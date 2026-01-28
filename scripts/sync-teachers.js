// sync-teachers.js
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
const TEACHERS_URL = "https://scheduler.braincloudlearning.com/Teachers/ajax_getTeachers.json?get=1";
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
    console.log("🚀 Starting Teacher Sync (Node.js)...");
    
    try {
        // 1. Login
        console.log("🔑 Logging in...");
        await loginToBraincloud();
        console.log("✅ Login Successful!");

        // 2. Fetch Teachers
        await processTeacherSync();

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
        // Follow redirects
        maxRedirects: 5 
    });
}

async function processTeacherSync() {
    console.log(`📥 Fetching teachers from: ${TEACHERS_URL}`);
    const res = await client.get(TEACHERS_URL, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    });

    const data = res.data;
    if (!data.teachers) {
        throw new Error("Invalid response: 'teachers' key missing");
    }

    const teachers = data.teachers;
    console.log(`✅  Found ${teachers.length} teachers.`);

    // --- STEP 1: Fetch Existing Users to find Mapping and Calculate Next ID ---
    // Select user_id (primary key) and braincloud_id
    const { data: existingUsers, error: fetchError } = await supabase
        .from('dim_user')
        .select('user_id, braincloud_id');

    if (fetchError) {
        throw new Error(`Failed to fetch existing users: ${fetchError.message}`);
    }

    const userMap = new Map(); // braincloud_id -> user_id
    let maxIdCounter = 0;

    if (existingUsers) {
        existingUsers.forEach(u => {
            // Map for existing checks
            if (u.braincloud_id) userMap.set(String(u.braincloud_id), u.user_id);

            // Calculate Max ID (Format: "bcp-XXXXX")
            if (u.user_id && typeof u.user_id === 'string' && u.user_id.startsWith('bcp-')) {
                const numPart = parseInt(u.user_id.replace('bcp-', ''), 10);
                if (!isNaN(numPart) && numPart > maxIdCounter) {
                    maxIdCounter = numPart;
                }
            }
        });
    }
    console.log(`📋 Loaded ${userMap.size} existing teachers. Max ID Counter: ${maxIdCounter}`);

    const upsertPayload = [];

    teachers.forEach(t => {
        let webId = String(t.id).trim();
        let userId = "";

        // Determine User ID
        if (userMap.has(webId)) {
            // [MODIFIED] SKIP EXISTING TEACHERS
            // Do not update existing records to preserve manual edits in Supabase.
            return;
        } else {
            // Insert New -> Generate ID
            maxIdCounter++;
            userId = `bcp-${String(maxIdCounter).padStart(5, '0')}`;
            console.log(`🆕 Generating new ID for ${t.firstname_en}: ${userId}`);
        }
        
        // --- Mapping Logic ---
        let rawSchoolCode = (t.school_code || "").trim();
        let fnameEn = (t.firstname_en || "").trim();
        let fnameTh = (t.firstname_th || "").trim();
        let rawStatus = t.status ? t.status.toLowerCase() : "";

        let affiliation = rawSchoolCode;
        let position = "";
        let userType = "";

        if (rawSchoolCode === 'BRN') {
            affiliation = "BC";
            if (fnameEn.toLowerCase() === fnameTh.toLowerCase() && fnameEn !== "") {
                position = "100";
            } else {
                position = "110";
            }
        } else {
            userType = "100"; // External
        }
        
        let dbStatus = (rawStatus === 'enabled') ? 'Active' : 'Inactive';

        const record = {
            user_id: userId, // PK
            braincloud_id: webId,
            firstname_en: fnameEn,
            lastname_en: t.lastname_en || "",
            firstname_th: fnameTh,
            lastname_th: t.lastname_th || "",
            user_type: userType === "" ? null : userType,
            affiliation: affiliation,
            position: position === "" ? null : position,
            status: dbStatus
        };

        upsertPayload.push(record);
    });

    // --- BATCH UPSERT TO SUPABASE ---
    if (upsertPayload.length > 0) {
        console.log(`☁️ Upserting ${upsertPayload.length} records to 'dim_user'...`);
        
        // Upsert based on valid User ID.
        // Assuming user_id is PK, we don't need to specify onConflict if it's the PK.
        // Or specific onConflict: 'user_id'
        const { error } = await supabase
            .from('dim_user')
            .upsert(upsertPayload); 

        if (error) {
            console.error("🔥 Supabase Error:", error.message);
        } else {
            console.log(`💾 Successfully synced teachers!`);
        }
    }
}

main();
