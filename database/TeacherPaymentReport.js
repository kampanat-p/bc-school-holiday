/**
 * 💰 Teacher Payment Database & Reporting System
 * ---------------------------------------------
 * 1. Syncs Daily Session Data into a persistent 'db_payment_ledger'.
 * 2. Calculates Payability based on advanced logic (Lead time, Unavailability cross-check).
 * 3. Generates Monthly Summary Reports from the ledger.
 */

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const LEDGER_SHEET_NAME = "db_payment_ledger";
const TIME_ZONE = "Asia/Bangkok"; // ✅ Force Timezone เพื่อป้องกัน Error
// ==========================================

/**
 * [TRIGGER] 1. Daily Sync: Run this via Time-driven trigger (e.g., every night)
 * Updates data for Yesterday and Today.
 */
function syncDailyPaymentData() {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  console.log("⏰ Starting Daily Payment Sync...");
  updatePaymentLedger(yesterday, today);
}

/**
 * [MANUAL] 2. Backfill: Run manually to fix/update past data.
 */
function runBackfillPaymentData() {
  // --- ตั้งค่าช่วงเวลา Backfill ตรงนี้ ---
  const START_DATE_STR = "2025-12-11"; 
  const END_DATE_STR   = "2025-12-16"; 
  // -------------------------------------

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Confirm Backfill', `Update payment data from ${START_DATE_STR} to ${END_DATE_STR}?`, ui.ButtonSet.YES_NO);
  
  if (response == ui.Button.YES) {
    const start = new Date(START_DATE_STR);
    const end = new Date(END_DATE_STR);
    updatePaymentLedger(start, end);
    ui.alert('✅ Backfill Complete!');
  }
}

/**
 * [REPORT] 3. Generate Summary Report (For Finance)
 * Reads from 'db_payment_ledger' and creates summary sheets.
 */
function generateMonthlyReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ledgerSheet = ss.getSheetByName(LEDGER_SHEET_NAME);
  
  if (!ledgerSheet) {
    Browser.msgBox("❌ No Database Found. Please run Backfill first.");
    return;
  }

  // Filter Month
  const REPORT_MONTH = "2025-12"; // Format: YYYY-MM
  
  const data = ledgerSheet.getDataRange().getValues();
  // Headers: 0:SessionID, 1:Date, ..., 5:Name, 6:Type, 7:Event, 8:Analysis, 9:Status, 10:Unit
  
  let summaryStats = new Map();
  // Key: TeacherName -> { type, teaching:0, cover:0, missed:0, cancelPay:0, cancelNoPay:0 }
  
  let typeStats = {
      'Full-time': { count: new Set(), teaching: 0, cover: 0, missed: 0, cancel: 0 },
      'Part-time': { count: new Set(), teaching: 0, cover: 0, missed: 0, cancel: 0 }
  };

  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    let dateStr = String(row[1]); // YYYY-MM-DD
    if (!dateStr.startsWith(REPORT_MONTH)) continue;

    let tName = row[5];
    let tType = row[6];
    let event = row[7];
    let unit = Number(row[10]);
    let statusText = row[9]; // Payment Status Text

    if (!summaryStats.has(tName)) {
        summaryStats.set(tName, { name: tName, type: tType, teaching:0, cover:0, missed:0, cancelPay:0, cancelNoPay:0 });
    }
    let stat = summaryStats.get(tName);
    
    // Global Type Stats
    if (typeStats[tType]) typeStats[tType].count.add(tName);

    if (event === "Normal Teaching") {
        stat.teaching++;
        if (typeStats[tType]) typeStats[tType].teaching++;
    } else if (event === "Cover (Sub)") {
        stat.teaching++; // Cover counts as teaching
        stat.cover++;
        if (typeStats[tType]) { typeStats[tType].teaching++; typeStats[tType].cover++; }
    } else if (event === "Class Cancelled") {
        if (unit === 1) {
            stat.cancelPay++;
            if (typeStats[tType]) typeStats[tType].cancel++;
        } else {
            stat.cancelNoPay++;
        }
    } else if (event.includes("Missed")) {
        stat.missed++;
        if (typeStats[tType]) typeStats[tType].missed++;
    }
  }

  // Create Summary Rows
  let summaryRows = [];
  summaryStats.forEach(s => {
      summaryRows.push([
        s.name, s.type, s.teaching, s.cover, s.missed, s.cancelPay, s.cancelNoPay, (s.teaching + s.cancelPay)
      ]);
  });
  // Sort
  summaryRows.sort((a,b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));

  // Create Comparison Rows
  let compRows = [
      ["Type", "Staff Count", "Total Taught", "Cover Events", "Missed", "Paid Cancels"],
      ["Full-time", typeStats['Full-time'].count.size, typeStats['Full-time'].teaching, typeStats['Full-time'].cover, typeStats['Full-time'].missed, typeStats['Full-time'].cancel],
      ["Part-time", typeStats['Part-time'].count.size, typeStats['Part-time'].teaching, typeStats['Part-time'].cover, typeStats['Part-time'].missed, typeStats['Part-time'].cancel]
  ];

  // Output
  outputToSheet(ss, `Finance_Sum_${REPORT_MONTH}`, summaryRows, 
    ["Teacher Name", "Type", "Total Taught", "Cover Count", "Missed", "Cancel (Paid)", "Cancel (No Pay)", "TOTAL PAYABLE"]
  );
  outputToSheet(ss, `Finance_Comp_${REPORT_MONTH}`, compRows, [], true);

  Browser.msgBox("✅ Report Generated from Ledger!");
}


