// sync-schedule.js
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---
const SUPABASE_URL = "https://cgznmxcecljfybcgujjb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2NTI1MywiZXhwIjoyMDgzMzQxMjUzfQ.kTov9RFS-FVDNZokkslR0jFH2zaKTUYSBH9NQ8aItlQ";

const BC_USERNAME = "admin.nong";
const BC_PASSWORD = "male*3,Guitar";

const LOGIN_PAGE_URL = "https://scheduler.braincloudlearning.com/Users/login";
const DATA_URL_BASE = "https://scheduler.braincloudlearning.com/Timetables/ajax_getMasterTimetableSessions.json";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize Axios with Cookie Jar
const jar = new CookieJar();
const client = wrapper(axios.create({ 
    jar,
    headers: { 'User-Agent': USER_AGENT }
}));

async function main() {
    console.log("🚀 Starting Schedule Sync (Node.js)...");
    
    try {
        // 1. Login
        console.log("🔑 Logging in...");
        await loginToBraincloud();
        console.log("✅ Login Successful!");

        // 2. Determine Date Range (Default: Today)
        // You can change these to backfill: e.g. processDate('2025-06-01')
        const today = new Date();
        await processSync(today);

        // Example: If you want to sync tomorrow as well
        // const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        // await processSync(tomorrow);

    } catch (error) {
        console.error("❌ Fatal Error:", error.message);
        if (error.response) console.error("   Response:", error.response.status, error.response.statusText);
    }
}

async function loginToBraincloud() {
    // Step 1: GET Login Page to extract CSRF Tokens
    const getRes = await client.get(LOGIN_PAGE_URL);
    const $ = cheerio.load(getRes.data);
    
    // Extract hidden inputs
    const key = $('input[name="data[_Token][key]"]').val();
    const fields = $('input[name="data[_Token][fields]"]').val();
    
    if (!key || !fields) throw new Error("CSRF Tokens not found on login page");

    // Step 2: POST Login
    const payload = new URLSearchParams();
    payload.append('_method', 'POST');
    payload.append('data[_Token][key]', key);
    payload.append('data[User][username]', BC_USERNAME);
    payload.append('data[User][password]', BC_PASSWORD);
    payload.append('data[User][remember]', '0');
    payload.append('data[_Token][fields]', fields);
    payload.append('data[_Token][unlocked]', '');

    await client.post(LOGIN_PAGE_URL, payload, {
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': LOGIN_PAGE_URL,
            'Origin': 'https://scheduler.braincloudlearning.com'
        },
        maxRedirects: 5 // Axios handles 302 automatically
    });
}

function formatDate(date) {
    // Returns YYYY-MM-DD
    return date.toISOString().split('T')[0];
}

function formatBCDate(date) {
    // Returns DD-MM-YYYY for URL
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
}

async function processSync(targetDate) {
    // --- PRE-FETCH 1: Get User Mapping (Braincloud ID -> User ID) ---
    console.log("🔄 Loading Teacher Map...");
    const { data: users, error: userError } = await supabase
        .from('dim_user')
        .select('user_id, braincloud_id');

    if (userError) throw new Error(`Failed to load users: ${userError.message}`);

    const userMap = new Map();
    if (users) {
        users.forEach(u => {
            if (u.braincloud_id) userMap.set(String(u.braincloud_id), u.user_id);
        });
    }
    console.log(`✅ Loaded ${userMap.size} teachers for ID translation.`);

    // --- PRE-FETCH 2: Get School Mapping (School Code -> School ID) ---
    console.log("🏫 Loading School Map...");
    const { data: schools, error: schoolError } = await supabase
        .from('dim_school')
        .select('school_id, school_code');

    if (schoolError) throw new Error(`Failed to load schools: ${schoolError.message}`);

    const schoolMap = new Map();
    if (schools) {
        schools.forEach(s => {
            if (s.school_code) schoolMap.set(String(s.school_code).toUpperCase(), s.school_id);
        });
    }
    console.log(`✅ Loaded ${schoolMap.size} schools for ID translation.`);


    const dbDateStr = formatDate(targetDate);
    const urlDateStr = formatBCDate(targetDate);

    console.log(`📅 Syncing Date: ${dbDateStr} (URL: ${urlDateStr})`);

    // Fetch JSON
    const url = `${DATA_URL_BASE}?date=${urlDateStr}`;
    const res = await client.get(url, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    });

    const data = res.data;
    if (!data.sessions) {
        console.warn(`⚠️ No sessions found for ${dbDateStr}`);
        return;
    }

    const sessions = data.sessions;
    console.log(`📥 Fetched ${sessions.length} sessions.`);

    const records = [];
    const nowISO = new Date().toISOString();

    for (const s of sessions) {
        if (!s.id || !s.start_time || !s.sc_code) continue;

        // --- Logic Mapping (Same as GAS) ---
        let webTeacherId = String(s.main_live_teacher_id);
        let status = "Normal";
        let actualWebId = webTeacherId;
        
        // Check Cover
        if (s.live_teacher_status === 'covered' && s.live_teacher_id) {
            actualWebId = String(s.live_teacher_id);
            status = "Substituted";
        }

        // Check Cancel
        let cancelledAt = null;
        if (s.cancellation_id) {
            if (s.cancel_by === 'local') status = "Cancelled (School)";
            else status = "Cancelled (BC)";

            if (s.cancellation_date) {
                 cancelledAt = s.cancellation_date; 
            }
        }

        // --- ID TRANSLATION (Braincloud ID -> Database PK) ---
        let actualDbId = userMap.get(actualWebId) || null;
        let originalDbId = userMap.get(webTeacherId) || null;

        if (!originalDbId) {
            console.warn(`⚠️ Skipped Session ${s.id}: Original Teacher ID ${webTeacherId} not found in DB.`);
            continue; 
        }

        // --- SCHOOL MAPPING ---
        let scCode = (s.sc_code || "").toUpperCase();
        let schoolDbId = schoolMap.get(scCode);

        if (!schoolDbId) {
             console.warn(`⚠️ Skipped Session ${s.id}: School Code '${scCode}' not found in DB.`);
             continue;
        }

        // Determine Payability (Simplified)
        let isPayable = false;
        if (status === "Cancelled (School)") {
            isPayable = false; 
        } else if (!status.startsWith("Cancelled")) {
            isPayable = true; 
        }

        records.push({
            session_id: String(s.id),
            date: dbDateStr,
            start_time: s.start_time,
            end_time: s.end_time,
            class_name: s.classroom,
            school_id: schoolDbId,     // Use Translated ID (e.g. sc-0005)
            actual_teacher_id: actualDbId,   
            original_teacher_id: originalDbId, 
            status: status,
            is_payable: isPayable,
            last_updated: nowISO,
            cancelled_at: cancelledAt
        });
    }

    // --- BATCH UPSERT TO SUPABASE ---
    if (records.length > 0) {
        const { error } = await supabase
            .from('fact_daily_session')
            .upsert(records, { onConflict: 'session_id' });

        if (error) {
            console.error("🔥 Supabase Error:", error.message);
        } else {
            console.log(`💾 Successfully upserted ${records.length} records.`);
        }
    }
}

main();
