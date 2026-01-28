
const SUPABASE_URL = "https://cgznmxcecljfybcgujjb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2NTI1MywiZXhwIjoyMDgzMzQxMjUzfQ.kTov9RFS-FVDNZokkslR0jFH2zaKTUYSBH9NQ8aItlQ";

async function testFetch() {
    const id = "bcp-00430";
    const url = `${SUPABASE_URL}/rest/v1/dim_user?user_id=eq.${id}&select=firstname_en,lastname_en,nickname_en`;
    
    console.log("Fetching:", url);

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error("Error Status:", response.status);
            console.error("Error Text:", await response.text());
            return;
        }

        const json = await response.json();
        console.log("Data:", JSON.stringify(json, null, 2));

    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

testFetch();
