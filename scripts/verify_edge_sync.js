const axios = require('axios');

const PROJECT_REF = "cgznmxcecljfybcgujjb";
const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/sync-unavailability`;

// If you deployed with --no-verify-jwt, this doesn't strictly need a key, 
// but Supabase might still gate it behind the Anon key if not configured otherwise.
// We'll try without, then with Anon key if needed.
// (Actually, --no-verify-jwt disables the JWT verification middleware, making it public)

async function test() {
    console.log(`Testing Edge Function: ${FUNCTION_URL}`);
    try {
        const res = await axios.post(FUNCTION_URL, {}, {
            params: { past: 0 } // Sync upcoming
        });
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
