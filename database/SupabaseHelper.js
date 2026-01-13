/**
 * ------------------------------------------------------------------
 * Supabase Integration Helper (Shared)
 * ------------------------------------------------------------------
 * This file provides the sendToSupabase function to all scripts in this project.
 */

// Define your Supabase credentials here (or in a separate configuration file)
const SUPABASE_URL = "https://cgznmxcecljfybcgujjb.supabase.co"; // REPLACE WITH YOUR URL
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2NTI1MywiZXhwIjoyMDgzMzQxMjUzfQ.kTov9RFS-FVDNZokkslR0jFH2zaKTUYSBH9NQ8aItlQ"; // REPLACE WITH YOUR KEY

function sendToSupabase(tableName, payload, onConflictColumn = null) {
  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes("your-project")) {
    Logger.log('Supabase credentials missing or default. Skipping sync.');
    return;
  }

  let url = `${SUPABASE_URL}/rest/v1/${tableName}`;
  if (onConflictColumn) {
    url += `?on_conflict=${onConflictColumn}`;
  }
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'resolution=merge-duplicates,return=minimal' // Upsert + minimal return
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    
    if (code >= 200 && code < 300) {
      Logger.log(`Supabase Sync Success [${tableName}]: ${code}`);
    } else {
      Logger.log(`Supabase Sync Failed [${tableName}]: ${code} - ${response.getContentText()}`);
    }
  } catch (e) {
    // Catch network errors or timeouts so the main script doesn't crash
    Logger.log(`Supabase API Error: ${e.toString()}`);
  }
}
