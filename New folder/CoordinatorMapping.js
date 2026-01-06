/**
 * 📊 สคริปต์สร้างรายงานสรุป Coordinator แยกตามกลุ่มโรงเรียน
 * อัปเดต: ใช้รหัสตัวอักษร 3 ตัว (School Code) แทนชื่อเต็มตามความต้องการของทีม
 */

function generateCoordinatorMappingReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. ดึงข้อมูลจากชีต dim_school
  const schoolSheet = ss.getSheetByName("dim_school");
  if (!schoolSheet) {
    Browser.msgBox("ไม่พบชีตชื่อ 'dim_school' กรุณาตรวจสอบว่าชื่อชีตถูกต้องหรือไม่");
    return;
  }
  const schoolData = schoolSheet.getDataRange().getValues();
  const schoolHeaders = schoolData.shift();
  
  // หา index ของคอลัมน์ที่สำคัญใน dim_school
  const idxSchoolCode = schoolHeaders.indexOf("school_code");
  const idxSchoolGroup = schoolHeaders.indexOf("school_group");

  // 2. ดึงข้อมูลจากชีต view_school_coordinator
  const coordSheet = ss.getSheetByName("view_school_coordinator");
  if (!coordSheet) {
    Browser.msgBox("ไม่พบชีตชื่อ 'view_school_coordinator' กรุณาตรวจสอบว่าชื่อชีตถูกต้องหรือไม่");
    return;
  }
  const coordData = coordSheet.getDataRange().getValues();
  coordData.shift(); // เอาหัวตารางออก

  // 3. สร้าง Map สำหรับการจับคู่รหัสโรงเรียนกับผู้ประสานงาน
  let coordMap = {};
  coordData.forEach(row => {
    let code = String(row[0]).trim(); // Column A ใน view_school_coordinator มักเป็นรหัส
    let name = String(row[1]).trim(); // Column B เป็นชื่อผู้ประสานงาน
    if (code) coordMap[code] = name;
  });

  // 4. จัดกลุ่มข้อมูล (Group -> Coordinator -> School Codes)
  let reportData = {};
  
  schoolData.forEach(row => {
    let code = String(row[idxSchoolCode]).trim();
    let group = String(row[idxSchoolGroup]).trim();
    let coordinator = coordMap[code] || "⚠️ ยังไม่ได้ระบุ";

    if (code && group) {
      let normalizedGroup = group.toLowerCase();
      
      if (!reportData[normalizedGroup]) reportData[normalizedGroup] = {};
      if (!reportData[normalizedGroup][coordinator]) reportData[normalizedGroup][coordinator] = [];
      
      // เก็บเฉพาะรหัสโรงเรียน (School Code)
      reportData[normalizedGroup][coordinator].push(code);
    }
  });

  // 5. เตรียมข้อมูลสำหรับเขียนลงชีตใหม่
  let output = [["School Group", "Coordinator", "Count", "School Codes (รหัสโรงเรียน)"]];
  
  // ลำดับกลุ่มเป้าหมาย
  const targetGroups = ["obec 3", "obec south", "thesaban", "private school"];
  
  targetGroups.forEach(gName => {
    if (reportData[gName]) {
      addRowsToOutput(gName, reportData[gName], output);
      delete reportData[gName];
    }
  });

  for (let gName in reportData) {
    addRowsToOutput(gName, reportData[gName], output);
  }

  // 6. บันทึกลงชีต
  let resultSheet = ss.getSheetByName("Summary_Coordinator_Report");
  if (resultSheet) {
    resultSheet.clear();
  } else {
    resultSheet = ss.insertSheet("Summary_Coordinator_Report");
  }

  resultSheet.getRange(1, 1, output.length, output[0].length).setValues(output);
  formatReportSheet(resultSheet, output.length);

  Browser.msgBox("✨ อัปเดตรายงานเรียบร้อย! ใช้รหัส 3 ตัวตามที่ทีมต้องการแล้วครับ");
}

function addRowsToOutput(groupName, coordinators, outputArray) {
  let displayGroup = groupName.toUpperCase();
  for (let coord in coordinators) {
    let codes = coordinators[coord];
    // เรียงลำดับตัวอักษร ABC เพื่อให้หาโค้ดง่ายขึ้น
    codes.sort();
    outputArray.push([
      displayGroup,
      coord,
      codes.length,
      codes.join(", ")
    ]);
  }
}

function formatReportSheet(sheet, totalRows) {
  sheet.getRange(1, 1, 1, 4)
       .setBackground("#2c3e50")
       .setFontColor("white")
       .setFontWeight("bold")
       .setHorizontalAlignment("center");

  sheet.getRange(2, 1, totalRows - 1, 4).setVerticalAlignment("top");
  
  sheet.setColumnWidth(1, 150); // Group
  sheet.setColumnWidth(2, 150); // Coordinator
  sheet.setColumnWidth(3, 80);  // Count
  sheet.setColumnWidth(4, 600); // Code List
  
  sheet.getRange(1, 1, totalRows, 4).setBorder(true, true, true, true, true, true, "#dcdde1", SpreadsheetApp.BorderStyle.SOLID);
  sheet.setFrozenRows(1);
}