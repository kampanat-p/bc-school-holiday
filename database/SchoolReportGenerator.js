/**
 * 📊 School Class Allocation Report Generator (Final Logic + Expanded Time Slots)
 * Purpose: Count DISTINCT active classes for manpower planning.
 * * Updates:
 * 1. [FIX] Expands "School Time Slots" into separate columns (Slot 1, Slot 2, ...) instead of one merged cell.
 * 2. Reads 'ref_school_time_slot' for accurate schedules.
 * 3. Excludes schools: TNR, TRN.
 * 4. Cleans "(Lab Class)" & normalizes spaces.
 */

function generateSchoolSessionReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ==========================================
  // ⚙️ CONFIGURATION
  // ==========================================
  const CONFIG_START_DATE = "2025-11-01"; 
  const CONFIG_END_DATE   = "2025-12-15";
  const IGNORE_SCHOOLS = new Set(['TNR', 'TRN']); 
  // ==========================================

  const startDate = new Date(CONFIG_START_DATE + 'T00:00:00');
  const endDate   = new Date(CONFIG_END_DATE + 'T23:59:59');

  const sheetFact = ss.getSheetByName('fact_daily_session');
  const sheetSchool = ss.getSheetByName('dim_school');
  const sheetRefSlots = ss.getSheetByName('ref_school_time_slot');

  if (!sheetFact || !sheetSchool) {
    Browser.msgBox("❌ Error", "Missing sheets: fact_daily_session or dim_school", Browser.Buttons.OK);
    return;
  }

  // 1. School Map
  const dataSchool = sheetSchool.getDataRange().getValues();
  const schoolMap = new Map();

  for (let i = 1; i < dataSchool.length; i++) {
    let row = dataSchool[i];
    let sId = String(row[0]);
    let sCode = String(row[1]).toUpperCase().trim(); 
    let sName = row[2];
    let sGroup = row[4] || "Unknown";

    if (IGNORE_SCHOOLS.has(sCode)) continue; 

    schoolMap.set(sId, { name: sName, group: sGroup, code: sCode });
  }

  // 2. Time Slot Map (Store as Array)
  const slotMap = new Map();
  let maxSlotsFound = 0; // Track max slots to create enough columns

  if (sheetRefSlots) {
    const dataSlots = sheetRefSlots.getDataRange().getValues();
    // Assuming CSV: school_code, source_file, slot_1, slot_2 ...
    for (let i = 1; i < dataSlots.length; i++) {
      let row = dataSlots[i];
      let code = String(row[0]).toUpperCase().trim();
      
      let slots = [];
      for (let j = 2; j < row.length; j++) {
        if (row[j] && String(row[j]).trim() !== "") {
          slots.push(String(row[j]).trim());
        }
      }
      
      if (slots.length > 0) {
        slotMap.set(code, slots);
        if (slots.length > maxSlotsFound) maxSlotsFound = slots.length;
      }
    }
  }

  // 3. Process Fact Data
  const dataFact = sheetFact.getDataRange().getValues();
  let hierarchy = {}; 

  const thaiBracketRegex = /\s*\([^)]*[\u0E00-\u0E7F]+[^)]*\)/g; 
  const labClassRegex = /\s*\(Lab Class\)/gi; 

  console.log("⏳ Processing data...");

  for (let i = 1; i < dataFact.length; i++) {
    let row = dataFact[i];
    let dateVal = row[1];
    let dateObj = (dateVal instanceof Date) ? dateVal : new Date(dateVal);

    if (dateObj < startDate || dateObj > endDate) continue;

    let sId = String(row[5]);
    let rawClassName = String(row[4]);

    if (!schoolMap.has(sId)) continue; 
    
    if (rawClassName.includes(',')) continue; 

    let schoolInfo = schoolMap.get(sId);
    let group = schoolInfo.group;
    let sName = schoolInfo.name;
    let sCode = schoolInfo.code;

    let cleanName = rawClassName;
    cleanName = cleanName.replace(/\s+/g, ' ').trim(); 
    cleanName = cleanName.replace(labClassRegex, '');

    if (group === 'Thesaban') {
       cleanName = cleanName.replace(thaiBracketRegex, '').trim();
    } else {
       cleanName = cleanName.replace(thaiBracketRegex, '').trim();
    }
    cleanName = cleanName.trim();

    let grade = extractGrade(cleanName);

    if (!hierarchy[group]) hierarchy[group] = {};
    if (!hierarchy[group][sCode]) {
        hierarchy[group][sCode] = { name: sName, grades: {} };
    }
    if (!hierarchy[group][sCode].grades[grade]) {
        hierarchy[group][sCode].grades[grade] = new Set();
    }

    hierarchy[group][sCode].grades[grade].add(cleanName);
  }

  // 4. Prepare Data Rows
  let groupSummaryRows = [["School Group", "Total Schools", "Total Active Class Units"]];
  
  // [UPDATED] Header for School Summary (Dynamic Slots)
  let schoolSummaryHeader = ["School Group", "School Code", "School Name", "Total Active Class Units"];
  for(let k=1; k<=maxSlotsFound; k++) {
    schoolSummaryHeader.push(`Slot ${k}`);
  }
  let schoolSummaryRows = [schoolSummaryHeader];

  let detailRows = [["School Group", "School Code", "School Name", "Grade / Level", "Active Class Count", "Class List (Reference)"]];

  let totalClassesAll = 0;
  let sortedGroups = Object.keys(hierarchy).sort();

  sortedGroups.forEach(grp => {
    let schoolsObj = hierarchy[grp];
    let schoolCodes = Object.keys(schoolsObj).sort(); 
    let groupClassCount = 0;

    schoolCodes.forEach(code => {
      let schoolData = schoolsObj[code];
      let sName = schoolData.name;
      let grades = schoolData.grades;
      
      let sortedGrades = Object.keys(grades).sort(gradeSort); 
      let schoolTotalClasses = 0; 

      sortedGrades.forEach(grd => {
        let classSet = grades[grd];
        let count = classSet.size; 
        
        schoolTotalClasses += count; 

        detailRows.push([
          grp, 
          code,
          sName, 
          grd, 
          count, 
          Array.from(classSet).sort().join(", ") 
        ]);
      });

      // [UPDATED] Retrieve and Spread Time Slots
      let timeSlotsArr = slotMap.get(code) || [];
      // Create a row: [Group, Code, Name, Total, Slot1, Slot2, ...]
      let summaryRow = [grp, code, sName, schoolTotalClasses, ...timeSlotsArr];
      
      // Pad with empty strings if this school has fewer slots than max
      while(summaryRow.length < schoolSummaryHeader.length) {
        summaryRow.push("");
      }

      schoolSummaryRows.push(summaryRow);

      groupClassCount += schoolTotalClasses;
    });

    groupSummaryRows.push([grp, schoolCodes.length, groupClassCount]);
    totalClassesAll += groupClassCount;
  });

  // 5. Write Output
  let reportSheetName = "Manpower_Allocation_Report";
  let targetSheet = ss.getSheetByName(reportSheetName);
  if (targetSheet) ss.deleteSheet(targetSheet);
  targetSheet = ss.insertSheet(reportSheetName);

  let headerStyle = SpreadsheetApp.newTextStyle().setBold(true).build();
  
  // --- SECTION 1 ---
  targetSheet.getRange("A1").setValue("📊 Executive Summary (By Group)").setTextStyle(headerStyle).setFontSize(14);
  targetSheet.getRange(3, 1, groupSummaryRows.length, 3).setValues(groupSummaryRows);
  targetSheet.getRange(3, 1, 1, 3).setBackground("#4c5c96").setFontColor("white").setFontWeight("bold");
  targetSheet.getRange(3, 1, groupSummaryRows.length, 3).setBorder(true, true, true, true, true, true);

  // --- SECTION 2: SCHOOL SUMMARY (EXPANDED SLOTS) ---
  let schoolStartRow = groupSummaryRows.length + 6;
  targetSheet.getRange(schoolStartRow - 2, 1).setValue("🏫 School Summary & Time Slots (Expanded)").setTextStyle(headerStyle).setFontSize(12);
  
  let numCols = schoolSummaryHeader.length;
  targetSheet.getRange(schoolStartRow, 1, schoolSummaryRows.length, numCols).setValues(schoolSummaryRows);
  
  // Style Header
  targetSheet.getRange(schoolStartRow, 1, 1, numCols).setBackground("#e76f51").setFontColor("white").setFontWeight("bold");
  // Borders
  targetSheet.getRange(schoolStartRow, 1, schoolSummaryRows.length, numCols).setBorder(true, true, true, true, true, true);
  // Center Align Counts and Slots
  targetSheet.getRange(schoolStartRow, 4, schoolSummaryRows.length, numCols - 3).setHorizontalAlignment("center");

  // --- SECTION 3 ---
  let detailStartRow = schoolStartRow + schoolSummaryRows.length + 4;
  targetSheet.getRange(detailStartRow - 2, 1).setValue("📋 Detailed Allocation (Group > School > Grade)").setTextStyle(headerStyle).setFontSize(12);
  
  targetSheet.getRange(detailStartRow, 1, detailRows.length, detailRows[0].length).setValues(detailRows);
  targetSheet.getRange(detailStartRow, 1, 1, detailRows[0].length).setBackground("#2a9d8f").setFontColor("white").setFontWeight("bold");
  targetSheet.getRange(detailStartRow, 1, detailRows.length, detailRows[0].length).setBorder(true, true, true, true, true, true, "#d9d9d9", SpreadsheetApp.BorderStyle.SOLID);
  targetSheet.getRange(detailStartRow, 5, detailRows.length, 1).setHorizontalAlignment("center");
  
  targetSheet.autoResizeColumns(1, numCols);
  
  console.log("✅ Report Generated");
  Browser.msgBox("✅ Report Ready", `Total Active Class Units: ${totalClassesAll}`, Browser.Buttons.OK);
}

function extractGrade(cleanName) {
  let parts = cleanName.split(" ");
  if (parts.length < 2) return cleanName; 
  let token = parts[1]; 
  if (token.includes("-")) return token.split("-")[0];
  if (token.includes("/")) return token.split("/")[0];
  return token;
}

function gradeSort(a, b) {
  let numA = parseInt(a.replace(/\D/g, ''));
  let numB = parseInt(b.replace(/\D/g, ''));
  if (!isNaN(numA) && !isNaN(numB)) {
    if (numA !== numB) return numA - numB;
  }
  return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
}