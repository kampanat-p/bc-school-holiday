/**
 * อยากลองฟังก์ชันหลัก: Auto-Login -> Warm-up Page -> Sync Data (AJAX)
 * [UPDATE]: เพิ่ม Step 2.8 เปิดหน้าตารางสอนก่อนดึง JSON เพื่อแก้ 403
 */
function syncDailySchedule() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // --- CONFIG ---
  const MY_USERNAME = "admin.nong"; 
  const MY_PASSWORD = "male*3,Guitar"; // *** ใส่รหัสจริง ***
  
  const LOGIN_PAGE_URL = "https://scheduler.braincloudlearning.com/Users/login";
  // หน้า HTML ของตารางสอน (ต้องเข้าหน้านี้ก่อนเพื่อ Activate Session สำหรับหน้านี้)
  const CALENDAR_PAGE_URL = "https://scheduler.braincloudlearning.com/admin/MasterTimetables";
  // API ตัวจริง
  const DATA_URL_BASE = "https://scheduler.braincloudlearning.com/Timetables/ajax_getMasterTimetableSessions.json";

  const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  // --------------

  let currentCookies = ""; 
  let csrfTokenKey = "";
  let csrfTokenFields = "";
  let dashboardUrl = "";

  console.log("🚀 เริ่มกระบวนการ Sync (Version: Page Warm-up)...");

  // --- STEP 1: Pre-Login ---
  try {
    const pageResponse = UrlFetchApp.fetch(LOGIN_PAGE_URL, {
      'method': 'get',
      'followRedirects': true,
      'headers': { 'User-Agent': USER_AGENT }
    });
    currentCookies = mergeCookies(currentCookies, pageResponse.getAllHeaders()['Set-Cookie']);
    
    const html = pageResponse.getContentText();
    const keyMatch = html.match(/name="data\[_Token\]\[key\]"\s+value="([^"]+)"/);
    const fieldsMatch = html.match(/name="data\[_Token\]\[fields\]"\s+value="([^"]+)"/);
    if (keyMatch) {
      csrfTokenKey = keyMatch[1];
      csrfTokenFields = fieldsMatch[1];
    } else {
      throw new Error("หา Token ไม่เจอ");
    }
  } catch (e) {
    console.error(`❌ Step 1 พลาด: ${e.message}`);
    return;
  }

  // --- STEP 2: POST Login ---
  try {
    const payload = {
      "_method": "POST",
      "data[_Token][key]": csrfTokenKey,
      "data[User][username]": MY_USERNAME,
      "data[User][password]": MY_PASSWORD,
      "data[User][remember]": "0",
      "data[_Token][fields]": csrfTokenFields,
      "data[_Token][unlocked]": ""
    };

    const loginResponse = UrlFetchApp.fetch(LOGIN_PAGE_URL, {
      'method': 'post',
      'payload': payload,
      'headers': {
        'Cookie': currentCookies, 
        'Referer': LOGIN_PAGE_URL,
        'User-Agent': USER_AGENT,
        'Origin': 'https://scheduler.braincloudlearning.com'
      },
      'followRedirects': false
    });

    currentCookies = mergeCookies(currentCookies, loginResponse.getAllHeaders()['Set-Cookie']);

    if (loginResponse.getResponseCode() === 302) {
      dashboardUrl = loginResponse.getAllHeaders()['Location'];
      console.log(`✅ Login สำเร็จ!`);
    } else {
      throw new Error(`Login Failed Code: ${loginResponse.getResponseCode()}`);
    }
  } catch (e) {
    console.error(`❌ Step 2 พลาด: ${e.message}`);
    return;
  }

  // --- STEP 2.5: Follow Redirect to Dashboard ---
  try {
    const dashResponse = UrlFetchApp.fetch(dashboardUrl, {
      'method': 'get',
      'headers': {
        'Cookie': currentCookies,
        'User-Agent': USER_AGENT,
        'Referer': LOGIN_PAGE_URL
      },
      'followRedirects': true
    });
    currentCookies = mergeCookies(currentCookies, dashResponse.getAllHeaders()['Set-Cookie']);
    console.log("✅ เข้าสู่ Dashboard แล้ว");
  } catch (e) {
    console.error(`❌ Step 2.5 พลาด: ${e.message}`);
  }

  // --- STEP 2.8: Warm-up! เปิดหน้าตารางสอน (HTML) ก่อน ---
  // ขั้นตอนนี้สำคัญมาก เพื่อหลอก Server ว่าเราเปิดหน้านี้จริงๆ แล้ว
  try {
    console.log(`🚶‍♂️ กำลังเดินเข้าหน้าตารางสอน (Warm-up)...`);
    const calendarResponse = UrlFetchApp.fetch(CALENDAR_PAGE_URL, {
      'method': 'get',
      'headers': {
        'Cookie': currentCookies,
        'User-Agent': USER_AGENT,
        'Referer': dashboardUrl // อ้างอิงว่ากดมาจาก Dashboard
      },
      'followRedirects': true
    });
    // อัปเดต Cookie อีกรอบ (เผื่อหน้านี้แจก Token เพิ่ม)
    currentCookies = mergeCookies(currentCookies, calendarResponse.getAllHeaders()['Set-Cookie']);
  } catch (e) {
    console.error(`❌ Step 2.8 พลาด: ${e.message}`);
    // ไม่ return เพราะอาจจะยังพอดึงได้
  }

  // --- STEP 3: Fetch Data (JSON) ---
  const TODAY = new Date();
  const URL_DATE = Utilities.formatDate(TODAY, Session.getScriptTimeZone(), "dd-MM-yyyy");
  const DB_DATE = Utilities.formatDate(TODAY, Session.getScriptTimeZone(), "yyyy-MM-dd");

  let jsonResponse;

  try {
    const FINAL_URL = `${DATA_URL_BASE}?date=${URL_DATE}`;
    console.log(`📥 กำลังดึงข้อมูล JSON: ${FINAL_URL}`);

    const dataResponse = UrlFetchApp.fetch(FINAL_URL, {
      'method': 'get',
      'headers': {
        'Cookie': currentCookies, 
        'User-Agent': USER_AGENT,
        'X-Requested-With': 'XMLHttpRequest', 
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Referer': CALENDAR_PAGE_URL // *** สำคัญ: ต้องบอกว่าเราเรียกมาจากหน้าตารางสอน ***
      },
      'muteHttpExceptions': true 
    });

    const code = dataResponse.getResponseCode();
    if (code !== 200) {
      console.error(`❌ Server ตอบกลับมาว่า (Code ${code}):`);
      console.error(dataResponse.getContentText().substring(0, 500));
      throw new Error(`Data Fetch Failed (${code})`);
    }

    const contentText = dataResponse.getContentText();
    if (contentText.trim().startsWith("<")) {
      console.error("❌ ได้รับ HTML แทน JSON:");
      console.log(contentText.substring(0, 300));
      throw new Error("Received HTML instead of JSON");
    }

    jsonResponse = JSON.parse(contentText);
    console.log(`📊 เย้! พบ ${jsonResponse.sessions ? jsonResponse.sessions.length : 0} รายการ`);

  } catch (e) {
    console.error(`❌ ขั้นตอนที่ 3 พลาด: ${e.message}`);
    return;
  }

  // --- STEP 4: Save to DB ---
  saveToDatabase(ss, jsonResponse, DB_DATE);
}

