// Follow this setup guide: https://supabase.com/docs/guides/functions
// Deploy with: supabase functions deploy sync-teachers --no-verify-jwt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

// --- CONFIGURATION ---
const BC_USERNAME = Deno.env.get("BC_USERNAME") ?? "admin.nong";
const BC_PASSWORD = Deno.env.get("BC_PASSWORD") ?? "male*3,Guitar";

const LOGIN_PAGE_URL = "https://scheduler.braincloudlearning.com/Users/login";
const TEACHERS_URL = "https://scheduler.braincloudlearning.com/Teachers/ajax_getTeachers.json?get=1";

// Initialize Supabase Client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// --- COOKIE & FETCH HELPER (Shared Logic) ---
class BraincloudSession {
  private cookies: Map<string, string> = new Map();

  private updateCookies(headers: Headers) {
    const setCookie = headers.get("set-cookie");
    // Deno/Edge fetch might combine multiple set-cookies into one comma-separated string
    if (setCookie) {
      // Split by comma, but be careful of commas in dates. 
      // Simple auth cookies usually safe to split on comma followed by key=
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
    
    // Inject Cookies
    const cookieStr = Array.from(this.cookies.entries())
        .map(([k, v]) => `${k}=${v}`).join('; ');
    if (cookieStr) headers.set('Cookie', cookieStr);

    // Default User Agent
    if (!headers.has('User-Agent')) {
        headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Deno/Edge');
    }

    const res = await fetch(url, { ...options, headers });
    this.updateCookies(res.headers);
    return res;
  }
}

// --- MAIN LOGIC ---

Deno.serve(async (req) => {
  try {
    console.log("🚀 Starting Teacher Sync (Edge)...");

    const session = new BraincloudSession();

    // 1. GET Login Page (CSRF)
    console.log("🔑 Step 1: Fetching Login Page...");
    const loginPageRes = await session.request(LOGIN_PAGE_URL);
    const loginHtml = await loginPageRes.text();
    const $ = cheerio.load(loginHtml);

    const key = $('input[name="data[_Token][key]"]').val() as string;
    const fields = $('input[name="data[_Token][fields]"]').val() as string;

    if (!key || !fields) {
      throw new Error("CSRF Tokens not found.");
    }

    // 2. POST Login
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

    // 3. Fetch Teachers API
    console.log(`📥 Fetching teachers...`);
    const res = await session.request(TEACHERS_URL, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    });
    
    if (!res.ok) throw new Error("Failed to fetch teachers URL");

    const data = await res.json();
    if (!data.teachers) throw new Error("Invalid response: 'teachers' key missing");
    
    const teachers = data.teachers;
    console.log(`✅ Found ${teachers.length} teachers from Braincloud.`);

    // 4. Fetch Existing Users (User Map & ID Generation)
    const { data: existingUsers, error: fetchError } = await supabase
        .from('dim_user')
        .select('user_id, braincloud_id');

    if (fetchError) throw fetchError;

    const userMap = new Set<string>(); // Set of existing Braincloud IDs
    let maxIdCounter = 0;

    if (existingUsers) {
        existingUsers.forEach((u: any) => {
            if (u.braincloud_id) userMap.add(String(u.braincloud_id));

            // Calculate Max ID (Format: "bcp-XXXXX")
            if (u.user_id && typeof u.user_id === 'string' && u.user_id.startsWith('bcp-')) {
                const parts = u.user_id.replace('bcp-', '');
                const numPart = parseInt(parts, 10);
                if (!isNaN(numPart) && numPart > maxIdCounter) {
                    maxIdCounter = numPart;
                }
            }
        });
    }
    console.log(`📋 Existing Teachers: ${userMap.size}. Max ID: ${maxIdCounter}`);

    // 5. Build New Payload
    const upsertPayload: any[] = [];

    for (const t of teachers) {
        const webId = String(t.id).trim();

        // [LOGIC] SKIP EXISTING TEACHERS
        // Do not update existing records to preserve manual edits in Supabase.
        if (userMap.has(webId)) {
            continue;
        }

        // Generate New ID
        maxIdCounter++;
        const userId = `bcp-${String(maxIdCounter).padStart(5, '0')}`;
        console.log(`🆕 Generating new ID for ${t.firstname_en}: ${userId}`);

        // Mapping Logic
        const rawSchoolCode = (t.school_code || "").trim();
        const fnameEn = (t.firstname_en || "").trim();
        const fnameTh = (t.firstname_th || "").trim();
        const rawStatus = t.status ? t.status.toLowerCase() : "";

        let affiliation = rawSchoolCode;
        let position = "";
        let userType = "";

        // Determine Affiliation/Type
        if (rawSchoolCode === 'BRN') {
            affiliation = "BC";
            if (fnameEn.toLowerCase() === fnameTh.toLowerCase() && fnameEn !== "") {
                position = "100"; // Code for admin/staff
            } else {
                position = "110"; // Code for normal teacher
            }
        } else {
            userType = "100"; // External
        }

        const dbStatus = (rawStatus === 'enabled') ? 'Active' : 'Inactive';

        upsertPayload.push({
            user_id: userId,
            braincloud_id: webId,
            firstname_en: fnameEn,
            lastname_en: t.lastname_en || "",
            firstname_th: fnameTh,
            lastname_th: t.lastname_th || "",
            user_type: userType === "" ? null : userType,
            affiliation: affiliation,
            position: position === "" ? null : position,
            status: dbStatus
        });
    }

    // 6. Upsert
    if (upsertPayload.length > 0) {
        console.log(`☁️ Inserting ${upsertPayload.length} new teachers...`);
        const { error: upsertError } = await supabase
            .from('dim_user')
            .upsert(upsertPayload); // onConflict relies on user_id (PK)

        if (upsertError) throw upsertError;
        
        return new Response(JSON.stringify({ 
            success: true, 
            new_users: upsertPayload.length 
        }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ 
        success: true, 
        message: "No new teachers to sync.",
        new_users: 0 
    }), { headers: { "Content-Type": "application/json" } });


  } catch (err) {
    console.error("❌ Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
