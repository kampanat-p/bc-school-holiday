/**
 * ------------------------------------------------------------------------
 * ส่วนที่ 1: ฟังก์ชันสั่งงาน (User Interfaces)
 * ------------------------------------------------------------------------
 */

/**
 * [DAILY TRIGGER] ตั้งเวลาให้รันวันละ 1 ครั้ง
 * ดึงข้อมูลครูใหม่ + อัปเดตข้อมูลครูเก่า (Status/Affiliation) ให้ตรงกับเว็บ
 */
function syncTeachersDaily() {
  console.log("👥 Teacher Sync Started...");
  processTeacherSync(); 
}

/**
 * ------------------------------------------------------------------------
 * ส่วนที่ 2: Core Logic
 * ------------------------------------------------------------------------
 */

const MY_USERNAME_T = "admin.nong"; 
const MY_PASSWORD_T = "male*3,Guitar"; // *** ใส่รหัสจริง ***
const LOGIN_PAGE_URL_T = "https://scheduler.braincloudlearning.com/Users/login";
const DATA_URL_TEACHERS = "https://scheduler.braincloudlearning.com/Teachers/ajax_getTeachers.json?get=1";
const USER_AGENT_T = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function processTeacherSync() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let currentCookies = ""; 
  let csrfTokenKey = "";
  let csrfTokenFields = "";
  let redirectUrl = "";

  // --- STEP 1: AUTO LOGIN ---
  try {
    const p1 = UrlFetchApp.fetch(LOGIN_PAGE_URL_T, {method:'get',followRedirects:true,headers:{'User-Agent':USER_AGENT_T}});
    currentCookies = mergeCookiesT(currentCookies, p1.getAllHeaders()['Set-Cookie']);
    const html = p1.getContentText();
    
    const keyMatch = html.match(/name="data\[_Token\]\[key\]"\s+value="([^"]+)"/);
    const fieldsMatch = html.match(/name="data\[_Token\]\[fields\]"\s+value="([^"]+)"/);
    
    if (!keyMatch || !fieldsMatch) throw new Error("Token Not Found");
    csrfTokenKey = keyMatch[1];
    csrfTokenFields = fieldsMatch[1];

    const payload = {"_method":"POST","data[_Token][key]":csrfTokenKey,"data[User][username]":MY_USERNAME_T,"data[User][password]":MY_PASSWORD_T,"data[User][remember]":"0","data[_Token][fields]":csrfTokenFields,"data[_Token][unlocked]":""};
    const p2 = UrlFetchApp.fetch(LOGIN_PAGE_URL_T, {method:'post',payload:payload,headers:{'Cookie':currentCookies,'Referer':LOGIN_PAGE_URL_T,'User-Agent':USER_AGENT_T,'Origin':'https://scheduler.braincloudlearning.com'},followRedirects:false});
    currentCookies = mergeCookiesT(currentCookies, p2.getAllHeaders()['Set-Cookie']);
    
    if (p2.getResponseCode() === 302) {
        redirectUrl = p2.getAllHeaders()['Location'];
        const p3 = UrlFetchApp.fetch(redirectUrl, {method:'get',headers:{'Cookie':currentCookies,'User-Agent':USER_AGENT_T,'Referer':LOGIN_PAGE_URL_T},followRedirects:true});
        currentCookies = mergeCookiesT(currentCookies, p3.getAllHeaders()['Set-Cookie']);
        console.log("✅ Login Successful");
    } else {
        throw new Error("Login Failed (Not 302)");
    }
  } catch(e) {
    console.error(`Login Error: ${e.message}`);
    return; 
  }

  // --- STEP 3: Fetch Teacher Data ---
  let jsonResponse;
  try {
    console.log(`📥 Fetching teachers from: ${DATA_URL_TEACHERS}`);
    const res = UrlFetchApp.fetch(DATA_URL_TEACHERS, {
      method: 'get',
      headers: {'Cookie':currentCookies, 'User-Agent':USER_AGENT_T, 'X-Requested-With':'XMLHttpRequest', 'Accept':'application/json', 'Referer':redirectUrl},
      muteHttpExceptions: true
    });
    
    if (res.getResponseCode() !== 200) throw new Error(`HTTP ${res.getResponseCode()}`);
    const txt = res.getContentText();
    if (txt.trim().startsWith("<")) throw new Error("Got HTML instead of JSON");
    jsonResponse = JSON.parse(txt);
    console.log(`✅ Data Fetched. Found ${jsonResponse.teachers ? jsonResponse.teachers.length : 0} teachers.`);

  } catch(e) {
    console.error(`Fetch Error: ${e.message}`);
    return;
  }

  // --- STEP 4: Save to Database ---
  saveTeachersToDB(ss, jsonResponse);
}

