/**
 * ส่วนที่ 1: เตรียมหน้าเว็บ (HTML)
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('TimelineView')
      .evaluate()
      .setTitle('Braincloud Master Timetable')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * ส่วนที่ 2: ดึงข้อมูลจาก Sheet ส่งไปให้หน้าเว็บ
 * [FIX TIMEZONE]: บังคับอ่านเวลาโดยอิงจาก Spreadsheet Timezone เท่านั้น
 */
function getTimelineData(targetDate) {
  console.time("Total Execution");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cache = CacheService.getScriptCache();
  
  // [IMPORTANT] ดึง Timezone ของไฟล์นี้มาใช้
  const sheetTimeZone = ss.getSpreadsheetTimeZone();
  
  // --- 1. เตรียมข้อมูลโรงเรียน (Cached) ---
  console.time("Load Master Data");
  let schoolMap = null;
  const cachedSchool = cache.get("dim_school_map_v5"); 
  if (cachedSchool) {
    schoolMap = JSON.parse(cachedSchool);
  } else {
    const schoolSheet = ss.getSheetByName('dim_school');
    schoolMap = {};
    if (schoolSheet) {
      const sData = schoolSheet.getDataRange().getValues();
      for (let i = 1; i < sData.length; i++) {
        schoolMap[sData[i][0]] = { code: sData[i][1], group: sData[i][4] };
      }
      cache.put("dim_school_map_v5", JSON.stringify(schoolMap), 1800);
    }
  }

  // --- 2. เตรียมข้อมูลครู (Cached) ---
  let userMap = null;
  const cachedUser = cache.get("dim_user_map_v5");
  if (cachedUser) {
    userMap = JSON.parse(cachedUser);
  } else {
    const userSheet = ss.getSheetByName('dim_user');
    userMap = {};
    if (userSheet) {
      const uData = userSheet.getDataRange().getValues();
      for (let i = 1; i < uData.length; i++) {
        let id = uData[i][0];
        let fname = uData[i][2];
        let lname = uData[i][3] ? uData[i][3].substring(0, 1) + "." : "";
        let typeCode = String(uData[i][13]); 
        
        userMap[id] = {
          name: `${fname} ${lname}`,
          isFullTime: (typeCode === '210')
        };
      }
      cache.put("dim_user_map_v5", JSON.stringify(userMap), 1800);
    }
  }
  console.timeEnd("Load Master Data");

  // --- Date Setup ---
  const tDateParts = targetDate.split('-'); 
  const tDateObj = new Date(tDateParts[0], tDateParts[1]-1, tDateParts[2]);
  
  const sevenDaysAgo = new Date(tDateObj);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const targetTimeStart = tDateObj.getTime();
  const targetTimeEnd = targetTimeStart + (24 * 60 * 60 * 1000); 
  const sevenDaysAgoTime = sevenDaysAgo.getTime();

  let items = [];
  const visibleTeachersSet = new Set();
  const groups = [];
  const logs = {
    cancelled: [],
    covered: [], 
    stats: { total: 0, cancel: 0, cover: 0 }, 
    generatedAt: Utilities.formatDate(new Date(), sheetTimeZone, "HH:mm") 
  };

  // --- 3. ดึงตารางเรียน (Smart Range Loading) ---
  console.time("Load Sessions");
  const sessionSheet = ss.getSheetByName('fact_daily_session');
  if (sessionSheet) {
    const lastRow = sessionSheet.getLastRow();
    
    if (lastRow > 1) {
      // 3.1 สแกนเฉพาะ Column Date (Col B)
      const dateColumn = sessionSheet.getRange(2, 2, lastRow - 1, 1).getValues();
      
      let startIndex = -1;
      let endIndex = -1;
      
      for (let i = 0; i < dateColumn.length; i++) {
        let d = dateColumn[i][0];
        if (!d) continue;
        let dTime = d instanceof Date ? d.getTime() : new Date(d).getTime();
        
        if (dTime >= sevenDaysAgoTime && dTime <= targetTimeEnd) {
           if (startIndex === -1) startIndex = i;
           endIndex = i; 
        }
      }
      
      if (startIndex !== -1 && endIndex !== -1) {
        // 3.2 ดึงข้อมูลจริง
        const startRow = startIndex + 2;
        const numRows = endIndex - startIndex + 1;
        const numCols = sessionSheet.getLastColumn();
        
        const dataChunk = sessionSheet.getRange(startRow, 1, numRows, numCols).getValues();
        
        for (let i = 0; i < dataChunk.length; i++) {
          let row = dataChunk[i];
          let dateVal = row[1];
          if (!dateVal) continue;
          
          let rowDateObj = new Date(dateVal);
          let rowTime = rowDateObj.getTime(); 
          // ใช้ Timezone ของ Sheet แปลงวันที่
          let rowDateStr = Utilities.formatDate(rowDateObj, sheetTimeZone, 'yyyy-MM-dd');

          let actualTeacherId = String(row[6]).trim();
          let originalTeacherId = String(row[7]).trim(); 
          
          if (rowTime >= sevenDaysAgoTime && rowTime <= targetTimeEnd) {
             if (userMap[actualTeacherId]) visibleTeachersSet.add(actualTeacherId);
             if (userMap[originalTeacherId]) visibleTeachersSet.add(originalTeacherId);
          }

          if (rowDateStr === targetDate) {
            // [FIX] ส่ง sheetTimeZone ไปด้วย เพื่อบังคับ format ให้ตรง
            let startTime = normalizeTime(row[2], sheetTimeZone); 
            let endTime = normalizeTime(row[3], sheetTimeZone);
            
            if (!startTime || !endTime) continue;

            let className = row[4];
            let status = String(row[8]);
            let schoolId = row[5];
            
            logs.stats.total++;

            let schoolInfo = schoolMap[schoolId] || { code: schoolId, group: 'Other' };
            let colorClass = 'group-other'; 
            let grp = (schoolInfo.group || "").toLowerCase();
            if (grp.includes('thesaban')) colorClass = 'group-thesaban';
            else if (grp.includes('obec 3')) colorClass = 'group-obec3';
            else if (grp.includes('private')) colorClass = 'group-private';
            else if (grp.includes('obec south')) colorClass = 'group-obec-south';

            let innerContent = className;
            let finalClass = colorClass; 
            let tooltip = `School: ${schoolInfo.code}\nTime: ${startTime}-${endTime}`;

            let isCover = (status === "Substituted") || 
                          (status === "Normal" && originalTeacherId && actualTeacherId && actualTeacherId !== originalTeacherId);

            if (status.startsWith("Cancelled")) {
              finalClass = 'status-cancelled';
              let cancelBy = status.includes("School") ? "School" : "BC";
              innerContent = `❌ ${className} <div style="font-size:9px; margin-top:2px;">(by ${cancelBy})</div>`;
              
              let tName = userMap[originalTeacherId] ? userMap[originalTeacherId].name : originalTeacherId;
              logs.cancelled.push({
                start: startTime.substring(0, 5),
                end: endTime.substring(0, 5),
                school: schoolInfo.code,
                class: className,
                teacher: tName,
                by: cancelBy
              });
              logs.stats.cancel++;
            } 
            else if (isCover) {
              finalClass += ' status-covered'; 
              let originalName = userMap[originalTeacherId] ? userMap[originalTeacherId].name : originalTeacherId;
              let actualName = userMap[actualTeacherId] ? userMap[actualTeacherId].name : actualTeacherId;
              innerContent = `🔄 ${className} <div style="font-size:9px; margin-top:2px; opacity:0.9;">(Cover: ${originalName})</div>`;
              tooltip += `\nCovering for: ${originalName}`;
              logs.covered.push({
                start: startTime.substring(0, 5),
                end: endTime.substring(0, 5),
                school: schoolInfo.code,
                class: className,
                actual: actualName,   
                original: originalName 
              });
              logs.stats.cover++;
            } else {
              innerContent = `${className}`;
            }

            items.push({
              id: row[0], 
              group: actualTeacherId, 
              start: `${targetDate}T${startTime}`, 
              end: `${targetDate}T${endTime}`,
              content: `<div class="content-wrapper">${innerContent}</div>`, 
              title: tooltip,
              className: finalClass,
              type: 'range'
            });
            
            if (userMap[actualTeacherId]) visibleTeachersSet.add(actualTeacherId);
          }
        }
      }
    }
  }
  console.timeEnd("Load Sessions");

  // --- 4. สร้าง Groups ---
  visibleTeachersSet.forEach(teacherId => {
    let userInfo = userMap[teacherId] || { name: `(${teacherId})`, isFullTime: false };
    let nameHtml = "";
    if (userInfo.isFullTime) {
      nameHtml = `<span style="color:#0D47A1; font-weight:bold;">👔 ${userInfo.name}</span>`;
    } else {
      nameHtml = `<span style="color:#E65100; font-weight:bold;">⏳ ${userInfo.name}</span>`;
    }

    groups.push({
      id: teacherId,
      content: nameHtml,
      style: "font-size: 13px; padding: 5px;"
    });
  });

  groups.sort((a, b) => {
      let uA = userMap[a.id];
      let uB = userMap[b.id];
      if (uA.isFullTime !== uB.isFullTime) return uA.isFullTime ? -1 : 1;
      return a.content.localeCompare(b.content);
  });

  console.timeEnd("Total Execution");
  return JSON.stringify({ groups: groups, items: items, logs: logs });
}

