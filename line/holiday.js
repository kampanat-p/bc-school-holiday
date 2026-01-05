/**
 * ------------------------------------------------------------------
 * 🏆 Braincloud Operations API (All-in-One v9.0)
 * Features: Dashboard, Timeline, Absence Report, Holiday Alert
 * ------------------------------------------------------------------
 */

const CONFIG = {
  // *** ตรวจสอบ ID ไฟล์ให้ถูกต้อง ***
  CENTRAL_DB_ID: "1NOZy-viGx5T60QQCo5GtdY3Lag7IrjkJb4_ePQ7YUeY", 
  HOLIDAY_DB_ID: "1eFkKYKXYpuIAmqQOH3BokANdbTUYjkLAmm4iwfAuluc",

  // ชื่อ Tab ใน Google Sheet (ต้องตรงเป๊ะ)
  SHEET_NAME_SCHOOL: "dim_school",
  SHEET_NAME_USER: "dim_user", // เพิ่มชีท User เพื่อดึง FT/PT และชื่อครูสำหรับคนลา
  SHEET_NAME_CACHE: "cache_today_session", 
  SHEET_NAME_COORD: "view_school_coordinator", 
  SHEET_NAME_DESTINATION: "Pending_Approval",  
  SHEET_NAME_HOLIDAY_LOG: "Holiday_Log",
  SHEET_NAME_UNAVAILABILITY: "fact_teacher_unavailability", // เพิ่มชีทวันลา

  NOTIFICATION_EMAIL: "k.phetkham@braincloudlearning.com"
};

/**
 * 1. API ROUTER
 */
