/*
 * 📧 Braincloud Email Notifier
 * Receives Webhook from Supabase -> Sends Email via Gmail
 * 
 * Instructions:
 * 1. Deploy this as a Web App (Execute as Me, Access: Anyone)
 * 2. Copy the URL to Supabase Webhooks
 */

const CONFIG = {
  // List all emails you want to notify here
  RECIPIENTS: [
    "k.phetkham@braincloudlearning.com",
    "l.sukbanjong@braincloudlearning.com",
    "d.guillory@braincloudlearning.com",
    "e.lopez@braincloudlearning.com",
    "a.deonarain@braincloudlearning.com"
  ],
  
  // Sender Name appearing in Inbox
  SENDER_NAME: "Braincloud Scheduler"
};

const SUPABASE_URL = "https://cgznmxcecljfybcgujjb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2NTI1MywiZXhwIjoyMDgzMzQxMjUzfQ.kTov9RFS-FVDNZokkslR0jFH2zaKTUYSBH9NQ8aItlQ";

/**
 * Health Check: To verify the URL is working in browser
 */
function doGet(e) {
  return ContentService.createTextOutput("✅ Braincloud Email Notifier is Online.");
}

/**
 * Webhook Handler: Receives POST from Supabase
 */
function doPost(e) {
  try {
    const jsonString = e.postData.contents;
    if (!jsonString) throw new Error("No JSON payload received");
    
    const payload = JSON.parse(jsonString);
    
    // Supabase sends data inside { record: { ... } }
    const data = payload.record || payload;

    // Validate essential data
    if (!data.teacher_id) throw new Error("Missing 'teacher_id'");

    // 🔍 Lookup Teacher Name from Supabase
    try {
        const nameData = getTeacherNameFromSupabase(data.teacher_id);
        data.teacher_name_display = nameData.name;
        data.debug_log = nameData.log; // Attach log to email for debugging
    } catch(e) {
        data.teacher_name_display = data.teacher_id;
        data.debug_log = "Error in lookup: " + e.message;
    }

    // Send the email
    sendNotificationEmail(data);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success", 
      message: "Email sent to " + CONFIG.RECIPIENTS.length + " recipients"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error("Error in doPost:", err);
    return ContentService.createTextOutput(JSON.stringify({
      status: "error", 
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Lookup Teacher Name from Supabase (dim_user)
 */
function getTeacherNameFromSupabase(id) {
  try {
    // 1. Check Cache first (Fast)
    const cache = CacheService.getScriptCache();
    const cachedName = cache.get("teacher_supa_v2_" + id);
    if (cachedName) return { name: cachedName, log: "Cache Hit" };

    // 2. Fetch from Supabase REST API
    // Use encodeURIComponent for safety
    const safeId = encodeURIComponent(id);
    const url = `${SUPABASE_URL}/rest/v1/dim_user?user_id=eq.${safeId}&select=firstname_en,lastname_en,nickname_en`;
    
    const options = {
      method: "get",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json"
      },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const content = response.getContentText();

    if (code !== 200) {
        return { name: id, log: `API Error ${code}: ${content}` };
    }

    const json = JSON.parse(content);

    if (json && json.length > 0) {
      const u = json[0];
      let fullName = u.firstname_en;
      if (u.lastname_en) fullName += " " + u.lastname_en;
      if (u.nickname_en) fullName += ` (${u.nickname_en})`;
      
      // Cache for 6 hours
      cache.put("teacher_supa_v2_" + id, fullName, 21600);
      return { name: fullName, log: "API Success" }; 
    }

    return { name: id, log: "User not found in dim_user" };

  } catch (e) {
    console.error("Supabase Lookup Error: " + e.toString());
    return { name: id, log: "Crash: " + e.toString() };
  }
}

/**
 * Construct and Send Email
 */
function sendNotificationEmail(data) {
  const subject = `📢 Leave Request: ${data.teacher_name_display} (${data.type})`;
  
  // Format Time Range
  const timeRange = (data.start_date === data.end_date) 
    ? data.start_date 
    : `${data.start_date} ➝ ${data.end_date}`;

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2563eb; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">New Leave Request</h2>
      </div>
      
      <div style="padding: 24px; background-color: #ffffff;">
        <p style="font-size: 16px; color: #333; margin-bottom: 12px;">Hello,</p>
        <p style="font-size: 16px; color: #333;">A leave ticket was submitted. Here are the details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 10px; border-bottom: 1px solid #eee; width: 30%;"><strong>Teacher</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <span style="font-size: 1.1em; font-weight: bold; color: #1e40af;">${data.teacher_name_display}</span>
              <br><span style="font-size: 0.8em; color: #6b7280;">(${data.teacher_id})</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Type</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${data.type}</span>
            </td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Time Range</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${timeRange}</td>
          </tr>
           <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Reason</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-style: italic;">"${data.reason || '-'}"</td>
          </tr>
        </table>
        
        <div style="margin-top: 30px; text-align: center;">
          <p style="color: #555; margin-bottom: 15px;">Click below to view the overall tickets and schedule:</p>
          <a href="https://kampanat-p.github.io/bc-school-holiday/admin-calendar.html" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Submission Info & Calendar</a>
        </div>

        <p style="margin-top: 30px; font-size: 16px; color: #333;">Thank you, have a good day!</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        Sent automatically by Braincloud Operations System • <span style="font-size: 10px">Debug: ${data.debug_log || '-'}</span>
      </div>
    </div>
  `;

  // Filter out empty emails just in case
  const validRecipients = CONFIG.RECIPIENTS.filter(email => email && email.includes("@"));

  if (validRecipients.length > 0) {
    // Send using GmailApp for better options (like 'name')
    // We send separate emails or one email to multiple Bcc/Cc? 
    // Best to send individual or comma separated to 'to'. 
    // GmailApp.sendEmail(recipient, subject, body, options)
    
    // Convert array to comma-separated string
    const recipientStr = validRecipients.join(",");
    
    try {
      GmailApp.sendEmail(recipientStr, subject, "", {
        htmlBody: htmlBody,
        name: CONFIG.SENDER_NAME
      });
      console.log(`Email sent to: ${recipientStr}`);
    } catch (e) {
      console.error("GmailApp Failed: " + e.message);
      // Fallback to MailApp if GmailApp fails (permissions issues sometimes)
      MailApp.sendEmail({
        to: recipientStr,
        subject: subject,
        htmlBody: htmlBody,
        name: CONFIG.SENDER_NAME
      });
    }
  }
}

/**
 * 🛠️ DEBUGGING TOOL
 * Run this function manually in the GAS Editor to test connections.
 * Select 'testSystem' from the dropdown and click 'Run'.
 */
function testSystem() {
  console.log("1. Starting Test...");
 
  // FORCE PERMISSION CHECK:
  // This line is here intentionally to force the "Review Permissions" dialog 
  // to appear if you haven't authorized external requests yet.
  UrlFetchApp.fetch("https://www.google.com");

  const testId = "bcp-00409"; // The ID that was failing
  
  console.log(`2. Testing Supabase Lookup for: ${testId}`);
  const result = getTeacherNameFromSupabase(testId);
  
  console.log("3. Lookup Result:");
  console.log(JSON.stringify(result, null, 2));
  
  if (result.name === testId) {
    console.error("❌ FAILURE: Name was not resolved. Check the log property above.");
  } else {
    console.log("✅ SUCCESS: Found name: " + result.name);
  }
}