function saveTeachersToDB(ss, jsonResponse) {
  const sheet = ss.getSheetByName('dim_user');
  if (!sheet) {
    console.error("❌ Sheet 'dim_user' not found!");
    return;
  }

  // 1. โหลดข้อมูลเดิม (Map ID -> Data)
  const existingData = sheet.getDataRange().getValues();
  const existingMap = new Map();
  
  // Col W (Index 22) is braincloud_id
  for (let i = 1; i < existingData.length; i++) {
    let bcId = String(existingData[i][22]).trim(); 
    if (bcId) {
        existingMap.set(bcId, {
            row: i + 1,
            userType: String(existingData[i][13]), // Col N
            affiliation: String(existingData[i][14]), // Col O
            position: String(existingData[i][15]), // Col P
            status: String(existingData[i][20]).toLowerCase() // Col U
        });
    }
  }

  let newRows = [];
  let updateCount = 0;
  let changeLogs = []; 
  
  // [BATCH OPT]
  let supabaseUpdates = [];

  // 2. วนลูปข้อมูลใหม่
  if (jsonResponse.teachers && Array.isArray(jsonResponse.teachers)) {
    jsonResponse.teachers.forEach(teacher => {
      let webId = String(teacher.id).trim();

      // --- LOGIC คำนวณค่า ---
      let rawSchoolCode = (teacher.school_code || "").trim();
      let calculatedAffiliation = rawSchoolCode;
      let calculatedUserType = ""; 
      let calculatedPosition = ""; 
      let calculatedStatus = teacher.status ? teacher.status.toLowerCase() : "";
      
      let fnameEn = (teacher.firstname_en || "").trim();
      let fnameTh = (teacher.firstname_th || "").trim();
      let teacherName = `${fnameEn} ${teacher.lastname_en || ""}`.trim();
      
      // CASE 1: เป็น Braincloud (BRN)
      if (rawSchoolCode === 'BRN') {
          calculatedAffiliation = "BC"; 
          // userType ไม่ยุ่ง
          if (fnameEn.toLowerCase() === fnameTh.toLowerCase() && fnameEn !== "") {
              calculatedPosition = "100"; 
          } else {
              calculatedPosition = "110"; 
          }
      } 
      // CASE 2: โรงเรียนอื่น (Non-BRN)
      else {
          calculatedUserType = "100"; // External
      }

      // --- ตรวจสอบว่ามีอยู่แล้วหรือเป็นคนใหม่ ---
      if (existingMap.has(webId)) {
          // [DISABLED BY USER REQUEST] 
          // Stop updating existing teachers to prevent overwriting manual data.
          // Only new teachers will be added.
          
          /* 
          // >>> UPDATE LOGIC (ซ่อมแซมและอัปเดตข้อมูลเก่า) <<<
          let current = existingMap.get(webId);
          let needsUpdate = false;
          
          // [UPDATED] 1. เช็ค Affiliation
          if (current.affiliation !== calculatedAffiliation) {
              sheet.getRange(current.row, 15).setValue(calculatedAffiliation); 
              changeLogs.push(`[UPDATE] ${teacherName}: Affiliation changed '${current.affiliation}' -> '${calculatedAffiliation}'`);
              needsUpdate = true;
          }

          // [UPDATED] 2. เช็ค Status
          if (current.status !== calculatedStatus) {
              sheet.getRange(current.row, 21).setValue(calculatedStatus); 
              changeLogs.push(`[UPDATE] ${teacherName}: Status changed '${current.status}' -> '${calculatedStatus}'`);
              needsUpdate = true;
          }

          // 3. เช็ค Position (เฉพาะ BRN และค่าเดิมว่างอยู่)
          if (rawSchoolCode === 'BRN' && current.position === "" && calculatedPosition !== "") {
              sheet.getRange(current.row, 16).setValue(calculatedPosition);
              changeLogs.push(`[UPDATE] ${teacherName}: Position set to '${calculatedPosition}'`);
              needsUpdate = true;
          }

          // 4. เช็ค User Type (เฉพาะ Non-BRN และค่าเดิมว่างอยู่)
          if (rawSchoolCode !== 'BRN' && current.userType === "" && calculatedUserType !== "") {
              sheet.getRange(current.row, 14).setValue(calculatedUserType); 
              changeLogs.push(`[UPDATE] ${teacherName}: User Type set to '${calculatedUserType}'`);
              needsUpdate = true;
          }

          if (needsUpdate) {
             updateCount++;
             
             // [BATCH OPT]
             supabaseUpdates.push({
               braincloud_id: webId,
               first_name_en: fnameEn,
               last_name_en: teacher.lastname_en || "",
               first_name_th: fnameTh,
               last_name_th: teacher.lastname_th || "",
               user_type: (calculatedUserType !== "") ? calculatedUserType : current.userType,
               affiliation: calculatedAffiliation,
               position: (calculatedPosition !== "") ? calculatedPosition : current.position,
               status: calculatedStatus === 'enabled' ? 'Active' : 'Inactive', // Map to DB status
               is_active: calculatedStatus === 'enabled' 
             });
          }
          */
      } 
      // --- CASE: NEW TEACHER ---
      else {
          // >>> INSERT LOGIC (เพิ่มคนใหม่) <<<
          let row = new Array(existingData[0].length).fill(""); 

          row[0] = ""; // Col A (Auto)
          row[2] = fnameEn;
          row[3] = teacher.lastname_en || "";
          row[4] = fnameTh;
          row[5] = teacher.lastname_th || "";
          
          row[13] = calculatedUserType;
          row[14] = calculatedAffiliation;
          row[15] = calculatedPosition;

          row[20] = calculatedStatus;
          row[22] = webId;

          newRows.push(row);
          changeLogs.push(`[NEW] Added teacher: ${teacherName} (${calculatedAffiliation})`);
      }
    }); // End Loop
  }
  
  // 3. บันทึกคนใหม่ (Sheet)
  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    
    // Sync New Rows to Supabase
    const newPayload = newRows.map(r => ({
       braincloud_id: r[22],
       first_name_en: r[2],
       last_name_en: r[3],
       first_name_th: r[4],
       last_name_th: r[5],
       user_type: r[13],
       affiliation: r[14],
       position: r[15],
       status: r[20] === 'enabled' ? 'Active' : 'Inactive',
       is_active: r[20] === 'enabled'
    }));
    
    // Merge into the batch update list for efficiency
    supabaseUpdates.push(...newPayload);
  }
  
  // [BATCH OPT] Execute Supabase Batch Sync (Both Updates + New)
  if (supabaseUpdates.length > 0) {
      console.log(`☁️ Syncing ${supabaseUpdates.length} teacher records to Supabase...`);
      const CHUNK_SIZE = 100; // Conservative for dim_user
      for (let i = 0; i < supabaseUpdates.length; i += CHUNK_SIZE) {
          sendToSupabase('dim_user', supabaseUpdates.slice(i, i + CHUNK_SIZE), 'braincloud_id');
          Utilities.sleep(100);
      }
  }

  // 4. แสดงผล Log
  if (changeLogs.length > 0) {
      console.log("--- 📝 Detailed Changes ---");
      changeLogs.forEach(log => console.log(log));
      console.log("---------------------------");
  } else {
      console.log("--- ✅ No Changes Detected ---");
  }
  
  console.log(`📊 Result: Added ${newRows.length} new teachers, Updated ${updateCount} existing teachers.`);
}

function mergeCookiesT(oldCookies, newCookiesHeader) {
  if (!newCookiesHeader) return oldCookies;
  let cookieMap = new Map();
  if (oldCookies) oldCookies.split(';').forEach(c => { const p = c.split('='); if(p.length>=2) cookieMap.set(p[0].trim(), p.slice(1).join('=').trim()); });
  let newCookies = Array.isArray(newCookiesHeader) ? newCookiesHeader : [newCookiesHeader];
  newCookies.forEach(c => { const p = c.split(';')[0].split('='); if(p.length>=2) cookieMap.set(p[0].trim(), p.slice(1).join('=').trim()); });
  let list = []; cookieMap.forEach((v, k) => list.push(`${k}=${v}`));
  return list.join('; ');
}