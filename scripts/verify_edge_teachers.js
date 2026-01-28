const axios = require('axios');

const PROJECT_REF = "cgznmxcecljfybcgujjb";
const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/sync-teachers`;

async function test() {
    console.log(`Testing Teachers Sync Edge Function: ${FUNCTION_URL}`);
    try {
        const res = await axios.post(FUNCTION_URL, {});
        console.log("✅ Status:", res.status);
        console.log("📄 Response:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("❌ Failed:", err.message);
        if (err.response) {
            console.error("   Data:", err.response.data);
        }
    }
}

test();
