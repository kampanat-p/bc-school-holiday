const axios = require('axios');

const PROJECT_REF = "cgznmxcecljfybcgujjb";
const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/sync-schedule`;

async function test() {
    console.log(`Testing Schedule Sync Edge Function: ${FUNCTION_URL}`);
    try {
        const start = Date.now();
        // Extending timeout significantly because parallel fetch of 8 days + upserting 1000+ rows takes time
        const res = await axios.post(FUNCTION_URL, {}, {
            timeout: 120000 // 120s timeout
        });
        const duration = (Date.now() - start) / 1000;
        console.log(`✅ Status: ${res.status} (Time: ${duration}s)`);
        console.log("📄 Response:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("❌ Failed:", err.message);
        if (err.code === 'ECONNABORTED') {
             console.error("   Timeout exceeded (120s). The function might still be running.");
        } else if (err.response) {
            console.error("   Data:", err.response.data);
        }
    }
}

test();
