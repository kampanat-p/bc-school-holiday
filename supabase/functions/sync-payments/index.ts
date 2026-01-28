// Follow this setup guide: https://supabase.com/docs/guides/functions
// Deploy with: supabase functions deploy sync-payments --no-verify-jwt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// In Edge Functions, we don't need external libraries for Date calc if strictly ISO, 
// using native JS Date is sufficient.

// Initialize Supabase Client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// --- HELPER FUNCTIONS ---
function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDateISO(date: Date): string {
    // YYYY-MM-DD
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function safeNormalizeTime(t: string | null): string {
    if (!t) return "";
    const parts = t.split(':');
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return t;
}

// --- MAIN LOGIC ---
Deno.serve(async (req) => {
    try {
        console.log("💰 Starting Payment Logic Sync (Edge)...");

        // 1. Determine Date Range
        // Default: Update Yesterday and Today (Catch-up)
        const now = new Date();
        const endDate = now;
        const startDate = addDays(now, -1);
        
        // OR read from body params if manual trigger needed
        // const body = await req.json().catch(() => ({}));
        // if (body.start) ...

        const startStr = formatDateISO(startDate);
        const endStr = formatDateISO(endDate);
        console.log(`📅 Processing Range: ${startStr} to ${endStr}`);

        // 2. Load Maps (Users, Schools, Unavailability)
        console.log("🔄 Loading Maps...");
        
        const [
             { data: users }, 
             { data: schools },
             { data: unavail }
        ] = await Promise.all([
             supabase.from('dim_user').select('*'),
             supabase.from('dim_school').select('*'),
             supabase.from('fact_teacher_unavailability')
                .select('*')
                .gte('start_date', startStr)
                .lte('start_date', endStr)
        ]);

        const userMap = new Map();
        let countFT = 0, countPT = 0, countOther = 0;

        users?.forEach((u: any) => {
            const name = `${u.firstname_en} ${u.lastname_en}`.trim();
            const uType = String(u.user_type || ''); // force string
            let type = "Unassigned";

            if (uType === '210') { type = 'Full-time'; countFT++; } 
            else if (uType === '220') { type = 'Part-time'; countPT++; } 
            else { 
                if (uType) type = `Type ${uType}`; 
                countOther++; 
            }

            userMap.set(String(u.user_id), { name, type });
        });

        const schoolMap = new Map();
        schools?.forEach((s: any) => schoolMap.set(String(s.school_id), s.school_code));

        const unavailMap = new Map();
        unavail?.forEach((item: any) => {
             const d = item.start_date;
             const t = safeNormalizeTime(item.start_time);
             const k = `${item.teacher_id}_${d}_${t}`;
             unavailMap.set(k, item.remark);
        });

        console.log(`Teachers Loaded: FT=${countFT}, PT=${countPT}, Other=${countOther}. Unavailability found: ${unavail?.length ?? 0}`);

        // 3. Fetch Sessions
        const { data: sessions, error: sessError } = await supabase
            .from('fact_daily_session')
            .select('*')
            .gte('date', startStr)
            .lte('date', endStr);

        if (sessError) throw sessError;
        console.log(`📥 Loaded ${sessions?.length ?? 0} sessions.`);

        const ledgerEntries: any[] = [];
        const nowISO = new Date().toISOString(); // UTC standard for last_updated is fine

        for (const s of (sessions || [])) {
            const sessionId = s.session_id;
            const dateStr = s.date;
            const startTime = safeNormalizeTime(s.start_time);
            const endTime = safeNormalizeTime(s.end_time);
            const timeRange = `${startTime}-${endTime}`;
            const schoolCode = schoolMap.get(s.school_id) || s.school_id;

            const actualId = s.actual_teacher_id;
            const originalId = s.original_teacher_id;
            const status = s.status || "";

            // --- LOGIC A: Actual Teacher (Gets Paid) ---
            if (!status.startsWith("Cancelled") && actualId && userMap.has(actualId)) {
                const actUser = userMap.get(actualId);
                let eventType = "Normal Teaching";
                let note = "-";

                if (originalId && actualId !== originalId) {
                    eventType = "Cover (Sub)";
                    const orgName = userMap.has(originalId) ? userMap.get(originalId).name : "Unknown";
                    note = `Cover for ${orgName}`;
                }

                ledgerEntries.push({
                    payment_key: `${sessionId}_${actualId}`, // Matches GAS 'payment_key'
                    session_id: sessionId,
                    date: dateStr,
                    time_range: timeRange,
                    school: schoolCode,
                    class_name: s.class_name,        // Matches GAS 'class_name'
                    teacher_name: actUser.name,
                    teacher_type: actUser.type,
                    event_type: eventType,           // Matches GAS 'event_type'
                    system_analysis: note,
                    status: "✅ Paid",
                    payable_unit: 1,
                    last_updated: nowISO
                });
            }

            // --- LOGIC B: Original Teacher (Cancelled Logic) ---
            if (originalId && userMap.has(originalId)) {
                const orgUser = userMap.get(originalId);

                if (status.startsWith("Cancelled")) {
                     const userReason = unavailMap.get(`${originalId}_${dateStr}_${startTime}`);
                     
                     let analysis = "";
                     let payStatus = "❌ No Pay";
                     let unit = 0;
                     let leadTime = "";

                     // Calculate Lead Time if cancelled_at is present
                     if (s.cancelled_at) {
                         try {
                             // Parse timestamps
                             // start_time is "HH:mm:00" or similar. dateStr is "YYYY-MM-DD"
                             const startIso = `${dateStr}T${startTime}:00+07:00`; // Assuming BKK offset for reliable calculation or just use local construction if server is same zone
                             // Actually, simpler: construct Date objects and diff
                             // s.cancelled_at is ISO string (likely UTC or Offset)
                             
                             // We need to be careful with Timezones. 
                             // fact_daily_session dates are YYYY-MM-DD. 
                             // Let's assume start_time implies BKK time (+07:00)
                             
                             // Construct Class Start Time
                             const classStart = new Date(`${dateStr}T${startTime}:00+07:00`);
                             const cancelTime = new Date(s.cancelled_at); // UTC ISO from DB

                             if (!isNaN(classStart.getTime()) && !isNaN(cancelTime.getTime())) {
                                 const diffHrs = (classStart.getTime() - cancelTime.getTime()) / 3600000;
                                 leadTime = `(${diffHrs.toFixed(1)}h notice)`;
                             }
                         } catch (e) {
                             // ignore date parsing errors
                         }
                     }

                     if (userReason) {
                         analysis = `[CONFLICT] Teacher Reason: "${userReason}". ${leadTime}`;
                         payStatus = "⚠️ Review";
                         unit = 0;
                     } else {
                         if (s.is_payable) {
                             analysis = `School Cancel < 3h. ${leadTime}`;
                             payStatus = "✅ Paid (Comp)";
                             unit = 1;
                         } else {
                             analysis = `Standard Cancel. ${leadTime}`;
                             payStatus = "❌ No Pay";
                             unit = 0;
                         }
                     }

                     ledgerEntries.push({
                         payment_key: `${sessionId}_${originalId}`,
                         session_id: sessionId,
                         date: dateStr,
                         time_range: timeRange,
                         school: schoolCode,
                         class_name: s.class_name,
                         teacher_name: orgUser.name,
                         teacher_type: orgUser.type,
                         event_type: "Class Cancelled",
                         system_analysis: analysis,
                         status: payStatus,
                         payable_unit: unit,
                         last_updated: nowISO
                     });
                }
            }
        }

        // 4. Batch Upsert to 'db_payment_ledger' (The Old Table)
        const entriesCount = ledgerEntries.length;
        if (entriesCount > 0) {
            console.log(`☁️ Upserting ${entriesCount} entries to 'db_payment_ledger'...`);
            
            // Chunking - safer for Edge Functions
            const CHUNK_SIZE = 100;
            for (let i = 0; i < entriesCount; i += CHUNK_SIZE) {
                const chunk = ledgerEntries.slice(i, i + CHUNK_SIZE);
                console.log(`   Processing chunk ${i} - ${Math.min(i + CHUNK_SIZE, entriesCount)}`);
                
                const { error: upsertError } = await supabase
                    .from('db_payment_ledger')
                    .upsert(chunk, { onConflict: 'payment_key' });

                if (upsertError) {
                    console.error(`💥 Error upserting chunk ${i}:`, upsertError.message);
                    throw upsertError;
                }
            }
            
            console.log("✅ Sync Complete: All ledger entries saved.");
            
            return new Response(JSON.stringify({ 
                success: true, 
                count: entriesCount 
            }), { headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ success: true, count: 0, message: "No entries generated." }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error("❌ Error:", err.message);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
});
