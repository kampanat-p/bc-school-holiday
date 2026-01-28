const axios = require('axios');

const PROJECT_REF = "cgznmxcecljfybcgujjb";
const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/sync-unavailability`;

// We need an Authorization header if the function is not public or verifies JWT.
// Since the previous script didn't use one, I assume '--no-verify-jwt' is used or it's public.
// But to be consistent with production calls (from pg_net), it usually has headers.
// The user instruction said: "Deploy with: supabase functions deploy sync-unavailability --no-verify-jwt"
// So no auth needed.

async function test() {
    console.log(`Testing Unavailability Sync Edge Function: ${FUNCTION_URL}`);
    try {
        const start = Date.now();
        // Passing ?past=0 to match the logs
        const res = await axios.post(`${FUNCTION_URL}?past=0`, {}, {
            timeout: 60000 // 60s timeout for client
        });
        const duration = (Date.now() - start) / 1000;
        console.log(`✅ Status: ${res.status} (Time: ${duration}s)`);
        console.log("📄 Response:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("❌ Failed:", err.message);
        if (err.response) {
            console.error("   Data:", err.response.data);
        } else if (err.code === 'ECONNABORTED') {
            console.error("   Timeout exceeded.");
        }
    }
}

test();