/**
 * Core Function: Updates the persistent ledger
 */
function updatePaymentLedger(startDate, endDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  startDate.setHours(0,0,0,0);
  endDate.setHours(23,59,59,999);

  // 1. Load Source Data
  const sheetFact = ss.getSheetByName('fact_daily_session');
  const sheetUnavail = ss.getSheetByName('fact_teacher_unavailability');
  const sheetUser = ss.getSheetByName('dim_user');
  const sheetSchool = ss.getSheetByName('dim_school');

  if (!sheetFact || !sheetUser) { console.error("Missing Data Sheets"); return; }

  // 2. Load Existing Ledger (For Upsert)
  let sheetLedger = ss.getSheetByName(LEDGER_SHEET_NAME);
  if (!sheetLedger) {
      sheetLedger = ss.insertSheet(LEDGER_SHEET_NAME);
      // Create Header
      sheetLedger.appendRow(["Session_ID", "Date", "Time", "School", "Class", "Teacher_Name", "Type", "Event", "System_Analysis", "Status", "Payable_Unit", "Last_Updated"]);
      sheetLedger.getRange(1,1,1,12).setBackground("#102027").setFontColor("white").setFontWeight("bold");
      sheetLedger.setFrozenRows(1);
  }

  // Create Map of Existing Rows: Key = "SessionID_TeacherName"
  const ledgerMap = new Map();
  const ledgerData = sheetLedger.getDataRange().getValues();
  for (let i = 1; i < ledgerData.length; i++) {
      let uniqueKey = `${ledgerData[i][0]}_${ledgerData[i][5]}`; 
      ledgerMap.set(uniqueKey, i + 1); // Store Row Index
  }

  // 3. Prepare Master Data Maps
  const userMap = new Map();
  const userData = sheetUser.getDataRange().getValues();
  for (let i = 1; i < userData.length; i++) {
      let uid = String(userData[i][0]);
      let typeCode = String(userData[i][13]);
      if (typeCode !== '210' && typeCode !== '220') continue;
      
      let fname = userData[i][2];
      let lname = userData[i][3];
      let formattedName = formatTeacherName(fname, lname);
      
      userMap.set(uid, {
          name: formattedName,
          type: (typeCode === '210') ? 'Full-time' : 'Part-time'
      });
  }

  const schoolMap = new Map();
  const schoolData = sheetSchool.getDataRange().getValues();
  for(let i=1; i<schoolData.length; i++) schoolMap.set(String(schoolData[i][0]), String(schoolData[i][1]));

  const unavailMap = new Map();
  if (sheetUnavail) {
    const uaData = sheetUnavail.getDataRange().getDisplayValues();
    for (let i = 1; i < uaData.length; i++) {
      // Key: TeacherID_Date_Time
      // ⚠️ CHANGE: ใช้ safeNormalizeTime เพื่อเลี่ยงฟังก์ชันที่มีปัญหาใน TimelineService
      unavailMap.set(`${uaData[i][1]}_${uaData[i][2]}_${safeNormalizeTime(uaData[i][4])}`, uaData[i][6]);
    }
  }

  // 4. Process Logic & Prepare Writes
  const sessionData = sheetFact.getDataRange().getValues();
  const rowsToUpdate = []; 
  const rowsToInsert = []; 

  for (let i = 1; i < sessionData.length; i++) {
      let row = sessionData[i];
      let dateVal = row[1];
      if (!dateVal) continue;
      let dateObj = (dateVal instanceof Date) ? dateVal : new Date(dateVal);
      
      if (dateObj < startDate || dateObj > endDate) continue;

      let dateStr = Utilities.formatDate(dateObj, TIME_ZONE, "yyyy-MM-dd");
      let sessionId = String(row[0]);
      
      // ⚠️ CHANGE: ใช้ safeNormalizeTime ทั้งหมด
      let startTime = safeNormalizeTime(row[2]);
      let endTime = safeNormalizeTime(row[3]);
      
      let timeRange = `${startTime}-${endTime}`;
      let className = row[4];
      let schoolCode = schoolMap.get(String(row[5])) || String(row[5]);
      let actualId = String(row[6]).trim();
      let originalId = String(row[7]).trim();
      let status = String(row[8]);
      let isPayable = (row[9] === true || String(row[9]).toLowerCase() === 'true');
      let cancelledAt = row[11];
      let lastUpdated = new Date();

      // --- LOGIC A: Actual Teacher ---
      if (!status.startsWith("Cancelled") && actualId && userMap.has(actualId)) {
          let actUser = userMap.get(actualId);
          let eventType = "Normal Teaching";
          let note = "-";
          
          if (originalId && actualId !== originalId) {
              eventType = "Cover (Sub)";
              let orgName = userMap.get(originalId) ? userMap.get(originalId).name : originalId;
              note = `Cover for ${orgName}`;
          }

          let record = [
              sessionId, dateStr, timeRange, schoolCode, className,
              actUser.name, actUser.type, eventType,
              note, "✅ Paid", 1, lastUpdated
          ];
          
          pushToOps(ledgerMap, sessionId, actUser.name, record, rowsToUpdate, rowsToInsert);
      }

      // --- LOGIC B: Original Teacher ---
      if (originalId && userMap.has(originalId)) {
          let orgUser = userMap.get(originalId);
          
          if (status.startsWith("Cancelled")) {
              let userReason = unavailMap.get(`${originalId}_${dateStr}_${startTime}`);
              let analysis = "";
              let payStatus = "❌ No Pay";
              let unit = 0;

              let leadTime = "";
              if (cancelledAt && cancelledAt instanceof Date) {
                  let classStartObj = new Date(dateObj);
                  let tParts = startTime.split(':');
                  classStartObj.setHours(tParts[0], tParts[1]);
                  let diff = (classStartObj - cancelledAt) / 36e5; // hours
                  leadTime = `(${diff.toFixed(1)}h notice)`;
              }

              if (userReason) {
                  analysis = `[CONFLICT] Teacher Reason: "${userReason}". ${leadTime}`;
                  payStatus = "⚠️ Review";
                  unit = 0;
              } else {
                  if (isPayable) {
                      analysis = `School Cancel < 3h. ${leadTime}`;
                      payStatus = "✅ Paid (Comp)";
                      unit = 1;
                  } else {
                      analysis = `Standard Cancel. ${leadTime}`;
                      payStatus = "❌ No Pay";
                      unit = 0;
                  }
              }

              let record = [
                  sessionId, dateStr, timeRange, schoolCode, className,
                  orgUser.name, orgUser.type, "Class Cancelled",
                  analysis, payStatus, unit, lastUpdated
              ];
              pushToOps(ledgerMap, sessionId, orgUser.name, record, rowsToUpdate, rowsToInsert);

          } else if (actualId && actualId !== originalId) {
              // Missed Class
              let reason = unavailMap.get(`${originalId}_${dateStr}_${startTime}`) || "Substituted";
              let actName = userMap.get(actualId) ? userMap.get(actualId).name : actualId;
              
              let record = [
                  sessionId, dateStr, timeRange, schoolCode, className,
                  orgUser.name, orgUser.type, "Missed / Substituted",
                  `Covered by ${actName}. Reason: ${reason}`,
                  "❌ No Pay", 0, lastUpdated
              ];
              pushToOps(ledgerMap, sessionId, orgUser.name, record, rowsToUpdate, rowsToInsert);
          }
      }
  }

  // 5. Execute Writes (Batch)
  if (rowsToUpdate.length > 0) {
      rowsToUpdate.forEach(item => {
          sheetLedger.getRange(item.row, 1, 1, item.values.length).setValues([item.values]);
      });
  }
  if (rowsToInsert.length > 0) {
      sheetLedger.getRange(sheetLedger.getLastRow()+1, 1, rowsToInsert.length, rowsToInsert[0].length).setValues(rowsToInsert);
  }

  console.log(`💾 Ledger Updated: ${rowsToUpdate.length} updated, ${rowsToInsert.length} new inserted.`);
}

