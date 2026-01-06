/**
 * 🕵️‍♀️ School Schedule Inference Generator
 * Purpose: Extract actual time slots AND infer missing slots based on patterns.
 * Logic:
 * 1. Calculate 'Standard Duration' and 'Typical Break' for each school (Mode).
 * 2. Fill gaps that match the pattern.
 * 3. Mark inferred slots differently from actual active slots.
 */

function generateInferredScheduleReport() {
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

  if (!sheetFact || !sheetSchool) {
    Browser.msgBox("❌ Error", "Missing sheets", Browser.Buttons.OK);
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
    schoolMap.set(sId, { name: sName, code: sCode, group: sGroup });
  }

  // 2. Collect Actual Slots
  const dataFact = sheetFact.getDataRange().getValues();
  // slots[SchoolCode] = Set("StartMins|EndMins") -> Store as minutes for easier math
  let rawSlots = {}; 

  console.log("⏳ Collecting actual slots...");

  for (let i = 1; i < dataFact.length; i++) {
    let row = dataFact[i];
    let dateVal = row[1];
    let dateObj = (dateVal instanceof Date) ? dateVal : new Date(dateVal);
    if (dateObj < startDate || dateObj > endDate) continue;

    let sId = String(row[5]);
    if (!schoolMap.has(sId)) continue;

    let startTime = row[2];
    let endTime = row[3];

    let startMins = convertToMinutes(startTime);
    let endMins = convertToMinutes(endTime);

    if (startMins === null || endMins === null) continue;

    let sCode = schoolMap.get(sId).code;
    if (!rawSlots[sCode]) rawSlots[sCode] = new Set();
    
    // Store as "Start|End" string to avoid duplicates
    rawSlots[sCode].add(`${startMins}|${endMins}`);
  }

  // 3. Process & Infer
  let outputRows = [];
  let maxCols = 0;
  let sortedCodes = Object.keys(rawSlots).sort();

  console.log("🧠 Inferring missing slots...");

  sortedCodes.forEach(code => {
    // 3.1 Convert Set to Object Array & Sort
    let uniqueSlots = Array.from(rawSlots[code]).map(s => {
      let parts = s.split('|');
      return { start: parseInt(parts[0]), end: parseInt(parts[1]), type: 'Active' };
    });
    uniqueSlots.sort((a, b) => a.start - b.start);

    // 3.2 Find Patterns (Mode Duration & Mode Break)
    let pattern = analyzePattern(uniqueSlots);
    let schoolSchedule = [];

    // 3.3 Fill Gaps (Inference Logic)
    if (uniqueSlots.length > 0) {
        // Start with the first actual slot
        schoolSchedule.push(uniqueSlots[0]);

        for (let i = 0; i < uniqueSlots.length - 1; i++) {
            let current = uniqueSlots[i];
            let next = uniqueSlots[i+1];
            
            // Try to infer slots between Current End and Next Start
            let gap = next.start - current.end;

            // Logic: Only infer if we have a solid pattern
            if (pattern.isValid && gap > 0) {
                let potentialSlots = inferGap(current.end, next.start, pattern);
                if (potentialSlots.length > 0) {
                    schoolSchedule = schoolSchedule.concat(potentialSlots);
                }
            }
            schoolSchedule.push(next);
        }
    } else {
        // No data
    }

    // 3.4 Format for Output
    // Convert back to "HH:mm - HH:mm (Type)"
    let formattedSlots = schoolSchedule.map(s => {
        let label = `${formatMins(s.start)} - ${formatMins(s.end)}`;
        if (s.type === 'Inferred') {
            return `[${label}] ?`; // Mark with brackets or ?
        } else if (s.type === 'Lunch') {
             return `🍱 Lunch`;
        }
        return label;
    });

    if (formattedSlots.length > maxCols) maxCols = formattedSlots.length;

    // Get School Info
    // (Optimization: Loop once to match code)
    let sName = "Unknown";
    let sGroup = "Unknown";
    for (let [id, info] of schoolMap) {
        if (info.code === code) {
            sName = info.name;
            sGroup = info.group;
            break;
        }
    }
    
    // Add Note if pattern was weak
    let note = pattern.isValid ? "" : "⚠️ Irregular/Single Class";

    outputRows.push([sGroup, code, sName, note, ...formattedSlots]);
  });

  // 4. Write Output
  let reportSheetName = "Inferred_Schedule_Map";
  let targetSheet = ss.getSheetByName(reportSheetName);
  if (targetSheet) ss.deleteSheet(targetSheet);
  targetSheet = ss.insertSheet(reportSheetName);

  let headerStyle = SpreadsheetApp.newTextStyle().setBold(true).build();
  targetSheet.getRange("A1").setValue("🧠 Inferred School Schedules (Based on Patterns)").setTextStyle(headerStyle).setFontSize(14);
  targetSheet.getRange("A2").setValue("Note: [09:30 - 10:20] ? = Inferred missing class. 🍱 = Likely Lunch Break.").setFontStyle("italic");

  let headers = ["Group", "School Code", "School Name", "Note"];
  for (let k = 1; k <= maxCols; k++) {
    headers.push(`Slot ${k}`);
  }

  let startRow = 4;
  targetSheet.getRange(startRow, 1, 1, headers.length).setValues([headers])
      .setBackground("#6d597a").setFontColor("white").setFontWeight("bold");

  if (outputRows.length > 0) {
    outputRows.forEach(row => {
        while (row.length < headers.length) row.push("");
    });

    targetSheet.getRange(startRow + 1, 1, outputRows.length, headers.length).setValues(outputRows);
    targetSheet.getRange(startRow, 1, outputRows.length + 1, headers.length)
      .setBorder(true, true, true, true, true, true, "#d9d9d9", SpreadsheetApp.BorderStyle.SOLID);
      
    // Center Align Slots
    if (headers.length > 4) {
        targetSheet.getRange(startRow + 1, 5, outputRows.length, headers.length - 4).setHorizontalAlignment("center");
    }
  }

  targetSheet.autoResizeColumns(1, headers.length);
  console.log("✅ Inferred Schedule Report Generated");
  Browser.msgBox("✅ Report Ready", `Generated schedules for ${outputRows.length} schools.`, Browser.Buttons.OK);
}