/**
 * [FIXED] Normalize Time with TimeZone
 * บังคับแปลง Date Object ให้เป็น String ตาม Timezone ของ Sheet (แก้ปัญหาเวลาเพี้ยน)
 */
function normalizeTime(val, timeZone) {
  if (!val) return null;
  
  // 1. ถ้าเป็น Date Object -> ใช้ Utilities.formatDate บังคับ Timezone
  if (val instanceof Date) {
    return Utilities.formatDate(val, timeZone, "HH:mm:ss");
  }
  
  // 2. ถ้าเป็น String -> Clean แล้ว Parse (รองรับ 9.00 และ 09:00)
  let str = String(val).trim();
  str = str.replace('.', ':'); // แก้ 9.00 เป็น 9:00
  
  let parts = str.split(':');
  if (parts.length < 2) return null; 

  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);
  let s = 0;
  
  if (str.toLowerCase().includes('pm') && h < 12) h += 12;
  if (str.toLowerCase().includes('am') && h === 12) h = 0;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

// ... ส่วน getSubstitutionSuggestions (อัปเดต Timezone ให้เหมือนกัน) ...
function getSubstitutionSuggestions(sessionId, targetDate, simState) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTimeZone = ss.getSpreadsheetTimeZone(); // [FIX]
  
  const sessionSheet = ss.getSheetByName('fact_daily_session');
  const userSheet = ss.getSheetByName('dim_user');
  const schoolSheet = ss.getSheetByName('dim_school');
  
  if (!sessionSheet || !userSheet || !schoolSheet) return JSON.stringify({ error: "Database not found" });

  const simulation = simState || { removed: [], added: [] };

  const schoolMap = {};
  const sData = schoolSheet.getDataRange().getValues();
  for (let i = 1; i < sData.length; i++) {
    schoolMap[sData[i][0]] = sData[i][4]; 
  }

  const sessionDataRaw = sessionSheet.getDataRange().getValues();
  
  let targetSession = null;
  for (let i = 1; i < sessionDataRaw.length; i++) {
    if (String(sessionDataRaw[i][0]) === sessionId) {
      targetSession = {
        id: sessionId,
        start: normalizeTime(sessionDataRaw[i][2], sheetTimeZone), // [FIX]
        end: normalizeTime(sessionDataRaw[i][3], sheetTimeZone),   // [FIX]
        school: sessionDataRaw[i][5],
        class: sessionDataRaw[i][4],
        teacherId: sessionDataRaw[i][6]
      };
      break;
    }
  }
  
  if (!targetSession) return JSON.stringify({ error: "Session not found" });

  let targetSchoolGroup = schoolMap[targetSession.school] || "";
  let isThesaban = (targetSchoolGroup.toLowerCase().includes('thesaban'));

  const teachersActiveRecently = new Set();
  const dailySessions = []; 
  const teacherWorkload = {};

  const tDateParts = targetDate.split('-'); 
  const tDateObj = new Date(tDateParts[0], tDateParts[1]-1, tDateParts[2]);
  const sevenDaysAgo = new Date(tDateObj);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  for (let i = 1; i < sessionDataRaw.length; i++) {
    let dVal = sessionDataRaw[i][1];
    if(!dVal) continue;
    let dObj = new Date(dVal);
    let dStr = Utilities.formatDate(dObj, sheetTimeZone, 'yyyy-MM-dd'); // [FIX]

    let actualTeacherId = String(sessionDataRaw[i][6]).trim();
    let status = String(sessionDataRaw[i][8]);
    let compositeId = String(sessionDataRaw[i][0]);

    if (dObj >= sevenDaysAgo && dObj <= tDateObj) {
        if (!status.startsWith("Cancelled")) {
            teachersActiveRecently.add(actualTeacherId);
        }
    }

    if (dStr === targetDate) {
      if (simulation.removed.includes(compositeId)) continue; 

      if (!status.startsWith("Cancelled")) {
         dailySessions.push({
            teacherId: actualTeacherId,
            start: normalizeTime(sessionDataRaw[i][2], sheetTimeZone), // [FIX]
            end: normalizeTime(sessionDataRaw[i][3], sheetTimeZone),   // [FIX]
            status: status
         });
         
         if (!teacherWorkload[actualTeacherId]) teacherWorkload[actualTeacherId] = 0;
         teacherWorkload[actualTeacherId]++;
      }
    }
  }

  if (simulation.added && simulation.added.length > 0) {
      simulation.added.forEach(simItem => {
          dailySessions.push({
              teacherId: simItem.teacherId,
              start: normalizeTime(simItem.start, sheetTimeZone), // [FIX] 
              end: normalizeTime(simItem.end, sheetTimeZone),     // [FIX]
              status: 'Simulated'
          });
          
          if (!teacherWorkload[simItem.teacherId]) teacherWorkload[simItem.teacherId] = 0;
          teacherWorkload[simItem.teacherId]++;
          teachersActiveRecently.add(simItem.teacherId);
      });
  }

  const users = userSheet.getDataRange().getValues();
  let userProperties = {}; 
  for (let i = 1; i < users.length; i++) {
      let uid = String(users[i][0]);
      userProperties[uid] = { pos: String(users[i][15]), qual: String(users[i][17]) };
  }
  let targetTeacherPos = userProperties[targetSession.teacherId]?.pos || "";

  let candidates = [];
  
  for (let i = 1; i < users.length; i++) {
    let uid = String(users[i][0]);
    if (!teachersActiveRecently.has(uid)) continue; 

    let typeCode = String(users[i][13]);
    let status = String(users[i][20]).toLowerCase().trim();
    let pos = String(users[i][15]); 
    let qual = String(users[i][17]); 
    
    if ((targetTeacherPos === '110' && pos !== '110') || (targetTeacherPos === '100' && pos !== '100')) {
        continue;
    }

    if (status === 'active' || status === 'enabled') {
        let currentLoad = teacherWorkload[uid] || 0;
        
        candidates.push({
            id: uid,
            name: (users[i][2] || "") + " " + (users[i][3] || ""),
            type: (typeCode === '210') ? 'Full-time' : 'Part-time',
            workload: currentLoad,
            qualification: qual,
            isAbsent: (currentLoad === 0),
            isBusy: false
        });
    }
  }

  const targetStart = timeToMinutes(targetSession.start);
  const targetEnd = timeToMinutes(targetSession.end);

  dailySessions.forEach(session => {
      if (session.status.startsWith("Cancelled")) return;
      let s = timeToMinutes(session.start);
      let e = timeToMinutes(session.end);
      if (s < targetEnd && e > targetStart) {
          let candidate = candidates.find(c => c.id === session.teacherId);
          if (candidate) candidate.isBusy = true;
      }
  });

  let availableTeachers = candidates.filter(c => !c.isBusy && c.id !== targetSession.teacherId);
  
  availableTeachers.sort((a, b) => {
      if (a.isAbsent !== b.isAbsent) return a.isAbsent ? 1 : -1;
      if (isThesaban) {
          let aQual = a.qualification ? 1 : 0;
          let bQual = b.qualification ? 1 : 0;
          if (aQual !== bQual) return bQual - aQual; 
      }
      if (a.workload !== b.workload) return a.workload - b.workload;
      if (a.type !== b.type) return a.type === 'Full-time' ? -1 : 1;
      return a.name.localeCompare(b.name);
  });

  return JSON.stringify({ 
      target: { ...targetSession, schoolGroup: targetSchoolGroup },
      suggestions: availableTeachers,
      isThesaban: isThesaban 
  });
}

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    let parts = timeStr.split(':');
    return (parseInt(parts[0]) * 60) + parseInt(parts[1]);
}