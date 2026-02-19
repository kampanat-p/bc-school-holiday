
const SUPABASE_URL = "https://cgznmxcecljfybcgujjb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2NTI1MywiZXhwIjoyMDgzMzQxMjUzfQ.kTov9RFS-FVDNZokkslR0jFH2zaKTUYSBH9NQ8aItlQ";

async function fetchData(table, idCol, idVal) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${idCol}=eq.${idVal}&select=*`;
    try {
        const res = await fetch(url, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY
            }
        });
        const data = await res.json();
        console.log(`\n--- [${table}] ID: ${idVal} ---`);
        if (data && data.length > 0) {
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            console.log("No data found or error:", data);
        }
    } catch (e) {
        console.error(`Error fetching ${table}:`, e);
    }
}

async function run() {
    await fetchData('fact_daily_session', 'session_id', '21614_2026-02-02_09:40:00');
    await fetchData('fact_teacher_unavailability', 'unavailability_id', '3154_2026-02-02_09:40:00');
}

run();
