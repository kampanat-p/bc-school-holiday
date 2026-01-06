function doGet(e) {
  const params = e.parameter;
  const action = params.action;

  if (action === 'getDashboardData') {
    return getDashboardData(e);
  } else if (!action || action === 'timeline') {
    if (typeof timelineView === 'function') {
      return timelineView(e);
    } else {
      return HtmlService.createHtmlOutput("Timeline View is currently unavailable.");
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    error: true, 
    message: "Unknown Action: " + action
  })).setMimeType(ContentService.MimeType.JSON);
}

// ------------------------------------------------------------------
// CONFIG: Central Database ID & Holiday DB ID
// ------------------------------------------------------------------
const CONFIG = {
  HOLIDAY_DB_ID: "1eFkKYKXYpuIAmqQOH3BokANdbTUYjkLAmm4iwfAuluc" 
};

function getDashboardData(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // -----------------------------------------------------------------
    // PREPARE MAPS (Common for both strategies)
    // -----------------------------------------------------------------
    const schoolMap = getSchoolMap(ss); 
    const coordinatorMap = getCoordinatorMap(ss); // New: Get Coordinator Mapping

    let sessions = []; // Will hold final sessions
    let cancellations = []; 
    let teacherSet = new Set();
    let schoolSet = new Set();
    let coordSet = new Set();
    
    // Metrics
    let metrics = {
      total: 0,
      cancelBC: 0,
      cancelSchool: 0,
      covered: 0
    };

    // -----------------------------------------------------------------
    // STRATEGY: Prefer Cache for speed
    // -----------------------------------------------------------------
    const cacheSheet = ss.getSheetByName('cache_today_session');
    const useCache = (cacheSheet && cacheSheet.getLastRow() > 1);
    
    // Impact Map
    let impactMap = {}; 

    // --- MODE 1: FAST (Read from Cache) ---
    if (useCache) {
      const data = cacheSheet.getDataRange().getValues(); 
      // 0:id, 1:school_code, 2:class, 3:time, 4:act_teach_name, 5:act_type, 6:orig_name, 7:orig_type, 8:status, 9:school_id
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;
        
        const schoolCode = String(row[1]); // FORCE STRING to prevent "SAT" -> Date issues
        const sCoord = coordinatorMap[schoolCode] || "Unassigned";
        
        const tName = row[4]; 
        const tType = row[5]; 
        const origName = row[6]; 
        const status = String(row[8]);
        const timeSlot = String(row[3]); 
        
        let displayTime = timeSlot; 

        // Collect Impact
        if (origName && origName !== "-" && origName !== "Unknown") {
            if (!impactMap[origName]) impactMap[origName] = [];
            impactMap[origName].push({
                time: displayTime,
                school: schoolCode,
                className: row[2], 
                status: status,
                actualTeacher: tName
            });
        }

        // Metrics & Inclusion
        metrics.total++;
        if (status.includes("Cancel")) {
            if (status.toLowerCase().includes("bc")) metrics.cancelBC++;
            else metrics.cancelSchool++; // Default to School if not BC (or explicitly School)
        } else if (status === "Substituted" || status === "Cover") {
            metrics.covered++;
        }

        // ALWAYS Push to sessions (User wants to see cancelled classes too)
        sessions.push({
             id: row[0],
             time: displayTime, 
             school: schoolCode,
             class: row[2],
             teacher: tName,
             teacherType: tType,
             coordinator: sCoord,
             status: status
        });
        
        teacherSet.add(tName);
        schoolSet.add(schoolCode);
        coordSet.add(sCoord);
      }
    } 
    // --- MODE 2: SLOW (Fallback) ---
    else {
      const tz = ss.getSpreadsheetTimeZone();
      const todayStr = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
      const userMap = getUserMap(ss);
      const sheet = ss.getSheetByName('fact_daily_session');
  
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        const dispData = sheet.getDataRange().getDisplayValues();
        
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const rowDate = row[1] instanceof Date ? Utilities.formatDate(row[1], tz, "yyyy-MM-dd") : String(row[1]);
          
          if (rowDate === todayStr) {
            const teachId = String(row[6]);
            const origId = String(row[7]); 
            const schoolId = String(row[5]); 
            
            const tName = userMap[teachId] ? userMap[teachId].name : teachId;
            const tType = userMap[teachId] ? userMap[teachId].type : "Unknown";
            
            let origName = "-";
            if (origId && origId !== teachId) {
                origName = userMap[origId] ? userMap[origId].name : origId;
            }
            
            const sCodeRaw = schoolMap[schoolId] ? schoolMap[schoolId].name : schoolId; 
            const sCode = String(sCodeRaw); // FORCE STRING
            const sCoord = coordinatorMap[sCode] || "Unassigned"; 
            
            const tStart = dispData[i][2].substring(0,5);
            const tEnd = dispData[i][3].substring(0,5);
            const displayTime = `${tStart} - ${tEnd}`;
            const status = String(row[8]);
            
            if (origName && origName !== "-" && origName !== "Unknown") {
                if (!impactMap[origName]) impactMap[origName] = [];
                impactMap[origName].push({ time: displayTime, school: sCode, className: row[4], status: status, actualTeacher: tName });
            }

            // Metrics
            metrics.total++;
            if (status.includes("Cancel")) {
                if (status.toLowerCase().includes("bc")) metrics.cancelBC++;
                else metrics.cancelSchool++;
            } else if (status === "Substituted" || status === "Cover") {
                metrics.covered++;
            }

            sessions.push({
                 id: row[0], time: displayTime, school: sCode, class: row[4],
                 teacher: tName, teacherType: tType, coordinator: sCoord, status: status
            });
            teacherSet.add(tName);
            schoolSet.add(sCode);
            coordSet.add(sCoord);
          }
        }
      }
    }
    
    // Sort Results
    sessions.sort((a,b) => a.time.localeCompare(b.time));

    // -----------------------------------------------------------------
    // NEW FETCHERS
    // -----------------------------------------------------------------
    const userMapForUA = getUserMap(ss); 
    const absences = getAbsenceData(ss, userMapForUA); 
    
    // Inject Impacts
    absences.forEach(a => {
        if (impactMap[a.name]) {
            a.impacts = impactMap[a.name];
            a.impacts.sort((x,y) => x.time.localeCompare(y.time));
        }
    });

    const holidays = getHolidayLogCancellations(); 

    const result = {
      absentCount: absences.length,
      absentees: absences,
      metrics: metrics, // New Metrics
      filters: {
        teachers: Array.from(teacherSet).sort(),
        schools: Array.from(schoolSet).sort(),
        coordinators: Array.from(coordSet).sort()
      },
      sessions: sessions,
      cancellations: holidays, 
      source: useCache ? "Cache" : "Live" 
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: true,
      message: err.toString() + " Stack: " + err.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --- NEW HELPERS ---

function getCoordinatorMap(ss) {
  const map = {};
  const sh = ss.getSheetByName('view_school_coordinator');
  if (!sh) return map; // Return empty if not found
  const data = sh.getDataRange().getValues();
  // Col A = School Code/Name, Col B = Coordinator Name
  for (let i = 1; i < data.length; i++) {
    let key = String(data[i][0]).trim();
    if(key) map[key] = data[i][1];
  }
  return map;
}

function getAbsenceData(ss, userMap) {
  // --- TRY CACHE FIRST ---
  const cacheSheet = ss.getSheetByName('cache_today_unavailability');
  if (cacheSheet && cacheSheet.getLastRow() > 1) {
    const data = cacheSheet.getDataRange().getValues();
    const absentees = [];
    // 0:tid, 1:name, 2:type, 3:period, 4:reason
    for (let i = 1; i < data.length; i++) {
      absentees.push({
        name: data[i][1],
        type: data[i][2],
        period: data[i][3],
        reason: data[i][4],
        impacts: [] // Cache doesn't store impacts logic yet, simple view is fine
      });
    }
    return absentees;
  }

  // --- FALLBACK TO SLOW READ (If Cache Missing) ---
  const sh = ss.getSheetByName('fact_teacher_unavailability');
  if (!sh) return [];
  
  const today = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
  const data = sh.getDataRange().getValues();
  const dispData = sh.getDataRange().getDisplayValues(); // To get nice time strings
  
  const absentees = [];
  const processed = new Set(); // Prevent duplicates

  // 0:uid, 1:tid, 2:startDate, 3:endDate, 4:startTime, 5:endTime, 6:remark
  for (let i = 1; i < data.length; i++) {
    let sDate = data[i][2] instanceof Date ? Utilities.formatDate(data[i][2], ss.getSpreadsheetTimeZone(), "yyyy-MM-dd") : String(data[i][2]);
    let eDate = data[i][3] instanceof Date ? Utilities.formatDate(data[i][3], ss.getSpreadsheetTimeZone(), "yyyy-MM-dd") : String(data[i][3]);
    
    if (sDate <= today && eDate >= today) {
       let tid = String(data[i][1]);
       let tInfo = userMap[tid] || { name: tid, type: "Unknown" };
       
       let uniqueKey = tid + "_" + data[i][6]; // Group by Teacher + Reason
       
       if (!processed.has(uniqueKey)) {
         let timeStr = "";
         // Logic: If almost whole day (08:00 - 16:00), just show "Whole Day" or similar
         // Or just show raw time range
         let tStart = dispData[i][4] ? dispData[i][4].substring(0,5) : "";
         let tEnd = dispData[i][5] ? dispData[i][5].substring(0,5) : "";
         
         if (tStart && tEnd) timeStr = `${tStart} - ${tEnd}`;
         else timeStr = "All Day";

         absentees.push({
           name: tInfo.name,
           type: tInfo.type,
           period: timeStr,
           reason: data[i][6],
           impacts: [] 
         });
         processed.add(uniqueKey);
       }
    }
  }
  return absentees;
}

function getHolidayLogCancellations() {
  try {
    const holidaySS = SpreadsheetApp.openById(CONFIG.HOLIDAY_DB_ID);
    const sh = holidaySS.getSheetByName('Holiday_Log');
    if (!sh) return [];
    
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const data = sh.getDataRange().getValues();
    const cancellations = [];
    
    // Columns: 0:Ticket, 1:Time, 2:User, 3:School, 4:Start, 5:End, 6:Type, 7:SessIDs, 8:Reason, 9:Status
    for (let i = 1; i < data.length; i++) {
      let sDate = data[i][4] instanceof Date ? Utilities.formatDate(data[i][4], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(data[i][4]);
      let eDate = data[i][5] instanceof Date ? Utilities.formatDate(data[i][5], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(data[i][5]);
      
      // Filter: Active today (overlaps today)
      if (sDate <= today && eDate >= today) {
         cancellations.push({
           school: data[i][3],
           time: data[i][1], // Submitted time
           type: data[i][6], // "Whole Day" or "Specific"
           reason: data[i][8],
           user: data[i][2]
         });
      }
    }
    return cancellations;
  } catch (e) {
    // If permission error or file not found, return empty (don't break dashboard)
    console.error("Holiday Log Error: " + e.message);
    return [];
  }
}

function getSchoolMap(ss) {
  const map = {};
  const sh = ss.getSheetByName('dim_school');
  if (!sh) return map;
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    // Standardize: ID (Key) -> Code (Name)
    map[String(data[i][0])] = {
      name: data[i][1] 
    };
  }
  return map;
}

function getUserMap(ss) {
  const map = {};
  const sh = ss.getSheetByName('dim_user');
  if (!sh) return map;
  // Use DisplayValues to safely get String for IDs
  const data = sh.getDataRange().getValues(); 
  
  for (let i = 1; i < data.length; i++) {
    let uid = String(data[i][0]);
    // Logic from holiday.js/DailyCacheJob
    let name = data[i][8] || data[i][2]; // Nickname or Firstname
    if (data[i][3]) name += " " + String(data[i][3]).charAt(0) + "."; 
    
    let typeCode = data[i][13];
    let typeLabel = (typeCode == 210) ? "Full-time" : ((typeCode == 220) ? "Part-time" : "External");
    
    map[uid] = { name, type: typeLabel };
  }
  return map;
}

// Needed for POST actions (like reporting absence)
function doPost(e) {
  return doGet(e);
}
