/**
 * Script นี้สำหรับรันในไฟล์ [bc]_central_db เท่านั้น
 * Updated: เพิ่มการ Map ชื่อครูทั้งสองคน (Actual/Original) และใช้ Status จาก Database โดยตรง
 */

const CACHE_SHEET_NAME = "cache_today_session";

function createDailyCache() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. เตรียมข้อมูล Master Data
  var userMap = getUserMap(ss);
  var schoolMap = getSchoolMap(ss);
  
  // 2. ดึงข้อมูล Session ทั้งหมด
  var sessionSheet = ss.getSheetByName("fact_daily_session");
  var sessionData = sessionSheet.getDataRange().getValues();
  
  // 3. กรองเฉพาะวันนี้ (และแปลง Timezone ให้เป็นไทย)
  var todayStr = getThaiDateString(new Date()); 
  // var todayStr = "2025-12-25"; // บรรทัดนี้สำหรับ Test วันที่มีข้อมูลเยอะๆ
  
  var cachedRows = [];
  
  // Index อ้างอิงจาก fact_daily_session: 
  // 0:id, 1:date, 2:start, 3:end, 4:class, 5:school_id, 6:actual_teacher, 7:original_teacher, 8:status
  for (var i = 1; i < sessionData.length; i++) {
    var row = sessionData[i];
    var rowDateStr = formatDateStandard(row[1]);
    
    if (rowDateStr === todayStr) {
      var schoolId = row[5];
      var actualTeacherId = row[6];
      var originalTeacherId = row[7];
      var dbStatus = row[8]; // ดึง Status จาก DB โดยตรง (Normal, Substituted, Cancelled...)
      
      // Map ข้อมูล
      var schoolCode = schoolMap[schoolId] || "N/A";
      
      // Map ครูสอนจริง
      var actualInfo = userMap[actualTeacherId] || { name: "Unknown", type: "N/A" };
      
      // Map ครูเจ้าของคาบ (ถ้ามี)
      var originalInfo = { name: "-", type: "-" };
      if (originalTeacherId && originalTeacherId !== actualTeacherId) {
         originalInfo = userMap[originalTeacherId] || { name: "Unknown", type: "N/A" };
      }
      
      // ปรับแต่ง Status Wording
      var displayStatus = dbStatus;
      if (dbStatus === "Substituted") displayStatus = "Cover";
      
      // สร้างแถวใหม่สำหรับ Cache (เพิ่มคอลัมน์ครู 2 คน)
      cachedRows.push([
        row[0], // session_id
        schoolCode,
        row[4], // class_name
        formatTime(row[2]) + " - " + formatTime(row[3]), // time_slot
        actualInfo.name, // ชื่อครูสอนจริง
        actualInfo.type, // ประเภทครูสอนจริง
        originalInfo.name, // ชื่อครูเจ้าของคาบ (ถ้าไม่มีจะเป็น -)
        originalInfo.type, // ประเภทครูเจ้าของคาบ
        displayStatus, // Status (Normal, Cover, Cancelled...)
        row[5] // school_id
      ]);
    }
  }
  
  // 4. บันทึกลงชีท Cache
  var cacheSheet = ss.getSheetByName(CACHE_SHEET_NAME);
  if (!cacheSheet) {
    cacheSheet = ss.insertSheet(CACHE_SHEET_NAME);
  }
  
  cacheSheet.clear(); 
  
  // สร้าง Header ใหม่
  cacheSheet.appendRow([
    "session_id", "school_code", "class_name", "time_slot", 
    "actual_teacher_name", "actual_teacher_type", 
    "original_teacher_name", "original_teacher_type", 
    "status", "school_id"
  ]);
  
  if (cachedRows.length > 0) {
    cacheSheet.getRange(2, 1, cachedRows.length, cachedRows[0].length).setValues(cachedRows);
  }
  
  cacheSheet.getRange("Z1").setValue("Updated: " + new Date());
  Logger.log("Cache updated for " + todayStr + ": " + cachedRows.length + " sessions.");
}

// --- Helper Functions (เหมือนเดิม) ---
function getUserMap(ss) {
  var sheet = ss.getSheetByName("dim_user");
  var data = sheet.getDataRange().getValues();
  var map = {};
  
  // Index: 0:user_id, 2:firstname_en, 3:lastname_en, 8:nickname, 13:user_type
  for (var i = 1; i < data.length; i++) {
    var uid = data[i][0];
    var fname = data[i][2];
    var lname = data[i][3];
    var nickname = data[i][8];
    var typeCode = data[i][13];
    
    var displayName = nickname ? nickname : fname;
    if (lname && typeof lname === 'string') displayName += " " + lname.charAt(0) + ".";
    
    var typeLabel = "Unknown";
    if (typeCode == 210) typeLabel = "Full-time";
    else if (typeCode == 220) typeLabel = "Part-time";
    else if (typeCode == 100) typeLabel = "External";
    
    map[uid] = { name: displayName, type: typeLabel };
  }
  return map;
}

function getSchoolMap(ss) {
  var sheet = ss.getSheetByName("dim_school");
  var data = sheet.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < data.length; i++) {
    map[data[i][0]] = data[i][1];
  }
  return map;
}

function getThaiDateString(date) {
  var d = new Date(date);
  var offset = 7 * 60 * 60 * 1000; 
  var localDate = new Date(d.getTime() + offset);
  return localDate.toISOString().split('T')[0];
}

function formatDateStandard(dateObj) {
  if (!dateObj) return "";
  var d = new Date(dateObj);
  var year = d.getFullYear();
  var month = ('0' + (d.getMonth() + 1)).slice(-2);
  var day = ('0' + d.getDate()).slice(-2);
  return year + "-" + month + "-" + day;
}

function formatTime(dateObj) {
  if (!dateObj) return "";
  if (typeof dateObj === 'string') return dateObj.substring(0, 5); // Handle string time "08:30:00"
  var d = new Date(dateObj);
  var h = ('0' + d.getHours()).slice(-2);
  var m = ('0' + d.getMinutes()).slice(-2);
  return h + ":" + m;
}