function pushToOps(map, id, name, record, updateList, insertList) {
    let key = `${id}_${name}`;
    if (map.has(key)) {
        updateList.push({ row: map.get(key), values: record });
    } else {
        insertList.push(record);
    }
}

function formatTeacherName(fname, lname) {
    if (!fname) return "";
    fname = String(fname).trim();
    if (!lname) return fname;
    let initial = String(lname).trim().charAt(0).toUpperCase();
    return `${fname} ${initial}.`;
}

function exportFinanceFiles() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const financeSheets = sheets.filter(s => s.getName().startsWith("Finance_"));
  if (financeSheets.length === 0) { Browser.msgBox("❌ ไม่พบชีตรายงาน Finance"); return; }
  
  let dateStr = Utilities.formatDate(new Date(), TIME_ZONE, "yyyy-MM-dd");
  let newSS = SpreadsheetApp.create(`Braincloud_Finance_Report_${dateStr}`);
  financeSheets.forEach(sheet => { sheet.copyTo(newSS).setName(sheet.getName()); });
  let dSheet = newSS.getSheetByName("Sheet1"); if(dSheet) newSS.deleteSheet(dSheet);
  let htmlOutput = HtmlService.createHtmlOutput(`<p>✅ Export เรียบร้อย!</p><p><a href="${newSS.getUrl()}" target="_blank">เปิดไฟล์รายงาน</a></p>`).setWidth(300).setHeight(150);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Export Successful");
}

function outputToSheet(ss, sheetName, data, headers, simpleMode=false) {
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet(sheetName);
  if (!simpleMode) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground("#004d40").setFontColor("white").setFontWeight("bold");
      if (data.length > 0) sheet.getRange(2, 1, data.length, headers.length).setValues(data);
      sheet.autoResizeColumns(1, headers.length);
  } else {
      if (data.length > 0) {
          sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
          sheet.getRange(1, 1, 1, data[0].length).setBackground("#1a237e").setFontColor("white").setFontWeight("bold");
          sheet.autoResizeColumns(1, data[0].length);
      }
  }
}

// ⚠️ CHANGE: เปลี่ยนชื่อฟังก์ชันเพื่อไม่ให้ไปตีกับไฟล์อื่น (TimelineService)
function safeNormalizeTime(val) {
  if (val instanceof Date) return Utilities.formatDate(val, TIME_ZONE, "HH:mm");
  return String(val).substring(0, 5);
}