/**
 * ------------------------------------------------------------------------
 * ส่วนที่ 1: ฟังก์ชันสั่งงาน (User Interfaces)
 * ------------------------------------------------------------------------
 */

/**
 * [DAILY TRIGGER] ตั้งเวลาให้รันวันละ 1 ครั้ง (เช่น 6 โมงเช้า)
 * ดึงข้อมูลปัจจุบันและอนาคต (past=0)
 */
function syncDailyUnavailability() {
  console.log("⏰ Daily Sync Started...");
  processUnavailabilitySync(false); // false = ไม่เอาอดีต (past=0)
}

/**
 * [MANUAL BACKFILL] กดรันครั้งเดียวเพื่อดึงประวัติทั้งหมด
 * ดึงข้อมูลย้อนหลังทั้งหมด (past=1)
 */
function runBackfillUnavailability() {
  console.log("⏳ Backfill Started (Fetching ALL history)...");
  // ไม่ต้องลูปวันที่แล้ว เพราะ URL นี้มี past=1 ที่ดึงมาให้หมดเลย
  processUnavailabilitySync(true); // true = เอาอดีตด้วย (past=1)
}


/**
 * ------------------------------------------------------------------------
 * ส่วนที่ 2: Core Logic
 * ------------------------------------------------------------------------
 */

const MY_USERNAME_U = "admin.nong"; 
const MY_PASSWORD_U = "male*3,Guitar"; // *** ใส่รหัสจริง ***
const LOGIN_PAGE_URL_U = "https://scheduler.braincloudlearning.com/Users/login";

// [UPDATE] URL ใหม่ที่มีพารามิเตอร์ past
const DATA_URL_BASE_U = "https://scheduler.braincloudlearning.com/admin/Conflicts/ajax_getUnavailableDetailConflictWithTemporaryDetailList";
const USER_AGENT_U = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function processUnavailabilitySync(isBackfill) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let currentCookies = ""; 
  let csrfTokenKey = "";
  let csrfTokenFields = "";
  let redirectUrl = "";

  // --- STEP 1-2.5: AUTO LOGIN ---
  try {
    const p1 = UrlFetchApp.fetch(LOGIN_PAGE_URL_U, {method:'get',followRedirects:true,headers:{'User-Agent':USER_AGENT_U}});
    currentCookies = mergeCookiesU(currentCookies, p1.getAllHeaders()['Set-Cookie']);
    const html = p1.getContentText();
    const keyMatch = html.match(/name="data\[_Token\]\[key\]"\s+value="([^"]+)"/);
    const fieldsMatch = html.match(/name="data\[_Token\]\[fields\]"\s+value="([^"]+)"/);
    
    if (!keyMatch || !fieldsMatch) throw new Error("Token Not Found");
    csrfTokenKey = keyMatch[1];
    csrfTokenFields = fieldsMatch[1];

    const payload = {"_method":"POST","data[_Token][key]":csrfTokenKey,"data[User][username]":MY_USERNAME_U,"data[User][password]":MY_PASSWORD_U,"data[User][remember]":"0","data[_Token][fields]":csrfTokenFields,"data[_Token][unlocked]":""};
    const p2 = UrlFetchApp.fetch(LOGIN_PAGE_URL_U, {method:'post',payload:payload,headers:{'Cookie':currentCookies,'Referer':LOGIN_PAGE_URL_U,'User-Agent':USER_AGENT_U,'Origin':'https://scheduler.braincloudlearning.com'},followRedirects:false});
    currentCookies = mergeCookiesU(currentCookies, p2.getAllHeaders()['Set-Cookie']);
    
    if (p2.getResponseCode() === 302) {
        redirectUrl = p2.getAllHeaders()['Location'];
        const p3 = UrlFetchApp.fetch(redirectUrl, {method:'get',headers:{'Cookie':currentCookies,'User-Agent':USER_AGENT_U,'Referer':LOGIN_PAGE_URL_U},followRedirects:true});
        currentCookies = mergeCookiesU(currentCookies, p3.getAllHeaders()['Set-Cookie']);
    } else {
        throw new Error("Login Failed (Not 302)");
    }
    console.log("✅ Login Successful");
  } catch(e) {
    console.error(`Login Error: ${e.message}`);
    return; 
  }

  // --- STEP 3: Fetch Data ---
  let jsonResponse;
  try {
    // Construct URL: ?past=1 หรือ ?past=0
    const pastParam = isBackfill ? "1" : "0";
    const FINAL_URL = `${DATA_URL_BASE_U}?past=${pastParam}`;
    
    console.log(`📥 Fetching data from: ${FINAL_URL}`);

    const res = UrlFetchApp.fetch(FINAL_URL, {
      method: 'get',
      headers: {'Cookie':currentCookies, 'User-Agent':USER_AGENT_U, 'X-Requested-With':'XMLHttpRequest', 'Accept':'application/json', 'Referer':redirectUrl},
      muteHttpExceptions: true
    });
    
    if (res.getResponseCode() !== 200) throw new Error(`HTTP ${res.getResponseCode()}`);
    const txt = res.getContentText();
    
    if (txt.trim().startsWith("<")) {
       console.error("Received HTML Preview: " + txt.substring(0, 200));
       throw new Error("Got HTML instead of JSON");
    }
    
    jsonResponse = JSON.parse(txt);
    console.log("✅ Data Fetched Successfully");

  } catch(e) {
    console.error(`Fetch Error: ${e.message}`);
    return;
  }

  // --- STEP 4: Save ---
  saveToUnavailabilityDB(ss, jsonResponse);
}