// -----------------------------------------------------------------------
// 🧠 AI / LOGIC HELPERS
// -----------------------------------------------------------------------

/**
 * Analyze existing slots to find the "Mode" (Most common) duration and break.
 */
function analyzePattern(slots) {
    if (slots.length < 2) return { isValid: false, duration: 0, break: 0 };

    let durations = {};
    let breaks = {};

    for (let i = 0; i < slots.length; i++) {
        // Duration Frequency
        let dur = slots[i].end - slots[i].start;
        durations[dur] = (durations[dur] || 0) + 1;

        // Break Frequency (with next slot)
        if (i < slots.length - 1) {
            let brk = slots[i+1].start - slots[i].end;
            if (brk >= 0 && brk < 120) { // Ignore huge gaps (lunch/night) for pattern finding
                breaks[brk] = (breaks[brk] || 0) + 1;
            }
        }
    }

    let standardDuration = parseInt(getMode(durations));
    let standardBreak = parseInt(getMode(breaks));

    // Fallback: If no consistent break found, assume 10 mins or 0 depending on data
    if (isNaN(standardBreak)) standardBreak = 10; 

    // Validity Check: If standard duration is weird (e.g. < 30 mins), pattern is weak
    if (standardDuration < 30) return { isValid: false };

    return { isValid: true, duration: standardDuration, break: standardBreak };
}

/**
 * Try to fit inferred slots into a gap
 */
function inferGap(gapStart, gapEnd, pattern) {
    let inferred = [];
    let current = gapStart;
    
    // Safety limit to prevent infinite loops
    let loopCount = 0;
    
    // We try to fit: Break + Class
    // First, add the initial break from the previous class
    current += pattern.break;

    while (current + pattern.duration <= gapEnd && loopCount < 10) {
        
        // Detect Lunch: If we are crossing 12:00-13:00 and gap is large
        // 720 mins = 12:00 PM
        if (current >= 710 && current <= 780 && (gapEnd - current) >= 40) {
             // Likely lunch, stop inferring normal classes here or mark as lunch
             // For this script, let's just mark a Lunch slot and skip to the next actual class
             // But simplistic approach: If it fits perfectly, it's a class. If it leaves a weird gap, maybe lunch.
        }

        let slotEnd = current + pattern.duration;

        // Check if this fits nicely within the gap (allow 5 min margin of error)
        if (slotEnd <= gapEnd + 5) {
            inferred.push({ start: current, end: slotEnd, type: 'Inferred' });
            
            // Advance: End of this inferred class + Break
            current = slotEnd + pattern.break;
        } else {
            break;
        }
        loopCount++;
    }

    return inferred;
}

function getMode(obj) {
    let bestKey = null;
    let maxCount = -1;
    for (let key in obj) {
        if (obj[key] > maxCount) {
            maxCount = obj[key];
            bestKey = key;
        }
    }
    return bestKey;
}

// -----------------------------------------------------------------------
// ⏰ TIME UTILS
// -----------------------------------------------------------------------

function convertToMinutes(val) {
  if (!val) return null;
  let h=0, m=0;
  if (val instanceof Date) {
    h = val.getHours();
    m = val.getMinutes();
  } else {
    let str = String(val).trim();
    let match = str.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    h = parseInt(match[1]);
    m = parseInt(match[2]);
  }
  return (h * 60) + m;
}

function formatMins(mins) {
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}