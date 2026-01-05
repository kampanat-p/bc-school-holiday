/**
 * ⏰ School Time Slot Report Generator
 * Purpose: Extract unique daily time slots (Bell Schedule) for each school.
 * Logic: Scans actual session data to find distinct Start-End time pairs.
 */

function generateSchoolTimeSlotReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ==========================================
  // ⚙️ CONFIGURATION
  // ==========================================
  const CONFIG_START_DATE = "2025-11-01"; 
  const CONFIG_END_DATE   = "2025-12-17";
  const IGNORE_SCHOOLS = new Set(['TNR', 'TRN']); 
  // ==========================================

  const startDate = new Date(CONFIG_START_DATE + 'T00:00:00');
  const endDate   = new Date(CONFIG_END_DATE + 'T23:59:59');

  const sheetFact = ss.getSheetByName('fact_daily_session');
  const sheetSchool = ss.getSheetByName('dim_school');

  if (!sheetFact || !sheetSchool) {
    Browser.msgBox("❌ Error", "Missing sheets", Browser.Buttons.OK);
    return;
  }

  // 1. School Map (Get Code & Name)
  const dataSchool = sheetSchool.getDataRange().getValues();
  const schoolMap = new Map();

  for (let i = 1; i < dataSchool.length; i++) {
    let row = dataSchool[i];
    let sId = String(row[0]);
    let sCode = String(row[1]).toUpperCase().trim(); 
    let sName = row[2];
    let sGroup = row[4] || "Unknown";

    if (IGNORE_SCHOOLS.has(sCode)) continue; 

    schoolMap.set(sId, { name: sName, code: sCode, group: sGroup });
  }

  // 2. Process Fact Data
  const dataFact = sheetFact.getDataRange().getValues();
  
  // Structure: slotMap[SchoolCode] = Set("08:30-09:20", "09:30-10:20")
  let slotMap = {}; 

  console.log("⏳ Scanning time slots...");

  for (let i = 1; i < dataFact.length; i++) {
    let row = dataFact[i];
    let dateVal = row[1];
    let dateObj = (dateVal instanceof Date) ? dateVal : new Date(dateVal);

    // Filter Date Range
    if (dateObj < startDate || dateObj > endDate) continue;

    let sId = String(row[5]);
    if (!schoolMap.has(sId)) continue;

    let startTime = row[2]; // Col C
    let endTime = row[3];   // Col D

    // Format Times (HH:mm)
    let startStr = formatTime(startTime);
    let endStr = formatTime(endTime);
    
    // Skip invalid times
    if (!startStr || !endStr) continue;

    // Create Slot String
    let slotLabel = `${startStr} - ${endStr}`;
    
    let sCode = schoolMap.get(sId).code;
    
    if (!slotMap[sCode]) {
      slotMap[sCode] = new Set();
    }
    slotMap[sCode].add(slotLabel);
  }

  // 3. Prepare Output Rows
  let outputRows = [];
  let maxSlots = 0; // To determine how many header columns we need

  let sortedCodes = Object.keys(slotMap).sort();

  sortedCodes.forEach(code => {
    // Convert Set to Array and Sort Chronologically
    let uniqueSlots = Array.from(slotMap[code]);
    
    // Sort logic: "08:30 - 09:20" vs "13:00 - 13:50"
    uniqueSlots.sort((a, b) => {
      return a.localeCompare(b); // String compare works for HH:mm format
    });

    // Update max columns needed
    if (uniqueSlots.length > maxSlots) maxSlots = uniqueSlots.length;

    // Get School Name
    // Note: We need to find the ID again or just store name in a separate map. 
    // Optimization: We can just loop schoolMap to find name matching code (a bit slow but fine)
    // Or better, let's look up from our schoolMap (Wait, key was ID).
    // Let's just find the first school with this code.
    let sName = "Unknown";
    let sGroup = "Unknown";
    for (let [id, info] of schoolMap) {
        if (info.code === code) {
            sName = info.name;
            sGroup = info.group;
            break;
        }
    }

    // Build Row
    let row = [sGroup, code, sName, ...uniqueSlots];
    outputRows.push(row);
  });

  // 4. Create Sheet
  let reportSheetName = "School_Time_Slots";
  let targetSheet = ss.getSheetByName(reportSheetName);
  if (targetSheet) ss.deleteSheet(targetSheet);
  targetSheet = ss.insertSheet(reportSheetName);

  // Headers
  let headerStyle = SpreadsheetApp.newTextStyle().setBold(true).build();
  targetSheet.getRange("A1").setValue("⏰ School Bell Schedule (Time Slots)").setTextStyle(headerStyle).setFontSize(14);
  
  let headers = ["Group", "School Code", "School Name"];
  for (let k = 1; k <= maxSlots; k++) {
    headers.push(`Slot ${k}`);
  }

  let startRow = 3;
  targetSheet.getRange(startRow, 1, 1, headers.length).setValues([headers])
      .setBackground("#4c5c96").setFontColor("white").setFontWeight("bold");

  if (outputRows.length > 0) {
    // Pad rows to match header length
    outputRows.forEach(row => {
        while (row.length < headers.length) {
            row.push("");
        }
    });

    targetSheet.getRange(startRow + 1, 1, outputRows.length, headers.length).setValues(outputRows);
    targetSheet.getRange(startRow, 1, outputRows.length + 1, headers.length)
      .setBorder(true, true, true, true, true, true, "#d9d9d9", SpreadsheetApp.BorderStyle.SOLID);
      
    // Align time slots to center
    if (headers.length > 3) {
        targetSheet.getRange(startRow + 1, 4, outputRows.length, headers.length - 3).setHorizontalAlignment("center");
    }
  }

  targetSheet.autoResizeColumns(1, headers.length);
  console.log("✅ Time Slot Report Generated");
  Browser.msgBox("✅ Report Ready", `Found distinct schedules for ${outputRows.length} schools.`, Browser.Buttons.OK);
}

/**
 * Helper: Formats Date object or Time string to "HH:mm"
 */
function formatTime(val) {
  if (!val) return null;
  
  // If it's a Google Sheet Date Object
  if (val instanceof Date) {
    let h = val.getHours().toString().padStart(2, '0');
    let m = val.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }
  
  // If it's a string like "08:30:00" or "8:30"
  let str = String(val).trim();
  // Regex to capture HH:mm
  let match = str.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    let h = match[1].padStart(2, '0');
    let m = match[2];
    return `${h}:${m}`;
  }
  
  return null;
}