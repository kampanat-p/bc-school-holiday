/**
 * ------------------------------------------------------------------------
 * ส่วนที่ 1: ฟังก์ชันสั่งงาน (User Interfaces)
 * ------------------------------------------------------------------------
 */

/**
 * [DAILY TRIGGER] ฟังก์ชันสำหรับตั้งเวลาอัตโนมัติรายชั่วโมง
 */
function syncDailySchedule() {
  const TODAY = new Date();
  processSync(TODAY, 'ALL'); 
}

/**
 * [MANUAL BACKFILL] ฟังก์ชันสำหรับกดรันย้อนหลัง
 */
function runBackfill() {
  // --- ตั้งค่าช่วงเวลาที่จะ Backfill ---
  const START_DATE = "2025-04-01"; 
  const END_DATE =   "2025-04-30"; 
  // ----------------------------------

  const start = new Date(START_DATE);
  const end = new Date(END_DATE);
  
  // วนลูปทีละวัน
  // ใช้ new Date(d) เพื่อป้องกันปัญหา Reference
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    let dateStr = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
    console.log(`⏳ กำลัง Backfill วันที่: ${dateStr}`);
    try {
      processSync(new Date(d), 'ALL'); 
    } catch (e) {
      console.error(`❌ ข้ามวันที่ ${dateStr} เนื่องจาก Error: ${e.message}`);
    }
    Utilities.sleep(500); 
  }
  
  SpreadsheetApp.getUi().alert("✅ Backfill เสร็จสิ้น!");
}


/**
 * ------------------------------------------------------------------------
 * ส่วนที่ 2: Core Logic
 * ------------------------------------------------------------------------
 */

const MY_USERNAME = "admin.nong"; 
const MY_PASSWORD = "male*3,Guitar"; 
const LOGIN_PAGE_URL = "https://scheduler.braincloudlearning.com/Users/login";
const DATA_URL_BASE = "https://scheduler.braincloudlearning.com/Timetables/ajax_getMasterTimetableSessions.json";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function processSync(targetDateObj, mode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const URL_DATE = Utilities.formatDate(targetDateObj, Session.getScriptTimeZone(), "dd-MM-yyyy");
  const DB_DATE = Utilities.formatDate(targetDateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");

  let currentCookies = ""; 
  let csrfTokenKey = "";
  let csrfTokenFields = "";
  let redirectUrl = "";

  // --- STEP 1-2.5: AUTO LOGIN ---
  try {
    const p1 = UrlFetchApp.fetch(LOGIN_PAGE_URL, {method:'get',followRedirects:true,headers:{'User-Agent':USER_AGENT}});
    currentCookies = mergeCookies(currentCookies, p1.getAllHeaders()['Set-Cookie']);
    const html = p1.getContentText();
    const keyMatch = html.match(/name="data\[_Token\]\[key\]"\s+value="([^"]+)"/);
    const fieldsMatch = html.match(/name="data\[_Token\]\[fields\]"\s+value="([^"]+)"/);
    
    if (!keyMatch || !fieldsMatch) throw new Error("Token Not Found");
    csrfTokenKey = keyMatch[1];
    csrfTokenFields = fieldsMatch[1];

    const payload = {"_method":"POST","data[_Token][key]":csrfTokenKey,"data[User][username]":MY_USERNAME,"data[User][password]":MY_PASSWORD,"data[User][remember]":"0","data[_Token][fields]":csrfTokenFields,"data[_Token][unlocked]":""};
    const p2 = UrlFetchApp.fetch(LOGIN_PAGE_URL, {method:'post',payload:payload,headers:{'Cookie':currentCookies,'Referer':LOGIN_PAGE_URL,'User-Agent':USER_AGENT,'Origin':'https://scheduler.braincloudlearning.com'},followRedirects:false});
    currentCookies = mergeCookies(currentCookies, p2.getAllHeaders()['Set-Cookie']);
    
    if (p2.getResponseCode() === 302) {
        redirectUrl = p2.getAllHeaders()['Location'];
        const p3 = UrlFetchApp.fetch(redirectUrl, {method:'get',headers:{'Cookie':currentCookies,'User-Agent':USER_AGENT,'Referer':LOGIN_PAGE_URL},followRedirects:true});
        currentCookies = mergeCookies(currentCookies, p3.getAllHeaders()['Set-Cookie']);
    } else {
        throw new Error("Login Failed (Not 302)");
    }
  } catch(e) {
    console.error(`Login Error: ${e.message}`);
    return; 
  }

  // --- STEP 3: Fetch Data ---
  let jsonResponse;
  try {
    const FINAL_URL = `${DATA_URL_BASE}?date=${URL_DATE}`;
    const res = UrlFetchApp.fetch(FINAL_URL, {
      method: 'get',
      headers: {'Cookie':currentCookies, 'User-Agent':USER_AGENT, 'X-Requested-With':'XMLHttpRequest', 'Accept':'application/json', 'Referer':redirectUrl},
      muteHttpExceptions: true
    });
    
    if (res.getResponseCode() !== 200) throw new Error(`HTTP ${res.getResponseCode()}`);
    jsonResponse = JSON.parse(res.getContentText());
  } catch(e) {
    console.error(`Fetch Error (${URL_DATE}): ${e.message}`);
    return;
  }

  // --- STEP 4: Save ---
  saveToDatabase(ss, jsonResponse, DB_DATE, mode);
}

