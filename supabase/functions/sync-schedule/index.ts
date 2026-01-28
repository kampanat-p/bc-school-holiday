// Follow this setup guide: https://supabase.com/docs/guides/functions
// Deploy with: supabase functions deploy sync-schedule --no-verify-jwt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

// --- CONFIGURATION ---
const BC_USERNAME = Deno.env.get("BC_USERNAME") ?? "admin.nong";
const BC_PASSWORD = Deno.env.get("BC_PASSWORD") ?? "male*3,Guitar";

const LOGIN_PAGE_URL = "https://scheduler.braincloudlearning.com/Users/login";
const DATA_URL_BASE = "https://scheduler.braincloudlearning.com/Timetables/ajax_getMasterTimetableSessions.json";

// Initialize Supabase Client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// --- COOKIE & FETCH HELPER (Reused) ---
class BraincloudSession {
  private cookies: Map<string, string> = new Map();

  private updateCookies(headers: Headers) {
    const setCookie = headers.get("set-cookie");
    if (setCookie) {
      const entries = setCookie.split(/,(?=\s*[a-zA-Z0-9_-]+=)/); 
      for (const entry of entries) {
        const [pair] = entry.split(';');
        const [key, val] = pair.split('=');
        if (key && val) {
            this.cookies.set(key.trim(), val.trim());
        }
      }
    }
  }

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});
    const cookieStr = Array.from(this.cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
    if (cookieStr) headers.set('Cookie', cookieStr);
    if (!headers.has('User-Agent')) headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Deno/Edge');

    const res = await fetch(url, { ...options, headers });
    this.updateCookies(res.headers);
    return res;
  }
}

// --- DATE HELPERS ---
function getBangkokDate(): Date {
    const now = new Date();
    // Create a date object shifted to BKK time
    const bkkStr = now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
    return new Date(bkkStr);
}

