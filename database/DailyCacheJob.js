/**
 * Script นี้สำหรับรันในไฟล์ [bc]_central_db เท่านั้น
 * Updated: แก้ปัญหาเวลาเพี้ยน (Time Shift) โดยใช้ getDisplayValues()
 */

const CACHE_SHEET_NAME = "cache_today_session";
const CACHE_UA_SHEET_NAME = "cache_today_unavailability";

function createDailyCache() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. เตรียมข้อมูล Master Data
  var userMap = getUserMap(ss);
  var schoolMap = getSchoolMap(ss);
  
  // --- PART A: SESSION CACHE (Existing) ---
  var sessionSheet = ss.getSheetByName("fact_daily_session");
  
  // *** แก้ไขจุดที่ 1: ดึงทั้ง Values (เพื่อคำนวณ) และ DisplayValues (เพื่อเอาเวลาที่ถูกต้อง) ***
  var range = sessionSheet.getDataRange();
  var sessionData = range.getValues();          // เอาไว้เช็ควันที่ (Date Object)
  var sessionDisplayData = range.getDisplayValues(); // เอาไว้ดึงเวลา (String "HH:mm")
  
  // 3. กรองเฉพาะวันนี้
  var todayDate = new Date();
  var todayStr = getThaiDateString(todayDate); 
  // var todayStr = "2025-12-25"; // สำหรับ Test
  
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
      var dbStatus = row[8];
      
      // Map ข้อมูล
      var schoolCode = schoolMap[schoolId] || "N/A";
      var actualInfo = userMap[actualTeacherId] || { name: "Unknown", type: "N/A" };
      
      var originalInfo = { name: "-", type: "-" };
      if (originalTeacherId && originalTeacherId !== actualTeacherId) {
         originalInfo = userMap[originalTeacherId] || { name: "Unknown", type: "N/A" };
      }
      
      var displayStatus = dbStatus;
      if (dbStatus === "Substituted") displayStatus = "Cover";
      
      // *** แก้ไขจุดที่ 2: ดึงเวลาจาก DisplayValues โดยตรง (ตัดปัญหา Timezone) ***
      // Index 2 = Start Time, Index 3 = End Time
      var startTimeRaw = sessionDisplayData[i][2]; 
      var endTimeRaw = sessionDisplayData[i][3];
      var classNameRaw = sessionDisplayData[i][4]; // Use DisplayValue for Class Name to avoid Date conversion
      
      // ตัด string ให้เหลือแค่ HH:mm (เผื่อ Excel มีวินาทีติดมา)
      var timeSlot = cleanTimeStr(startTimeRaw) + " - " + cleanTimeStr(endTimeRaw);
      
      cachedRows.push([
        row[0], // session_id
        schoolCode,
        classNameRaw, // class_name (String)
        timeSlot, // time_slot (String แท้ๆ ไม่เพี้ยน)
        actualInfo.name,
        actualInfo.type,
        originalInfo.name,
        originalInfo.type,
        displayStatus,
        row[5]
      ]);
    }
  }
  
  // 4. บันทึกลงชีท Cache Session
  var cacheSheet = ss.getSheetByName(CACHE_SHEET_NAME);
  if (!cacheSheet) {
    cacheSheet = ss.insertSheet(CACHE_SHEET_NAME);
  }
  cacheSheet.clear(); 
  cacheSheet.appendRow([
    "session_id", "school_code", "class_name", "time_slot", 
    "actual_teacher_name", "actual_teacher_type", 
    "original_teacher_name", "original_teacher_type", 
    "status", "school_id"
  ]);
  
  if (cachedRows.length > 0) {
    var range = cacheSheet.getRange(2, 1, cachedRows.length, cachedRows[0].length);
    range.setNumberFormat("@"); 
    range.setValues(cachedRows);
  }
  
  // --- PART B: UNAVAILABILITY CACHE (New) ---
  createUnavailabilityCache(ss, userMap, todayStr);
  
  Logger.log("Cache updated for " + todayStr);
}

function createUnavailabilityCache(ss, userMap, todayStr) {
  var uaSheet = ss.getSheetByName("fact_teacher_unavailability");
  if (!uaSheet) return;

  var uaData = uaSheet.getDataRange().getValues();
  var uaDisp = uaSheet.getDataRange().getDisplayValues(); // Get times as string

  var uaCached = [];
  var processed = new Set();
  
  // 0:uid, 1:tid, 2:startDate, 3:endDate, 4:startTime, 5:endTime, 6:remark
  for (var i = 1; i < uaData.length; i++) {
     let sDate = formatDateStandard(uaData[i][2]);
     let eDate = formatDateStandard(uaData[i][3]);
     
     // Check Overlap with Today
     if (sDate <= todayStr && eDate >= todayStr) {
        let tid = String(uaData[i][1]);
        
        let uniqueKey = tid + "_" + uaData[i][6]; 
        
        if (!processed.has(uniqueKey)) {
           let tInfo = userMap[tid] || { name: tid, type: "Unknown" };
           
           let tStart = uaDisp[i][4] ? uaDisp[i][4].substring(0,5) : "";
           let tEnd = uaDisp[i][5] ? uaDisp[i][5].substring(0,5) : "";
           let timeStr = (tStart && tEnd) ? tStart + " - " + tEnd : "All Day";

           uaCached.push([
             tid,
             tInfo.name,
             tInfo.type,
             timeStr,
             uaData[i][6] // Reason
           ]);
           processed.add(uniqueKey);
        }
     }
  }
  
  var uaCacheSheet = ss.getSheetByName(CACHE_UA_SHEET_NAME);
  if (!uaCacheSheet) {
    uaCacheSheet = ss.insertSheet(CACHE_UA_SHEET_NAME);
  }
  uaCacheSheet.clear();
  uaCacheSheet.appendRow(["tid", "name", "type", "period", "reason"]);
  
  if (uaCached.length > 0) {
    var r = uaCacheSheet.getRange(2, 1, uaCached.length, uaCached[0].length);
    r.setNumberFormat("@");
    r.setValues(uaCached);
  }
}


// --- Helper Functions ---

function cleanTimeStr(str) {
  if (!str) return "";
  // ถ้ามาเป็น 08:30:00 ให้ตัดเหลือ 08:30
  return String(str).substring(0, 5);
}

function getUserMap(ss) {
  var sheet = ss.getSheetByName("dim_user");
  var data = sheet.getDataRange().getValues();
  var map = {};
  
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