function saveToDatabase(ss, jsonResponse, TARGET_DATE, mode) {
  // --- 1. Load Reference Maps (User & School) ---
  const userSheet = ss.getSheetByName('dim_user');
  const userMap = new Map();
  if (userSheet) {
    const vals = userSheet.getDataRange().getValues();
    for (let i=1; i<vals.length; i++) {
        if(vals[i][22]) userMap.set(String(vals[i][22]), {id:vals[i][0], type:vals[i][13]});
    }
  }

  const schoolSheet = ss.getSheetByName('dim_school');
  const schoolMap = new Map();
  if (schoolSheet) {
    const vals = schoolSheet.getDataRange().getValues();
    for (let i=1; i<vals.length; i++) {
        if(vals[i][1]) schoolMap.set(String(vals[i][1]).trim().toUpperCase(), vals[i][0]);
    }
  }

  // --- 2. Prepare Sheet ---
  let factSheet = ss.getSheetByName('fact_daily_session');
  if (!factSheet) {
    factSheet = ss.insertSheet('fact_daily_session');
    factSheet.appendRow(['session_id', 'date', 'start_time', 'end_time', 'class_name', 'school_id', 'actual_teacher_id', 'original_teacher_id', 'status', 'is_payable', 'last_updated', 'cancelled_at']);
  }
  
  // --- 3. Load Existing Data for Watchdog Logic ---
  const existingData = factSheet.getDataRange().getValues();
  const existingMap = new Map();
  for (let i = 1; i < existingData.length; i++) {
    // ใช้ Composite Key จาก Col A
    let key = String(existingData[i][0]); 
    existingMap.set(key, {
      row: i + 1,
      status: existingData[i][8],      // Col I
      isPayable: existingData[i][9],   // Col J
      cancelledAt: existingData[i][11] // Col L
    });
  }

  let newRows = [];
  let updateCount = 0;
  const NOW = new Date(); 
  
  if (jsonResponse.sessions) {
    jsonResponse.sessions.forEach(session => {
      // Filter Garbage
      if (!session.id || !session.start_time || !session.sc_code) return;

      // ------------------------------------------------
      // A. ระบุตัวครูและสถานะที่เข้ามาใหม่ (Incoming Status)
      // ------------------------------------------------
      let webTeacherId = String(session.main_live_teacher_id);
      let actualWebId = webTeacherId;
      
      let incomingStatus = "Normal";
      
      // เช็คสอนแทน
      if (session.live_teacher_status === 'covered' && session.live_teacher_id) {
        actualWebId = String(session.live_teacher_id);
        incomingStatus = "Substituted";
      }

      // เช็คยกเลิก (จาก API)
      if (session.cancellation_id) {
          if (session.cancel_by === 'local') {
              incomingStatus = "Cancelled (School)";
          } else {
              incomingStatus = "Cancelled (BC)";
          }
      }

      // Filter Mode (Backfill)
      if (mode === 'IMPORTANT_ONLY' && incomingStatus === "Normal") return; 

      // Map User
      let actUser = userMap.get(actualWebId) || {id:`Unmapped:${actualWebId}`, type:'999'};
      let orgUser = userMap.get(webTeacherId) || {id:`Unmapped:${webTeacherId}`, type:'999'};
      let scCode = (session.sc_code || "").toUpperCase();
      let scId = schoolMap.get(scCode) || scCode;

      // Create Key
      let compositeId = `${session.id}_${TARGET_DATE}_${session.start_time}`;
      
      // ------------------------------------------------
      // B. 🧠 INTELLIGENT WATCHDOG LOGIC
      // ------------------------------------------------
      let finalStatus = incomingStatus;
      let finalPayable = false;
      let finalCancelledAt = "";

      // ดึงข้อมูลเก่า (ถ้ามี)
      let prevData = existingMap.get(compositeId);

      if (incomingStatus.startsWith("Cancelled")) {
          // >>> กรณี 1: ข้อมูลใหม่บอกว่า "ยกเลิก" <<<
          
          let isJustCancelled = (!prevData) || (!String(prevData.status).startsWith("Cancelled"));

          if (isJustCancelled) {
              // 🚨 เพิ่งยกเลิกสดๆ ร้อนๆ (Normal -> Cancelled)
              finalCancelledAt = Utilities.formatDate(NOW, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

              if (incomingStatus === "Cancelled (School)") {
                  // คำนวณกฎ 3 ชม.
                  let dParts = TARGET_DATE.split('-'); 
                  let tParts = session.start_time.split(':'); 
                  let classStartObj = new Date(dParts[0], dParts[1]-1, dParts[2], tParts[0], tParts[1], 0);
                  
                  let diffMs = classStartObj.getTime() - NOW.getTime();
                  let diffHrs = diffMs / (1000 * 60 * 60);

                  console.log(`🕒 Cancel Detected! Class: ${session.start_time}, Now: ${finalCancelledAt}, Diff: ${diffHrs.toFixed(2)} hrs`);

                  if (diffHrs < 3) finalPayable = true; // Late Cancel -> จ่าย
                  else finalPayable = false; // Early Cancel -> ไม่จ่าย
              } else {
                  finalPayable = false; // BC ยกเลิก -> ไม่จ่าย
              }

          } else {
              // 💤 ยกเลิกไปนานแล้ว (Cancelled -> Cancelled)
              // รักษาค่าเดิมไว้ (เผื่อแก้ Manual)
              finalPayable = prevData.isPayable;
              finalCancelledAt = prevData.cancelledAt; 
          }

      } else {
          // >>> กรณี 2: ข้อมูลใหม่บอกว่า "สอนปกติ" (Normal / Substituted) <<<
          
          // [UPDATE] เช็คว่าเป็นการ "คืนชีพ" หรือไม่? (Cancelled -> Normal)
          if (prevData && String(prevData.status).startsWith("Cancelled")) {
             console.log(`✨ Reinstatement Detected! (คืนชีพ): ${compositeId}`);
             // ล้างเวลา Cancel ทิ้ง
             finalCancelledAt = ""; 
             // คำนวณเงินใหม่ตามกฎปกติ (เหมือนไม่เคยยกเลิก)
             finalPayable = (actUser.type != '210'); 
          } 
          else {
             // กรณีปกติ (Normal -> Normal) หรือเพิ่งมาใหม่
             finalCancelledAt = ""; 
             finalPayable = (actUser.type != '210'); 
          }
      }

      // ------------------------------------------------
      // C. สร้าง Record
      // ------------------------------------------------
      let record = [
        compositeId, 
        TARGET_DATE, 
        session.start_time, 
        session.end_time, 
        session.classroom,
        scId, 
        actUser.id, 
        orgUser.id,
        finalStatus, 
        finalPayable, 
        NOW, 
        finalCancelledAt
      ];

      // D. Upsert
      if (prevData) {
        let rowIdx = prevData.row;
        factSheet.getRange(rowIdx, 1, 1, record.length).setValues([record]);
        updateCount++;
      } else {
        newRows.push(record);
      }
    });
  }

  // Batch Insert
  if (newRows.length > 0) {
    factSheet.getRange(factSheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }
  console.log(`💾 Saved ${TARGET_DATE}: Inserted ${newRows.length}, Updated ${updateCount}`);
}

function mergeCookies(oldCookies, newCookiesHeader) {
  if (!newCookiesHeader) return oldCookies;
  let cookieMap = new Map();
  if (oldCookies) oldCookies.split(';').forEach(c => { const p = c.split('='); if(p.length>=2) cookieMap.set(p[0].trim(), p.slice(1).join('=').trim()); });
  let newCookies = Array.isArray(newCookiesHeader) ? newCookiesHeader : [newCookiesHeader];
  newCookies.forEach(c => { const p = c.split(';')[0].split('='); if(p.length>=2) cookieMap.set(p[0].trim(), p.slice(1).join('=').trim()); });
  let list = []; cookieMap.forEach((v, k) => list.push(`${k}=${v}`));
  return list.join('; ');
}