function saveToUnavailabilityDB(ss, jsonResponse) {
  // 1. Load User Map (WebID -> BCP-ID)
  const userSheet = ss.getSheetByName('dim_user');
  const userMap = new Map();
  if (userSheet) {
    const vals = userSheet.getDataRange().getValues();
    for (let i=1; i<vals.length; i++) {
        // Col W (22) is WebID, Col A (0) is BCP-ID
        if(vals[i][22]) userMap.set(String(vals[i][22]), vals[i][0]);
    }
  }

  // 2. Prepare Sheet
  let sheet = ss.getSheetByName('fact_teacher_unavailability');
  if (!sheet) {
    sheet = ss.insertSheet('fact_teacher_unavailability');
    sheet.appendRow(['unavailability_id', 'teacher_id', 'start_date', 'end_date', 'start_time', 'end_time', 'remark', 'semester_id', 'last_updated']);
  }
  
  // 3. Load Existing Data (for Upsert)
  const existingData = sheet.getDataRange().getValues();
  const existingMap = new Map();
  for (let i = 1; i < existingData.length; i++) {
     existingMap.set(String(existingData[i][0]), i + 1);
  }

  let newRows = [];
  let updateCount = 0;
  
  // Helper Function: แปลง String "YYYY-MM-DD" ให้เป็น Date Object จริงๆ
  // เพื่อแก้ปัญหา Looker Studio Drill Down ไม่ได้
  const parseDateObj = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-'); 
    // สร้าง Date โดยระบุ ปี, เดือน-1, วัน (เพื่อป้องกันปัญหา Timezone เลื่อน)
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  // 4. Parse JSON & Prepare Rows
  if (jsonResponse.Semester) {
    for (const semesterId in jsonResponse.Semester) {
        const semesterData = jsonResponse.Semester[semesterId];
        
        if (semesterData.Template && Array.isArray(semesterData.Template)) {
            semesterData.Template.forEach(item => {
                
                const uId = item.u_id;
                const webTeacherId = String(item.u_teacher_id);
                const bcpTeacherId = userMap.get(webTeacherId) || `Unmapped:${webTeacherId}`;
                
                // Composite Key
                const compositeId = `${uId}_${item.u_start_date}_${item.u_start_time}`;

                const record = [
                    compositeId,            // A: unavailability_id
                    bcpTeacherId,           // B: teacher_id
                    parseDateObj(item.u_start_date), // C: start_date (แปลงเป็น Date Object ทันที)
                    parseDateObj(item.u_end_date),   // D: end_date (แปลงเป็น Date Object ทันที)
                    item.u_start_time,      // E: start_time
                    item.u_end_time,        // F: end_time
                    item.u_remark,          // G: remark
                    item.semester_id,       // H: semester_id
                    new Date()              // I: last_updated
                ];

                if (existingMap.has(compositeId)) {
                    // Update
                    let rowIdx = existingMap.get(compositeId);
                    sheet.getRange(rowIdx, 1, 1, record.length).setValues([record]);
                    updateCount++;
                } else {
                    // Insert
                    newRows.push(record);
                }
            });
        }
    }
  }

  // 5. Batch Insert New Rows
  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }
  
  console.log(`💾 Saved Unavailability: Inserted ${newRows.length}, Updated ${updateCount}`);
}

function mergeCookiesU(oldCookies, newCookiesHeader) {
  if (!newCookiesHeader) return oldCookies;
  let cookieMap = new Map();
  if (oldCookies) oldCookies.split(';').forEach(c => { const p = c.split('='); if(p.length>=2) cookieMap.set(p[0].trim(), p.slice(1).join('=').trim()); });
  let newCookies = Array.isArray(newCookiesHeader) ? newCookiesHeader : [newCookiesHeader];
  newCookies.forEach(c => { const p = c.split(';')[0].split('='); if(p.length>=2) cookieMap.set(p[0].trim(), p.slice(1).join('=').trim()); });
  let list = []; cookieMap.forEach((v, k) => list.push(`${k}=${v}`));
  return list.join('; ');
}