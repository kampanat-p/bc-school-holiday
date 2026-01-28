// sync-unavailability.js
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
const DATA_URL_BASE = "https://scheduler.braincloudlearning.com/admin/Conflicts/ajax_getUnavailableDetailConflictWithTemporaryDetailList";
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
    console.log("🚀 Starting Unavailability Sync (Node.js)...");
    
    try {
        // 1. Login
        console.log("🔑 Logging in...");
        await loginToBraincloud();
        console.log("✅ Login Successful!");

        // 2. Fetch User Map (WebID -> BCP ID)
        const userMap = await loadUserMap();

        // 3. Process Sync (Default: Past=0 for daily, change to Past=1 for full history)
        // You can change this to true if you want to pull EVERYTHING
        const IS_BACKFILL = false; 
        await processSync(userMap, IS_BACKFILL);

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
        maxRedirects: 5 
    });
}

async function loadUserMap() {
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
    return userMap;
}

async function processSync(userMap, isBackfill) {
    const pastParam = isBackfill ? "1" : "0";
    const url = `${DATA_URL_BASE}?past=${pastParam}`;

    console.log(`📥 Fetching Unavailability (Past=${pastParam})...`);
    
    // Fetch JSON
    const res = await client.get(url, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    });

    const data = res.data;
    if (!data.Semester) {
        console.warn("⚠️ No Semester data found.");
        return;
    }

    const payloadMap = new Map();
    const nowISO = new Date().toISOString();

    // Iterate Semesters
    for (const semesterId in data.Semester) {
        const semesterData = data.Semester[semesterId];
        
        if (semesterData.Template && Array.isArray(semesterData.Template)) {
            semesterData.Template.forEach(item => {
                
                const uId = String(item.u_id);
                const webTeacherId = String(item.u_teacher_id);
                
                // Map to BCP ID
                const teacherDbId = userMap.get(webTeacherId);
                
                if (!teacherDbId) {
                    // console.warn(`Skipping Unavailability ${uId}: Teacher ${webTeacherId} not found.`);
                    return;
                }

                const compositeId = `${uId}_${item.u_start_date}_${item.u_start_time}`;

                payloadMap.set(compositeId, {
                    unavailability_id: compositeId,
                    teacher_id: teacherDbId,
                    start_date: item.u_start_date,
                    end_date: item.u_end_date,
                    start_time: item.u_start_time,
                    end_time: item.u_end_time,
                    remark: item.u_remark,
                    semester_id: item.semester_id,
                    last_updated: nowISO
                });

            });
        }
    }

    const upsertPayload = Array.from(payloadMap.values());

    // --- BATCH UPSERT TO SUPABASE ---
    if (upsertPayload.length > 0) {
        console.log(`☁️ Upserting ${upsertPayload.length} unavailability records...`);
        
        // Chunking
        const CHUNK_SIZE = 500;
        for (let i = 0; i < upsertPayload.length; i += CHUNK_SIZE) {
            const chunk = upsertPayload.slice(i, i + CHUNK_SIZE);
            const { error } = await supabase
                .from('fact_teacher_unavailability')
                .upsert(chunk); 

            if (error) {
                console.error(`🔥 Chunk Error (${i}-${i+CHUNK_SIZE}):`, error.message);
            } else {
                console.log(`   Saved chunk ${i/CHUNK_SIZE + 1}`);
            }
        }
        console.log("✅ Unavailability Sync Verified.");
    } else {
        console.log("✅ No records to sync.");
    }
}

main();
