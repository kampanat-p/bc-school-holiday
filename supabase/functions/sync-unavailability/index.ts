// Follow this setup guide: https://supabase.com/docs/guides/functions
// Deploy with: supabase functions deploy sync-unavailability --no-verify-jwt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

// --- CONFIGURATION ---
// In production, move these to Supabase Secrets via: supabase secrets set BC_PASSWORD=...
const BC_USERNAME = Deno.env.get("BC_USERNAME") ?? "admin.nong";
const BC_PASSWORD = Deno.env.get("BC_PASSWORD") ?? "male*3,Guitar";

const LOGIN_PAGE_URL = "https://scheduler.braincloudlearning.com/Users/login";
const DATA_URL_BASE = "https://scheduler.braincloudlearning.com/admin/Conflicts/ajax_getUnavailableDetailConflictWithTemporaryDetailList";

// Initialize Supabase Client (Edge Runtime automatically identifies these env vars)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// --- COOKIE & FETCH HELPER ---
class BraincloudSession {
  private cookies: Map<string, string> = new Map();

  private updateCookies(headers: Headers) {
    // Handling multiple Set-Cookie headers in Deno
    const setCookie = headers.get("set-cookie"); 
    // Deno/Edge fetch might combine them with comma.
    // Ideally we use headers.getSetCookie() if available, but fallback to splitting.
    // For simple PHP sessions, usually one critical cookie 'CAKEPHP' comes through.
    if (setCookie) {
      // Crude split for combined headers, might be risky if dates contain commas, 
      // but session cookies usually don't expire explicitly in the Set-Cookie string for simple auth.
      // Better approach: regex or just look for the key we need.
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

    // Default User Agent to look like a browser
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
    console.log("🚀 Starting Unavailability Sync (Edge Function)...");

    const session = new BraincloudSession();

    // 1. GET Login Page (CSRF)
    console.log("🔑 Step 1: Fetching Login Page...");
    const loginPageRes = await session.request(LOGIN_PAGE_URL);
    const loginHtml = await loginPageRes.text();
    const $ = cheerio.load(loginHtml);

    const key = $('input[name="data[_Token][key]"]').val();
    const fields = $('input[name="data[_Token][fields]"]').val();

    if (!key || !fields) {
      throw new Error("CSRF Tokens not found. Braincloud might be down or layout changed.");
    }

    // 2. POST Login
    console.log("🔑 Step 2: Submitting Credentials...");
    const params = new URLSearchParams();
    params.append('_method', 'POST');
    params.append('data[_Token][key]', key as string);
    params.append('data[User][username]', BC_USERNAME);
    params.append('data[User][password]', BC_PASSWORD);
    params.append('data[User][remember]', '0');
    params.append('data[_Token][fields]', fields as string);
    params.append('data[_Token][unlocked]', '');

    // Note: We use redirect: 'manual' to catch the 302 cookie before following
    const postRes = await session.request(LOGIN_PAGE_URL, {
        method: 'POST',
        body: params,
        redirect: 'manual' 
    });

    if (postRes.status === 302) {
        console.log("✅ Login Redirect Detected (Success).");
        // We captured the Auth cookie in session.request()
    } else {
        const text = await postRes.text();
        if(text.includes('Logout')) {
             console.log("✅ Already logged in?");
        } else {
             console.warn(`⚠️ Login might have failed. Status: ${postRes.status}`);
        }
    }

    // 3. Load User Map (Supabase)
    console.log("🔄 Loading Teacher Map from DB...");
    const { data: users, error: userError } = await supabase
        .from('dim_user')
        .select('user_id, braincloud_id');

    if (userError) throw userError;

    const userMap = new Map<string, string>();
    users?.forEach((u: any) => {
        if (u.braincloud_id) userMap.set(String(u.braincloud_id), u.user_id);
    });
    console.log(`✅ Loaded ${userMap.size} teachers.`);

    // 4. Fetch Unavailability Data
    // Default: past=0 (Upcoming). Use url params to override ?past=1
    const { searchParams } = new URL(req.url);
    const pastParam = searchParams.get('past') ?? "0";
    
    const dataUrl = `${DATA_URL_BASE}?past=${pastParam}`;
    console.log(`📥 Fetching Data from: ${dataUrl}`);

    const dataRes = await session.request(dataUrl, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    });

    if (!dataRes.ok) throw new Error(`Data fetch failed: ${dataRes.status}`);
    
    // Parse JSON
    // Note: Sometimes PHP returns HTML with JSON? Hopefully clean JSON here.
    const data = await dataRes.json();
    
    if (!data.Semester) {
        return new Response(JSON.stringify({ message: "No Semester data found" }), { headers: { "Content-Type": "application/json" } });
    }

    const payloadMap = new Map();
    const nowISO = new Date().toISOString();

    for (const semesterId in data.Semester) {
        const semesterData = data.Semester[semesterId];
        if (semesterData.Template && Array.isArray(semesterData.Template)) {
            for (const item of semesterData.Template) {
                 const uId = String(item.u_id);
                 const webTeacherId = String(item.u_teacher_id);
                 const teacherDbId = userMap.get(webTeacherId);

                 if (teacherDbId) {
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
                 }
            }
        }
    }

    const upsertPayload = Array.from(payloadMap.values());

    // 5. Upsert to Supabase (Chunked)
    if (upsertPayload.length > 0) {
        console.log(`☁️ Upserting ${upsertPayload.length} records...`);

        // Chunking to avoid timeouts on large datasets
        const BATCH_SIZE = 100;
        for (let i = 0; i < upsertPayload.length; i += BATCH_SIZE) {
            const chunk = upsertPayload.slice(i, i + BATCH_SIZE);
            console.log(`   - Processing chunk ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(upsertPayload.length / BATCH_SIZE)} (${chunk.length} rows)`);
            
            const { error: upsertError } = await supabase
                .from('fact_teacher_unavailability')
                .upsert(chunk);

            if (upsertError) {
                console.error(`❌ Upsert error on chunk ${i}:`, upsertError);
                throw upsertError;
            }
        }
        
        console.log("✅ Sync completed successfully.");

        return new Response(JSON.stringify({ 
            success: true, 
            count: upsertPayload.length 
        }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, count: 0, message: "No data to sync" }), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    console.error("❌ Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