function doGet(e) {
  const action = e.parameter.action;
  try {
    if (action === "getSchools") return responseJSON(getSchoolList());
    if (action === "getSchedule") return responseJSON(getDailySchedule(e.parameter.code, e.parameter.date));
    if (action === "getDashboardData") return responseJSON(getDashboardData());
    
    // --- New Features ---
    if (action === "getTimelineData") return responseJSON(getTimelineData(e.parameter.date));
    if (action === "getAbsenceData") return responseJSON(getAbsenceData(e.parameter.date));
    
    return ContentService.createTextOutput("API v9.0 Ready");
  } catch (err) {
    return responseJSON({ error: true, message: "System Error: " + err.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = saveHoliday(data);
    return responseJSON(result);
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 2. NEW FEATURES LOGIC (Timeline & Absence)
 */

// ฟังก์ชันสำหรับ Timeline View (ดึงตารางสอน + การลา)
function getTimelineData(dateStr) {
  const ss = SpreadsheetApp.openById(CONFIG.CENTRAL_DB_ID);
  
  // 1. ดึงตารางสอนจาก Cache (เร็วสุด)
  const cacheSheet = ss.getSheetByName(CONFIG.SHEET_NAME_CACHE);
  const rawCache = cacheSheet ? cacheSheet.getDataRange().getValues() : [];
  
  // 2. ดึงข้อมูลการลา (Unavailability)
  const uaSheet = ss.getSheetByName(CONFIG.SHEET_NAME_UNAVAILABILITY);
  const rawUA = uaSheet ? uaSheet.getDataRange().getValues() : [];
  
  // 3. ดึงชื่อครู (Master Data) เพื่อ Map ชื่อคนลา
  const userMap = getUserMap(ss); // Helper function ด้านล่าง

  // เตรียมข้อมูลสำหรับ Vis.js
  const groups = new Map(); // รายชื่อครู (Rows)
  const items = []; // คาบเรียน/การลา (Blocks)
  
  // วันที่เป้าหมาย (Default = Today)
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const dateKey = Utilities.formatDate(targetDate, "Asia/Bangkok", "yyyy-MM-dd");

  // A. ใส่ตารางสอน (Items)
  // Cache Header: 0:id, 1:school, 2:class, 3:time(08:30-09:20), 4:teacher, 5:type, 6:orig, 7:origType, 8:status
  for(let i=1; i<rawCache.length; i++) {
    let row = rawCache[i];
    let teacherName = row[4];
    let teacherType = row[5];
    
    if (!teacherName || teacherName === "Unknown") continue;
    
    // สร้าง Group (ครู)
    if (!groups.has(teacherName)) {
      groups.set(teacherName, { 
        id: teacherName, 
        content: `<b>${teacherName}</b> <small style='color:gray'>(${teacherType})</small>`,
        type: teacherType // ไว้ sort
      });
    }

    // แปลงเวลา "08:30 - 09:20" เป็น Date Object
    // ใช้ฟังก์ชัน normalizeTimeStr ช่วยแก้บั๊กเวลาเพี้ยน
    let times = row[3].split("-");
    let startStr = normalizeTimeStr(times[0]);
    let endStr = normalizeTimeStr(times[1]);
    
    // สร้าง Item (คาบเรียน)
    let isCover = row[8] === "Cover" || row[8] === "Substituted";
    items.push({
      id: row[0],
      group: teacherName,
      start: `${dateKey}T${startStr}:00`,
      end: `${dateKey}T${endStr}:00`,
      content: `${row[1]} <br><small>${row[2]}</small>`,
      className: isCover ? 'item-cover' : 'item-normal',
      type: 'box'
    });
  }

  // B. ใส่ข้อมูลการลา (Background Items)
  // UA Header: 1:teacher_id, 2:start_date, 3:end_date, 4:start_time, 5:end_time, 6:remark
  for(let i=1; i<rawUA.length; i++) {
    let row = rawUA[i];
    let tId = row[1];
    let sDate = formatDateStandard(row[2]);
    let eDate = formatDateStandard(row[3]);
    
    // เช็คว่าวันลาคลุมวันนี้หรือไม่
    if (sDate <= dateKey && eDate >= dateKey) {
       let teacherObj = userMap[tId];
       if (teacherObj) {
         let tName = teacherObj.name;
         
         // ถ้าครูคนนี้ไม่มีในตารางสอนวันนี้ (ไม่มี Group) ให้สร้างขึ้นมาด้วย
         if (!groups.has(tName)) {
            groups.set(tName, { 
              id: tName, 
              content: `<b>${tName}</b> <small style='color:gray'>(${teacherObj.type})</small>`,
              type: teacherObj.type
            });
         }

         // สร้าง Item (แถบแดง Background)
         let startTime = formatTimeOnly(row[4]) || "08:00";
         let endTime = formatTimeOnly(row[5]) || "16:00";
         
         items.push({
           id: "UA_" + i,
           group: tName,
           start: `${dateKey}T${startTime}:00`,
           end: `${dateKey}T${endTime}:00`,
           type: 'background', // แบบนี้จะเป็นพื้นหลังไม่บังคาบสอน
           className: 'item-absent',
           title: row[6] // Remark
         });
       }
    }
  }

  // Convert Map to Array & Sort
  const groupArray = Array.from(groups.values()).sort((a, b) => {
     // เรียงตาม FT มาก่อน PT แล้วตามด้วยชื่อ
     if (a.type !== b.type) return a.type === 'Full-time' ? -1 : 1;
     return a.id.localeCompare(b.id);
  });

  return {
    groups: groupArray,
    items: items,
    date: dateKey
  };
}

// ฟังก์ชันดึงรายงานคนลา (Absence Report)
function getAbsenceData(dateStr) {
  const ss = SpreadsheetApp.openById(CONFIG.CENTRAL_DB_ID);
  const uaSheet = ss.getSheetByName(CONFIG.SHEET_NAME_UNAVAILABILITY);
  if(!uaSheet) return [];

  const userMap = getUserMap(ss);
  const rawUA = uaSheet.getDataRange().getValues();
  const targetDate = dateStr ? dateStr : Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd");
  
  const absentees = [];

  for(let i=1; i<rawUA.length; i++) {
    let row = rawUA[i];
    let sDate = formatDateStandard(row[2]);
    let eDate = formatDateStandard(row[3]);
    
    if (sDate <= targetDate && eDate >= targetDate) {
       let tId = row[1];
       let teacher = userMap[tId] || { name: tId, type: "-" };
       
       let startTime = formatTimeOnly(row[4]);
       let endTime = formatTimeOnly(row[5]);

       absentees.push({
         name: teacher.name,
         type: teacher.type,
         period: `${startTime} - ${endTime}`,
         reason: row[6]
       });
    }
  }
  return absentees;
}

// Helper: ดึง User Map (ID -> Name, Type)
function getUserMap(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME_USER);
  const data = sheet.getDataRange().getValues();
  const map = {};
  // 0:uid, 2:fname, 3:lname, 8:nick, 13:type(210=FT, 220=PT)
  for (let i = 1; i < data.length; i++) {
    let typeCode = data[i][13];
    let typeLabel = typeCode == 210 ? "Full-time" : (typeCode == 220 ? "Part-time" : "Ext");
    let name = data[i][8] || data[i][2]; // Nickname or Firstname
    if (data[i][3]) name += " " + String(data[i][3]).charAt(0) + "."; // + Lastname Initial
    
    map[data[i][0]] = { name: name, type: typeLabel };
  }
  return map;
}

function formatDateStandard(dateObj) {
  if (!dateObj) return "";
  return Utilities.formatDate(new Date(dateObj), "Asia/Bangkok", "yyyy-MM-dd");
}

function formatTimeOnly(val) {
  if (val instanceof Date) return Utilities.formatDate(val, "Asia/Bangkok", "HH:mm");
  // ถ้าเป็น Text ให้ normalize
  return normalizeTimeStr(String(val));
}

function normalizeTimeStr(timeStr) {
  if (!timeStr) return "00:00";
  var clean = timeStr.toString().split('-')[0].replace(/[^0-9:]/g, "").trim();
  if (clean.endsWith(":")) clean = clean.slice(0, -1);
  var parts = clean.split(':');
  var h = parts[0] || "0"; var m = parts[1] || "00";
  if (h.length === 1) h = "0" + h; if (m.length === 1) m = "0" + m;
  return h + ":" + m;
}

/**
 * 3. EXISTING LOGIC (UPDATED)
 */

function getDashboardData() {
  const ss = SpreadsheetApp.openById(CONFIG.CENTRAL_DB_ID);
  
  // 1. Cache Sheet
  const cacheSheet = ss.getSheetByName(CONFIG.SHEET_NAME_CACHE);
  if (!cacheSheet) throw new Error("No Cache Sheet found");
  
  // 2. Coord Map
  const coordSheet = ss.getSheetByName(CONFIG.SHEET_NAME_COORD);
  const rawCoord = coordSheet ? coordSheet.getDataRange().getValues() : [];
  const schoolCoordMap = {};
  for(let i=1; i<rawCoord.length; i++) {
    schoolCoordMap[String(rawCoord[i][0]).trim()] = String(rawCoord[i][1]).trim();
  }

  const rawCache = cacheSheet.getDataRange().getValues();
  const sessions = [];
  const teachers = new Set(), schools = new Set(), coords = new Set();

  // Cache: 0:id, 1:school, 2:class, 3:time, 4:teacher, 5:type, ...
  for(let i=1; i<rawCache.length; i++) {
    let row = rawCache[i];
    let scCode = row[1];
    let teacher = row[4];
    let type = row[5]; // เพิ่ม Teacher Type
    let coord = schoolCoordMap[scCode] || "N/A";

    sessions.push({
      id: row[0], school: scCode, class: row[2], time: row[3],
      teacher: teacher, 
      teacherType: type, // ส่งไปหน้าบ้าน
      status: row[8], coordinator: coord
    });

    if(teacher) teachers.add(teacher);
    if(scCode) schools.add(scCode);
    if(coord) coords.add(coord);
  }

  // Cancellations
  const pendingSheet = ss.getSheetByName(CONFIG.SHEET_NAME_DESTINATION);
  const cancellations = [];
  if (pendingSheet) {
    const rawPending = pendingSheet.getDataRange().getValues();
    const today = new Date().toISOString().split('T')[0];
    for(let i=1; i<rawPending.length; i++) {
      let row = rawPending[i];
      let pDate = String(row[4]).replace(/'/g, "");
      if(pDate === today) {
        cancellations.push({
          ticket: row[0], school: row[3], type: row[6],
          reason: row[8], user: row[2], time: row[1]
        });
      }
    }
  }

  return {
    sessions: sessions,
    filters: {
      teachers: Array.from(teachers).sort(),
      schools: Array.from(schools).sort(),
      coordinators: Array.from(coords).sort()
    },
    cancellations: cancellations
  };
}

// ... (Functions เดิมที่จำเป็นสำหรับการแจ้งวันหยุด: getSchoolList, getDailySchedule, saveHoliday, recordToSheet, sendHtmlEmail, mapSessionRow) ...
// เพื่อความสะดวก ก๊อปปี้บรรทัดยาวๆ นี้ไปแปะต่อท้ายได้เลยครับ (ห้ามลืม)

function getSchoolList() { try { var ss = SpreadsheetApp.openById(CONFIG.CENTRAL_DB_ID); var sheet = ss.getSheetByName(CONFIG.SHEET_NAME_SCHOOL); var data = sheet.getDataRange().getValues(); var schools = []; for (var i = 1; i < data.length; i++) { var status = String(data[i][9]).toLowerCase().trim(); if (data[i][1] && status === 'active') { schools.push({ code: data[i][1], name: data[i][3] }); } } return schools.sort((a, b) => a.code.localeCompare(b.code)); } catch (e) { return [{code: "ERR", name: "Error: " + e.message}]; } }
function getDailySchedule(schoolCode, dateString) { var today = new Date(); var reqDate = new Date(dateString); today.setHours(0,0,0,0); reqDate.setHours(0,0,0,0); if (reqDate.getTime() !== today.getTime()) return []; try { var ss = SpreadsheetApp.openById(CONFIG.CENTRAL_DB_ID); var sheet = ss.getSheetByName(CONFIG.SHEET_NAME_CACHE); if (!sheet) return []; var data = sheet.getDataRange().getValues(); var schedules = []; for (var i = 1; i < data.length; i++) { if (data[i][1] === schoolCode) { schedules.push({ id: data[i][0], time: data[i][3], className: data[i][2], teacher: data[i][4], teacherType: data[i][5], originalTeacher: data[i][6], originalType: data[i][7], status: data[i][8] }); } } return schedules.sort((a, b) => { var tA = normalizeTimeStr(a.time); var tB = normalizeTimeStr(b.time); return tA.localeCompare(tB); }); } catch (e) { return []; } }
function saveHoliday(data) { try { var ssCentral = SpreadsheetApp.openById(CONFIG.CENTRAL_DB_ID); var sessionDetails = []; var todayStr = Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd"); if (data.startDate === todayStr) { try { var cacheSheet = ssCentral.getSheetByName(CONFIG.SHEET_NAME_CACHE); if (cacheSheet) { var cacheData = cacheSheet.getDataRange().getValues(); if (data.type === "Specific Sessions" && data.selectedSessions) { data.selectedSessions.forEach(id => { var row = cacheData.find(r => String(r[0]) === String(id)); if (row) sessionDetails.push(mapSessionRow(row)); }); } else if (data.type === "Whole Day") { cacheData.forEach(row => { if (String(row[1]) === data.schoolCode) { sessionDetails.push(mapSessionRow(row)); } }); } sessionDetails.sort((a, b) => { var tA = normalizeTimeStr(a.time); var tB = normalizeTimeStr(b.time); return tA.localeCompare(tB); }); } } catch(ex) { Logger.log("Error details: " + ex); } } recordToSheet(ssCentral, CONFIG.SHEET_NAME_DESTINATION, data); if (CONFIG.HOLIDAY_DB_ID && CONFIG.HOLIDAY_DB_ID.length > 5) { try { var ssHoliday = SpreadsheetApp.openById(CONFIG.HOLIDAY_DB_ID); recordToSheet(ssHoliday, CONFIG.SHEET_NAME_HOLIDAY_LOG, data); } catch(ex) {} } if (CONFIG.NOTIFICATION_EMAIL) { sendHtmlEmail(data, sessionDetails); } return { status: "success", ticketId: data.ticketId || "NEW-" + Date.now() }; } catch (e) { return { status: "error", message: e.toString() }; } }
function recordToSheet(ss, sheetName, data) { let sheet = ss.getSheetByName(sheetName); if (!sheet) { sheet = ss.insertSheet(sheetName); sheet.appendRow(["Ticket ID", "Timestamp", "User", "School", "Start Date", "End Date", "Type", "Session IDs", "Reason", "Status"]); } const timestamp = new Date(); const ticketId = data.ticketId || "REQ-" + Math.floor(Date.now() / 1000); const sessionIds = data.selectedSessions ? data.selectedSessions.join(", ") : "-"; sheet.appendRow([ticketId, timestamp, data.displayName, data.schoolCode, "'" + data.startDate, "'" + data.endDate, data.type, sessionIds, data.reason, "Pending"]); }
function sendHtmlEmail(data, sessionDetails) { var ticketId = data.ticketId || "N/A"; var isWholeDay = data.type === "Whole Day"; var subjectPrefix = isWholeDay ? "🔴 [URGENT]" : "🟡 [NOTICE]"; var subject = `${subjectPrefix} แจ้งยกเลิกคลาส: ${data.schoolCode} (${data.startDate})`; var tableHtml = ""; var totalSessions = sessionDetails.length; if (totalSessions > 0) { var rows = sessionDetails.map((s, index) => { var bg = index % 2 === 0 ? "#ffffff" : "#f9f9f9"; return ` <tr style="background-color: ${bg};"> <td style="padding: 10px; border-bottom: 1px solid #eee; color: #444;">${s.time}</td> <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #000;">${s.className}</td> <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${s.teacher}</td> </tr>`; }).join(""); tableHtml = ` <div style="margin-top: 20px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;"> <div style="background-color: #f1f8e9; padding: 10px 15px; border-bottom: 1px solid #ddd; color: #33691e; font-weight: bold; font-size: 14px;"> 📋 รายการคาบที่ได้รับผลกระทบ (${totalSessions} คาบ) </div> <table style="width: 100%; border-collapse: collapse; font-size: 14px;"> <thead> <tr style="background-color: #fafafa; text-align: left;"> <th style="padding: 10px; border-bottom: 2px solid #eee; width: 30%;">เวลา</th> <th style="padding: 10px; border-bottom: 2px solid #eee; width: 30%;">ห้องเรียน</th> <th style="padding: 10px; border-bottom: 2px solid #eee;">ครูผู้สอน</th> </tr> </thead> <tbody>${rows}</tbody> </table> </div>`; } else if (data.type !== "Partial") { tableHtml = ` <div style="margin-top: 20px; padding: 15px; background-color: #fff3e0; border: 1px solid #ffe0b2; border-radius: 8px; color: #e65100; font-size: 13px;"> ⚠️ ไม่พบรายละเอียดรายคาบในระบบ (อาจเป็นการแจ้งล่วงหน้า หรือ Cache ยังไม่อัปเดต) </div>`; } var typeBadge = ""; if (isWholeDay) typeBadge = `<span style="background:#ffebee; color:#c62828; padding:4px 10px; border-radius:20px; font-weight:bold; font-size:12px; border:1px solid #ffcdd2;">หยุดทั้งวัน (Whole Day)</span>`; else if (data.type === "Specific Sessions") typeBadge = `<span style="background:#e3f2fd; color:#1565c0; padding:4px 10px; border-radius:20px; font-weight:bold; font-size:12px; border:1px solid #bbdefb;">งดบางคาบ (Partial)</span>`; else typeBadge = `<span style="background:#fff3e0; color:#ef6c00; padding:4px 10px; border-radius:20px; font-weight:bold; font-size:12px; border:1px solid #ffe0b2;">ระบุเอง (Manual)</span>`; var htmlBody = ` <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);"> <div style="background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%); color: white; padding: 25px 20px;"> <h1 style="margin: 0; font-size: 22px; font-weight: bold;">แจ้งวันหยุด / ยกเลิกคลาส</h1> <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Ticket ID: ${ticketId}</p> </div> <div style="padding: 25px; background-color: #fff;"> <table style="width: 100%; border-collapse: separate; border-spacing: 0 10px;"> <tr> <td style="color: #666; width: 100px; font-size: 14px;">โรงเรียน:</td> <td style="font-size: 18px; font-weight: bold; color: #333;">${data.schoolCode}</td> </tr> <tr> <td style="color: #666; font-size: 14px;">วันที่:</td> <td style="font-size: 16px; font-weight: bold; color: #d32f2f;">${data.startDate} ${data.endDate !== data.startDate ? ' - ' + data.endDate : ''}</td> </tr> <tr> <td style="color: #666; font-size: 14px;">ประเภท:</td> <td>${typeBadge}</td> </tr> <tr> <td style="color: #666; font-size: 14px;">ผู้แจ้ง:</td> <td style="font-weight: 500;">${data.displayName}</td> </tr> </table> <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #757575; margin-top: 10px; border-radius: 4px;"> <span style="font-size: 12px; color: #888; display: block; margin-bottom: 4px;">เหตุผล / หมายเหตุ:</span> <span style="font-size: 14px; color: #333; line-height: 1.5;">${data.reason || "-"}</span> </div> ${tableHtml} <div style="text-align: center; margin-top: 35px; margin-bottom: 10px;"> <a href="https://docs.google.com/spreadsheets/d/${CONFIG.CENTRAL_DB_ID}" style="background-color: #2E7D32; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 5px rgba(46, 125, 50, 0.3);"> เปิดดูไฟล์ Google Sheet </a> </div> </div> <div style="background-color: #fafafa; padding: 15px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee;"> Braincloud Operations System | Automated Notification </div> </div> `; try { MailApp.sendEmail({ to: CONFIG.NOTIFICATION_EMAIL, subject: subject, htmlBody: htmlBody }); } catch(e) { Logger.log("Email Error: " + e.message); } }
function mapSessionRow(row) { return { time: row[3], className: row[2], teacher: row[4] }; }