function formatDateISO(date: Date): string {
    // YYYY-MM-DD
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatBCDate(date: Date): string {
    // DD-MM-YYYY
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${d}-${m}-${y}`;
}

// --- MAIN LOGIC ---
Deno.serve(async (req) => {
  try {
    console.log("🚀 Starting Schedule Sync (Edge)...");
    const session = new BraincloudSession();

    // 1. Login
    console.log("🔑 Step 1: Fetching Login Page...");
    const loginPageRes = await session.request(LOGIN_PAGE_URL);
    const loginHtml = await loginPageRes.text();
    const $ = cheerio.load(loginHtml);

    const key = $('input[name="data[_Token][key]"]').val() as string;
    const fields = $('input[name="data[_Token][fields]"]').val() as string;

    if (!key || !fields) throw new Error("CSRF Tokens not found.");

    console.log("🔑 Step 2: Submitting Credentials...");
    const params = new URLSearchParams();
    params.append('_method', 'POST');
    params.append('data[_Token][key]', key);
    params.append('data[User][username]', BC_USERNAME);
    params.append('data[User][password]', BC_PASSWORD);
    params.append('data[User][remember]', '0');
    params.append('data[_Token][fields]', fields);
    params.append('data[_Token][unlocked]', '');

    await session.request(LOGIN_PAGE_URL, {
        method: 'POST',
        body: params,
        redirect: 'manual'
    });
    console.log("✅ Logged in.");

    // 2. Load Mappings
    console.log("🔄 Loading Maps...");
    const [{ data: users }, { data: schools }] = await Promise.all([
        supabase.from('dim_user').select('user_id, braincloud_id'),
        supabase.from('dim_school').select('school_id, school_code')
    ]);

    const userMap = new Map<string, string>();
    users?.forEach((u: any) => { if (u.braincloud_id) userMap.set(String(u.braincloud_id), u.user_id); });

    const schoolMap = new Map<string, string>();
    schools?.forEach((s: any) => { if (s.school_code) schoolMap.set(String(s.school_code).toUpperCase(), s.school_id); });

    console.log(`✅ Loaded ${userMap.size} users, ${schoolMap.size} schools.`);

    // 3. Parallel Processing (Today + 7 Days)
    const bkkNow = getBangkokDate();
    const LOOP_DAYS = 7;
    console.log(`🚀 Starting Parallel Sync for ${LOOP_DAYS + 1} days...`);

    // Prepare Date Objects
    const datesToSync: Date[] = [];
    for (let i = 0; i <= LOOP_DAYS; i++) {
        const d = new Date(bkkNow);
        d.setDate(bkkNow.getDate() + i);
        datesToSync.push(d);
    }

    const nowBKK = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" }).replace(' ', 'T');
    const nowISO = `${nowBKK}+07:00`;

    // Process all days in parallel
    const dayPromises = datesToSync.map(async (targetDate) => {
        const dbDateStr = formatDateISO(targetDate);
        const urlDateStr = formatBCDate(targetDate);
        
        try {
            // A. Fetch Session Data
            const url = `${DATA_URL_BASE}?date=${urlDateStr}&_=${Date.now()}`;
            const res = await session.request(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (!res.ok) {
                 console.error(`❌ Failed to fetch ${urlDateStr}: ${res.status}`);
                 return [];
            }
            const data = await res.json();
            const sessions = data.sessions || [];
            if (sessions.length === 0) return [];

            // B. Fetch Existing (Watchdog) - Optimally we could fetch all 8 days at once outside, but parallel reads are fine too.
            // Using maybeSingle() or lightweight select to avoid massive memory if not needed, 
            // but we need the rows.
            const { data: existingRows } = await supabase
                .from('fact_daily_session')
                .select('session_id, status, is_payable, cancelled_at')
                .eq('date', dbDateStr);
            
            const existingMap = new Map();
            existingRows?.forEach((r: any) => existingMap.set(r.session_id, r));

            const dayRecords: any[] = [];

            // C. Process Logic
            for (const s of sessions) {
                if (!s.id || !s.start_time || !s.sc_code) continue;

                let webTeacherId = String(s.main_live_teacher_id);
                let status = "Normal";
                let actualWebId = webTeacherId;

                const rawStatus = (s.live_teacher_status || '').toLowerCase();
                if (rawStatus === 'covered' && s.live_teacher_id) {
                    actualWebId = String(s.live_teacher_id);
                    status = "Substituted";
                }

                if (s.cancellation_id) {
                    if (s.cancel_by === 'local') status = "Cancelled (School)";
                    else status = "Cancelled (BC)";
                }

                let actualDbId = userMap.get(actualWebId) || null;
                let originalDbId = userMap.get(webTeacherId) || null;
                if (!originalDbId) continue;

                let scCode = (String(s.sc_code)).toUpperCase();
                let schoolDbId = schoolMap.get(scCode);
                if (!schoolDbId) continue;

                let session_id = `${s.id}_${dbDateStr}_${s.start_time}`;
                let prevData = existingMap.get(session_id);
                let cancelledAt = null;
                let isPayable = false;

                if (status.startsWith("Cancelled")) {
                    const isJustCancelled = !prevData || !prevData.status.startsWith("Cancelled");

                    if (s.cancellation_date) {
                        cancelledAt = s.cancellation_date;
                    } else if (isJustCancelled) {
                        cancelledAt = nowISO; 
                    } else if (prevData && prevData.cancelled_at) {
                        cancelledAt = prevData.cancelled_at;
                    }

                    if (status === "Cancelled (School)") {
                        if (isJustCancelled && cancelledAt) {
                             const sessionIso = `${dbDateStr}T${s.start_time}:00+07:00`;
                             const sessionTs = new Date(sessionIso).getTime();
                             const cancelTs = new Date(cancelledAt).getTime();
                             if (!isNaN(sessionTs) && !isNaN(cancelTs)) {
                                 const diffHrs = (sessionTs - cancelTs) / 3600000;
                                 if (diffHrs < 3) isPayable = true;
                             }
                        } else {
                            isPayable = prevData ? prevData.is_payable : false;
                        }
                    } else {
                        isPayable = false;
                    }
                } else {
                    isPayable = true;
                }

                dayRecords.push({
                    session_id,
                    date: dbDateStr,
                    start_time: s.start_time,
                    end_time: s.end_time,
                    class_name: s.classroom,
                    school_id: schoolDbId,
                    actual_teacher_id: actualDbId,
                    original_teacher_id: originalDbId,
                    status,
                    is_payable: isPayable,
                    last_updated: nowISO,
                    cancelled_at: cancelledAt
                });
            }
            return dayRecords;

        } catch (e) {
            console.error(`🔥 Error processing day ${urlDateStr}:`, e);
            return [];
        }
    });

    // Wait for all days
    const allResults = await Promise.all(dayPromises);
    const flatRecords = allResults.flat();

    console.log(`✅ Processed all days. Total records to upsert: ${flatRecords.length}`);

    // 4. Batch Upsert
    if (flatRecords.length > 0) {
        // Dedupe Global results
        const uniqueRecords = Array.from(new Map(flatRecords.map(item => [item.session_id, item])).values());
        
        // Chunking - Process in smaller batches for stability
        const CHUNK_SIZE = 100;
        let upsertCount = 0;
        
        console.log(`☁️ Upserting ${uniqueRecords.length} records in chunks of ${CHUNK_SIZE}...`);

        for (let i = 0; i < uniqueRecords.length; i += CHUNK_SIZE) {
             const chunk = uniqueRecords.slice(i, i + CHUNK_SIZE);
             console.log(`   - Processing chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(uniqueRecords.length / CHUNK_SIZE)} (${chunk.length} rows)`);
             
             const { error: upsertError } = await supabase
                .from('fact_daily_session')
                .upsert(chunk, { onConflict: 'session_id' });
             
             if (upsertError) {
                 console.error(`❌ Upsert Chunk Error on index ${i}:`, upsertError.message);
                 throw upsertError;
             } else {
                 upsertCount += chunk.length;
             }
        }
        
        console.log("✅ Sync completed successfully.");
        
        return new Response(JSON.stringify({ success: true, count: upsertCount }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ success: true, count: 0 }), {
        headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