// --- Helper Functions ---

function mergeCookies(oldCookies, newCookiesHeader) {
  if (!newCookiesHeader) return oldCookies;
  
  let cookieMap = new Map();
  if (oldCookies) {
    oldCookies.split(';').forEach(c => {
      let parts = c.split('=');
      if (parts.length >= 2) {
        let key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        cookieMap.set(key, value);
      }
    });
  }
  
  let newCookies = Array.isArray(newCookiesHeader) ? newCookiesHeader : [newCookiesHeader];
  newCookies.forEach(c => {
    let parts = c.split(';')[0].split('='); 
    if (parts.length >= 2) {
      let key = parts[0].trim();
      let value = parts.slice(1).join('=').trim();
      cookieMap.set(key, value);
    }
  });
  
  let cookieList = [];
  cookieMap.forEach((value, key) => {
    cookieList.push(`${key}=${value}`);
  });
  
  return cookieList.join('; ');
}

function saveToDatabase(ss, jsonResponse, TARGET_DATE) {
  const userSheet = ss.getSheetByName('dim_user');
  const userMap = new Map();
  if (userSheet) {
    const userValues = userSheet.getDataRange().getValues();
    for (let i = 1; i < userValues.length; i++) {
      let bcpId = userValues[i][0]; 
      let uType = userValues[i][13];
      let webId = userValues[i][22]; 
      if (webId) userMap.set(String(webId), { id: bcpId, type: String(uType) });
    }
  }

  const schoolSheet = ss.getSheetByName('dim_school');
  const schoolMap = new Map();
  if (schoolSheet) {
    const scValues = schoolSheet.getDataRange().getValues();
    for (let i = 1; i < scValues.length; i++) {
      let scId = scValues[i][0];
      let scCode = (scValues[i][1] || "").toString().trim().toUpperCase();
      if (scCode) schoolMap.set(scCode, scId);
    }
  }

  let factSheet = ss.getSheetByName('fact_daily_session');
  if (!factSheet) {
    factSheet = ss.insertSheet('fact_daily_session');
    factSheet.appendRow(['session_id', 'date', 'start_time', 'end_time', 'class_name', 'school_id', 'actual_teacher_id', 'original_teacher_id', 'status', 'is_payable', 'last_updated', 'cancelled_at']);
  }

  const existingData = factSheet.getDataRange().getValues();
  const existingMap = new Map(); 
  for (let i = 1; i < existingData.length; i++) {
    let sessId = existingData[i][0];
    existingMap.set(String(sessId), {
      rowIndex: i + 1,
      status: existingData[i][8],      
      isPayable: existingData[i][9],   
      cancelledAt: existingData[i][11] 
    });
  }

  let newRows = [];
  let updateCount = 0;
  let insertCount = 0;
  const NOW = new Date();

  if (jsonResponse.sessions && jsonResponse.sessions.length > 0) {
    jsonResponse.sessions.forEach(session => {
      
      if (!session.id || !session.start_time || !session.sc_code) return;

      let webTeacherId = String(session.main_live_teacher_id);
      let actualWebId = webTeacherId;
      let status = "Normal";

      if (session.live_teacher_status === 'covered' && session.live_teacher_id) {
        actualWebId = String(session.live_teacher_id);
        status = "Substituted";
      }

      let originalUser = userMap.get(webTeacherId) || { id: `Unmapped:${webTeacherId}`, type: '999' };
      let actualUser = userMap.get(actualWebId) || { id: `Unmapped:${actualWebId}`, type: '999' };

      let scCode = (session.sc_code || "").toUpperCase();
      let scId = schoolMap.get(scCode) || scCode;

      let isPayable = false;
      let cancelledAt = ""; 
      let prevData = existingMap.get(String(session.id));

      if (session.cancellation_id) {
        status = "Cancelled";
        let isJustCancelled = (!prevData) || (prevData.status !== "Cancelled");

        if (isJustCancelled) {
          cancelledAt = Utilities.formatDate(NOW, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

          if (session.cancel_by === 'local') {
            let classStart = new Date(`${TARGET_DATE}T${session.start_time}`);
            let diffHours = (classStart - NOW) / (1000 * 60 * 60); 

            if (diffHours < 3) isPayable = true; 
            else isPayable = false; 
          } else {
            isPayable = false; 
          }
        } else {
          isPayable = prevData.isPayable;
          cancelledAt = prevData.cancelledAt; 
        }
      } else {
        if (actualUser.type == '210') isPayable = false;
        else isPayable = true;
      }

      let record = [
        session.id,             
        TARGET_DATE,            
        session.start_time,     
        session.end_time,       
        session.classroom,      
        scId,                   
        actualUser.id,       
        originalUser.id,     
        status,                 
        isPayable,              
        new Date(),
        cancelledAt 
      ];

      if (prevData) {
        let rowIdx = prevData.rowIndex;
        factSheet.getRange(rowIdx, 1, 1, record.length).setValues([record]);
        updateCount++;
      } else {
        newRows.push(record);
        insertCount++;
      }
    });
  }

  if (newRows.length > 0) {
    factSheet.getRange(factSheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }

  let msg = `เสร็จสิ้น! (${TARGET_DATE})\n- เพิ่ม: ${insertCount}\n- อัปเดต: ${updateCount}`;
  console.log(msg);
}