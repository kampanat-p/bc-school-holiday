// sync-payments.js
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---
const SUPABASE_URL = "https://cgznmxcecljfybcgujjb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2NTI1MywiZXhwIjoyMDgzMzQxMjUzfQ.kTov9RFS-FVDNZokkslR0jFH2zaKTUYSBH9NQ8aItlQ";

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Date Helpers
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function safeNormalizeTime(t) {
    if (!t) return "";
    // Ensure HH:mm:ss format
    let parts = t.split(':');
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return t;
}

async function main() {
    console.log("💰 Starting Payment Logic Sync (Node.js)...");

    try {
        // Default: Sync Yesterday & Today
        const today = new Date();
        const yesterday = addDays(today, -1);
        
        // OR: Manual Range
        // const start = new Date("2026-01-01");
        // const end = new Date("2026-01-31");
        
        await updatePaymentLedger(yesterday, today);

    } catch (error) {
        console.error("❌ Fatal Error:", error.message);
    }
}

async function updatePaymentLedger(startDate, endDate) {
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);
    console.log(`📅 Processing Range: ${startStr} to ${endStr}`);

    // 1. Fetch Master Data
    console.log("🔄 Loading Maps...");
    
    // Users
    const { data: users } = await supabase.from('dim_user').select('*');
    const userMap = new Map(); // id -> { name, type }
    
    // Stats for debugging
    let countFT = 0, countPT = 0, countOther = 0;

    users.forEach(u => {
        // [MODIFIED] Removed filter to allow ALL teachers to appear in ledger
        // Previously: Checked if (u.user_type === '210' || u.user_type === '220')
        // Now: Map everyone, default unknown types to 'Unassigned'
        
        const name = `${u.firstname_en} ${u.lastname_en}`.trim();
        let type = "Unassigned"; // Default

        if (u.user_type === '210') {
            type = 'Full-time';
            countFT++;
        } else if (u.user_type === '220') {
            type = 'Part-time';
            countPT++;
        } else {
            // Handle Type 100 or null
            if (u.user_type) type = `Type ${u.user_type}`;
            countOther++;
        }

        userMap.set(u.user_id, { name, type });
    });
    console.log(`👥 Loaded Teachers: ${countFT} FT, ${countPT} PT, ${countOther} Other/Unassigned.`);

    // Schools
    const { data: schools } = await supabase.from('dim_school').select('*');
    const schoolMap = new Map(); // id -> code
    schools.forEach(s => schoolMap.set(s.school_id, s.school_code));

    // Unavailability (Filtered by Date Range roughly)
    // Note: Fetching 'relevant' unavailability is tricky without complicated queries.
    // We'll fetch all active ones overlapping date range? 
    // For simplicity, we fetch where start_date >= startDate - 1 day
    const { data: unavail } = await supabase
        .from('fact_teacher_unavailability')
        .select('*')
        .gte('start_date', startStr) // Approximate lower bound
        .lte('start_date', endStr);
    
    const unavailMap = new Map(); // Key: TeacherID_Date_Time -> Remark
    if (unavail) {
        unavail.forEach(item => {
            // Key format: TeacherID_YYYY-MM-DD_HH:MM
            const d = item.start_date; // YYYY-MM-DD
            const t = safeNormalizeTime(item.start_time);
            const k = `${item.teacher_id}_${d}_${t}`;
            unavailMap.set(k, item.remark);
        });
    }

    // 2. Fetch Sessions
    const { data: sessions, error: sessError } = await supabase
        .from('fact_daily_session')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr);

    if (sessError) throw new Error(sessError.message);
    console.log(`📥 Loaded ${sessions.length} sessions.`);

    const ledgerEntries = [];
    const nowISO = new Date().toISOString();

    for (const s of sessions) {
        const sessionId = s.session_id;
        const dateStr = s.date;
        const startTime = safeNormalizeTime(s.start_time);
        const endTime = safeNormalizeTime(s.end_time);
        const timeRange = `${startTime}-${endTime}`;
        
        const schoolCode = schoolMap.get(s.school_id) || s.school_id;
        
        const actualId = s.actual_teacher_id;
        const originalId = s.original_teacher_id;
        const status = s.status || "";
        
        // --- LOGIC A: Actual Teacher ---
        if (!status.startsWith("Cancelled") && actualId && userMap.has(actualId)) {
            const actUser = userMap.get(actualId);
            let eventType = "Normal Teaching";
            let note = "-";

            if (originalId && actualId !== originalId) {
                eventType = "Cover (Sub)";
                const orgName = userMap.has(originalId) ? userMap.get(originalId).name : "Unknown";
                note = `Cover for ${orgName}`;
            }

            const uniqueKey = `${sessionId}_${actualId}`; // PK for ledger
            ledgerEntries.push({
                ledger_id: uniqueKey, // Custom PK
                session_id: sessionId,
                date: dateStr,
                time_range: timeRange,
                school: schoolCode,
                class: s.class_name,
                teacher_name: actUser.name,
                teacher_type: actUser.type,
                event: eventType,
                system_analysis: note,
                status: "✅ Paid",
                payable_unit: 1,
                last_updated: nowISO
            });
        }

        // --- LOGIC B: Original Teacher ---
        // Conditions: 
        // 1. Original exists and is FT/PT.
        // 2. Was cancelled (Status has 'Cancelled')
        // 3. (Or missed? - Missed logic usually requires 'teacher_status' from API which we might not have stored deeply, let's stick to Cancelled for now)
        if (originalId && userMap.has(originalId)) {
            const orgUser = userMap.get(originalId);

            if (status.startsWith("Cancelled")) {
                const userReason = unavailMap.get(`${originalId}_${dateStr}_${startTime}`);
                
                let analysis = "";
                let payStatus = "❌ No Pay";
                let unit = 0;

                // Check Unavailability Map
                if (userReason) {
                    analysis = `[CONFLICT] Teacher Reason: "${userReason}"`;
                    payStatus = "⚠️ Review";
                    unit = 0;
                } else {
                    // School Cancel Logic
                    if (s.is_payable) {
                        analysis = "School Cancel < 3h (or Auto-Pay)";
                        payStatus = "✅ Paid (Comp)";
                        unit = 1;
                    } else {
                        analysis = "Standard Cancel";
                        payStatus = "❌ No Pay";
                        unit = 0;
                    }
                }

                const uniqueKey = `${sessionId}_${originalId}`; // PK
                ledgerEntries.push({
                    ledger_id: uniqueKey,
                    session_id: sessionId,
                    date: dateStr,
                    time_range: timeRange,
                    school: schoolCode,
                    class: s.class_name,
                    teacher_name: orgUser.name,
                    teacher_type: orgUser.type,
                    event: "Class Cancelled",
                    system_analysis: analysis,
                    status: payStatus,
                    payable_unit: unit,
                    last_updated: nowISO
                });
            }
        }
    }

    // 3. Upsert
    if (ledgerEntries.length > 0) {
        console.log(`☁️ Upserting ${ledgerEntries.length} ledger entries...`);
        const { error } = await supabase
            .from('finance_payment_ledger')
            .upsert(ledgerEntries, { onConflict: 'ledger_id' });

        if (error) {
            console.error("🔥 Supabase Error:", error.message);
            console.log("⚠️ Hint: Does table 'finance_payment_ledger' exist?");
        } else {
            console.log("✅ Payment Ledger Updated!");
        }
    } else {
        console.log("✅ No payment events found in range.");
    }
}

main();
