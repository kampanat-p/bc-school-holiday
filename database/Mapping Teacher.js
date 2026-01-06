/**
 * ฟังก์ชันช่วยจับคู่ ID จาก Web JSON เข้ากับ Database ของเรา
 * [UPDATE]: ตัดการสร้าง ID อัตโนมัติออก (ปล่อยว่างให้ ARRAYFORMULA ทำงาน)
 */
function autoMapTeacherIDs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName('dim_user');
  
  if (!userSheet) {
    console.error("❌ ไม่พบ Sheet ชื่อ 'dim_user'");
    return;
  }

  // ดึงข้อมูลทั้งหมดรวมถึง Header
  const range = userSheet.getDataRange();
  const userData = range.getValues();
  
  // --- ส่วนจำลอง JSON (เอาของจริงมาแปะทับตรงนี้) ---
  const jsonResponse = {
    "teachers": [
        {
            "id": 886,
            "firstname_en": "Aaliyah",
            "lastname_en": "Muse",
            "firstname_th": "Aaliyah",
            "lastname_th": "Muse",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 507,
            "firstname_en": "Aaron",
            "lastname_en": "Gartrell",
            "firstname_th": "Aaron",
            "lastname_th": "Gartrell",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 515,
            "firstname_en": "Aaron",
            "lastname_en": "Landon",
            "firstname_th": "Aaron",
            "lastname_th": "Landon",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 884,
            "firstname_en": "Aaron",
            "lastname_en": "Syme",
            "firstname_th": "Aaron",
            "lastname_th": "Syme",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 758,
            "firstname_en": "Abdulmannam",
            "lastname_en": "Paenaeh",
            "firstname_th": "\u0e2d\u0e31\u0e1a\u0e14\u0e38\u0e25\u0e21\u0e31\u0e19\u0e19\u0e31\u0e21 ",
            "lastname_th": "\u0e41\u0e1b\u0e41\u0e19\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BSK "
        },
        {
            "id": 767,
            "firstname_en": "Abdulwahid",
            "lastname_en": "Useng",
            "firstname_th": "\u0e2d\u0e31\u0e1a\u0e14\u0e38\u0e25\u0e27\u0e32\u0e40\u0e2e\u0e14",
            "lastname_th": "\u0e2d\u0e39\u0e40\u0e0b\u0e47\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BTB "
        },
        {
            "id": 407,
            "firstname_en": "Abubakree",
            "lastname_en": "Karee",
            "firstname_th": "\u0e2d\u0e32\u0e1a\u0e39\u0e1a\u0e31\u0e01\u0e23\u0e35",
            "lastname_th": "\u0e01\u0e32\u0e23\u0e35",
            "type": "Local",
            "status": "Enabled",
            "school_code": "GPC "
        },
        {
            "id": 409,
            "firstname_en": "Afdol",
            "lastname_en": "Awae",
            "firstname_th": "\u0e2d\u0e31\u0e1f\u0e0e\u0e2d\u0e25",
            "lastname_th": "\u0e2d\u0e32\u0e41\u0e27",
            "type": "Local",
            "status": "Disabled",
            "school_code": "JRS "
        },
        {
            "id": 348,
            "firstname_en": "Airsoh",
            "lastname_en": "Doni",
            "firstname_th": "\u0e2d\u0e32\u0e41\u0e2d\u0e40\u0e2a\u0e32\u0e30",
            "lastname_th": "\u0e14\u0e2d\u0e19\u0e34",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTG "
        },
        {
            "id": 420,
            "firstname_en": "Aiyarin",
            "lastname_en": "Boonraung",
            "firstname_th": "\u0e44\u0e2d\u0e22\u0e23\u0e34\u0e13\u200b",
            "lastname_th": "\u0e1a\u0e38\u0e0d\u0e40\u0e23\u0e37\u0e2d\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LBM "
        },
        {
            "id": 439,
            "firstname_en": "Alan",
            "lastname_en": "Shaw",
            "firstname_th": "Alan",
            "lastname_th": "Shaw",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 588,
            "firstname_en": "Aldrin",
            "lastname_en": "Jarlata (SKH)",
            "firstname_th": "\u0e2d\u0e31\u0e25\u0e14\u0e23\u0e34\u0e19",
            "lastname_th": "\u0e08\u0e32\u0e23\u0e4c\u0e25\u0e32\u0e15\u0e49\u0e32 (SKH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKH "
        },
        {
            "id": 912,
            "firstname_en": "Alex",
            "lastname_en": "Bowler",
            "firstname_th": "Alex",
            "lastname_th": "Bowler",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 194,
            "firstname_en": "Alexandra",
            "lastname_en": "Mahoney",
            "firstname_th": "Alexandra",
            "lastname_th": "Mahoney",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 323,
            "firstname_en": "Allen",
            "lastname_en": "Corral",
            "firstname_th": "Allen",
            "lastname_th": "Corral",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 589,
            "firstname_en": "Almie Fe",
            "lastname_en": "Jarlata (SKH)",
            "firstname_th": "\u0e2d\u0e31\u0e25\u0e21\u0e35\u0e48 \u0e40\u0e1f",
            "lastname_th": "\u0e08\u0e32\u0e23\u0e4c\u0e25\u0e32\u0e15\u0e49\u0e32 (SKH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKH "
        },
        {
            "id": 297,
            "firstname_en": "Ameer Nathaphol",
            "lastname_en": "Chawla",
            "firstname_th": "Ameer Nathaphol",
            "lastname_th": "Chawla",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 375,
            "firstname_en": "Ampika",
            "lastname_en": "Protam",
            "firstname_th": "\u0e2d\u0e31\u0e21\u0e1e\u0e34\u0e01\u0e32",
            "lastname_th": "\u0e1e\u0e23\u0e21\u0e17\u0e33",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BNY "
        },
        {
            "id": 490,
            "firstname_en": "Ampika",
            "lastname_en": "Protam (BNO)",
            "firstname_th": "\u0e2d\u0e31\u0e21\u0e1e\u0e34\u0e01\u0e32",
            "lastname_th": "\u0e1e\u0e23\u0e21\u0e17\u0e33 (BNO)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BNO "
        },
        {
            "id": 534,
            "firstname_en": "Amporn",
            "lastname_en": "Uttarachai",
            "firstname_th": "\u0e2d\u0e31\u0e21\u0e1e\u0e23",
            "lastname_th": "\u0e2d\u0e38\u0e15\u0e23\u0e30\u0e0a\u0e31\u0e22",
            "type": "Local",
            "status": "Enabled",
            "school_code": "RAP "
        },
        {
            "id": 498,
            "firstname_en": "Anan",
            "lastname_en": "Salaya",
            "firstname_th": "\u0e2d\u0e19\u0e31\u0e19\u0e15\u0e4c",
            "lastname_th": "\u0e2a\u0e30\u0e25\u0e32\u0e22\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BKY "
        },
        {
            "id": 478,
            "firstname_en": "Anchana",
            "lastname_en": "Boondarigpornpunt",
            "firstname_th": "Anchana",
            "lastname_th": "Boondarigpornpunt",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 394,
            "firstname_en": "Andre",
            "lastname_en": "McHenry",
            "firstname_th": "Andre",
            "lastname_th": "McHenry",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 325,
            "firstname_en": "Anisah",
            "lastname_en": "Lateh",
            "firstname_th": "\u0e2d\u0e32\u0e19\u0e35\u0e0b\u0e4a\u0e30",
            "lastname_th": "\u0e25\u0e32\u0e40\u0e15\u0e4a\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PSW "
        },
        {
            "id": 355,
            "firstname_en": "Anna",
            "lastname_en": "Kaewkul",
            "firstname_th": "\u0e41\u0e2d\u0e19\u0e19\u0e32 ",
            "lastname_th": "\u0e41\u0e01\u0e49\u0e27\u0e01\u0e39\u0e25",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ARN "
        },
        {
            "id": 443,
            "firstname_en": "Annika",
            "lastname_en": "Soontornchot",
            "firstname_th": "Annika",
            "lastname_th": "Soontornchot",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 273,
            "firstname_en": "Anthony",
            "lastname_en": "McNally",
            "firstname_th": "Anthony",
            "lastname_th": "McNally",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 582,
            "firstname_en": "Anuchida",
            "lastname_en": "Phothisa (SKC)",
            "firstname_th": "\u0e2d\u0e19\u0e38\u0e0a\u0e34\u0e14\u0e32",
            "lastname_th": "\u0e42\u0e1e\u0e18\u0e34\u0e29\u0e32 (SKC)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKC "
        },
        {
            "id": 828,
            "firstname_en": "Anyanee",
            "lastname_en": "Keawklay",
            "firstname_th": "\u0e2d\u0e31\u0e0d\u0e0d\u0e32\u0e13\u0e35",
            "lastname_th": "\u0e41\u0e01\u0e49\u0e27\u0e04\u0e25\u0e49\u0e32\u0e22",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BWK "
        },
        {
            "id": 485,
            "firstname_en": "Apinya",
            "lastname_en": "Chitlamchuan",
            "firstname_th": "\u0e2d\u0e20\u0e34\u0e0d\u0e0d\u0e32",
            "lastname_th": "\u0e08\u0e34\u0e15\u0e15\u0e4c\u0e25\u0e33\u0e08\u0e27\u0e19",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PPV "
        },
        {
            "id": 791,
            "firstname_en": "Apinya",
            "lastname_en": "Haruethaithavorn",
            "firstname_th": "\u0e2d\u0e20\u0e34\u0e0d\u0e0d\u0e32",
            "lastname_th": "\u0e2b\u0e24\u0e17\u0e31\u0e22\u0e16\u0e32\u0e27\u0e23",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 385,
            "firstname_en": "Areelak  ",
            "lastname_en": "Promcharn",
            "firstname_th": "\u0e2d\u0e32\u0e23\u0e35\u0e25\u0e31\u0e01\u0e29\u0e4c",
            "lastname_th": "\u0e1e\u0e23\u0e21\u0e08\u0e32\u0e23\u0e22\u0e4c ",
            "type": "Local",
            "status": "Enabled",
            "school_code": "DBB "
        },
        {
            "id": 412,
            "firstname_en": "Areena",
            "lastname_en": "Aleebango",
            "firstname_th": "\u0e2d\u0e32\u0e23\u0e35\u0e19\u0e32",
            "lastname_th": "\u0e2d\u0e32\u0e25\u0e35\u0e1a\u0e32\u0e42\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": "WRS "
        },
        {
            "id": 309,
            "firstname_en": "Areerat",
            "lastname_en": "E-wan",
            "firstname_th": "\u0e2d\u0e32\u0e23\u0e35\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e2d\u0e35\u0e2b\u0e27\u0e31\u0e48\u0e19",
            "type": "Local",
            "status": "Disabled",
            "school_code": "MLY "
        },
        {
            "id": 826,
            "firstname_en": "Arifah",
            "lastname_en": "Hahwae",
            "firstname_th": "\u0e2d\u0e32\u0e23\u0e35\u0e1f\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e2b\u0e30\u0e41\u0e27",
            "type": "Local",
            "status": "Enabled",
            "school_code": "WRS "
        },
        {
            "id": 240,
            "firstname_en": "Arisa",
            "lastname_en": "Samo",
            "firstname_th": "\u0e2d\u0e32\u0e2d\u0e35\u0e0b\u0e30",
            "lastname_th": "\u0e2a\u0e32\u0e40\u0e21\u0e32\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 523,
            "firstname_en": "Arunee",
            "lastname_en": "Nuchai",
            "firstname_th": "\u0e2d\u0e23\u0e38\u0e13\u0e35",
            "lastname_th": "\u0e2b\u0e19\u0e39\u0e0a\u0e31\u0e22",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BWK "
        },
        {
            "id": 754,
            "firstname_en": "Arunrat",
            "lastname_en": "Kongdechudomkul",
            "firstname_th": "\u0e2d\u0e23\u0e38\u0e13\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e04\u0e07\u0e40\u0e14\u0e0a\u0e2d\u0e38\u0e14\u0e21\u0e01\u0e38\u0e25",
            "type": "Local",
            "status": "Disabled",
            "school_code": "HSS "
        },
        {
            "id": 472,
            "firstname_en": "Arunya",
            "lastname_en": "Tachalertpana",
            "firstname_th": "\u0e2d\u0e23\u0e31\u0e0d\u0e0d\u0e32",
            "lastname_th": "\u0e40\u0e15\u0e0a\u0e30\u0e40\u0e25\u0e34\u0e28\u0e1e\u0e19\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "HMC "
        },
        {
            "id": 775,
            "firstname_en": "Asha",
            "lastname_en": "Deonarain",
            "firstname_th": "Asha",
            "lastname_th": "Deonarain",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 436,
            "firstname_en": "Asila",
            "lastname_en": "Nitae",
            "firstname_th": "\u0e2d\u0e32\u0e0b\u0e35\u0e25\u0e32",
            "lastname_th": "\u0e19\u0e34\u0e41\u0e15",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PSW "
        },
        {
            "id": 821,
            "firstname_en": "Asleena",
            "lastname_en": "Saidee-adinum",
            "firstname_th": "\u0e2d\u0e31\u0e2a\u0e25\u0e35\u0e19\u0e32",
            "lastname_th": "\u0e2a\u0e32\u0e22\u0e14\u0e35\u0e2d\u0e14\u0e34\u0e19\u0e31\u0e19\u0e17\u0e4c",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 920,
            "firstname_en": "Asma",
            "lastname_en": "Tae",
            "firstname_th": "\u0e2d\u0e31\u0e2a\u0e21\u0e32\u0e2b\u0e4c",
            "lastname_th": "\u0e41\u0e15",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTB "
        },
        {
            "id": 800,
            "firstname_en": "Asma",
            "lastname_en": "Yapha",
            "firstname_th": "\u0e2d\u0e31\u0e2a\u0e21\u0e30",
            "lastname_th": "\u0e22\u0e30\u0e1e\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BDY "
        },
        {
            "id": 793,
            "firstname_en": "Asman",
            "lastname_en": "Ma",
            "firstname_th": "\u0e2d\u0e31\u0e2a\u0e21\u0e31\u0e19",
            "lastname_th": "\u0e21\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BKT "
        },
        {
            "id": 581,
            "firstname_en": "Atichat",
            "lastname_en": "Seajung (SKC)",
            "firstname_th": "\u0e2d\u0e15\u0e34\u0e0a\u0e32\u0e15",
            "lastname_th": "\u0e41\u0e0b\u0e48\u0e08\u0e31\u0e07 (SKC)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKC "
        },
        {
            "id": 458,
            "firstname_en": "Auseng",
            "lastname_en": "Mateaha",
            "firstname_th": "\u0e2d\u0e38\u0e2a\u200b\u0e40\u0e0b\u0e47\u0e07\u200b",
            "lastname_th": "\u0e21\u0e30\u0e41\u0e15\u200b\u0e2e\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "TNW "
        },
        {
            "id": 749,
            "firstname_en": "Aussama",
            "lastname_en": "Saka",
            "firstname_th": "\u0e2d\u0e31\u0e2a\u0e21\u0e32",
            "lastname_th": "\u0e2a\u0e32\u0e01\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FPT "
        },
        {
            "id": 930,
            "firstname_en": "Aysan",
            "lastname_en": "Rashidiazar",
            "firstname_th": "Aysan",
            "lastname_th": "Rashidiazar",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 450,
            "firstname_en": "Azmi",
            "lastname_en": "Poknik",
            "firstname_th": "\u0e2d\u0e31\u0e2a\u0e21\u0e35",
            "lastname_th": "\u0e40\u0e1b\u0e4a\u0e32\u0e30\u0e19\u0e34",
            "type": "Local",
            "status": "Enabled",
            "school_code": "JRS "
        },
        {
            "id": 603,
            "firstname_en": "Benjatawan",
            "lastname_en": "Srisupawut (SMP)",
            "firstname_th": "\u0e40\u0e1a\u0e0d\u0e08\u0e40\u0e17\u0e27\u0e31\u0e0d",
            "lastname_th": "\u0e28\u0e23\u0e35\u0e28\u0e38\u0e20\u0e27\u0e38\u0e12\u0e34 (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 316,
            "firstname_en": "Bongkoch",
            "lastname_en": "Kantawong",
            "firstname_th": "\u0e1a\u0e07\u0e01\u0e0a",
            "lastname_th": "\u0e01\u0e31\u0e19\u0e17\u0e32\u0e27\u0e07\u0e28\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LMW "
        },
        {
            "id": 326,
            "firstname_en": "Boonruang",
            "lastname_en": "Suksabai",
            "firstname_th": "\u0e1a\u0e38\u0e0d\u0e40\u0e23\u0e37\u0e2d\u0e07",
            "lastname_th": "\u0e2a\u0e38\u0e02\u0e2a\u0e1a\u0e32\u0e22",
            "type": "Local",
            "status": "Enabled",
            "school_code": "KWH "
        },
        {
            "id": 610,
            "firstname_en": "Botlhale",
            "lastname_en": "Mathebula",
            "firstname_th": "Botlhale",
            "lastname_th": "Mathebula",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 526,
            "firstname_en": "Brad",
            "lastname_en": "Astle",
            "firstname_th": "Brad",
            "lastname_th": "Astle",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 438,
            "firstname_en": "Brad",
            "lastname_en": "Mason",
            "firstname_th": "Brad",
            "lastname_th": "Mason",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 528,
            "firstname_en": "Buppha",
            "lastname_en": "Tubsawat",
            "firstname_th": "\u0e1a\u0e38\u0e1b\u0e1c\u0e32",
            "lastname_th": "\u0e17\u0e31\u0e1a\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e34\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "RPW "
        },
        {
            "id": 238,
            "firstname_en": "Busaret",
            "lastname_en": "Kachapon",
            "firstname_th": "\u0e1a\u0e38\u0e29\u0e40\u0e23\u0e2a",
            "lastname_th": "\u0e04\u0e0a\u0e32\u0e1c\u0e25",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 428,
            "firstname_en": "Busror",
            "lastname_en": "Sa-i",
            "firstname_th": "\u0e1a\u0e38\u0e2a\u0e23\u0e2d\u0e22\u0e4c",
            "lastname_th": "\u0e2a\u0e30\u0e2d\u0e34",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BTS "
        },
        {
            "id": 397,
            "firstname_en": "Bussayaporn",
            "lastname_en": "Janpisarn",
            "firstname_th": "\u0e1a\u0e38\u0e29\u0e22\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c\u0e1e\u0e34\u0e28\u0e32\u0e25",
            "type": "Local",
            "status": "Disabled",
            "school_code": "TNW "
        },
        {
            "id": 350,
            "firstname_en": "CIEO",
            "lastname_en": "Teacher",
            "firstname_th": "CIEO",
            "lastname_th": "Teacher",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CIE "
        },
        {
            "id": 552,
            "firstname_en": "Catherine",
            "lastname_en": "Laspona",
            "firstname_th": "Catherine",
            "lastname_th": "Laspona",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPR "
        },
        {
            "id": 300,
            "firstname_en": "Chaitanya",
            "lastname_en": "Wright",
            "firstname_th": "Chaitanya",
            "lastname_th": "Wright",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 919,
            "firstname_en": "Chalalai",
            "lastname_en": "Emleng",
            "firstname_th": "\u0e0a\u0e25\u0e32\u0e25\u0e31\u0e22",
            "lastname_th": "\u0e40\u0e2d\u0e47\u0e21\u0e40\u0e25\u0e48\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTB "
        },
        {
            "id": 200,
            "firstname_en": "Chananchida",
            "lastname_en": "Pumdeeying",
            "firstname_th": "\u0e0a\u0e13\u0e31\u0e0d\u0e0a\u0e34\u0e14\u0e32",
            "lastname_th": "\u0e1e\u0e38\u0e48\u0e21\u0e14\u0e35\u0e22\u0e34\u0e48\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 296,
            "firstname_en": "Chanatporn",
            "lastname_en": "Suwannarat",
            "firstname_th": "\u0e0a\u0e13\u0e31\u0e10\u0e20\u0e23\u0e13\u0e4c",
            "lastname_th": "\u0e2a\u0e38\u0e27\u0e23\u0e23\u0e13\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SWD "
        },
        {
            "id": 205,
            "firstname_en": "Chanokbhorn",
            "lastname_en": "Chaichalad",
            "firstname_th": "\u0e0a\u0e19\u0e01\u0e1e\u0e23",
            "lastname_th": "\u0e43\u0e08\u0e09\u0e25\u0e32\u0e14",
            "type": "Local",
            "status": "Enabled",
            "school_code": "TNW "
        },
        {
            "id": 785,
            "firstname_en": "Chanoknan",
            "lastname_en": "Qiu",
            "firstname_th": "\u0e0a\u0e19\u0e01\u0e19\u0e31\u0e19\u0e17\u0e4c",
            "lastname_th": "\u0e0a\u0e34\u0e27",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 464,
            "firstname_en": "Chaoyoot",
            "lastname_en": "Khajornsakwongwai",
            "firstname_th": "Chaoyoot",
            "lastname_th": "Khajornsakwongwai",
            "type": "Online",
            "status": "Enabled",
            "school_code": "TRN "
        },
        {
            "id": 604,
            "firstname_en": "Charoon",
            "lastname_en": "Raksapai (SMP)",
            "firstname_th": "\u0e08\u0e23\u0e39\u0e0d",
            "lastname_th": "\u0e23\u0e31\u0e01\u0e29\u0e32\u0e20\u0e31\u0e22 (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 261,
            "firstname_en": "Chattraphat",
            "lastname_en": "Kongsuwan",
            "firstname_th": "\u0e09\u0e31\u0e15\u0e23\u0e20\u0e31\u0e17\u0e23",
            "lastname_th": "\u0e04\u0e07\u0e2a\u0e38\u0e27\u0e23\u0e23\u0e13",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BDB "
        },
        {
            "id": 384,
            "firstname_en": "Chitrada",
            "lastname_en": "Konyeun",
            "firstname_th": "\u0e08\u0e34\u0e15\u0e23\u0e25\u0e14\u0e32",
            "lastname_th": "\u0e04\u0e19\u0e22\u0e37\u0e19",
            "type": "Local",
            "status": "Enabled",
            "school_code": "DBB "
        },
        {
            "id": 888,
            "firstname_en": "Chiyedza",
            "lastname_en": "Muteweri",
            "firstname_th": "Chiyedza",
            "lastname_th": "Muteweri",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 931,
            "firstname_en": "Chloe",
            "lastname_en": "Nash",
            "firstname_th": "Chloe",
            "lastname_th": "Nash",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 504,
            "firstname_en": "Chongkol",
            "lastname_en": "Chinsena",
            "firstname_th": "\u0e08\u0e07\u0e01\u0e25",
            "lastname_th": "\u0e0a\u0e34\u0e19\u0e40\u0e2a\u0e19\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "HSS "
        },
        {
            "id": 293,
            "firstname_en": "Christian",
            "lastname_en": "Levesque",
            "firstname_th": "Christian",
            "lastname_th": "Levesque",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 516,
            "firstname_en": "Christopher",
            "lastname_en": "Cobb",
            "firstname_th": "Christopher",
            "lastname_th": "Cobb",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 424,
            "firstname_en": "Chuenswat",
            "lastname_en": "Nuanraong",
            "firstname_th": "\u0e0a\u0e37\u0e48\u0e19\u0e2a\u0e27\u0e32\u0e17",
            "lastname_th": "\u0e19\u0e27\u0e25\u0e25\u0e30\u0e2d\u0e2d\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BTS "
        },
        {
            "id": 430,
            "firstname_en": "Chutikarn",
            "lastname_en": "Bukong",
            "firstname_th": "\u0e0a\u0e38\u0e15\u0e34\u0e01\u0e32\u0e0d\u0e08\u0e19\u0e4c",
            "lastname_th": "\u0e1a\u0e39\u0e01\u0e4b\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BTS "
        },
        {
            "id": 314,
            "firstname_en": "Chutipha",
            "lastname_en": "Kumpanart",
            "firstname_th": "\u0e0a\u0e38\u0e15\u0e34\u0e20\u0e32",
            "lastname_th": "\u0e01\u0e33\u0e1b\u0e19\u0e32\u0e17",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LBT "
        },
        {
            "id": 188,
            "firstname_en": "Claudio",
            "lastname_en": "Aronica",
            "firstname_th": "Claudio",
            "lastname_th": "Aronica",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 550,
            "firstname_en": "Connor",
            "lastname_en": "Sullivan",
            "firstname_th": "Connor",
            "lastname_th": "Sullivan",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 392,
            "firstname_en": "Coral Bay",
            "lastname_en": "Teacher",
            "firstname_th": "Coral Bay",
            "lastname_th": "Teacher",
            "type": "Local",
            "status": "Enabled",
            "school_code": "KCB "
        },
        {
            "id": 913,
            "firstname_en": "Craig",
            "lastname_en": "Britz",
            "firstname_th": "Craig",
            "lastname_th": "Britz",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 917,
            "firstname_en": "Craig",
            "lastname_en": "Fredericks",
            "firstname_th": "Craig",
            "lastname_th": "Fredericks",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 831,
            "firstname_en": "Cuan",
            "lastname_en": "Smit",
            "firstname_th": "Cuan",
            "lastname_th": "Smit",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 551,
            "firstname_en": "Curt",
            "lastname_en": "Millen",
            "firstname_th": "Curt",
            "lastname_th": "Millen",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 774,
            "firstname_en": "Curtis",
            "lastname_en": "Hughes",
            "firstname_th": "Curtis",
            "lastname_th": "Hughes",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 817,
            "firstname_en": "Daniel",
            "lastname_en": "Thomson",
            "firstname_th": "Daniel",
            "lastname_th": "Thomson",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 395,
            "firstname_en": "Danny",
            "lastname_en": "Daniels",
            "firstname_th": "Danny",
            "lastname_th": "Daniels",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 616,
            "firstname_en": "David",
            "lastname_en": "Allen",
            "firstname_th": "David",
            "lastname_th": "Allen",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 191,
            "firstname_en": "David",
            "lastname_en": "Guillory",
            "firstname_th": "David",
            "lastname_th": "Guillory",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 517,
            "firstname_en": "Dayna",
            "lastname_en": "Morales",
            "firstname_th": "Dayna",
            "lastname_th": "Morales",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 479,
            "firstname_en": "Demo",
            "lastname_en": "Teacher",
            "firstname_th": "Demo",
            "lastname_th": "Teacher",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BOD "
        },
        {
            "id": 280,
            "firstname_en": "Dimitrios",
            "lastname_en": "Schismenos",
            "firstname_th": "Dimitrios",
            "lastname_th": "Schismenos",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 825,
            "firstname_en": "Donna",
            "lastname_en": "Aziz",
            "firstname_th": "Donna",
            "lastname_th": "Aziz",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 598,
            "firstname_en": "Duanpen",
            "lastname_en": "Thongharn (SMP)",
            "firstname_th": "\u0e40\u0e14\u0e37\u0e2d\u0e19\u0e40\u0e1e\u0e47\u0e0d",
            "lastname_th": "\u0e17\u0e2d\u0e07\u0e2b\u0e32\u0e23 (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 329,
            "firstname_en": "Dylan",
            "lastname_en": "Massey",
            "firstname_th": "Dylan",
            "lastname_th": "Massey",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 391,
            "firstname_en": "Eli",
            "lastname_en": "Lopez",
            "firstname_th": "Eli",
            "lastname_th": "Lopez",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 932,
            "firstname_en": "Elisa",
            "lastname_en": "Erasmus",
            "firstname_th": "Elisa",
            "lastname_th": "Erasmus",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 632,
            "firstname_en": "Ellie",
            "lastname_en": "Matsanova",
            "firstname_th": "Ellie",
            "lastname_th": "Matsanova",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 619,
            "firstname_en": "Erwin",
            "lastname_en": "Paco (SMT)",
            "firstname_th": "T.Erwin",
            "lastname_th": "Paco (SMT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMT "
        },
        {
            "id": 918,
            "firstname_en": "Fadeelah",
            "lastname_en": "Yeemad",
            "firstname_th": "\u0e1f\u0e32\u0e14\u0e35\u0e25\u0e30",
            "lastname_th": "\u0e22\u0e35\u0e2b\u0e21\u0e31\u0e14",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTB "
        },
        {
            "id": 449,
            "firstname_en": "Fadilah",
            "lastname_en": "Samoh",
            "firstname_th": "\u0e1f\u0e32\u0e14\u0e35\u0e25\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e2a\u0e32\u0e40\u0e21\u0e32\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "JRS "
        },
        {
            "id": 434,
            "firstname_en": "Fais",
            "lastname_en": "Tayeh",
            "firstname_th": "\u0e1f\u0e32\u0e2d\u0e34\u0e2a",
            "lastname_th": "\u0e15\u0e32\u0e40\u0e22\u0e4a\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ARN "
        },
        {
            "id": 415,
            "firstname_en": "Fakiroh",
            "lastname_en": "Saleng",
            "firstname_th": "\u0e1f\u0e32\u0e04\u0e35\u0e40\u0e23\u0e32\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e2a\u0e32\u0e40\u0e25\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "GNC "
        },
        {
            "id": 457,
            "firstname_en": "Fareeda",
            "lastname_en": "Chema",
            "firstname_th": "\u0e1f\u0e32\u0e23\u0e35\u0e14\u0e32",
            "lastname_th": "\u0e40\u0e08\u0e4a\u0e30\u0e2b\u0e21\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ASP "
        },
        {
            "id": 346,
            "firstname_en": "Faridah",
            "lastname_en": "Panoh",
            "firstname_th": "\u0e1e\u0e32\u0e23\u0e35\u0e14\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e1b\u0e32\u0e40\u0e19\u0e32\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "WMY "
        },
        {
            "id": 506,
            "firstname_en": "Fateemah",
            "lastname_en": "Jehmah",
            "firstname_th": "\u0e1f\u0e32\u0e15\u0e35\u0e21\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e40\u0e08\u0e30\u0e21\u0e30",
            "type": "Local",
            "status": "Disabled",
            "school_code": "WRS "
        },
        {
            "id": 363,
            "firstname_en": "Fatimoh",
            "lastname_en": "Mansnit",
            "firstname_th": "\u0e1f\u0e32\u0e15\u0e35\u0e40\u0e21\u0e4a\u0e32\u0e30",
            "lastname_th": "\u0e2b\u0e21\u0e31\u0e48\u0e19\u0e2a\u0e19\u0e34\u0e17",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BPM "
        },
        {
            "id": 189,
            "firstname_en": "Firdaos",
            "lastname_en": "Nangean",
            "firstname_th": "\u0e1f\u0e34\u0e23\u0e40\u0e14\u0e32\u0e2a\u0e4c",
            "lastname_th": "\u0e19\u0e32\u0e40\u0e07\u0e34\u0e19",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTG "
        },
        {
            "id": 319,
            "firstname_en": "Gangamol",
            "lastname_en": "Boonkeng",
            "firstname_th": "\u0e01\u0e31\u0e25\u0e22\u0e4c\u0e01\u0e21\u0e25",
            "lastname_th": "\u0e1a\u0e38\u0e0d\u0e41\u0e02\u0e47\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LPW "
        },
        {
            "id": 447,
            "firstname_en": "Guidance Education",
            "lastname_en": "Teacher",
            "firstname_th": "Guidance Education",
            "lastname_th": "Teacher",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CGE "
        },
        {
            "id": 366,
            "firstname_en": "Habibah",
            "lastname_en": "Masuyu",
            "firstname_th": "\u0e2e\u0e32\u0e1a\u0e35\u0e1a\u0e4a\u0e30",
            "lastname_th": "\u0e21\u0e30\u0e2a\u0e39\u0e22\u0e39",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BPM "
        },
        {
            "id": 260,
            "firstname_en": "Haleemoh",
            "lastname_en": "Cheuma",
            "firstname_th": "\u0e2e\u0e32\u0e25\u0e35\u0e40\u0e21\u0e32\u0e30",
            "lastname_th": "\u0e40\u0e08\u0e4a\u0e30\u0e2d\u0e38\u0e21\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "MLY "
        },
        {
            "id": 922,
            "firstname_en": "Hameesa ",
            "lastname_en": "Semae",
            "firstname_th": "\u0e2e\u0e32\u0e21\u0e35\u0e0b\u0e32",
            "lastname_th": "\u0e2a\u0e37\u0e2d\u0e41\u0e21",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTB "
        },
        {
            "id": 435,
            "firstname_en": "Haneesah",
            "lastname_en": "Panyee",
            "firstname_th": "\u0e2e\u0e32\u0e19\u0e35\u0e0b\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e1b\u0e31\u0e19\u0e22\u0e35",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PSW "
        },
        {
            "id": 292,
            "firstname_en": "Hansel",
            "lastname_en": "Hermann",
            "firstname_th": "Hansel",
            "lastname_th": "Hermann",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 548,
            "firstname_en": "Harrison",
            "lastname_en": "Walton",
            "firstname_th": "Harrison",
            "lastname_th": "Walton",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 207,
            "firstname_en": "Hathairat",
            "lastname_en": "Duang-In",
            "firstname_th": "\u0e2b\u0e17\u0e31\u0e22\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e14\u0e49\u0e27\u0e07\u0e2d\u0e34\u0e19\u0e17\u0e23\u0e4c",
            "type": "Local",
            "status": "Disabled",
            "school_code": "WMY "
        },
        {
            "id": 406,
            "firstname_en": "Hidayah",
            "lastname_en": "Waeyamaloh",
            "firstname_th": "\u0e2e\u0e34\u0e14\u0e32\u0e22\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e41\u0e27\u0e22\u0e32\u0e21\u0e32\u0e40\u0e25\u0e4a\u0e32\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "GKT "
        },
        {
            "id": 631,
            "firstname_en": "Ian",
            "lastname_en": "Selkirk",
            "firstname_th": "Ian",
            "lastname_th": "Selkirk",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 501,
            "firstname_en": "Ittipong",
            "lastname_en": "Puaktaisong",
            "firstname_th": "\u0e2d\u0e34\u0e17\u0e18\u0e34\u0e1e\u0e07\u0e28\u0e4c",
            "lastname_th": "\u0e1e\u0e27\u0e01\u0e44\u0e18\u0e2a\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "HSS "
        },
        {
            "id": 611,
            "firstname_en": "Jacob",
            "lastname_en": "Scholtz",
            "firstname_th": "Jacob",
            "lastname_th": "Scholtz",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 518,
            "firstname_en": "Jamar",
            "lastname_en": "Griffin",
            "firstname_th": "Jamar",
            "lastname_th": "Griffin",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 818,
            "firstname_en": "Jamar Keith",
            "lastname_en": "Griffin",
            "firstname_th": "Jamar Keith",
            "lastname_th": "Griffin",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 522,
            "firstname_en": "James",
            "lastname_en": "N",
            "firstname_th": "James",
            "lastname_th": "N",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 445,
            "firstname_en": "James Anthony",
            "lastname_en": "Latten",
            "firstname_th": "James Anthony",
            "lastname_th": "Latten",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 483,
            "firstname_en": "Jaratsri",
            "lastname_en": "Tosan",
            "firstname_th": "\u0e08\u0e23\u0e31\u0e2a\u0e28\u0e23\u0e35",
            "lastname_th": "\u0e42\u0e15\u0e4a\u0e30\u0e2a\u0e32\u0e23",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPW "
        },
        {
            "id": 410,
            "firstname_en": "Jarudee",
            "lastname_en": "Waha",
            "firstname_th": "\u0e08\u0e32\u0e23\u0e38\u0e14\u0e35",
            "lastname_th": "\u0e27\u0e32\u0e2b\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "GPC "
        },
        {
            "id": 909,
            "firstname_en": "Jazmin",
            "lastname_en": "Barker",
            "firstname_th": "Jazmin",
            "lastname_th": "Barker",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 519,
            "firstname_en": "Jemma",
            "lastname_en": "Hosegood",
            "firstname_th": "Jemma",
            "lastname_th": "Hosegood",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 249,
            "firstname_en": "Jennifer",
            "lastname_en": "Cator",
            "firstname_th": "Jennifer",
            "lastname_th": "Cator",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 440,
            "firstname_en": "Jeremy",
            "lastname_en": "Clodfelter",
            "firstname_th": "Jeremy",
            "lastname_th": "Clodfelter",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 322,
            "firstname_en": "Jirapon",
            "lastname_en": "Thayakonnon",
            "firstname_th": "\u0e08\u0e34\u0e23\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e17\u0e22\u0e32\u0e01\u0e23\u0e13\u0e4c\u0e19\u0e19\u0e17\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTG "
        },
        {
            "id": 840,
            "firstname_en": "Jirawan",
            "lastname_en": "Tranoo",
            "firstname_th": "\u0e08\u0e34\u0e23\u0e32\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e15\u0e23\u0e32\u0e2b\u0e19\u0e39",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FNV "
        },
        {
            "id": 615,
            "firstname_en": "John",
            "lastname_en": "Bougas",
            "firstname_th": "John",
            "lastname_th": "Bougas",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 275,
            "firstname_en": "Jonathan",
            "lastname_en": "Chouinard",
            "firstname_th": "Jonathan",
            "lastname_th": "Chouinard",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 542,
            "firstname_en": "Jongkonnee",
            "lastname_en": "Saikiseng",
            "firstname_th": "\u0e08\u0e07\u0e01\u0e25\u0e13\u0e35",
            "lastname_th": "\u0e2a\u0e32\u0e22\u0e01\u0e35\u0e40\u0e2a\u0e47\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BDB "
        },
        {
            "id": 223,
            "firstname_en": "Joshua",
            "lastname_en": "Coblentz",
            "firstname_th": "Joshua",
            "lastname_th": "Coblentz",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 235,
            "firstname_en": "Julian",
            "lastname_en": "Petrov",
            "firstname_th": "Julian",
            "lastname_th": "Petrov",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 411,
            "firstname_en": "Junthima",
            "lastname_en": "Junjang",
            "firstname_th": "\u0e08\u0e31\u0e19\u0e17\u0e34\u0e21\u0e32",
            "lastname_th": "\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c\u0e41\u0e08\u0e49\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "WMY "
        },
        {
            "id": 206,
            "firstname_en": "Juthasorn",
            "lastname_en": "Nontasaen",
            "firstname_th": "\u0e08\u0e38\u0e11\u0e32\u0e2a\u0e23\u0e13\u0e4c ",
            "lastname_th": "\u0e19\u0e19\u0e17\u0e30\u0e40\u0e2a\u0e19",
            "type": "Local",
            "status": "Disabled",
            "school_code": "TNW "
        },
        {
            "id": 393,
            "firstname_en": "Kai Ying Si",
            "lastname_en": "Teacher",
            "firstname_th": "Kai Ying Si",
            "lastname_th": "Teacher",
            "type": "Local",
            "status": "Enabled",
            "school_code": "KYS "
        },
        {
            "id": 360,
            "firstname_en": "Kamilah",
            "lastname_en": "Sama-ae",
            "firstname_th": "\u0e01\u0e32\u0e21\u0e35\u0e2b\u0e25\u0e30",
            "lastname_th": "\u0e2a\u0e30\u0e21\u0e30\u0e41\u0e2d",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTN "
        },
        {
            "id": 597,
            "firstname_en": "Kamolsiri",
            "lastname_en": "Chomchioy (SMP)",
            "firstname_th": "\u0e01\u0e21\u0e25\u0e28\u0e34\u0e23\u0e34",
            "lastname_th": "\u0e0a\u0e21\u0e40\u0e0a\u0e22 (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 784,
            "firstname_en": "Kampanat",
            "lastname_en": "Phetkham",
            "firstname_th": "\u0e01\u0e31\u0e21\u0e1b\u0e19\u0e32\u0e17",
            "lastname_th": "\u0e40\u0e1e\u0e0a\u0e23\u0e04\u0e33",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 304,
            "firstname_en": "Kantinan",
            "lastname_en": "Siriwaitayanon",
            "firstname_th": "\u0e01\u0e31\u0e19\u0e15\u0e34\u0e19\u0e31\u0e19\u0e17\u0e4c",
            "lastname_th": "\u0e2a\u0e34\u0e23\u0e34\u0e44\u0e27\u0e17\u0e22\u0e19\u0e19\u0e17\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ARN "
        },
        {
            "id": 911,
            "firstname_en": "Karl",
            "lastname_en": "Hilzinger",
            "firstname_th": "Karl",
            "lastname_th": "Hilzinger",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 933,
            "firstname_en": "Katherine",
            "lastname_en": "Downey",
            "firstname_th": "Katherine",
            "lastname_th": "Downey",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 451,
            "firstname_en": "Katherine",
            "lastname_en": "Thompson",
            "firstname_th": "Katherine",
            "lastname_th": "Thompson",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 437,
            "firstname_en": "Kavisara",
            "lastname_en": "Polpo",
            "firstname_th": "Kavisara",
            "lastname_th": "Polpo",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 195,
            "firstname_en": "Kelly",
            "lastname_en": "Flynn",
            "firstname_th": "Kelly",
            "lastname_th": "Flynn",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 620,
            "firstname_en": "Kevin",
            "lastname_en": "Sumethasorn",
            "firstname_th": "Kevin",
            "lastname_th": "Sumethasorn",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 496,
            "firstname_en": "Khaleeyoh",
            "lastname_en": "Do",
            "firstname_th": "\u0e04\u0e2d\u0e25\u0e35\u0e40\u0e22\u0e32\u0e30",
            "lastname_th": "\u0e42\u0e14",
            "type": "Local",
            "status": "Disabled",
            "school_code": "MLY "
        },
        {
            "id": 795,
            "firstname_en": "Kholed",
            "lastname_en": "Yusoh",
            "firstname_th": "\u0e04\u0e2d\u0e40\u0e25\u0e14",
            "lastname_th": "\u0e22\u0e39\u0e42\u0e0b\u0e4a\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BKT "
        },
        {
            "id": 525,
            "firstname_en": "Khoteeyoh",
            "lastname_en": "Mudo",
            "firstname_th": "\u0e04\u0e2d\u0e15\u0e35\u0e40\u0e22\u0e32\u0e30",
            "lastname_th": "\u0e21\u0e39\u0e14\u0e2d",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BHK "
        },
        {
            "id": 268,
            "firstname_en": "Khwanta",
            "lastname_en": "Suwanain",
            "firstname_th": "\u0e02\u0e27\u0e31\u0e0d\u0e15\u0e32",
            "lastname_th": "\u0e2a\u0e38\u0e27\u0e23\u0e23\u0e13\u0e2d\u0e34\u0e19\u0e17\u0e23\u0e4c",
            "type": "Local",
            "status": "Disabled",
            "school_code": "WMY "
        },
        {
            "id": 372,
            "firstname_en": "Kirsten",
            "lastname_en": "Branigan",
            "firstname_th": "Kirsten",
            "lastname_th": "Branigan",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 783,
            "firstname_en": "Kitchawancha",
            "lastname_en": "Witchayakitwarawong",
            "firstname_th": "\u0e01\u0e24\u0e29\u0e13\u0e4c\u0e0a\u0e27\u0e31\u0e25\u0e0a\u0e32",
            "lastname_th": "\u0e27\u0e34\u0e0a\u0e0d\u0e01\u0e34\u0e08\u0e27\u0e23\u0e32\u0e27\u0e07\u0e29\u0e4c",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 531,
            "firstname_en": "Kittikorn",
            "lastname_en": "Khwanthong",
            "firstname_th": "\u0e01\u0e34\u0e15\u0e34\u0e01\u0e23\u0e13\u0e4c",
            "lastname_th": "\u0e02\u0e27\u0e31\u0e0d\u0e17\u0e2d\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SAC "
        },
        {
            "id": 425,
            "firstname_en": "Kobkaew",
            "lastname_en": "Nobkaew",
            "firstname_th": "\u0e01\u0e2d\u0e1a\u0e41\u0e01\u0e49\u0e27",
            "lastname_th": "\u0e19\u0e2d\u0e1a\u0e41\u0e01\u0e49\u0e27",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BTS "
        },
        {
            "id": 197,
            "firstname_en": "Kodchaphan",
            "lastname_en": "Thong-roi-ying",
            "firstname_th": "\u0e01\u0e0a\u0e1e\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e17\u0e2d\u0e07\u0e23\u0e49\u0e2d\u0e22\u0e22\u0e34\u0e48\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": ""
        },
        {
            "id": 339,
            "firstname_en": "Kornkamol",
            "lastname_en": "Seetapanya",
            "firstname_th": "\u0e01\u0e23\u0e01\u0e21\u0e25",
            "lastname_th": "\u0e28\u0e35\u0e15\u0e30\u0e1b\u0e31\u0e19\u0e22\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKK "
        },
        {
            "id": 396,
            "firstname_en": "Kornnaphat",
            "lastname_en": "Nantawong",
            "firstname_th": "\u0e01\u0e23\u0e13\u0e1e\u0e31\u0e12\u0e19\u0e4c",
            "lastname_th": "\u0e19\u0e31\u0e19\u0e17\u0e30\u0e27\u0e07\u0e28\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LJP "
        },
        {
            "id": 421,
            "firstname_en": "Krisada",
            "lastname_en": "Theprungsarid",
            "firstname_th": "\u0e01\u0e24\u0e29\u0e14\u0e32",
            "lastname_th": "\u0e40\u0e17\u0e1e\u0e23\u0e31\u0e07\u0e2a\u0e24\u0e29\u0e0f\u0e34\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "NTB "
        },
        {
            "id": 236,
            "firstname_en": "Krissana",
            "lastname_en": "Jantanuon",
            "firstname_th": "\u0e01\u0e24\u0e29\u0e13\u0e32",
            "lastname_th": "\u0e08\u0e31\u0e19\u0e17\u0e19\u0e27\u0e25",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 401,
            "firstname_en": "Kulwara",
            "lastname_en": "Kanka",
            "firstname_th": "\u0e01\u0e38\u0e25\u0e27\u0e23\u0e32",
            "lastname_th": "\u0e01\u0e31\u0e19\u0e01\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "GHL "
        },
        {
            "id": 334,
            "firstname_en": "Kunyanut",
            "lastname_en": "Chaituen",
            "firstname_th": "\u0e01\u0e31\u0e0d\u0e0d\u0e32\u0e13\u0e31\u0e10",
            "lastname_th": "\u0e43\u0e08\u0e15\u0e37\u0e48\u0e19",
            "type": "Local",
            "status": "Enabled",
            "school_code": "JCS "
        },
        {
            "id": 456,
            "firstname_en": "Kuwiyah",
            "lastname_en": "Chewae",
            "firstname_th": "\u0e01\u0e39\u0e27\u0e35\u0e2b\u0e22\u0e4a\u0e30",
            "lastname_th": "\u0e40\u0e08\u0e4a\u0e30\u0e41\u0e27",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ASP "
        },
        {
            "id": 320,
            "firstname_en": "Kwancheewa",
            "lastname_en": "Jaicheng",
            "firstname_th": "\u0e02\u0e27\u0e31\u0e0d\u0e0a\u0e35\u0e27\u0e32",
            "lastname_th": "\u0e43\u0e08\u0e40\u0e09\u0e35\u0e22\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LBK "
        },
        {
            "id": 915,
            "firstname_en": "Legend",
            "lastname_en": "Johnson",
            "firstname_th": "Legend",
            "lastname_th": "Johnson",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 816,
            "firstname_en": "Lennasia",
            "lastname_en": "Dixon",
            "firstname_th": "Lennasia",
            "lastname_th": "Dixon",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 916,
            "firstname_en": "Les",
            "lastname_en": "McCray",
            "firstname_th": "Les",
            "lastname_th": "McCray",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 663,
            "firstname_en": "Linda",
            "lastname_en": "Cherotich Kosgei (CKC)",
            "firstname_th": "T.Linda",
            "lastname_th": "Cherotich Kosgei (CKC)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CKC "
        },
        {
            "id": 520,
            "firstname_en": "Lindsay",
            "lastname_en": "Muro",
            "firstname_th": "Lindsay",
            "lastname_th": "Muro",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 463,
            "firstname_en": "Local",
            "lastname_en": "Teacher",
            "firstname_th": "Local",
            "lastname_th": "Teacher",
            "type": "Local",
            "status": "Enabled",
            "school_code": "DBN "
        },
        {
            "id": 889,
            "firstname_en": "Luke",
            "lastname_en": "Bartlett",
            "firstname_th": "Luke",
            "lastname_th": "Bartlett",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 500,
            "firstname_en": "Malerie",
            "lastname_en": "West",
            "firstname_th": "Malerie",
            "lastname_th": "West",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 476,
            "firstname_en": "Mallika",
            "lastname_en": "Suankeaw",
            "firstname_th": "\u0e21\u0e31\u0e25\u0e25\u0e34\u0e01\u0e32",
            "lastname_th": "\u0e2a\u0e27\u0e19\u0e41\u0e01\u0e49\u0e27",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPR "
        },
        {
            "id": 513,
            "firstname_en": "Mallika",
            "lastname_en": "Suankeaw (SPO)",
            "firstname_th": "\u0e21\u0e31\u0e25\u0e25\u0e34\u0e01\u0e32",
            "lastname_th": "\u0e2a\u0e27\u0e19\u0e41\u0e01\u0e49\u0e27 (SPO)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPO "
        },
        {
            "id": 487,
            "firstname_en": "Mana",
            "lastname_en": "Suthaprot",
            "firstname_th": "\u0e21\u0e32\u0e19\u0e32",
            "lastname_th": "\u0e2a\u0e38\u0e18\u0e32\u0e1e\u0e23\u0e15",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PPV "
        },
        {
            "id": 332,
            "firstname_en": "Mantana",
            "lastname_en": "Chantasa",
            "firstname_th": "\u0e21\u0e31\u0e13\u0e11\u0e19\u0e32",
            "lastname_th": "\u0e08\u0e31\u0e19\u0e15\u0e4a\u0e30\u0e2a\u0e32 ",
            "type": "Local",
            "status": "Enabled",
            "school_code": "JWC "
        },
        {
            "id": 219,
            "firstname_en": "Mardhiyah",
            "lastname_en": "Taleb",
            "firstname_th": "\u0e21\u0e31\u0e23\u0e0e\u0e35\u0e22\u0e30\u0e2e\u0e4c",
            "lastname_th": "\u0e40\u0e15\u0e25\u0e47\u0e1a",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTN "
        },
        {
            "id": 494,
            "firstname_en": "Maria Lourdes",
            "lastname_en": "Palines Lopido",
            "firstname_th": "Maria Lourdes",
            "lastname_th": "Palines Lopido",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPR "
        },
        {
            "id": 514,
            "firstname_en": "Maria Lourdes (SPO)",
            "lastname_en": "Palines Lopido",
            "firstname_th": "Maria Lourdes (SPO)",
            "lastname_th": "Palines Lopido",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPO "
        },
        {
            "id": 212,
            "firstname_en": "Marinee",
            "lastname_en": "Awae",
            "firstname_th": "\u0e21\u0e32\u0e23\u0e35\u0e19\u0e35",
            "lastname_th": "\u0e2d\u0e32\u0e41\u0e27",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BMY "
        },
        {
            "id": 209,
            "firstname_en": "Mariyanee",
            "lastname_en": "Ma",
            "firstname_th": "\u0e21\u0e32\u0e23\u0e35\u0e22\u0e32\u0e19\u0e35",
            "lastname_th": "\u0e21\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 488,
            "firstname_en": "Mark",
            "lastname_en": "Loveless",
            "firstname_th": "\u0e21\u0e32\u0e23\u0e4c\u0e04",
            "lastname_th": "\u0e40\u0e25\u0e34\u0e1f\u0e40\u0e25\u0e2a",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PPV "
        },
        {
            "id": 465,
            "firstname_en": "Mark",
            "lastname_en": "Vonn Parker",
            "firstname_th": "Mark",
            "lastname_th": "Vonn Parker",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 617,
            "firstname_en": "Mark",
            "lastname_en": "Wise",
            "firstname_th": "Mark",
            "lastname_th": "Wise",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 362,
            "firstname_en": "Marwan",
            "lastname_en": "Doloh",
            "firstname_th": "\u0e21\u0e31\u0e23\u0e27\u0e32\u0e19 ",
            "lastname_th": "\u0e14\u0e2d\u0e40\u0e25\u0e32\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BWM "
        },
        {
            "id": 925,
            "firstname_en": "Matthew",
            "lastname_en": "Dewald",
            "firstname_th": "Matthew",
            "lastname_th": "Dewald",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 926,
            "firstname_en": "Matthew",
            "lastname_en": "Smeaton",
            "firstname_th": "Matthew",
            "lastname_th": "Smeaton",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 865,
            "firstname_en": "Mayura",
            "lastname_en": "Kantalan (CCT)",
            "firstname_th": "\u0e21\u0e22\u0e38\u0e23\u0e32",
            "lastname_th": "\u0e01\u0e31\u0e19\u0e17\u0e30\u0e2b\u0e25\u0e31\u0e48\u0e19 (CCT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CCT "
        },
        {
            "id": 801,
            "firstname_en": "Mayuree",
            "lastname_en": "Leekee",
            "firstname_th": "\u0e21\u0e22\u0e38\u0e23\u0e35",
            "lastname_th": "\u0e25\u0e35\u0e01\u0e35",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BDY "
        },
        {
            "id": 408,
            "firstname_en": "Mayuri",
            "lastname_en": "Manojarern",
            "firstname_th": "\u0e21\u0e22\u0e38\u0e23\u0e35",
            "lastname_th": "\u0e21\u0e42\u0e19\u0e40\u0e08\u0e23\u0e34\u0e0d",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LMM "
        },
        {
            "id": 299,
            "firstname_en": "Megan",
            "lastname_en": "Balah",
            "firstname_th": "Megan",
            "lastname_th": "Balah",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 934,
            "firstname_en": "Meggan",
            "lastname_en": "Casten",
            "firstname_th": "Meggan",
            "lastname_th": "Casten",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 373,
            "firstname_en": "Michael",
            "lastname_en": "Gilligan",
            "firstname_th": "Michael",
            "lastname_th": "Gilligan",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 935,
            "firstname_en": "Michaela",
            "lastname_en": "van Rensburg",
            "firstname_th": "Michaela",
            "lastname_th": "van Rensburg",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 405,
            "firstname_en": "Mikkiya",
            "lastname_en": "Deng",
            "firstname_th": "\u0e21\u0e34\u0e01\u0e01\u0e34\u0e22\u0e32",
            "lastname_th": "\u0e40\u0e14\u0e47\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "GKT "
        },
        {
            "id": 824,
            "firstname_en": "Miles",
            "lastname_en": "Ndebele",
            "firstname_th": "Miles",
            "lastname_th": "Ndebele",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 760,
            "firstname_en": "Mueanfan",
            "lastname_en": "Khunrat",
            "firstname_th": "\u0e40\u0e2b\u0e21\u0e37\u0e2d\u0e19\u0e1d\u0e31\u0e19",
            "lastname_th": "\u0e02\u0e38\u0e19\u0e23\u0e32\u0e0a",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BHK "
        },
        {
            "id": 283,
            "firstname_en": "Muneerah",
            "lastname_en": "Salaeharae",
            "firstname_th": "\u0e21\u0e39\u0e19\u0e35\u0e40\u0e23\u0e32\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e2a\u0e32\u0e41\u0e25\u0e30\u0e2d\u0e32\u0e41\u0e23\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BHK "
        },
        {
            "id": 403,
            "firstname_en": "Nadia",
            "lastname_en": "Bueto",
            "firstname_th": "\u0e19\u0e32\u0e40\u0e14\u0e35\u0e22",
            "lastname_th": "\u0e1a\u0e37\u0e2d\u0e42\u0e15",
            "type": "Local",
            "status": "Enabled",
            "school_code": "GKT "
        },
        {
            "id": 923,
            "firstname_en": "Nadiya",
            "lastname_en": "Waesulong",
            "firstname_th": "\u0e19\u0e32\u0e14\u0e35\u0e22\u0e32",
            "lastname_th": "\u0e41\u0e27\u0e2a\u0e38\u0e2b\u0e25\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BWK "
        },
        {
            "id": 474,
            "firstname_en": "Nadlada",
            "lastname_en": "Keawleang",
            "firstname_th": "\u0e19\u0e32\u0e0e\u0e25\u0e14\u0e32",
            "lastname_th": "\u0e41\u0e01\u0e49\u0e27\u0e40\u0e01\u0e25\u0e37\u0e49\u0e22\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPR "
        },
        {
            "id": 511,
            "firstname_en": "Nadlada",
            "lastname_en": "Keawleang (SPO)",
            "firstname_th": "\u0e19\u0e32\u0e0e\u0e25\u0e14\u0e32",
            "lastname_th": "\u0e41\u0e01\u0e49\u0e27\u0e40\u0e01\u0e25\u0e37\u0e49\u0e22\u0e07 (SPO)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPO "
        },
        {
            "id": 757,
            "firstname_en": "Naemah",
            "lastname_en": "Lubokamae",
            "firstname_th": "\u0e19\u0e32\u0e2d\u0e35\u0e2b\u0e21\u0e4a\u0e30",
            "lastname_th": "\u0e25\u0e39\u0e42\u0e1a\u0e30\u0e01\u0e32\u0e41\u0e21",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BSK "
        },
        {
            "id": 594,
            "firstname_en": "Nakorn",
            "lastname_en": "Onsuna (SWM)",
            "firstname_th": "\u0e19\u0e04\u0e23",
            "lastname_th": "\u0e2d\u0e49\u0e19\u0e2a\u0e38\u0e19\u0e32 (SWM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SWM "
        },
        {
            "id": 448,
            "firstname_en": "Nan Hua",
            "lastname_en": "Teacher",
            "firstname_th": "Nan Hua",
            "lastname_th": "Teacher",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CNH "
        },
        {
            "id": 584,
            "firstname_en": "Nantawan",
            "lastname_en": "Ratchatapipatkul (SKC)",
            "firstname_th": "\u0e19\u0e31\u0e19\u0e17\u0e27\u0e31\u0e19",
            "lastname_th": "\u0e23\u0e31\u0e0a\u0e15\u0e30\u0e1e\u0e34\u0e1e\u0e31\u0e12\u0e19\u0e4c\u0e01\u0e38\u0e25 (SKC)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKC "
        },
        {
            "id": 337,
            "firstname_en": "Nantiya",
            "lastname_en": "Doungdokmul",
            "firstname_th": "\u0e19\u0e31\u0e19\u0e17\u0e34\u0e22\u0e32",
            "lastname_th": "\u0e14\u0e27\u0e07\u0e14\u0e2d\u0e01\u0e21\u0e39\u0e25",
            "type": "Local",
            "status": "Enabled",
            "school_code": "JCS "
        },
        {
            "id": 839,
            "firstname_en": "Napatchaya",
            "lastname_en": "Thongkliang",
            "firstname_th": "\u0e13\u0e20\u0e31\u0e0a\u0e23\u0e4c\u0e0a\u0e0d\u0e32",
            "lastname_th": "\u0e17\u0e2d\u0e07\u0e40\u0e01\u0e25\u0e35\u0e49\u0e22\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BNY "
        },
        {
            "id": 759,
            "firstname_en": "Nareema",
            "lastname_en": "Wasoh",
            "firstname_th": "\u0e19\u0e32\u0e23\u0e35\u0e21\u0e32",
            "lastname_th": "\u0e27\u0e32\u0e42\u0e0b\u0e4a\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BMO "
        },
        {
            "id": 497,
            "firstname_en": "Nareesa",
            "lastname_en": "Saleh",
            "firstname_th": "\u0e19\u0e32\u0e23\u0e35\u0e0b\u0e32",
            "lastname_th": "\u0e2a\u0e32\u0e41\u0e25\u0e4a\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BMO "
        },
        {
            "id": 284,
            "firstname_en": "Naseehah",
            "lastname_en": "Sulong",
            "firstname_th": "\u0e19\u0e32\u0e0b\u0e35\u0e2e\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e2a\u0e38\u0e2b\u0e25\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BHK "
        },
        {
            "id": 454,
            "firstname_en": "Nasorah",
            "lastname_en": "Seng",
            "firstname_th": "\u0e19\u0e32\u0e0b\u0e2d\u0e40\u0e23\u0e32\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e40\u0e0b\u0e47\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ASP "
        },
        {
            "id": 601,
            "firstname_en": "Natakorn",
            "lastname_en": "Jintana (SMP)",
            "firstname_th": "\u0e19\u0e0f\u0e01\u0e23",
            "lastname_th": "\u0e08\u0e34\u0e19\u0e15\u0e19\u0e32 (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 508,
            "firstname_en": "Natalie",
            "lastname_en": "Hoffman",
            "firstname_th": "Natalie",
            "lastname_th": "Hoffman",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 789,
            "firstname_en": "Natamon",
            "lastname_en": "Payuhin",
            "firstname_th": "\u0e13\u0e10\u0e21\u0e19",
            "lastname_th": "\u0e1e\u0e32\u0e22\u0e38\u0e2b\u0e34\u0e19",
            "type": "Local",
            "status": "Disabled",
            "school_code": "YBT "
        },
        {
            "id": 303,
            "firstname_en": "Natjira",
            "lastname_en": "Yatang",
            "firstname_th": "\u0e13\u0e31\u0e10\u0e08\u0e34\u0e23\u0e32",
            "lastname_th": "\u0e22\u0e30\u0e17\u0e31\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 756,
            "firstname_en": "Natjirajorn",
            "lastname_en": "Eakwatayajarn",
            "firstname_th": "\u0e13\u0e31\u0e10\u0e08\u0e34\u0e23\u0e01\u0e23\u0e13\u0e4c",
            "lastname_th": "\u0e40\u0e2d\u0e01\u0e27\u0e32\u0e17\u0e22\u0e32\u0e08\u0e32\u0e23\u0e22\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "WRS "
        },
        {
            "id": 377,
            "firstname_en": "Natnicha ",
            "lastname_en": "Kachapol",
            "firstname_th": "\u0e13\u0e31\u0e10\u0e13\u0e34\u0e0a\u0e32 ",
            "lastname_th": "\u0e04\u0e0a\u0e32\u0e1c\u0e25",
            "type": "Local",
            "status": "Disabled",
            "school_code": "WRS "
        },
        {
            "id": 426,
            "firstname_en": "Nattaphon",
            "lastname_en": "Damkerngkiat",
            "firstname_th": "\u0e13\u0e31\u0e10\u0e1e\u0e25",
            "lastname_th": "\u0e14\u0e33\u0e40\u0e01\u0e34\u0e07\u0e40\u0e01\u0e35\u0e22\u0e23\u0e15\u0e34",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTS "
        },
        {
            "id": 499,
            "firstname_en": "Nattapon",
            "lastname_en": "Noosanit",
            "firstname_th": "\u0e19\u0e31\u0e10\u0e1e\u0e25",
            "lastname_th": "\u0e2b\u0e19\u0e39\u0e2a\u0e19\u0e34\u0e17",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BWK "
        },
        {
            "id": 482,
            "firstname_en": "Natthakon",
            "lastname_en": "Yodmek",
            "firstname_th": "\u0e13\u0e31\u0e10\u0e01\u0e23",
            "lastname_th": "\u0e22\u0e28\u0e40\u0e21\u0e06",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPW "
        },
        {
            "id": 481,
            "firstname_en": "Natthamathe",
            "lastname_en": "Chuadbua",
            "firstname_th": "\u0e13\u0e31\u0e10\u0e40\u0e21\u0e18\u0e35",
            "lastname_th": "\u0e0a\u0e27\u0e14\u0e1a\u0e31\u0e27",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPW "
        },
        {
            "id": 343,
            "firstname_en": "Nayeebah",
            "lastname_en": "Rachniyom",
            "firstname_th": "\u0e19\u0e32\u0e22\u0e35\u0e1a\u0e4a\u0e30",
            "lastname_th": "\u0e23\u0e32\u0e0a\u0e19\u0e34\u0e22\u0e21",
            "type": "Local",
            "status": "Enabled",
            "school_code": "TNW "
        },
        {
            "id": 833,
            "firstname_en": "Netikan",
            "lastname_en": "Rittidet",
            "firstname_th": "\u0e40\u0e19\u0e15\u0e34\u0e01\u0e32\u0e19\u0e15\u0e4c",
            "lastname_th": "\u0e24\u0e17\u0e18\u0e34\u0e40\u0e14\u0e0a",
            "type": "Local",
            "status": "Enabled",
            "school_code": "WMY "
        },
        {
            "id": 380,
            "firstname_en": "Ni a-mina",
            "lastname_en": "Kosaeng",
            "firstname_th": "\u0e19\u0e34\u0e2d\u0e32\u0e21\u0e35\u0e19\u0e32 ",
            "lastname_th": "\u0e01\u0e2d\u0e40\u0e2a\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": "WRS "
        },
        {
            "id": 402,
            "firstname_en": "Niasma",
            "lastname_en": "Radenahmad",
            "firstname_th": "\u0e19\u0e34\u0e2d\u0e31\u0e2a\u0e21\u0e32",
            "lastname_th": "\u0e23\u0e30\u0e40\u0e14\u0e48\u0e19\u0e2d\u0e32\u0e2b\u0e21\u0e31\u0e14",
            "type": "Local",
            "status": "Enabled",
            "school_code": "GKP "
        },
        {
            "id": 577,
            "firstname_en": "Niki",
            "lastname_en": "Hause",
            "firstname_th": "Niki",
            "lastname_th": "Hause",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 585,
            "firstname_en": "Nipaporn",
            "lastname_en": "Wangcherdklang (SKH)",
            "firstname_th": "\u0e19\u0e34\u0e20\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e2b\u0e27\u0e31\u0e07\u0e40\u0e0a\u0e34\u0e14\u0e01\u0e25\u0e32\u0e07 (SKH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKH "
        },
        {
            "id": 336,
            "firstname_en": "Niphattra",
            "lastname_en": "Che-leh",
            "firstname_th": "\u0e19\u0e34\u0e1e\u0e31\u0e15\u0e23\u0e32",
            "lastname_th": "\u0e40\u0e08\u0e4a\u0e30\u0e40\u0e25\u0e30",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BTG "
        },
        {
            "id": 477,
            "firstname_en": "Nisakorn",
            "lastname_en": "Boonsena",
            "firstname_th": "\u0e19\u0e34\u0e28\u0e32\u0e01\u0e23",
            "lastname_th": "\u0e1a\u0e38\u0e0d\u0e40\u0e2a\u0e19\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "KKU "
        },
        {
            "id": 364,
            "firstname_en": "Nisareen",
            "lastname_en": "Hayakuechi",
            "firstname_th": "\u0e19\u0e34\u0e2a\u0e23\u0e35\u0e19",
            "lastname_th": "\u0e2b\u0e30\u0e22\u0e35\u0e01\u0e37\u0e2d\u0e08\u0e34",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BPM "
        },
        {
            "id": 311,
            "firstname_en": "Nisofia",
            "lastname_en": "Kumae",
            "firstname_th": "\u0e19\u0e34\u0e42\u0e0b\u0e40\u0e1f\u0e35\u0e22\u0e23\u0e4c",
            "lastname_th": "\u0e01\u0e39\u0e41\u0e21",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BMY "
        },
        {
            "id": 387,
            "firstname_en": "Nita ",
            "lastname_en": "Bhatiasevi",
            "firstname_th": "\u0e19\u0e35\u0e15\u0e49\u0e32",
            "lastname_th": "\u0e1b\u0e32\u0e15\u0e34\u0e22\u0e40\u0e2a\u0e27\u0e35",
            "type": "Local",
            "status": "Enabled",
            "school_code": "JWS "
        },
        {
            "id": 214,
            "firstname_en": "Nitaya",
            "lastname_en": "Hayilate",
            "firstname_th": "\u0e19\u0e34\u0e15\u0e22\u0e32",
            "lastname_th": "\u0e2b\u0e30\u0e22\u0e35\u0e25\u0e32\u0e40\u0e15\u0e4a\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BNK "
        },
        {
            "id": 328,
            "firstname_en": "Noel",
            "lastname_en": "Hanni",
            "firstname_th": "Noel",
            "lastname_th": "Hanni",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 473,
            "firstname_en": "Nongnapas",
            "lastname_en": "Tichai",
            "firstname_th": "\u0e19\u0e07\u0e19\u0e20\u0e31\u0e2a",
            "lastname_th": "\u0e17\u0e34\u0e0a\u0e31\u0e22",
            "type": "Local",
            "status": "Enabled",
            "school_code": "HMC "
        },
        {
            "id": 792,
            "firstname_en": "Nor-ida",
            "lastname_en": "Mahlee",
            "firstname_th": "\u0e19\u0e2d\u0e23\u0e4c\u0e44\u0e2d\u0e14\u0e32 ",
            "lastname_th": "\u0e21\u0e30\u0e25\u0e35",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BKT "
        },
        {
            "id": 768,
            "firstname_en": "Nur erawanie",
            "lastname_en": "Kuno",
            "firstname_th": "\u0e19\u0e39\u0e23\u0e2d\u0e35\u0e23\u0e32\u0e27\u0e32\u0e19\u0e35",
            "lastname_th": "\u0e01\u0e39\u0e42\u0e19",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTB "
        },
        {
            "id": 263,
            "firstname_en": "Nureeyah",
            "lastname_en": "Chehyor",
            "firstname_th": "\u0e19\u0e39\u0e23\u0e35\u0e22\u0e4a\u0e30",
            "lastname_th": "\u0e40\u0e08\u0e4a\u0e30\u0e22\u0e2d",
            "type": "Local",
            "status": "Enabled",
            "school_code": "TNW "
        },
        {
            "id": 799,
            "firstname_en": "Nurhafisa",
            "lastname_en": "Pohtae",
            "firstname_th": "\u0e19\u0e39\u0e23\u0e2e\u0e32\u0e1f\u0e35\u0e0b\u0e32",
            "lastname_th": "\u0e40\u0e1b\u0e32\u0e30\u0e41\u0e15",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BDY "
        },
        {
            "id": 344,
            "firstname_en": "Nurmee",
            "lastname_en": "Kabo",
            "firstname_th": "\u0e19\u0e39\u0e23\u0e21\u0e35",
            "lastname_th": "\u0e01\u0e32\u0e42\u0e1a\u0e4a\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "TNW "
        },
        {
            "id": 427,
            "firstname_en": "Nurriya",
            "lastname_en": "Kakao",
            "firstname_th": "\u0e19\u0e39\u0e23\u0e35\u0e22\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e01\u0e32\u0e40\u0e01\u0e32\u0e30",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BTS "
        },
        {
            "id": 342,
            "firstname_en": "Nurroihan",
            "lastname_en": "Dosani",
            "firstname_th": "\u0e19\u0e39\u0e23\u0e23\u0e2d\u0e22\u0e2e\u0e32\u0e19",
            "lastname_th": "\u0e42\u0e14\u0e2a\u0e19\u0e34",
            "type": "Local",
            "status": "Enabled",
            "school_code": "MLY "
        },
        {
            "id": 761,
            "firstname_en": "Nuruliman",
            "lastname_en": "Useng",
            "firstname_th": "\u0e19\u0e39\u0e23\u0e38\u0e25\u0e2d\u0e35\u0e21\u0e32\u0e19",
            "lastname_th": "\u0e2d\u0e39\u0e40\u0e0b\u0e47\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BHK "
        },
        {
            "id": 802,
            "firstname_en": "Nusnawatee",
            "lastname_en": "Ala",
            "firstname_th": "\u0e19\u0e38\u0e2a\u0e19\u0e32\u0e27\u0e32\u0e15\u0e35",
            "lastname_th": "\u0e2d\u0e32\u0e25\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BDY "
        },
        {
            "id": 286,
            "firstname_en": "Nuttapon",
            "lastname_en": "Pichetpongsa",
            "firstname_th": "Nuttapon",
            "lastname_th": "Pichetpongsa",
            "type": "Online",
            "status": "Enabled",
            "school_code": "TRN "
        },
        {
            "id": 590,
            "firstname_en": "Nuttapong",
            "lastname_en": "Sillapawit",
            "firstname_th": "\u0e13\u0e31\u0e0f\u0e10\u0e32\u0e1e\u0e07\u0e28\u0e4c",
            "lastname_th": "\u0e28\u0e34\u0e25\u0e1b\u0e27\u0e34\u0e17\u0e22\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKM "
        },
        {
            "id": 388,
            "firstname_en": "Nuttaya\t",
            "lastname_en": "Tiangsirichai",
            "firstname_th": "\u0e13\u0e31\u0e10\u0e18\u0e22\u0e32\u0e19\u0e4c\t\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07\u0e28\u0e34\u0e23\u0e34\u0e0a\u0e31\u0e22",
            "lastname_th": "\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07\u0e28\u0e34\u0e23\u0e34\u0e0a\u0e31\u0e22",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PPW "
        },
        {
            "id": 823,
            "firstname_en": "Oliver",
            "lastname_en": "Tate",
            "firstname_th": "Oliver",
            "lastname_th": "Tate",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 838,
            "firstname_en": "Oranat",
            "lastname_en": "Naonan",
            "firstname_th": "\u0e2d\u0e23\u0e19\u0e32\u0e23\u0e16",
            "lastname_th": "\u0e40\u0e19\u0e32\u0e19\u0e32\u0e19",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BNY "
        },
        {
            "id": 491,
            "firstname_en": "Orapun",
            "lastname_en": "Utama (BNO)",
            "firstname_th": "\u0e2d\u0e23\u0e1e\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e2d\u0e38\u0e15\u0e30\u0e21\u0e30 (BNO)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BNO "
        },
        {
            "id": 381,
            "firstname_en": "Orapun ",
            "lastname_en": "Utama",
            "firstname_th": "\u0e2d\u0e23\u0e1e\u0e23\u0e23\u0e13 ",
            "lastname_th": "\u0e2d\u0e38\u0e15\u0e30\u0e21\u0e30",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BNY "
        },
        {
            "id": 484,
            "firstname_en": "Pakpicha",
            "lastname_en": "Muangchu",
            "firstname_th": "\u0e20\u0e31\u0e04\u0e1e\u0e34\u0e0a\u0e32",
            "lastname_th": "\u0e40\u0e21\u0e37\u0e2d\u0e07\u0e0a\u0e39",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPW "
        },
        {
            "id": 595,
            "firstname_en": "Panida",
            "lastname_en": "Patana (SWM)",
            "firstname_th": "\u0e1e\u0e19\u0e34\u0e14\u0e32",
            "lastname_th": "\u0e1e\u0e30\u0e18\u0e30\u0e19\u0e30 (SWM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SWM "
        },
        {
            "id": 312,
            "firstname_en": "Panisara",
            "lastname_en": "Sritulakan",
            "firstname_th": "\u0e1b\u0e32\u0e13\u0e34\u0e2a\u0e23\u0e32",
            "lastname_th": "\u0e28\u0e23\u0e35\u0e15\u0e38\u0e25\u0e32\u0e01\u0e32\u0e23",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BDB "
        },
        {
            "id": 399,
            "firstname_en": "Pannee",
            "lastname_en": "Mahama",
            "firstname_th": "\u0e1e\u0e23\u0e23\u0e13\u0e35",
            "lastname_th": "\u0e21\u0e30\u0e2b\u0e30\u0e21\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "GHL "
        },
        {
            "id": 769,
            "firstname_en": "Parnrawee",
            "lastname_en": "Ngoenmak",
            "firstname_th": "\u0e1b\u0e32\u0e19\u0e23\u0e27\u0e35",
            "lastname_th": "\u0e40\u0e07\u0e34\u0e19\u0e21\u0e32\u0e01",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BMT "
        },
        {
            "id": 607,
            "firstname_en": "Paruehadon",
            "lastname_en": "Koedsawat (SMP)",
            "firstname_th": "\u0e1e\u0e24\u0e2b\u0e14\u0e25",
            "lastname_th": "\u0e40\u0e01\u0e34\u0e14\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e34\u0e4c (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 836,
            "firstname_en": "Patarasuda",
            "lastname_en": "Chomchoei",
            "firstname_th": "\u0e20\u0e31\u0e17\u0e23\u0e2a\u0e38\u0e14\u0e32",
            "lastname_th": "\u0e0a\u0e21\u0e40\u0e0a\u0e22",
            "type": "Local",
            "status": "Enabled",
            "school_code": "HSS "
        },
        {
            "id": 530,
            "firstname_en": "Patchadaporn",
            "lastname_en": "Suwanklad",
            "firstname_th": "\u0e1e\u0e31\u0e0a\u0e0e\u0e32\u0e20\u0e23\u0e13\u0e4c",
            "lastname_th": "\u0e2a\u0e38\u0e27\u0e23\u0e23\u0e13\u0e01\u0e25\u0e31\u0e14",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SAC "
        },
        {
            "id": 890,
            "firstname_en": "Patinyarat",
            "lastname_en": "Promsrisawat",
            "firstname_th": "Patinyarat",
            "lastname_th": "Promsrisawat",
            "type": "Local",
            "status": "Enabled",
            "school_code": "DHM "
        },
        {
            "id": 186,
            "firstname_en": "Pattama",
            "lastname_en": "Keawpim",
            "firstname_th": "\u0e1b\u0e31\u0e17\u0e21\u0e32",
            "lastname_th": "\u0e41\u0e01\u0e49\u0e27\u0e1e\u0e34\u0e21\u0e1e\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 213,
            "firstname_en": "Pattama",
            "lastname_en": "Sattayapong",
            "firstname_th": "\u0e1b\u0e31\u0e17\u0e21\u0e32",
            "lastname_th": "\u0e2a\u0e31\u0e15\u0e22\u0e1e\u0e07\u0e28\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 379,
            "firstname_en": "Pattama ",
            "lastname_en": "Narasompochkit",
            "firstname_th": "\u0e1b\u0e31\u0e17\u0e21\u0e32 ",
            "lastname_th": "\u0e19\u0e23\u0e32\u0e2a\u0e21\u0e42\u0e20\u0e0a\u0e01\u0e34\u0e08",
            "type": "Local",
            "status": "Disabled",
            "school_code": "WRS "
        },
        {
            "id": 224,
            "firstname_en": "Paul",
            "lastname_en": "Leger",
            "firstname_th": "Paul",
            "lastname_th": "Leger",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 486,
            "firstname_en": "Pawana",
            "lastname_en": "Loveless",
            "firstname_th": "\u0e20\u0e32\u0e27\u0e19\u0e32",
            "lastname_th": "\u0e40\u0e25\u0e34\u0e1f\u0e40\u0e25\u0e2a",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PPV "
        },
        {
            "id": 259,
            "firstname_en": "Paweena",
            "lastname_en": "Maneechai",
            "firstname_th": "\u0e1b\u0e27\u0e35\u0e13\u0e32",
            "lastname_th": "\u0e21\u0e13\u0e35\u0e0a\u0e31\u0e22",
            "type": "Local",
            "status": "Enabled",
            "school_code": "VSS "
        },
        {
            "id": 446,
            "firstname_en": "Peerawut",
            "lastname_en": "Khotsuwan",
            "firstname_th": "Peerawut",
            "lastname_th": "Khotsuwan",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 786,
            "firstname_en": "Penpisut",
            "lastname_en": "Harmarit",
            "firstname_th": "\u0e40\u0e1e\u0e47\u0e0d\u0e1e\u0e34\u0e2a\u0e38\u0e17\u0e18\u0e34\u0e4c",
            "lastname_th": "\u0e2b\u0e32\u0e21\u0e30\u0e24\u0e17\u0e18\u0e34\u0e4c",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 772,
            "firstname_en": "Peter",
            "lastname_en": "Tall",
            "firstname_th": "Peter",
            "lastname_th": "Tall",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 586,
            "firstname_en": "Phaichittra",
            "lastname_en": "Chendong (SKH)",
            "firstname_th": "\u0e44\u0e1e\u0e08\u0e34\u0e15\u0e15\u0e23\u0e32",
            "lastname_th": "\u0e40\u0e08\u0e23\u0e14\u0e07 (SKH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKH "
        },
        {
            "id": 527,
            "firstname_en": "Phasini",
            "lastname_en": "Hitkaeo",
            "firstname_th": "\u0e20\u0e32\u0e2a\u0e34\u0e19\u0e35",
            "lastname_th": "\u0e2b\u0e35\u0e15\u0e41\u0e01\u0e49\u0e27",
            "type": "Local",
            "status": "Enabled",
            "school_code": "RPW "
        },
        {
            "id": 489,
            "firstname_en": "Phasook",
            "lastname_en": "Sumamankul",
            "firstname_th": "\u0e1c\u0e32\u0e2a\u0e38\u0e01",
            "lastname_th": "\u0e2a\u0e38\u0e21\u0e32\u0e21\u0e32\u0e25\u0e22\u0e4c\u0e01\u0e38\u0e25",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PPV "
        },
        {
            "id": 422,
            "firstname_en": "Phatcharapha",
            "lastname_en": "Theprungsarid",
            "firstname_th": "\u0e1e\u0e31\u0e0a\u0e23\u0e32\u0e20\u0e32",
            "lastname_th": "\u0e40\u0e17\u0e1e\u0e23\u0e31\u0e07\u0e2a\u0e24\u0e29\u0e0f\u0e34\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "NTB "
        },
        {
            "id": 787,
            "firstname_en": "Phatchari",
            "lastname_en": "Singtong",
            "firstname_th": "\u0e1e\u0e31\u0e0a\u0e23\u0e35",
            "lastname_th": "\u0e2a\u0e34\u0e07\u0e2b\u0e4c\u0e17\u0e2d\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": "YBT "
        },
        {
            "id": 618,
            "firstname_en": "Pieter",
            "lastname_en": "Koen",
            "firstname_th": "Pieter",
            "lastname_th": "Koen",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 345,
            "firstname_en": "Pimnipa",
            "lastname_en": "Moudree",
            "firstname_th": "\u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e19\u0e34\u0e20\u0e32",
            "lastname_th": "\u0e2b\u0e21\u0e27\u0e14\u0e2b\u0e23\u0e35",
            "type": "Local",
            "status": "Enabled",
            "school_code": "TNW "
        },
        {
            "id": 538,
            "firstname_en": "Pitchayapa",
            "lastname_en": "Nuysuwan",
            "firstname_th": "\u0e1e\u0e34\u0e0a\u0e0d\u0e32\u0e20\u0e32",
            "lastname_th": "\u0e19\u0e38\u0e49\u0e22\u0e2a\u0e38\u0e27\u0e23\u0e23\u0e13",
            "type": "Local",
            "status": "Disabled",
            "school_code": "WMY "
        },
        {
            "id": 599,
            "firstname_en": "Piyanuch",
            "lastname_en": "Pankaew (SMP)",
            "firstname_th": "\u0e1b\u0e34\u0e22\u0e30\u0e19\u0e38\u0e0a",
            "lastname_th": "\u0e1e\u0e32\u0e19\u0e41\u0e01\u0e49\u0e27 (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 777,
            "firstname_en": "Piyanuch",
            "lastname_en": "Sinsiri",
            "firstname_th": "\u0e1b\u0e34\u0e22\u0e30\u0e19\u0e38\u0e0a",
            "lastname_th": "\u0e2a\u0e34\u0e19\u0e2a\u0e34\u0e23\u0e34",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 533,
            "firstname_en": "Piyatida",
            "lastname_en": "Khongbal",
            "firstname_th": "\u0e1b\u0e34\u0e22\u0e30\u0e18\u0e34\u0e14\u0e32\u200b",
            "lastname_th": "\u0e04\u0e07\u200b\u0e1a\u0e32\u0e25\u200b",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SAC "
        },
        {
            "id": 830,
            "firstname_en": "Piyawan",
            "lastname_en": "Foythong",
            "firstname_th": "\u0e1b\u0e34\u0e22\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e1d\u0e2d\u0e22\u0e17\u0e2d\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BWK "
        },
        {
            "id": 605,
            "firstname_en": "Piyawun",
            "lastname_en": "Bourkaew (SMP)",
            "firstname_th": "\u0e1b\u0e34\u0e22\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e1a\u0e31\u0e27\u0e41\u0e01\u0e49\u0e27 (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 851,
            "firstname_en": "Poomsit",
            "lastname_en": "Pongpornnapa",
            "firstname_th": "\u0e20\u0e39\u0e21\u0e34\u0e2a\u0e34\u0e29\u0e10\u0e4c",
            "lastname_th": "\u0e1e\u0e07\u0e28\u0e4c\u0e1e\u0e23\u0e19\u0e20\u0e32",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 543,
            "firstname_en": "Pornsirin",
            "lastname_en": "Kanhawan",
            "firstname_th": "\u0e1e\u0e23\u0e28\u0e34\u0e23\u0e34\u0e19\u0e17\u0e23\u0e4c",
            "lastname_th": "\u0e01\u0e31\u0e19\u0e2b\u0e32\u0e27\u0e31\u0e19",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BNY "
        },
        {
            "id": 545,
            "firstname_en": "Pornsirin",
            "lastname_en": "Kanhawan (BNO)",
            "firstname_th": "\u0e1e\u0e23\u0e28\u0e34\u0e23\u0e34\u0e19\u0e17\u0e23\u0e4c",
            "lastname_th": "\u0e01\u0e31\u0e19\u0e2b\u0e32\u0e27\u0e31\u0e19 (BNO)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BNO "
        },
        {
            "id": 778,
            "firstname_en": "Pornsirin",
            "lastname_en": "Watthanasathian",
            "firstname_th": "\u0e1e\u0e23\u0e2a\u0e34\u0e23\u0e34\u0e19\u0e17\u0e23\u0e4c",
            "lastname_th": "\u0e27\u0e31\u0e12\u0e19\u0e40\u0e2a\u0e16\u0e35\u0e22\u0e23",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 790,
            "firstname_en": "Pranee",
            "lastname_en": "Baha",
            "firstname_th": "\u0e1b\u0e23\u0e32\u0e13\u0e35",
            "lastname_th": "\u0e1a\u0e32\u0e2e\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "YBT "
        },
        {
            "id": 468,
            "firstname_en": "Prangthong",
            "lastname_en": "Puttamanee",
            "firstname_th": "\u0e1b\u0e23\u0e32\u0e07\u0e04\u0e4c\u0e17\u0e2d\u0e07",
            "lastname_th": "\u0e1e\u0e38\u0e17\u0e18\u0e21\u0e13\u0e35\u0e22\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "RAP "
        },
        {
            "id": 780,
            "firstname_en": "Prapawan",
            "lastname_en": "Jongjammareeseethong",
            "firstname_th": "\u0e1b\u0e23\u0e30\u0e20\u0e32\u0e27\u0e31\u0e25\u0e22\u0e4c",
            "lastname_th": "\u0e08\u0e07\u0e08\u0e32\u0e21\u0e23\u0e35\u0e2a\u0e35\u0e17\u0e2d\u0e07",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 885,
            "firstname_en": "Preeyaphat",
            "lastname_en": "Ngawlaem",
            "firstname_th": "\u0e1b\u0e23\u0e35\u0e22\u0e32\u0e20\u0e31\u0e17\u0e23\u0e4c",
            "lastname_th": "\u0e07\u0e49\u0e32\u0e27\u0e41\u0e2b\u0e25\u0e21",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 653,
            "firstname_en": "Preeyaporn",
            "lastname_en": "Kanjanachart",
            "firstname_th": "\u0e1b\u0e23\u0e35\u0e22\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e01\u0e32\u0e0d\u0e08\u0e19\u0e30\u0e0a\u0e32\u0e15\u0e34",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EPM "
        },
        {
            "id": 536,
            "firstname_en": "Premjai",
            "lastname_en": "Chinpokung",
            "firstname_th": "\u0e40\u0e1b\u0e23\u0e21\u0e43\u0e08",
            "lastname_th": "\u0e0a\u0e34\u0e13\u0e42\u0e1e\u0e18\u0e34\u0e4c\u0e04\u0e31\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": "WMY "
        },
        {
            "id": 417,
            "firstname_en": "Rabeeyah",
            "lastname_en": "Hama",
            "firstname_th": "\u0e25\u0e32\u0e1a\u0e35\u0e22\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e2b\u0e30\u0e21\u0e30",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BWM "
        },
        {
            "id": 239,
            "firstname_en": "Rahmanee",
            "lastname_en": "Umsoh",
            "firstname_th": "\u0e23\u0e2d\u0e2e\u0e21\u0e32\u0e13\u0e35\u0e22\u0e4c",
            "lastname_th": "\u0e2d\u0e33\u0e40\u0e0b\u0e32\u0e30\u0e2b\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BHK "
        },
        {
            "id": 910,
            "firstname_en": "Ramon",
            "lastname_en": "Pereda",
            "firstname_th": "Ramon",
            "lastname_th": "Pereda",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 389,
            "firstname_en": "Rampai",
            "lastname_en": "Chantharnpratak",
            "firstname_th": "\u0e23\u0e33\u0e44\u0e1e",
            "lastname_th": "\u0e08\u0e31\u0e19\u0e17\u0e23\u0e1b\u0e23\u0e30\u0e17\u0e31\u0e01\u0e29\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PPW "
        },
        {
            "id": 382,
            "firstname_en": "Rapeepan",
            "lastname_en": "Boonrasri",
            "firstname_th": "\u0e23\u0e30\u0e1e\u0e35\u0e1e\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e1a\u0e38\u0e0d\u0e23\u0e32\u0e28\u0e23\u0e35",
            "type": "Local",
            "status": "Enabled",
            "school_code": "DBB "
        },
        {
            "id": 549,
            "firstname_en": "Ricky",
            "lastname_en": "Chawla",
            "firstname_th": "Ricky",
            "lastname_th": "Chawla",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 471,
            "firstname_en": "Rita",
            "lastname_en": "De Marco",
            "firstname_th": "Rita",
            "lastname_th": "De Marco",
            "type": "Online",
            "status": "Enabled",
            "school_code": "TRN "
        },
        {
            "id": 272,
            "firstname_en": "Rob",
            "lastname_en": "Stokes",
            "firstname_th": "Rob",
            "lastname_th": "Stokes",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 190,
            "firstname_en": "Robert",
            "lastname_en": "Scannell",
            "firstname_th": "Robert",
            "lastname_th": "Scannell",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 773,
            "firstname_en": "Robert",
            "lastname_en": "Wise",
            "firstname_th": "Robert",
            "lastname_th": "Wise",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 429,
            "firstname_en": "Rorsiya",
            "lastname_en": "Jehheng",
            "firstname_th": "\u0e23\u0e2d\u0e2a\u0e35\u0e22\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e40\u0e08\u0e4a\u0e30\u0e40\u0e2e\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BTS "
        },
        {
            "id": 431,
            "firstname_en": "Rorsiyor",
            "lastname_en": "Maae",
            "firstname_th": "\u0e23\u0e2d\u0e2a\u0e35\u0e40\u0e22\u0e32\u0e30",
            "lastname_th": "\u0e21\u0e30\u0e41\u0e2d",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BTS "
        },
        {
            "id": 305,
            "firstname_en": "Rosarin",
            "lastname_en": "Intaraksa",
            "firstname_th": "\u0e23\u0e2a\u0e23\u0e34\u0e19",
            "lastname_th": "\u0e2d\u0e34\u0e19\u0e17\u0e23\u0e31\u0e01\u0e29\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "NTB "
        },
        {
            "id": 808,
            "firstname_en": "Rosee",
            "lastname_en": "Binmada-oh",
            "firstname_th": "\u0e23\u0e2d\u0e0b\u0e35",
            "lastname_th": "\u0e1a\u0e34\u0e19\u0e21\u0e30\u0e14\u0e32\u0e42\u0e2d\u0e4a\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BPD "
        },
        {
            "id": 796,
            "firstname_en": "Rosemalin",
            "lastname_en": "Che-laeh",
            "firstname_th": "\u0e42\u0e23\u0e2a\u0e21\u0e32\u0e25\u0e34\u0e19",
            "lastname_th": "\u0e42\u0e23\u0e2a\u0e21\u0e32\u0e25\u0e34\u0e19",
            "type": "Local",
            "status": "Enabled",
            "school_code": "TPR "
        },
        {
            "id": 797,
            "firstname_en": "Rositoh",
            "lastname_en": "Arbu",
            "firstname_th": "\u0e23\u0e2d\u0e0b\u0e35\u0e40\u0e15\u0e4a\u0e32\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e2d\u0e32\u0e1a\u0e39",
            "type": "Local",
            "status": "Enabled",
            "school_code": "TPR "
        },
        {
            "id": 583,
            "firstname_en": "Rotsukon",
            "lastname_en": "Ngernpim (SKC)",
            "firstname_th": "\u0e23\u0e2a\u0e2a\u0e38\u0e04\u0e19\u0e18\u0e4c",
            "lastname_th": "\u0e40\u0e07\u0e34\u0e19\u0e1e\u0e34\u0e21\u0e1e\u0e4c (SKC)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKC "
        },
        {
            "id": 217,
            "firstname_en": "Royda",
            "lastname_en": "Abdullateh",
            "firstname_th": "\u0e23\u0e2d\u0e22\u0e14\u0e32",
            "lastname_th": "\u0e2d\u0e31\u0e1a\u0e14\u0e38\u0e25\u0e25\u0e32\u0e40\u0e15\u0e4a\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 390,
            "firstname_en": "Rozalia",
            "lastname_en": "Kieliszkiewicz",
            "firstname_th": "Rozalia",
            "lastname_th": "Kieliszkiewicz",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 509,
            "firstname_en": "Ruhana",
            "lastname_en": "Tayeh",
            "firstname_th": "\u0e23\u0e39\u0e2e\u0e32\u0e13\u0e32",
            "lastname_th": "\u0e15\u0e32\u0e40\u0e22\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTG "
        },
        {
            "id": 321,
            "firstname_en": "Rumpeung",
            "lastname_en": "Deemak",
            "firstname_th": "\u0e23\u0e33\u0e1e\u0e36\u0e07",
            "lastname_th": "\u0e14\u0e35\u0e21\u0e32\u0e01",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LTS "
        },
        {
            "id": 524,
            "firstname_en": "Rusna",
            "lastname_en": "Sayakha",
            "firstname_th": "\u0e23\u0e38\u0e2a\u0e19\u0e32",
            "lastname_th": "\u0e2a\u0e30\u0e22\u0e32\u0e04\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTS "
        },
        {
            "id": 416,
            "firstname_en": "Ruthairat",
            "lastname_en": "Ek-uru",
            "firstname_th": "\u0e24\u0e17\u0e31\u0e22\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e40\u0e2d\u0e01\u0e2d\u0e38\u0e23\u0e38",
            "type": "Local",
            "status": "Enabled",
            "school_code": "GNC "
        },
        {
            "id": 330,
            "firstname_en": "Ryan",
            "lastname_en": "White",
            "firstname_th": "Ryan",
            "lastname_th": "White",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 306,
            "firstname_en": "Sabueree",
            "lastname_en": "Jeh-ngoh",
            "firstname_th": "\u0e2a\u0e1a\u0e37\u0e2d\u0e23\u0e35",
            "lastname_th": "\u0e40\u0e08\u0e30\u0e40\u0e07\u0e32\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTS "
        },
        {
            "id": 606,
            "firstname_en": "Saisina",
            "lastname_en": "Buaphuan (SMP)",
            "firstname_th": "\u0e2a\u0e32\u0e22\u0e2a\u0e34\u0e19\u0e32",
            "lastname_th": "\u0e1a\u0e31\u0e27\u0e40\u0e1c\u0e37\u0e48\u0e2d\u0e19 (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 764,
            "firstname_en": "Saitong",
            "lastname_en": "Waeteh",
            "firstname_th": "\u0e0b\u0e31\u0e22\u0e15\u0e07",
            "lastname_th": "\u0e41\u0e27\u0e40\u0e15\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BYH "
        },
        {
            "id": 788,
            "firstname_en": "Sakina",
            "lastname_en": "Dolo",
            "firstname_th": "\u0e2a\u0e32\u0e01\u0e35\u0e19\u0e32",
            "lastname_th": "\u0e14\u0e2d\u0e40\u0e25\u0e32\u0e30",
            "type": "Local",
            "status": "Disabled",
            "school_code": "YBT "
        },
        {
            "id": 418,
            "firstname_en": "Sakinah",
            "lastname_en": "Salaeh",
            "firstname_th": "\u0e0b\u0e32\u0e01\u0e35\u0e2b\u0e19\u0e30",
            "lastname_th": "\u0e2a\u0e32\u0e41\u0e25\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BPM "
        },
        {
            "id": 480,
            "firstname_en": "Salaila",
            "lastname_en": "Kachaanan",
            "firstname_th": "\u0e2a\u0e44\u0e25\u0e25\u0e32",
            "lastname_th": "\u0e04\u0e0a\u0e32\u0e2d\u0e19\u0e31\u0e19\u0e15\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPW "
        },
        {
            "id": 887,
            "firstname_en": "Salima",
            "lastname_en": "Tomard",
            "firstname_th": "\u0e0b\u0e32\u0e25\u0e34\u0e21\u0e32",
            "lastname_th": "\u0e42\u0e15\u0e4a\u0e30\u0e2b\u0e21\u0e32\u0e14",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 327,
            "firstname_en": "Samuel",
            "lastname_en": "Hall",
            "firstname_th": "Samuel",
            "lastname_th": "Hall",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 302,
            "firstname_en": "Sanchai",
            "lastname_en": "Khamudom",
            "firstname_th": "\u0e2a\u0e23\u0e23\u0e04\u0e4c\u0e0a\u0e31\u0e22",
            "lastname_th": "\u0e04\u0e33\u0e2d\u0e38\u0e14\u0e21",
            "type": "Local",
            "status": "Enabled",
            "school_code": "KRM "
        },
        {
            "id": 921,
            "firstname_en": "Sanguan",
            "lastname_en": "Bunni",
            "firstname_th": "\u0e2a\u0e07\u0e27\u0e19",
            "lastname_th": "\u0e1a\u0e38\u0e0d\u0e2b\u0e19\u0e34",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTB "
        },
        {
            "id": 204,
            "firstname_en": "Sanicha",
            "lastname_en": "Chanlap",
            "firstname_th": "\u0e28\u0e13\u0e34\u0e0a\u0e32",
            "lastname_th": "\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c\u0e25\u0e32\u0e20",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BDB "
        },
        {
            "id": 453,
            "firstname_en": "Sarifat",
            "lastname_en": "Nisni",
            "firstname_th": "\u0e0b\u0e32\u0e23\u0e35\u0e1f\u0e31\u0e15",
            "lastname_th": "\u0e19\u0e34\u0e2a\u0e19\u0e34",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ASP "
        },
        {
            "id": 539,
            "firstname_en": "Sarinee",
            "lastname_en": "Lohek",
            "firstname_th": "\u0e01\u0e39\u0e0b\u0e32\u0e23\u0e34\u0e19\u0e35",
            "lastname_th": "\u0e25\u0e2d\u0e40\u0e2e\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "WMY "
        },
        {
            "id": 455,
            "firstname_en": "Sarining",
            "lastname_en": "Cheyapa",
            "firstname_th": "\u0e2a\u0e32\u0e23\u0e35\u0e19\u0e34\u0e07",
            "lastname_th": "\u0e40\u0e08\u0e30\u0e22\u0e30\u0e1b\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ASP "
        },
        {
            "id": 266,
            "firstname_en": "Sarinya",
            "lastname_en": "Pramnak",
            "firstname_th": "\u0e2a\u0e23\u0e34\u0e19\u0e22\u0e32",
            "lastname_th": "\u0e1e\u0e23\u0e32\u0e2b\u0e21\u0e13\u0e4c\u0e19\u0e32\u0e04",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTG "
        },
        {
            "id": 378,
            "firstname_en": "Sarinya ",
            "lastname_en": "Manoondawee",
            "firstname_th": "\u0e28\u0e23\u0e34\u0e0d\u0e0d\u0e32 ",
            "lastname_th": "\u0e21\u0e19\u0e39\u0e0d\u0e14\u0e32\u0e2b\u0e27\u0e35",
            "type": "Local",
            "status": "Disabled",
            "school_code": "WRS "
        },
        {
            "id": 837,
            "firstname_en": "Sarunchanok",
            "lastname_en": "Odton",
            "firstname_th": "\u0e28\u0e23\u0e31\u0e13\u0e22\u0e4c\u0e0a\u0e19\u0e01",
            "lastname_th": "\u0e2d\u0e14\u0e17\u0e19",
            "type": "Local",
            "status": "Enabled",
            "school_code": "HSS "
        },
        {
            "id": 341,
            "firstname_en": "Sarunya",
            "lastname_en": "Chalurmpanpaiboon",
            "firstname_th": "\u0e28\u0e23\u0e31\u0e0d\u0e0d\u0e32",
            "lastname_th": "\u0e40\u0e09\u0e25\u0e34\u0e21\u0e1e\u0e31\u0e19\u0e18\u0e4c\u0e44\u0e1e\u0e1a\u0e39\u0e25\u0e22\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BDB "
        },
        {
            "id": 609,
            "firstname_en": "Sarut",
            "lastname_en": "Hakosee (SMP)",
            "firstname_th": "\u0e28\u0e23\u0e38\u0e12\u0e34",
            "lastname_th": "\u0e2b\u0e32\u0e42\u0e01\u0e2a\u0e35\u0e22\u0e4c (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 317,
            "firstname_en": "Sasiwimon",
            "lastname_en": "Rattanabutra",
            "firstname_th": "\u0e28\u0e28\u0e34\u0e27\u0e34\u0e21\u0e25",
            "lastname_th": "\u0e23\u0e31\u0e15\u0e19\u0e1a\u0e38\u0e15\u0e23",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LMR "
        },
        {
            "id": 544,
            "firstname_en": "Sathiradaporn",
            "lastname_en": "Nittayawan",
            "firstname_th": "\u0e2a\u0e16\u0e34\u0e23\u0e14\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e19\u0e34\u0e15\u0e22\u0e27\u0e31\u0e19",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BNY "
        },
        {
            "id": 546,
            "firstname_en": "Sathiradaporn",
            "lastname_en": "Nittayawan (BNO)",
            "firstname_th": "\u0e2a\u0e16\u0e34\u0e23\u0e14\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e19\u0e34\u0e15\u0e22\u0e27\u0e31\u0e19 (BNO)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BNO "
        },
        {
            "id": 404,
            "firstname_en": "Satriya",
            "lastname_en": "Mada-hu",
            "firstname_th": "\u0e2a\u0e15\u0e23\u0e35\u0e22\u0e32",
            "lastname_th": "\u0e21\u0e30\u0e14\u0e32\u0e2e\u0e39",
            "type": "Local",
            "status": "Enabled",
            "school_code": "GKT "
        },
        {
            "id": 252,
            "firstname_en": "Scott",
            "lastname_en": "Johnson",
            "firstname_th": "Scott",
            "lastname_th": "Johnson",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 832,
            "firstname_en": "Shaneel",
            "lastname_en": "Jairam",
            "firstname_th": "Shaneel",
            "lastname_th": "Jairam",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 848,
            "firstname_en": "Siegrid",
            "lastname_en": "Tejeno (CWN)",
            "firstname_th": "Siegrid",
            "lastname_th": "Tejeno (CWN)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CWN "
        },
        {
            "id": 815,
            "firstname_en": "Simon",
            "lastname_en": "Hulton-Smith",
            "firstname_th": "Simon",
            "lastname_th": "Hulton-Smith",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 460,
            "firstname_en": "Sirigon",
            "lastname_en": "Sookkaew",
            "firstname_th": "\u0e2a\u0e34\u0e23\u0e34\u0e01\u0e23",
            "lastname_th": "\u0e2a\u0e38\u0e02\u0e41\u0e01\u0e49\u0e27",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BDB "
        },
        {
            "id": 442,
            "firstname_en": "Sirikarn",
            "lastname_en": "Bhornpanarut",
            "firstname_th": "Sirikarn",
            "lastname_th": "Bhornpanarut",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 891,
            "firstname_en": "Siriluk",
            "lastname_en": "Ceathang",
            "firstname_th": "Siriluk",
            "lastname_th": "Ceathang",
            "type": "Local",
            "status": "Enabled",
            "school_code": "DHM "
        },
        {
            "id": 199,
            "firstname_en": "Sirin",
            "lastname_en": "Watthanavikrai",
            "firstname_th": "\u0e28\u0e34\u0e23\u0e34\u0e19\u0e17\u0e23\u0e4c",
            "lastname_th": "\u0e27\u0e31\u0e18\u0e19\u0e30\u0e27\u0e34\u0e44\u0e01\u0e23",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 807,
            "firstname_en": "Siriwan",
            "lastname_en": "Lueampui",
            "firstname_th": "\u0e28\u0e34\u0e23\u0e34\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e40\u0e2b\u0e25\u0e37\u0e2d\u0e21\u0e1b\u0e38\u0e22",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BSM "
        },
        {
            "id": 776,
            "firstname_en": "Skao",
            "lastname_en": "Nontor",
            "firstname_th": "\u0e2a\u0e01\u0e32\u0e27",
            "lastname_th": "\u0e19\u0e19\u0e17\u0e2d",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 287,
            "firstname_en": "Skuyler",
            "lastname_en": "Van Fossan",
            "firstname_th": "Skuyler",
            "lastname_th": "Van Fossan",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 462,
            "firstname_en": "Somchai",
            "lastname_en": "Obrom",
            "firstname_th": "Somchai",
            "lastname_th": "Obrom",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 798,
            "firstname_en": "Somchit",
            "lastname_en": "Jehmong",
            "firstname_th": "\u0e2a\u0e21\u0e08\u0e34\u0e15",
            "lastname_th": "\u0e40\u0e08\u0e4a\u0e30\u0e42\u0e21\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": "TPR "
        },
        {
            "id": 276,
            "firstname_en": "Somjate",
            "lastname_en": "Buasakool",
            "firstname_th": "\u0e2a\u0e21\u0e40\u0e08\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e1a\u0e31\u0e27\u0e2a\u0e01\u0e38\u0e25",
            "type": "Local",
            "status": "Disabled",
            "school_code": "JVS "
        },
        {
            "id": 529,
            "firstname_en": "Somjit",
            "lastname_en": "Aunta",
            "firstname_th": "\u0e2a\u0e21\u0e08\u0e34\u0e15",
            "lastname_th": "\u0e2d\u0e38\u0e48\u0e19\u0e15\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BNO "
        },
        {
            "id": 503,
            "firstname_en": "Somprasong",
            "lastname_en": "Sirithanyaboon",
            "firstname_th": "\u0e2a\u0e21\u0e1b\u0e23\u0e30\u0e2a\u0e07\u0e04\u0e4c",
            "lastname_th": "\u0e28\u0e34\u0e23\u0e34\u0e18\u0e31\u0e19\u0e0d\u0e1a\u0e39\u0e23\u0e13\u0e4c",
            "type": "Local",
            "status": "Disabled",
            "school_code": "HSS "
        },
        {
            "id": 365,
            "firstname_en": "Sopee",
            "lastname_en": "Jehsohoh",
            "firstname_th": "\u0e42\u0e2a\u0e20\u0e35",
            "lastname_th": "\u0e40\u0e08\u0e4a\u0e30\u0e2a\u0e2d\u0e40\u0e2b\u0e32\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BPM "
        },
        {
            "id": 298,
            "firstname_en": "Sophie",
            "lastname_en": "Mottet",
            "firstname_th": "Sophie",
            "lastname_th": "Mottet",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 218,
            "firstname_en": "Sophit",
            "lastname_en": "Homrot",
            "firstname_th": "\u0e42\u0e2a\u0e1e\u0e34\u0e28",
            "lastname_th": "\u0e2b\u0e2d\u0e21\u0e23\u0e2a",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BWM "
        },
        {
            "id": 400,
            "firstname_en": "Soraya",
            "lastname_en": "Mada-u",
            "firstname_th": "\u0e42\u0e2a\u0e23\u0e22\u0e32",
            "lastname_th": "\u0e21\u0e30\u0e14\u0e32\u0e2d\u0e39",
            "type": "Local",
            "status": "Enabled",
            "school_code": "GHL "
        },
        {
            "id": 593,
            "firstname_en": "Sriprapa",
            "lastname_en": "Vonglacon (SWM)",
            "firstname_th": "\u0e28\u0e23\u0e35\u0e1b\u0e23\u0e30\u0e20\u0e32",
            "lastname_th": "\u0e27\u0e07\u0e28\u0e4c\u0e25\u0e30\u0e04\u0e23 (SWM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SWM "
        },
        {
            "id": 602,
            "firstname_en": "Suchada",
            "lastname_en": "Deemuan (SMP)",
            "firstname_th": "\u0e2a\u0e38\u0e0a\u0e32\u0e14\u0e32",
            "lastname_th": "\u0e14\u0e35\u0e40\u0e2b\u0e21\u0e37\u0e2d\u0e19 (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 285,
            "firstname_en": "Suchada",
            "lastname_en": "Jarong",
            "firstname_th": "\u0e2a\u0e38\u0e0a\u0e32\u0e14\u0e32",
            "lastname_th": "\u0e08\u0e32\u0e23\u0e07\u0e04\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTN "
        },
        {
            "id": 215,
            "firstname_en": "Sudarat",
            "lastname_en": "Nilapong",
            "firstname_th": "\u0e2a\u0e38\u0e14\u0e32\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e19\u0e34\u0e25\u0e1e\u0e07\u0e29\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 613,
            "firstname_en": "Sue",
            "lastname_en": "Hughes",
            "firstname_th": "Sue",
            "lastname_th": "Hughes",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 495,
            "firstname_en": "Sujingtana",
            "lastname_en": "Chaiyah",
            "firstname_th": "\u0e2a\u0e38\u0e08\u0e23\u0e34\u0e07\u0e15\u0e19\u0e32",
            "lastname_th": "\u0e0a\u0e31\u0e22\u0e22\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PSF "
        },
        {
            "id": 331,
            "firstname_en": "Sukanya",
            "lastname_en": "Intarasaen",
            "firstname_th": "\u0e2a\u0e38\u0e01\u0e31\u0e0d\u0e0d\u0e32  ",
            "lastname_th": "\u0e2d\u0e34\u0e19\u0e17\u0e23\u0e41\u0e2a\u0e19",
            "type": "Local",
            "status": "Enabled",
            "school_code": "JWC "
        },
        {
            "id": 781,
            "firstname_en": "Sukrit",
            "lastname_en": "Prueksawan",
            "firstname_th": "\u0e2a\u0e38\u0e01\u0e24\u0e29\u0e0f\u0e34\u0e4c",
            "lastname_th": "\u0e1e\u0e24\u0e01\u0e29\u0e30\u0e27\u0e31\u0e19",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 820,
            "firstname_en": "Sukunchanat",
            "lastname_en": "Chawiengwad",
            "firstname_th": "\u0e28\u0e38\u0e01\u0e38\u0e19\u0e0c\u0e19\u0e32\u0e0f",
            "lastname_th": "\u0e40\u0e09\u0e27\u0e35\u0e22\u0e07\u0e27\u0e32\u0e2a",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTN "
        },
        {
            "id": 277,
            "firstname_en": "Sukunya",
            "lastname_en": "Kumrueng",
            "firstname_th": "\u0e2a\u0e38\u0e01\u0e31\u0e0d\u0e0d\u0e32",
            "lastname_th": "\u0e04\u0e38\u0e49\u0e21\u0e40\u0e23\u0e37\u0e2d\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": "JVS "
        },
        {
            "id": 591,
            "firstname_en": "Suliwan",
            "lastname_en": "Phosri (SWM)",
            "firstname_th": "\u0e2a\u0e38\u0e25\u0e34\u0e27\u0e31\u0e25\u0e22\u0e4c",
            "lastname_th": "\u0e42\u0e1e\u0e18\u0e34\u0e4c\u0e28\u0e23\u0e35 (SWM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SWM "
        },
        {
            "id": 307,
            "firstname_en": "Sulkiflee",
            "lastname_en": "Dilohsae",
            "firstname_th": "\u0e0b\u0e38\u0e25\u0e01\u0e34\u0e1f\u0e25\u0e35",
            "lastname_th": "\u0e14\u0e2d\u0e40\u0e25\u0e4a\u0e32\u0e30\u0e41\u0e0b",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 433,
            "firstname_en": "Sumet",
            "lastname_en": "Laorsrisakulchai",
            "firstname_th": "Sumet",
            "lastname_th": "Laorsrisakulchai",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 770,
            "firstname_en": "Sumitta",
            "lastname_en": "Yuwathananon",
            "firstname_th": "\u0e2a\u0e38\u0e21\u0e34\u0e15\u0e15\u0e32",
            "lastname_th": "\u0e22\u0e38\u0e27\u0e18\u0e19\u0e32\u0e19\u0e19\u0e17\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BMT "
        },
        {
            "id": 211,
            "firstname_en": "Sunirat",
            "lastname_en": "Agawatayajarn",
            "firstname_th": "\u0e2a\u0e38\u0e13\u0e35\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e40\u0e2d\u0e01\u0e27\u0e32\u0e17\u0e22\u0e32\u0e08\u0e32\u0e23\u0e22\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 608,
            "firstname_en": "Sunisa",
            "lastname_en": "Yingngam (SMP)",
            "firstname_th": "\u0e2a\u0e38\u0e19\u0e34\u0e2a\u0e32",
            "lastname_th": "\u0e22\u0e34\u0e48\u0e07\u0e07\u0e32\u0e21 (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 467,
            "firstname_en": "Supadee",
            "lastname_en": "Promthongdee",
            "firstname_th": "\u0e2a\u0e38\u0e20\u0e32\u0e14\u0e35",
            "lastname_th": "\u0e1e\u0e23\u0e21\u0e17\u0e2d\u0e07\u0e14\u0e35",
            "type": "Local",
            "status": "Enabled",
            "school_code": "RAP "
        },
        {
            "id": 537,
            "firstname_en": "Supaluksana",
            "lastname_en": "Srikong",
            "firstname_th": "\u0e28\u0e38\u0e20\u0e25\u0e31\u0e01\u0e29\u0e13\u0e32",
            "lastname_th": "\u0e28\u0e23\u0e35\u0e04\u0e07",
            "type": "Local",
            "status": "Disabled",
            "school_code": "WMY "
        },
        {
            "id": 333,
            "firstname_en": "Supanard",
            "lastname_en": "Pimngern",
            "firstname_th": "\u0e28\u0e38\u0e20\u0e19\u0e32\u0e0e ",
            "lastname_th": "\u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e40\u0e07\u0e34\u0e19",
            "type": "Local",
            "status": "Enabled",
            "school_code": "JCA "
        },
        {
            "id": 600,
            "firstname_en": "Supapor",
            "lastname_en": "Phipho (SMP)",
            "firstname_th": "\u0e2a\u0e38\u0e20\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e44\u0e1c\u0e42\u0e1e\u0e18\u0e34\u0e4c (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 459,
            "firstname_en": "Suparerk",
            "lastname_en": "Khamhang",
            "firstname_th": "\u0e28\u0e38\u0e20\u0e24\u0e01\u0e29\u0e4c",
            "lastname_th": "\u0e04\u0e33\u0e41\u0e2b\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "AKH "
        },
        {
            "id": 829,
            "firstname_en": "Supatida",
            "lastname_en": "Senket",
            "firstname_th": "\u0e28\u0e38\u0e20\u0e18\u0e34\u0e14\u0e32",
            "lastname_th": "\u0e40\u0e2a\u0e19\u0e40\u0e01\u0e15\u0e38",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BWK "
        },
        {
            "id": 763,
            "firstname_en": "Suphitcha",
            "lastname_en": "Dumrongkul",
            "firstname_th": "\u0e2a\u0e38\u0e1e\u0e34\u0e0a\u0e0c\u0e32\u0e22\u0e4c",
            "lastname_th": "\u0e14\u0e33\u0e23\u0e07\u0e01\u0e39\u0e25",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BYH "
        },
        {
            "id": 755,
            "firstname_en": "Supitcha",
            "lastname_en": "Leejaturong",
            "firstname_th": "\u0e2a\u0e38\u0e1e\u0e34\u0e0a\u0e0c\u0e32\u0e22\u0e4c",
            "lastname_th": "\u0e25\u0e35\u0e49\u0e08\u0e32\u0e15\u0e38\u0e23\u0e07\u0e04\u0e4c",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 771,
            "firstname_en": "Suradet",
            "lastname_en": "Yuwathananon",
            "firstname_th": "\u0e2a\u0e38\u0e23\u0e40\u0e14\u0e0a",
            "lastname_th": "\u0e22\u0e38\u0e27\u0e18\u0e19\u0e32\u0e19\u0e19\u0e17\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BMT "
        },
        {
            "id": 383,
            "firstname_en": "Surarat ",
            "lastname_en": "Chodveeraphat",
            "firstname_th": "\u0e2a\u0e38\u0e23\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e42\u0e0a\u0e15\u0e19\u0e4c\u0e27\u0e35\u0e23\u0e20\u0e31\u0e17\u0e23",
            "type": "Local",
            "status": "Enabled",
            "school_code": "DBB "
        },
        {
            "id": 267,
            "firstname_en": "Suravit",
            "lastname_en": "Duang-in",
            "firstname_th": "\u0e2a\u0e38\u0e23\u0e27\u0e34\u0e0a",
            "lastname_th": "\u0e14\u0e49\u0e27\u0e07\u0e2d\u0e34\u0e19\u0e17\u0e23\u0e4c",
            "type": "Local",
            "status": "Disabled",
            "school_code": "WMY "
        },
        {
            "id": 794,
            "firstname_en": "Suriyatee",
            "lastname_en": "Arsakala",
            "firstname_th": "\u0e2a\u0e39\u0e23\u0e35\u0e22\u0e32\u0e15\u0e35",
            "lastname_th": "\u0e2d\u0e49\u0e32\u0e2a\u0e30\u0e01\u0e30\u0e25\u0e30",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BKT "
        },
        {
            "id": 386,
            "firstname_en": "Susama",
            "lastname_en": "Upara",
            "firstname_th": "\u0e2a\u0e38\u0e29\u0e21\u0e32",
            "lastname_th": "\u0e2d\u0e38\u0e1b\u0e23\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "JWS "
        },
        {
            "id": 466,
            "firstname_en": "Suthana",
            "lastname_en": "Jutangura",
            "firstname_th": "\u0e2a\u0e38\u0e18\u0e19\u0e32",
            "lastname_th": "\u0e08\u0e38\u0e11\u0e32\u0e07\u0e01\u0e39\u0e23",
            "type": "Local",
            "status": "Enabled",
            "school_code": "RAP "
        },
        {
            "id": 532,
            "firstname_en": "Sutthakarn",
            "lastname_en": "Suwanklad",
            "firstname_th": "\u0e2a\u0e38\u0e17\u0e18\u0e01\u0e32\u0e19\u0e15\u0e4c",
            "lastname_th": "\u0e2a\u0e38\u0e27\u0e23\u0e23\u0e13\u0e01\u0e25\u0e31\u0e14",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SAC "
        },
        {
            "id": 198,
            "firstname_en": "Sutthaya",
            "lastname_en": "Jittkum",
            "firstname_th": "\u0e2a\u0e38\u0e17\u0e18\u0e22\u0e32\u0e13",
            "lastname_th": "\u0e08\u0e34\u0e15\u0e15\u0e4c\u0e04\u0e33",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 475,
            "firstname_en": "Sutthilak",
            "lastname_en": "Bunnasit",
            "firstname_th": "\u0e2a\u0e38\u0e17\u0e18\u0e34\u0e25\u0e31\u0e01\u0e29\u0e13\u0e4c",
            "lastname_th": "\u0e1a\u0e23\u0e23\u0e13\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPR "
        },
        {
            "id": 512,
            "firstname_en": "Sutthilak",
            "lastname_en": "Bunnasit (SPO)",
            "firstname_th": "\u0e2a\u0e38\u0e17\u0e18\u0e34\u0e25\u0e31\u0e01\u0e29\u0e13\u0e4c",
            "lastname_th": "\u0e1a\u0e23\u0e23\u0e13\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c (SPO)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SPO "
        },
        {
            "id": 230,
            "firstname_en": "Suwaiba",
            "lastname_en": "Paware",
            "firstname_th": "\u0e2a\u0e38\u0e27\u0e31\u0e22\u0e1a\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e1b\u0e32\u0e41\u0e27",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 827,
            "firstname_en": "Suwaibah",
            "lastname_en": "Deemadee",
            "firstname_th": "\u0e2a\u0e38\u0e44\u0e27\u0e1a\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e14\u0e35\u0e21\u0e30\u0e14\u0e35",
            "type": "Local",
            "status": "Enabled",
            "school_code": "WRS "
        },
        {
            "id": 810,
            "firstname_en": "T.1",
            "lastname_en": "Test",
            "firstname_th": "T.1",
            "lastname_th": "Test",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 811,
            "firstname_en": "T.2",
            "lastname_en": "Test",
            "firstname_th": "T.2",
            "lastname_th": "Test",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 812,
            "firstname_en": "T.3",
            "lastname_en": "Test",
            "firstname_th": "T.3",
            "lastname_th": "Test",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 813,
            "firstname_en": "T.4",
            "lastname_en": "Test",
            "firstname_th": "T.4",
            "lastname_th": "Test",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 814,
            "firstname_en": "T.5",
            "lastname_en": "Test",
            "firstname_th": "T.5",
            "lastname_th": "Test",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 573,
            "firstname_en": "T.A-esoh",
            "lastname_en": "Doloh (BTW)",
            "firstname_th": "\u0e2d\u0e32\u0e2d\u0e35\u0e40\u0e2a\u0e4a\u0e32\u0e30",
            "lastname_th": "\u0e14\u0e2d\u0e40\u0e25\u0e32\u0e30 (BTW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTW "
        },
        {
            "id": 562,
            "firstname_en": "T.Achiraya",
            "lastname_en": "Sae-chen (BNI)",
            "firstname_th": "\u0e2d\u0e0a\u0e34\u0e23\u0e0d\u0e32\u0e13\u0e4c",
            "lastname_th": "\u0e41\u0e0b\u0e48\u0e40\u0e0a\u0e48\u0e19 (BNI)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BNI "
        },
        {
            "id": 872,
            "firstname_en": "T.Adoon",
            "lastname_en": "Oubalee (EMC)",
            "firstname_th": "\u0e2d\u0e14\u0e38\u0e25\u0e22\u0e4c",
            "lastname_th": "\u0e2d\u0e38\u0e1a\u0e32\u0e25\u0e35 (EMC)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EMC "
        },
        {
            "id": 637,
            "firstname_en": "T.Ajjima",
            "lastname_en": "Kumthanom (CWN)",
            "firstname_th": "\u0e2d\u0e31\u0e08\u0e08\u0e34\u0e21\u0e32",
            "lastname_th": "\u0e04\u0e38\u0e49\u0e21\u0e16\u0e19\u0e2d\u0e21 (CWN)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CWN "
        },
        {
            "id": 765,
            "firstname_en": "T.Amanee",
            "lastname_en": "Taleh (BWM)",
            "firstname_th": "\u0e2d\u0e32\u0e21\u0e32\u0e13\u0e35\u0e22\u0e4c",
            "lastname_th": "\u0e15\u0e32\u0e40\u0e25\u0e30 (BWM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BWM "
        },
        {
            "id": 645,
            "firstname_en": "T.Ampon",
            "lastname_en": "Santawan (CMM)",
            "firstname_th": "\u0e2d\u0e31\u0e21\u0e1e\u0e23",
            "lastname_th": "\u0e2a\u0e31\u0e19\u0e15\u0e30\u0e27\u0e31\u0e19 (CMM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CMM "
        },
        {
            "id": 692,
            "firstname_en": "T.Anton",
            "lastname_en": "Lombard (CRP)",
            "firstname_th": "Anton",
            "lastname_th": "Lombard (CRP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CRP "
        },
        {
            "id": 728,
            "firstname_en": "T.Apisara",
            "lastname_en": "Mekchai (CSJ)",
            "firstname_th": "Apisara",
            "lastname_th": "Mekchai (CSJ)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CSJ "
        },
        {
            "id": 834,
            "firstname_en": "T.Areerat",
            "lastname_en": "E-wan (MLY)",
            "firstname_th": "\u0e2d\u0e32\u0e23\u0e35\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e2d\u0e35\u0e2b\u0e27\u0e31\u0e48\u0e19 (MLY)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "MLY "
        },
        {
            "id": 684,
            "firstname_en": "T.Ariyapon",
            "lastname_en": "Maneechan (ENS)",
            "firstname_th": "\u0e2d\u0e32\u0e23\u0e35\u0e22\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e21\u0e30\u0e13\u0e35\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c (ENS)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ENS "
        },
        {
            "id": 555,
            "firstname_en": "T.Armidoh",
            "lastname_en": "Mudor (BYH)",
            "firstname_th": "\u0e2d\u0e32\u0e21\u0e35\u0e40\u0e14\u0e4a\u0e32\u0e30",
            "lastname_th": "\u0e21\u0e39\u0e14\u0e2d (BYH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BYH "
        },
        {
            "id": 803,
            "firstname_en": "T.Benchawan",
            "lastname_en": "Mukkaew (BSM)",
            "firstname_th": "\u0e40\u0e1a\u0e0d\u0e08\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e21\u0e38\u0e02\u0e41\u0e01\u0e49\u0e27 (BSM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BSM "
        },
        {
            "id": 883,
            "firstname_en": "T.Boonmee",
            "lastname_en": "Patpolngam (CKS)",
            "firstname_th": "\u0e1a\u0e38\u0e0d\u0e21\u0e35",
            "lastname_th": "\u0e1b\u0e31\u0e14\u0e1e\u0e25\u0e07\u0e32\u0e21 (CKS)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CKS "
        },
        {
            "id": 691,
            "firstname_en": "T.Calis",
            "lastname_en": "Agtulao (CRP)",
            "firstname_th": "Calis",
            "lastname_th": "Agtulao (CRP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CRP "
        },
        {
            "id": 867,
            "firstname_en": "T.Chaniga",
            "lastname_en": "Kuntawong (CBN)",
            "firstname_th": "\u0e0a\u0e19\u0e34\u0e01\u0e32",
            "lastname_th": "\u0e01\u0e31\u0e19\u0e17\u0e30\u0e27\u0e07\u0e28\u0e4c (CBN)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CBN "
        },
        {
            "id": 907,
            "firstname_en": "T.Chanissara",
            "lastname_en": "Pandika (UKP)",
            "firstname_th": "\u0e0a\u0e19\u0e34\u0e2a\u0e23\u0e32",
            "lastname_th": "\u0e1b\u0e31\u0e19\u0e14\u0e34\u0e01\u0e32 (UKP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "UKP "
        },
        {
            "id": 843,
            "firstname_en": "T.Chanpiroon",
            "lastname_en": "Mahahing (ENS)",
            "firstname_th": "\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c\u0e1e\u0e34\u0e23\u0e38\u0e13",
            "lastname_th": "\u0e21\u0e2b\u0e32\u0e2b\u0e34\u0e07\u0e2a\u0e4c (ENS)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ENS "
        },
        {
            "id": 666,
            "firstname_en": "T.Chanya",
            "lastname_en": "Senakham (EPB)",
            "firstname_th": "\u0e08\u0e23\u0e23\u0e22\u0e32",
            "lastname_th": "\u0e40\u0e2a\u0e19\u0e32\u0e04\u0e33 (EPB)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EPB "
        },
        {
            "id": 690,
            "firstname_en": "T.Charintip",
            "lastname_en": "Thongsuk (CRP)",
            "firstname_th": "\u0e0a\u0e23\u0e34\u0e19\u0e17\u0e34\u0e1e\u0e22\u0e4c",
            "lastname_th": "\u0e17\u0e2d\u0e07\u0e2a\u0e38\u0e02 (CRP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CRP "
        },
        {
            "id": 881,
            "firstname_en": "T.Chidapha",
            "lastname_en": "Sukprasert (EPT)",
            "firstname_th": "\u0e08\u0e34\u0e14\u0e32\u0e20\u0e32",
            "lastname_th": "\u0e2a\u0e38\u0e02\u0e1b\u0e23\u0e30\u0e40\u0e2a\u0e23\u0e34\u0e10 (EPT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EPT "
        },
        {
            "id": 744,
            "firstname_en": "T.Chirawan",
            "lastname_en": "Wongchalad (ESS)",
            "firstname_th": "\u0e08\u0e35\u0e23\u0e30\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e27\u0e07\u0e28\u0e4c\u0e09\u0e25\u0e32\u0e14 (ESS)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ESS "
        },
        {
            "id": 819,
            "firstname_en": "T.Chutamath",
            "lastname_en": "Thepchan (BSM)",
            "firstname_th": "\u0e08\u0e38\u0e11\u0e32\u0e21\u0e32\u0e28",
            "lastname_th": "\u0e40\u0e17\u0e1e\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c (BSM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BSM "
        },
        {
            "id": 846,
            "firstname_en": "T.Dutsanee",
            "lastname_en": "Suksing (CNC)",
            "firstname_th": "\u0e14\u0e38\u0e29\u0e13\u0e35",
            "lastname_th": "\u0e2a\u0e38\u0e02\u0e2a\u0e34\u0e07\u0e2b\u0e4c (CNC)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CNC "
        },
        {
            "id": 779,
            "firstname_en": "T.Ekkasak",
            "lastname_en": "Seethim (BNO)",
            "firstname_th": "\u0e40\u0e2d\u0e01\u0e28\u0e31\u0e01\u0e14\u0e34\u0e4c",
            "lastname_th": "\u0e2a\u0e35\u0e17\u0e34\u0e21 (BNO)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BNO "
        },
        {
            "id": 762,
            "firstname_en": "T.Ekkasak",
            "lastname_en": "Seethim (BNY)",
            "firstname_th": "\u0e40\u0e2d\u0e01\u0e28\u0e31\u0e01\u0e14\u0e34\u0e4c",
            "lastname_th": "\u0e2a\u0e35\u0e17\u0e34\u0e21 (BNY)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BNY "
        },
        {
            "id": 901,
            "firstname_en": "T.Fadila",
            "lastname_en": "Mastan (UKD)",
            "firstname_th": "\u0e1f\u0e32\u0e14\u0e35\u0e25\u0e48\u0e32",
            "lastname_th": "\u0e21\u0e31\u0e2a\u0e15\u0e31\u0e19 (UKD)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "UKD "
        },
        {
            "id": 857,
            "firstname_en": "T.Gloryyerong",
            "lastname_en": "Lakah (EMS)",
            "firstname_th": "\u0e01\u0e25\u0e2d\u0e23\u0e35\u0e48 \u0e40\u0e22\u0e2d\u0e23\u0e2d\u0e07",
            "lastname_th": "\u0e25\u0e32\u0e04\u0e48\u0e32 (EMS)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EMS "
        },
        {
            "id": 861,
            "firstname_en": "T.Hamdiyah",
            "lastname_en": "Kahong (SAT)",
            "firstname_th": "\u0e2e\u0e31\u0e21\u0e14\u0e35\u0e22\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e01\u0e32\u0e42\u0e2e\u0e07 (SAT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SAT "
        },
        {
            "id": 559,
            "firstname_en": "T.Intukarn",
            "lastname_en": "Maneerat (BYH)",
            "firstname_th": "\u0e2d\u0e34\u0e19\u0e11\u0e38\u0e01\u0e32\u0e19\u0e15\u0e4c",
            "lastname_th": "\u0e21\u0e13\u0e35\u0e23\u0e31\u0e15\u0e19\u0e4c (BYH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BYH "
        },
        {
            "id": 806,
            "firstname_en": "T.Irfan",
            "lastname_en": "Maroding (BSM)",
            "firstname_th": "\u0e2d\u0e34\u0e23\u0e1f\u0e32\u0e19\u0e23\u0e4c",
            "lastname_th": "\u0e21\u0e30\u0e23\u0e2d\u0e14\u0e34\u0e07 (BSM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BSM "
        },
        {
            "id": 903,
            "firstname_en": "T.Isma-an",
            "lastname_en": "Labaiji (UKP)",
            "firstname_th": "\u0e2d\u0e34\u0e2a\u0e21\u0e32\u0e41\u0e2d\u0e19",
            "lastname_th": "\u0e25\u0e30\u0e43\u0e1a\u0e08\u0e34 (UKP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "UKP "
        },
        {
            "id": 643,
            "firstname_en": "T.Jaruwan",
            "lastname_en": "Prasit (CTP)",
            "firstname_th": "\u0e08\u0e32\u0e23\u0e38\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e1b\u0e23\u0e30\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c (CTP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CTP "
        },
        {
            "id": 652,
            "firstname_en": "T.Jiraphorn",
            "lastname_en": "Jarnpanya (CBL)",
            "firstname_th": "\u0e08\u0e34\u0e23\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e08\u0e32\u0e23\u0e22\u0e4c\u0e1b\u0e31\u0e0d\u0e0d\u0e32 (CBL)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CBL "
        },
        {
            "id": 689,
            "firstname_en": "T.Jiraporn",
            "lastname_en": "Atsawanantakan (CRP)",
            "firstname_th": "\u0e08\u0e34\u0e23\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e2d\u0e31\u0e28\u0e27\u0e19\u0e31\u0e19\u0e17\u0e01\u0e32\u0e23 (CRP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CRP "
        },
        {
            "id": 875,
            "firstname_en": "T.Kamonchanok",
            "lastname_en": "Wisutthiarporn (CNC)",
            "firstname_th": "\u0e01\u0e21\u0e25\u0e0a\u0e19\u0e01",
            "lastname_th": "\u0e27\u0e34\u0e2a\u0e38\u0e17\u0e18\u0e34\u0e2d\u0e32\u0e20\u0e23\u0e13\u0e4c (CNC)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CNC "
        },
        {
            "id": 871,
            "firstname_en": "T.Kamonwan",
            "lastname_en": "Yanajit (CRL)",
            "firstname_th": "\u0e01\u0e21\u0e25\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e22\u0e32\u0e19\u0e30\u0e08\u0e34\u0e15 (CRL)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CRL "
        },
        {
            "id": 664,
            "firstname_en": "T.Kanchanaporn",
            "lastname_en": "Singhapan (CBP)",
            "firstname_th": "\u0e01\u0e32\u0e0d\u0e08\u0e19\u0e20\u0e23\u0e13\u0e4c",
            "lastname_th": "\u0e2a\u0e34\u0e07\u0e2b\u0e1e\u0e31\u0e19\u0e18\u0e38\u0e4c (CBP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CBP "
        },
        {
            "id": 722,
            "firstname_en": "T.Kanchanaporn",
            "lastname_en": "Worrarak (EBM)",
            "firstname_th": "\u0e01\u0e32\u0e0d\u0e08\u0e19\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e27\u0e23\u0e23\u0e31\u0e01\u0e29\u0e4c (EBM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EBM "
        },
        {
            "id": 707,
            "firstname_en": "T.Kanda",
            "lastname_en": "Bopthong (FSP)",
            "firstname_th": "\u0e01\u0e32\u0e19\u0e14\u0e32",
            "lastname_th": "\u0e42\u0e1a\u0e1a\u0e17\u0e2d\u0e07 (FSP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FSP "
        },
        {
            "id": 672,
            "firstname_en": "T.Kanokporn",
            "lastname_en": "Chaichoowit (EPT)",
            "firstname_th": "\u0e01\u0e19\u0e01\u0e1e\u0e23",
            "lastname_th": "\u0e0a\u0e31\u0e22\u0e0a\u0e39\u0e27\u0e34\u0e17\u0e22\u0e4c (EPT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EPT "
        },
        {
            "id": 748,
            "firstname_en": "T.Kanokwan",
            "lastname_en": "Jaidee (FPW)",
            "firstname_th": "\u0e01\u0e19\u0e01\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e43\u0e08\u0e14\u0e35 (FPW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FPW "
        },
        {
            "id": 732,
            "firstname_en": "T.Kanokwan",
            "lastname_en": "Sirilert (CBM)",
            "firstname_th": "\u0e01\u0e19\u0e01\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e28\u0e34\u0e23\u0e34\u0e40\u0e25\u0e34\u0e28 (CBM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CBM "
        },
        {
            "id": 718,
            "firstname_en": "T.Kantapong",
            "lastname_en": "Sangstamp (FMK)",
            "firstname_th": "\u0e01\u0e31\u0e19\u0e15\u0e1e\u0e07\u0e28\u0e4c",
            "lastname_th": "\u0e2a\u0e31\u0e07\u0e41\u0e2a\u0e15\u0e21\u0e1b\u0e4c (FMK)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FMK "
        },
        {
            "id": 565,
            "firstname_en": "T.Kanthima",
            "lastname_en": "Akeh (BYY)",
            "firstname_th": "\u0e01\u0e31\u0e19\u0e17\u0e34\u0e21\u0e32",
            "lastname_th": "\u0e2d\u0e32\u0e40\u0e01\u0e4a\u0e30 (BYY)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BYY "
        },
        {
            "id": 575,
            "firstname_en": "T.Kareeman",
            "lastname_en": "Muda (BSK)",
            "firstname_th": "\u0e01\u0e32\u0e23\u0e35\u0e21\u0e31\u0e19",
            "lastname_th": "\u0e21\u0e39\u0e14\u0e2d (BSK)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BSK "
        },
        {
            "id": 669,
            "firstname_en": "T.Kornkanok",
            "lastname_en": "Buntao (EWW)",
            "firstname_th": "\u0e01\u0e23\u0e01\u0e19\u0e01",
            "lastname_th": "\u0e1a\u0e23\u0e23\u0e40\u0e17\u0e32 (EWW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EWW "
        },
        {
            "id": 727,
            "firstname_en": "T.Krongjit",
            "lastname_en": "Duangkaew (CSJ)",
            "firstname_th": "Krongjit",
            "lastname_th": "Duangkaew (CSJ)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CSJ "
        },
        {
            "id": 879,
            "firstname_en": "T.Kusaman",
            "lastname_en": "Suepsunthon (CCB)",
            "firstname_th": "\u0e01\u0e38\u0e2a\u0e38\u0e21\u0e32\u0e25\u0e22\u0e4c",
            "lastname_th": "\u0e2a\u0e37\u0e1a\u0e2a\u0e38\u0e19\u0e17\u0e23 (CCB)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CCB "
        },
        {
            "id": 719,
            "firstname_en": "T.Local",
            "lastname_en": "Teacher (EBW)",
            "firstname_th": "Local",
            "lastname_th": "Teacher (EBW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EBW "
        },
        {
            "id": 713,
            "firstname_en": "T.Local",
            "lastname_en": "Teacher (ENK)",
            "firstname_th": "Local",
            "lastname_th": "Teacher (ENK)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ENK "
        },
        {
            "id": 928,
            "firstname_en": "T.Maimunah",
            "lastname_en": "Leemadai (YBT)",
            "firstname_th": "\u0e44\u0e21\u0e21\u0e39\u0e40\u0e19\u0e4a\u0e32\u0e30",
            "lastname_th": "\u0e25\u0e35\u0e21\u0e32\u0e14\u0e32\u0e2d\u0e34 (YBT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "YBT "
        },
        {
            "id": 558,
            "firstname_en": "T.Mareeyae",
            "lastname_en": "Wasoh (BYH)",
            "firstname_th": "\u0e21\u0e32\u0e23\u0e35\u0e41\u0e22",
            "lastname_th": "\u0e27\u0e32\u0e42\u0e0b\u0e30 (BYH)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BYH "
        },
        {
            "id": 678,
            "firstname_en": "T.Mayuree",
            "lastname_en": "Nounking (ESW)",
            "firstname_th": "\u0e21\u0e22\u0e38\u0e23\u0e35",
            "lastname_th": "\u0e19\u0e27\u0e25\u0e01\u0e34\u0e48\u0e07 (ESW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ESW "
        },
        {
            "id": 898,
            "firstname_en": "T.Meena",
            "lastname_en": "Nua-on (UBL)",
            "firstname_th": "\u0e21\u0e35\u0e19\u0e32",
            "lastname_th": "\u0e40\u0e19\u0e37\u0e49\u0e2d\u0e2d\u0e48\u0e2d\u0e19 (UBL)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "UBL "
        },
        {
            "id": 726,
            "firstname_en": "T.Michada",
            "lastname_en": "Hayman (CWS)",
            "firstname_th": "\u0e21\u0e34\u0e0a\u0e14\u0e32",
            "lastname_th": "\u0e40\u0e2b\u0e21\u0e31\u0e19\u0e15\u0e4c (CWS)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CWS "
        },
        {
            "id": 856,
            "firstname_en": "T.Millan",
            "lastname_en": "Taragon (EMS)",
            "firstname_th": "\u0e21\u0e34\u0e25\u0e31\u0e19",
            "lastname_th": "\u0e17\u0e32\u0e23\u0e32\u0e01\u0e2d\u0e19 (EMS)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EMS "
        },
        {
            "id": 574,
            "firstname_en": "T.Muhammadfadel",
            "lastname_en": "Hayeesatare (BSK)",
            "firstname_th": "\u0e21\u0e39\u0e2e\u0e33\u0e2b\u0e21\u0e31\u0e14\u0e1f\u0e32\u0e40\u0e14\u0e25",
            "lastname_th": "\u0e2b\u0e30\u0e22\u0e35\u0e2a\u0e30\u0e41\u0e15\u0e23\u0e4c (BSK)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BSK "
        },
        {
            "id": 563,
            "firstname_en": "T.Muneeroh",
            "lastname_en": "Maming (BNI)",
            "firstname_th": "\u0e21\u0e39\u0e19\u0e35\u0e40\u0e23\u0e32\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e21\u0e30\u0e21\u0e34\u0e07 (BNI)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BNI "
        },
        {
            "id": 352,
            "firstname_en": "T.Nadilah",
            "lastname_en": "Doha (BHK)",
            "firstname_th": "\u0e19\u0e32\u0e14\u0e35\u0e25\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e14\u0e2d\u0e2e\u0e30 (BHK)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BHK "
        },
        {
            "id": 647,
            "firstname_en": "T.Nanthawan",
            "lastname_en": "T.Poogun",
            "firstname_th": "\u0e19\u0e31\u0e19\u0e17\u0e27\u0e31\u0e19",
            "lastname_th": "\u0e2a\u0e35\u0e21\u0e30\u0e40\u0e14\u0e37\u0e48\u0e2d (CBP)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "CBP "
        },
        {
            "id": 725,
            "firstname_en": "T.Narasha",
            "lastname_en": "Chotiya (ETW)",
            "firstname_th": "\u0e19\u0e32\u0e23\u0e32\u0e0a\u0e32",
            "lastname_th": "\u0e42\u0e0a\u0e15\u0e34\u0e22\u0e32 (ETW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ETW "
        },
        {
            "id": 705,
            "firstname_en": "T.Naree",
            "lastname_en": "Maneenat (ETH)",
            "firstname_th": "\u0e19\u0e32\u0e23\u0e35",
            "lastname_th": "\u0e21\u0e19\u0e35\u0e19\u0e32\u0e16 (ETH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ETH "
        },
        {
            "id": 927,
            "firstname_en": "T.Naseehah",
            "lastname_en": "Sulong (BHK)",
            "firstname_th": "\u0e19\u0e32\u0e0b\u0e35\u0e2e\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e2a\u0e38\u0e2b\u0e25\u0e07 (BHK)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BHK "
        },
        {
            "id": 679,
            "firstname_en": "T.Nattamon",
            "lastname_en": "Ritjaroon (ESW)",
            "firstname_th": "\u0e13\u0e31\u0e10\u0e21\u0e19",
            "lastname_th": "\u0e24\u0e17\u0e18\u0e34\u0e4c\u0e08\u0e23\u0e39\u0e0d (ESW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ESW "
        },
        {
            "id": 699,
            "firstname_en": "T.Nattaphon",
            "lastname_en": "Chuaybumrung (FNT)",
            "firstname_th": "\u0e13\u0e31\u0e0f\u0e1e\u0e23",
            "lastname_th": "\u0e0a\u0e48\u0e27\u0e22\u0e1a\u0e33\u0e23\u0e38\u0e07 (FNT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FNT "
        },
        {
            "id": 746,
            "firstname_en": "T.Natthakan",
            "lastname_en": "Koetcaheng (SKM)",
            "firstname_th": "\u0e13\u0e31\u0e10\u0e01\u0e32\u0e19\u0e15\u0e4c",
            "lastname_th": "\u0e40\u0e01\u0e34\u0e14\u0e41\u0e08\u0e49\u0e07 (SKM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKM "
        },
        {
            "id": 880,
            "firstname_en": "T.Natthaya",
            "lastname_en": "Janthapan (CCB)",
            "firstname_th": "\u0e13\u0e31\u0e10\u0e18\u0e22\u0e32",
            "lastname_th": "\u0e08\u0e31\u0e19\u0e17\u0e30\u0e1e\u0e31\u0e19\u0e18\u0e4c (CCB)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CCB "
        },
        {
            "id": 651,
            "firstname_en": "T.Nattrikarn",
            "lastname_en": "Pratoomwan (EHR)",
            "firstname_th": "\u0e13\u0e31\u0e0f\u0e11\u0e23\u0e34\u0e01\u0e32\u0e0d\u0e08\u0e19\u0e4c",
            "lastname_th": "\u0e1b\u0e23\u0e30\u0e17\u0e38\u0e21\u0e27\u0e31\u0e19 (EHR)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EHR "
        },
        {
            "id": 568,
            "firstname_en": "T.Nuramee",
            "lastname_en": "Cheloh (BYY)",
            "firstname_th": "\u0e19\u0e38\u0e23\u0e21\u0e35\u0e22\u0e4c",
            "lastname_th": "\u0e40\u0e08\u0e30\u0e40\u0e25\u0e32\u0e30 (BYY)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BYY "
        },
        {
            "id": 878,
            "firstname_en": "T.Nureehun",
            "lastname_en": "Daramae (WMY)",
            "firstname_th": "\u0e19\u0e39\u0e23\u0e35\u0e2e\u0e31\u0e19",
            "lastname_th": "\u0e14\u0e32\u0e23\u0e32\u0e41\u0e21 (WMY)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "WMY "
        },
        {
            "id": 553,
            "firstname_en": "T.Nureesang",
            "lastname_en": "Tuwee (BYH)",
            "firstname_th": "\u0e19\u0e39\u0e23\u0e35\u0e0b\u0e31\u0e07",
            "lastname_th": "\u0e15\u0e39\u0e2b\u0e27\u0e35 (BYH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BYH "
        },
        {
            "id": 804,
            "firstname_en": "T.Nursilawatee",
            "lastname_en": "Rakdee (BSM)",
            "firstname_th": "\u0e19\u0e39\u0e23\u0e0b\u0e35\u0e25\u0e32\u0e27\u0e32\u0e15\u0e35",
            "lastname_th": "\u0e23\u0e31\u0e01\u0e14\u0e35 (BSM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BSM "
        },
        {
            "id": 717,
            "firstname_en": "T.Nutcharee",
            "lastname_en": "Wattaen (FMK)",
            "firstname_th": "\u0e19\u0e38\u0e0a\u0e23\u0e35\u0e22\u0e4c",
            "lastname_th": "\u0e2b\u0e27\u0e31\u0e14\u0e41\u0e17\u0e48\u0e19 (FMK)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FMK "
        },
        {
            "id": 687,
            "firstname_en": "T.Nutthicha",
            "lastname_en": "Had-han (FBD)",
            "firstname_th": "\u0e19\u0e31\u0e10\u0e18\u0e34\u0e0a\u0e32",
            "lastname_th": "\u0e2d\u0e32\u0e08\u0e2b\u0e32\u0e0d (FBD)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FBD "
        },
        {
            "id": 557,
            "firstname_en": "T.Orawan",
            "lastname_en": "Paetya (BYH)",
            "firstname_th": "\u0e2d\u0e23\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e41\u0e1e\u0e17\u0e22\u0e32 (BYH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BYH "
        },
        {
            "id": 864,
            "firstname_en": "T.Ornanong",
            "lastname_en": "Yuenyong (EKB)",
            "firstname_th": "\u0e2d\u0e23\u0e2d\u0e19\u0e07\u0e04\u0e4c",
            "lastname_th": "\u0e22\u0e37\u0e19\u0e22\u0e07 (EKB)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EKB "
        },
        {
            "id": 646,
            "firstname_en": "T.Pakkinee",
            "lastname_en": "Singwong (CCT)",
            "firstname_th": "\u0e20\u0e31\u0e04\u0e04\u0e34\u0e19\u0e35",
            "lastname_th": "\u0e2a\u0e34\u0e07\u0e2b\u0e4c\u0e27\u0e07\u0e28\u0e4c (CCT)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "CCT "
        },
        {
            "id": 571,
            "firstname_en": "T.Panthida",
            "lastname_en": "Kaewsomang (WCT)",
            "firstname_th": "\u0e1e\u0e23\u0e23\u0e13\u0e18\u0e34\u0e14\u0e32",
            "lastname_th": "\u0e41\u0e01\u0e49\u0e27\u0e2a\u0e33\u0e2d\u0e32\u0e07\u0e04\u0e4c (WCT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "WCT "
        },
        {
            "id": 904,
            "firstname_en": "T.Panthipa",
            "lastname_en": "Temkaew (UTW)",
            "firstname_th": "\u0e1e\u0e31\u0e19\u0e17\u0e34\u0e1e\u0e32",
            "lastname_th": "\u0e40\u0e15\u0e47\u0e21\u0e41\u0e01\u0e49\u0e27 (UTW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "UTW "
        },
        {
            "id": 677,
            "firstname_en": "T.Parichart",
            "lastname_en": "Teerakul (ESW)",
            "firstname_th": "\u0e1b\u0e32\u0e23\u0e34\u0e0a\u0e32\u0e15\u0e34",
            "lastname_th": "\u0e18\u0e35\u0e23\u0e01\u0e38\u0e25 (ESW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ESW "
        },
        {
            "id": 850,
            "firstname_en": "T.Patchanon",
            "lastname_en": "Sornsiri (EBM)",
            "firstname_th": "\u0e20\u0e31\u0e17\u0e23\u0e0a\u0e19\u0e19",
            "lastname_th": "\u0e28\u0e23\u0e28\u0e34\u0e23\u0e34 (EBM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EBM "
        },
        {
            "id": 675,
            "firstname_en": "T.Patchara",
            "lastname_en": "Chunpo (ESW)",
            "firstname_th": "\u0e1e\u0e31\u0e0a\u0e23\u0e32",
            "lastname_th": "\u0e0a\u0e27\u0e19\u0e42\u0e1e\u0e18\u0e34\u0e4c (ESW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ESW "
        },
        {
            "id": 870,
            "firstname_en": "T.Patchaya",
            "lastname_en": "Chotinunchai (CRL)",
            "firstname_th": "\u0e1e\u0e31\u0e0a\u0e22\u0e32",
            "lastname_th": "\u0e42\u0e0a\u0e15\u0e34\u0e19\u0e19\u0e0a\u0e31\u0e22 (CRL)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CRL "
        },
        {
            "id": 709,
            "firstname_en": "T.Pattamaphorn",
            "lastname_en": "Kuanun (EBP)",
            "firstname_th": "\u0e1b\u0e31\u0e17\u0e21\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e40\u0e01\u0e37\u0e49\u0e2d\u0e2b\u0e19\u0e38\u0e19 (EBP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EBP "
        },
        {
            "id": 703,
            "firstname_en": "T.Paweena",
            "lastname_en": "Saisuk (ETH)",
            "firstname_th": "\u0e1b\u0e27\u0e35\u0e13\u0e32",
            "lastname_th": "\u0e2a\u0e32\u0e22\u0e2a\u0e38\u0e02 (ETH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ETH "
        },
        {
            "id": 560,
            "firstname_en": "T.Pawidee",
            "lastname_en": "Phengjan (BYH)",
            "firstname_th": "\u0e20\u0e32\u0e27\u0e34\u0e14\u0e35",
            "lastname_th": "\u0e40\u0e1e\u0e47\u0e07\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c (BYH)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BYH "
        },
        {
            "id": 842,
            "firstname_en": "T.Phattarasuda",
            "lastname_en": "Banjongpan (CUP)",
            "firstname_th": "\u0e20\u0e31\u0e17\u0e23\u0e2a\u0e38\u0e14\u0e32",
            "lastname_th": "\u0e1a\u0e23\u0e23\u0e08\u0e07\u0e1b\u0e31\u0e49\u0e19 (CUP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CUP "
        },
        {
            "id": 747,
            "firstname_en": "T.Phensiri",
            "lastname_en": "Rutshami (FDK)",
            "firstname_th": "\u0e40\u0e1e\u0e47\u0e0d\u0e28\u0e34\u0e23\u0e34",
            "lastname_th": "\u0e23\u0e31\u0e28\u0e21\u0e35 (FDK)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FDK "
        },
        {
            "id": 698,
            "firstname_en": "T.Pimjai",
            "lastname_en": "Phetrit (FKM)",
            "firstname_th": "\u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e43\u0e08",
            "lastname_th": "\u0e40\u0e1e\u0e0a\u0e23\u0e24\u0e17\u0e18\u0e34\u0e4c (FKM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FKM "
        },
        {
            "id": 752,
            "firstname_en": "T.Pinit",
            "lastname_en": "Kotama (ENK)",
            "firstname_th": "\u0e1e\u0e34\u0e19\u0e34\u0e08",
            "lastname_th": "\u0e42\u0e04\u0e15\u0e30\u0e21\u0e30 (ENK)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ENK "
        },
        {
            "id": 650,
            "firstname_en": "T.Pinsuda",
            "lastname_en": "Phosri (EHR)",
            "firstname_th": "\u0e1b\u0e34\u0e48\u0e19\u0e2a\u0e38\u0e14\u0e32",
            "lastname_th": "\u0e42\u0e1e\u0e18\u0e34\u0e4c\u0e28\u0e23\u0e35 (EHR)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EHR "
        },
        {
            "id": 845,
            "firstname_en": "T.Pitcha",
            "lastname_en": "Pengpong (CMW)",
            "firstname_th": "\u0e1e\u0e34\u0e0a\u0e0a\u0e32",
            "lastname_th": "\u0e40\u0e1e\u0e47\u0e07\u0e1e\u0e07\u0e29\u0e4c (CMW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CMW "
        },
        {
            "id": 900,
            "firstname_en": "T.Piyamas",
            "lastname_en": "Meenkadar (UKD)",
            "firstname_th": "\u0e1b\u0e34\u0e22\u0e30\u0e21\u0e32\u0e28",
            "lastname_th": "\u0e2b\u0e21\u0e35\u0e19\u0e01\u0e32\u0e14\u0e49\u0e32 (UKD)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "UKD "
        },
        {
            "id": 844,
            "firstname_en": "T.Piyapat",
            "lastname_en": "Prajongjut (CKS)",
            "firstname_th": "\u0e1b\u0e34\u0e22\u0e1e\u0e31\u0e0a\u0e23\u0e4c",
            "lastname_th": "\u0e1b\u0e23\u0e30\u0e08\u0e07\u0e08\u0e31\u0e14 (CKS)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CKS "
        },
        {
            "id": 688,
            "firstname_en": "T.Piyarat",
            "lastname_en": "Samlee (FBD)",
            "firstname_th": "\u0e1b\u0e34\u0e22\u0e30\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e2a\u0e33\u0e25\u0e35 (FBD)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FBD "
        },
        {
            "id": 694,
            "firstname_en": "T.Piyathida",
            "lastname_en": "Banthupa (CNK)",
            "firstname_th": "\u0e1b\u0e34\u0e22\u0e18\u0e34\u0e14\u0e32",
            "lastname_th": "\u0e1a\u0e31\u0e19\u0e17\u0e38\u0e1b\u0e32 (CNK)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CNK "
        },
        {
            "id": 578,
            "firstname_en": "T.Pojchanat",
            "lastname_en": "Chaothong (BWM)",
            "firstname_th": "\u0e1e\u0e08\u0e19\u0e32\u0e16",
            "lastname_th": "\u0e40\u0e0a\u0e32\u0e27\u0e19\u0e4c\u0e17\u0e2d\u0e07 (BWM)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BWM "
        },
        {
            "id": 636,
            "firstname_en": "T.Pongskorn",
            "lastname_en": "Puttima (CTB)",
            "firstname_th": "\u0e1e\u0e07\u0e28\u0e01\u0e23",
            "lastname_th": "\u0e1e\u0e38\u0e17\u0e18\u0e34\u0e21\u0e32 (CTB)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CTB "
        },
        {
            "id": 849,
            "firstname_en": "T.Prapapan",
            "lastname_en": "Huangsub (CWP)",
            "firstname_th": "\u0e1b\u0e23\u0e30\u0e20\u0e32\u0e1e\u0e23\u0e23\u0e13\u0e4c",
            "lastname_th": "\u0e2b\u0e49\u0e27\u0e07\u0e17\u0e23\u0e31\u0e1e\u0e22\u0e4c (CWP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CWP "
        },
        {
            "id": 750,
            "firstname_en": "T.Preeyanuch",
            "lastname_en": "Wongtawee (ENH)",
            "firstname_th": "\u0e1b\u0e23\u0e35\u0e22\u0e32\u0e19\u0e38\u0e0a",
            "lastname_th": "\u0e27\u0e07\u0e29\u0e4c\u0e17\u0e27\u0e35 (ENH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ENH "
        },
        {
            "id": 659,
            "firstname_en": "T.Rakchanok",
            "lastname_en": "Ruenglap (CCB)",
            "firstname_th": "\u0e23\u0e31\u0e01\u0e0a\u0e19\u0e01",
            "lastname_th": "\u0e40\u0e23\u0e37\u0e2d\u0e07\u0e25\u0e32\u0e20 (CCB)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CCB "
        },
        {
            "id": 847,
            "firstname_en": "T.Ratchawan",
            "lastname_en": "Sangkawat (CNC)",
            "firstname_th": "\u0e23\u0e31\u0e0a\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e2a\u0e31\u0e07\u0e06\u0e27\u0e31\u0e15\u0e23 (CNC)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CNC "
        },
        {
            "id": 863,
            "firstname_en": "T.Rattaphong",
            "lastname_en": "Moonthadee (CBT)",
            "firstname_th": "\u0e23\u0e31\u0e10\u0e1e\u0e07\u0e29\u0e4c",
            "lastname_th": "\u0e21\u0e39\u0e25\u0e17\u0e32\u0e14\u0e35 (CBT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CBT "
        },
        {
            "id": 906,
            "firstname_en": "T.Riam",
            "lastname_en": "A-Mard (UTW)",
            "firstname_th": "\u0e40\u0e2b\u0e23\u0e35\u0e22\u0e21",
            "lastname_th": "\u0e2d\u0e30\u0e2b\u0e21\u0e32\u0e14 (UTW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "UTW "
        },
        {
            "id": 676,
            "firstname_en": "T.Rinyapat",
            "lastname_en": "Intananantasiri (ESW)",
            "firstname_th": "\u0e23\u0e34\u0e0d\u0e0d\u0e32\u0e20\u0e31\u0e17\u0e23\u0e4c",
            "lastname_th": "\u0e2d\u0e34\u0e19\u0e18\u0e19\u0e32\u0e19\u0e31\u0e19\u0e17\u0e28\u0e34\u0e23\u0e34 (ESW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ESW "
        },
        {
            "id": 569,
            "firstname_en": "T.Rungphet",
            "lastname_en": "Promrat (WCT)",
            "firstname_th": "\u0e23\u0e38\u0e49\u0e07\u0e40\u0e1e\u0e47\u0e0a\u0e23",
            "lastname_th": "\u0e1e\u0e23\u0e21\u0e23\u0e31\u0e15\u0e19\u0e4c (WCT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "WCT "
        },
        {
            "id": 572,
            "firstname_en": "T.Rusnsnee",
            "lastname_en": "Mohming (BTW)",
            "firstname_th": "\u0e23\u0e38\u0e2a\u0e19\u0e32\u0e19\u0e35",
            "lastname_th": "\u0e40\u0e21\u0e32\u0e30\u0e21\u0e34\u0e07 (BTW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTW "
        },
        {
            "id": 655,
            "firstname_en": "T.Ruttapon",
            "lastname_en": "Khrueason (CHD)",
            "firstname_th": "\u0e23\u0e31\u0e10\u0e1e\u0e25",
            "lastname_th": "\u0e40\u0e04\u0e23\u0e37\u0e2d\u0e2a\u0e19\u0e18\u0e34\u0e4c (CHD)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CHD "
        },
        {
            "id": 654,
            "firstname_en": "T.Saisunee",
            "lastname_en": "Waiting (CCB)",
            "firstname_th": "\u0e2a\u0e32\u0e22\u0e2a\u0e38\u0e13\u0e35\u0e22\u0e4c",
            "lastname_th": "\u0e44\u0e2b\u0e27\u0e15\u0e34\u0e07 (CCB)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CCB "
        },
        {
            "id": 693,
            "firstname_en": "T.Salinee",
            "lastname_en": "Boontep (CCP)",
            "firstname_th": "\u0e2a\u0e32\u0e25\u0e34\u0e19\u0e35",
            "lastname_th": "\u0e1a\u0e38\u0e0d\u0e40\u0e17\u0e1e (CCP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CCP "
        },
        {
            "id": 702,
            "firstname_en": "T.Sangwan",
            "lastname_en": "Panyarot (FNV)",
            "firstname_th": "\u0e2a\u0e31\u0e07\u0e27\u0e32\u0e25\u0e22\u0e4c",
            "lastname_th": "\u0e1b\u0e31\u0e0d\u0e0d\u0e32\u0e42\u0e23\u0e08\u0e19\u0e4c (FNV)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FNV "
        },
        {
            "id": 882,
            "firstname_en": "T.Saowaphak",
            "lastname_en": "Uthairat (EPT)",
            "firstname_th": "\u0e40\u0e2a\u0e32\u0e27\u0e20\u0e32\u0e04\u0e22\u0e4c",
            "lastname_th": "\u0e2d\u0e38\u0e17\u0e31\u0e22\u0e23\u0e31\u0e15\u0e19\u0e4c (EPT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EPT "
        },
        {
            "id": 899,
            "firstname_en": "T.Sarina",
            "lastname_en": "Sayan (UBL)",
            "firstname_th": "\u0e0b\u0e32\u0e23\u0e35\u0e19\u0e32",
            "lastname_th": "\u0e2a\u0e32\u0e22\u0e31\u0e19 (UBL)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "UBL "
        },
        {
            "id": 751,
            "firstname_en": "T.Satit",
            "lastname_en": "Raethong (ENK)",
            "firstname_th": "\u0e2a\u0e32\u0e17\u0e34\u0e15\u0e22\u0e4c",
            "lastname_th": "\u0e41\u0e23\u0e48\u0e17\u0e2d\u0e07 (ENK)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ENK "
        },
        {
            "id": 570,
            "firstname_en": "T.Sawanee",
            "lastname_en": "Suksridaeng (WCT)",
            "firstname_th": "\u0e2a\u0e27\u0e19\u0e35\u0e22\u0e4c",
            "lastname_th": "\u0e2a\u0e38\u0e02\u0e28\u0e23\u0e35\u0e41\u0e14\u0e07 (WCT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "WCT "
        },
        {
            "id": 262,
            "firstname_en": "T.Setana",
            "lastname_en": "Kaso (SAT)",
            "firstname_th": "\u0e0b\u0e35\u0e15\u0e32\u0e19\u0e32",
            "lastname_th": "\u0e01\u0e32\u0e0b\u0e2d (SAT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SAT "
        },
        {
            "id": 579,
            "firstname_en": "T.Sharipah",
            "lastname_en": "Othman (BMO)",
            "firstname_th": "\u0e2a\u0e32\u0e23\u0e35\u0e1b\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e2d\u0e38\u0e2a\u0e21\u0e32\u0e19 (BMO)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BMO "
        },
        {
            "id": 561,
            "firstname_en": "T.Sirirat",
            "lastname_en": "Daebok (BNI)",
            "firstname_th": "\u0e28\u0e34\u0e23\u0e34\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e41\u0e14\u0e1a\u0e4a\u0e2d\u0e01 (BNI)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BNI "
        },
        {
            "id": 737,
            "firstname_en": "T.Siriwan",
            "lastname_en": "Chakkrarat (CWM)",
            "firstname_th": "\u0e28\u0e34\u0e23\u0e34\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e08\u0e31\u0e01\u0e23\u0e23\u0e32\u0e0a (CWM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CWM "
        },
        {
            "id": 860,
            "firstname_en": "T.Siriwan",
            "lastname_en": "Chantarasing (ENW)",
            "firstname_th": "\u0e28\u0e34\u0e23\u0e34\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e08\u0e31\u0e19\u0e17\u0e23\u0e2a\u0e34\u0e07\u0e2b\u0e4c (ENW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ENW "
        },
        {
            "id": 835,
            "firstname_en": "T.Somjit",
            "lastname_en": "Aunta (BNY)",
            "firstname_th": "\u0e2a\u0e21\u0e08\u0e34\u0e15",
            "lastname_th": "\u0e2d\u0e38\u0e48\u0e19\u0e15\u0e32 (BNY)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BNY "
        },
        {
            "id": 556,
            "firstname_en": "T.Sophiyah",
            "lastname_en": "Buesu (BYH)",
            "firstname_th": "\u0e0b\u0e2d\u0e1f\u0e35\u0e22\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e1a\u0e37\u0e2d\u0e2a\u0e38 (BYH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BYH "
        },
        {
            "id": 723,
            "firstname_en": "T.Suchanan",
            "lastname_en": "Paksongsri (EBM)",
            "firstname_th": "\u0e2a\u0e38\u0e0a\u0e32\u0e19\u0e31\u0e19\u0e17\u0e4c",
            "lastname_th": "\u0e20\u0e31\u0e01\u0e14\u0e34\u0e4c\u0e2a\u0e07\u0e28\u0e23\u0e35 (EBM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EBM "
        },
        {
            "id": 805,
            "firstname_en": "T.Suchanya",
            "lastname_en": "Innupat (BSM)",
            "firstname_th": "\u0e2a\u0e38\u0e0a\u0e31\u0e0d\u0e0d\u0e32",
            "lastname_th": "\u0e2d\u0e34\u0e19\u0e19\u0e38\u0e1e\u0e31\u0e12\u0e19\u0e4c (BSM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BSM "
        },
        {
            "id": 876,
            "firstname_en": "T.Sudaporn",
            "lastname_en": "Chayutikulphan (CYW)",
            "firstname_th": "\u0e2a\u0e38\u0e14\u0e32\u0e1e\u0e23",
            "lastname_th": "\u0e0a\u0e22\u0e38\u0e15\u0e34\u0e01\u0e38\u0e25\u0e1e\u0e31\u0e19\u0e18\u0e38\u0e4c (CYW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CYW "
        },
        {
            "id": 622,
            "firstname_en": "T.Sudarat",
            "lastname_en": "Soiyson (CNC)",
            "firstname_th": "\u0e2a\u0e38\u0e14\u0e32\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e2a\u0e23\u0e49\u0e2d\u0e22\u0e2a\u0e19 (CNC)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CNC "
        },
        {
            "id": 567,
            "firstname_en": "T.Sulwa",
            "lastname_en": "Waeto (BYY)",
            "firstname_th": "\u0e0b\u0e31\u0e25\u0e27\u0e32\u0e23\u0e4c",
            "lastname_th": "\u0e41\u0e27\u0e42\u0e15 (BYY)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BYY "
        },
        {
            "id": 695,
            "firstname_en": "T.Sunan",
            "lastname_en": "Kongprom (CBT)",
            "firstname_th": "\u0e2a\u0e38\u0e19\u0e31\u0e19\u0e17\u0e4c",
            "lastname_th": "\u0e01\u0e2d\u0e07\u0e1e\u0e23\u0e21 (CBT)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "CBT "
        },
        {
            "id": 566,
            "firstname_en": "T.Supamas",
            "lastname_en": "Singhakosit (BYY)",
            "firstname_th": "\u0e28\u0e38\u0e20\u0e21\u0e32\u0e2a",
            "lastname_th": "\u0e2a\u0e34\u0e07\u0e2b\u0e42\u0e06\u0e29\u0e34\u0e15 (BYY)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BYY "
        },
        {
            "id": 873,
            "firstname_en": "T.Suparat",
            "lastname_en": "Karon (EMC)",
            "firstname_th": "\u0e28\u0e38\u0e20\u0e23\u0e31\u0e15\u0e19\u0e4c",
            "lastname_th": "\u0e01\u0e32\u0e23\u0e38\u0e13 (EMC)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EMC "
        },
        {
            "id": 741,
            "firstname_en": "T.Supawadee",
            "lastname_en": "Kongkoed (ENT)",
            "firstname_th": "\u0e2a\u0e38\u0e20\u0e32\u0e27\u0e14\u0e35",
            "lastname_th": "\u0e01\u0e2d\u0e07\u0e40\u0e01\u0e34\u0e14 (ENT) ",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ENT "
        },
        {
            "id": 745,
            "firstname_en": "T.Suphannee",
            "lastname_en": "Khananai (CHD)",
            "firstname_th": "\u0e2a\u0e38\u0e1e\u0e23\u0e23\u0e13\u0e35",
            "lastname_th": "\u0e04\u0e13\u0e30\u0e19\u0e31\u0e22 (CHD)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CHD "
        },
        {
            "id": 667,
            "firstname_en": "T.Suphasutta",
            "lastname_en": "Phoophet (EPB)",
            "firstname_th": "\u0e28\u0e38\u0e20\u0e2a\u0e38\u0e15\u0e15\u0e32",
            "lastname_th": "\u0e20\u0e39\u0e40\u0e1e\u0e47\u0e0a\u0e23 (EPB)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EPB "
        },
        {
            "id": 877,
            "firstname_en": "T.Supitcha",
            "lastname_en": "Phuritorn (EBP)",
            "firstname_th": "\u0e2a\u0e38\u0e1e\u0e34\u0e0a\u0e0a\u0e32",
            "lastname_th": "\u0e20\u0e39\u0e23\u0e34\u0e18\u0e23 (EBP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EBP "
        },
        {
            "id": 736,
            "firstname_en": "T.Suttida",
            "lastname_en": "Sinuanchan (CWM)",
            "firstname_th": "\u0e2a\u0e38\u0e17\u0e18\u0e34\u0e14\u0e32",
            "lastname_th": "\u0e28\u0e23\u0e35\u0e19\u0e27\u0e25\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c (CWM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CWM "
        },
        {
            "id": 858,
            "firstname_en": "T.Tadsaneewan",
            "lastname_en": "Simajan (ENT)",
            "firstname_th": "\u0e17\u0e31\u0e28\u0e13\u0e35\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e2a\u0e34\u0e21\u0e32\u0e08\u0e32\u0e23\u0e22\u0e4c (ENT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ENT "
        },
        {
            "id": 708,
            "firstname_en": "T.Taksina",
            "lastname_en": "Dacharan (FSW)",
            "firstname_th": "\u0e17\u0e31\u0e01\u0e29\u0e34\u0e13\u0e32",
            "lastname_th": "\u0e40\u0e14\u0e0a\u0e2d\u0e23\u0e31\u0e0d (FSW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FSW "
        },
        {
            "id": 680,
            "firstname_en": "T.Tanapohn",
            "lastname_en": "Changplook (ESW)",
            "firstname_th": "\u0e18\u0e19\u0e20\u0e23\u0e13\u0e4c",
            "lastname_th": "\u0e0a\u0e48\u0e32\u0e07\u0e1b\u0e25\u0e39\u0e01 (ESW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ESW "
        },
        {
            "id": 661,
            "firstname_en": "T.Tawatchai",
            "lastname_en": "Srihaboot (CMR)",
            "firstname_th": "\u0e18\u0e27\u0e31\u0e0a\u0e0a\u0e31\u0e22",
            "lastname_th": "\u0e28\u0e23\u0e35\u0e2b\u0e32\u0e1a\u0e38\u0e15\u0e23 (CMR)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CMR "
        },
        {
            "id": 862,
            "firstname_en": "T.Thamolwan",
            "lastname_en": "Sawadthuek (SAT)",
            "firstname_th": "\u0e18\u0e21\u0e25\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e34\u0e4c\u0e16\u0e36\u0e01 (SAT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SAT "
        },
        {
            "id": 730,
            "firstname_en": "T.Thanachai",
            "lastname_en": "Noisong (EKB)",
            "firstname_th": "\u0e18\u0e13\u0e32\u0e0a\u0e31\u0e22",
            "lastname_th": "\u0e19\u0e49\u0e2d\u0e22\u0e17\u0e23\u0e07 (EKB)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EKB "
        },
        {
            "id": 701,
            "firstname_en": "T.Thanatchaporn",
            "lastname_en": "Hunchiang (FNV)",
            "firstname_th": "\u0e18\u0e19\u0e31\u0e0a\u0e1e\u0e23",
            "lastname_th": "\u0e2e\u0e31\u0e48\u0e19\u0e40\u0e09\u0e35\u0e22\u0e07 (FNV)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "FNV "
        },
        {
            "id": 706,
            "firstname_en": "T.Thanyalak",
            "lastname_en": "Pukdeepang (ETH)",
            "firstname_th": "\u0e18\u0e31\u0e0d\u0e25\u0e31\u0e01\u0e29\u0e13\u0e4c",
            "lastname_th": "\u0e20\u0e31\u0e01\u0e14\u0e35\u0e41\u0e1e\u0e07 (ETH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ETH "
        },
        {
            "id": 712,
            "firstname_en": "T.Thichaphat",
            "lastname_en": "Lekyaem (CWY)",
            "firstname_th": "\u0e17\u0e34\u0e0a\u0e32\u0e20\u0e31\u0e17\u0e23\u0e4c",
            "lastname_th": "\u0e40\u0e2b\u0e25\u0e47\u0e01\u0e41\u0e22\u0e49\u0e21 (CWY)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CWY "
        },
        {
            "id": 685,
            "firstname_en": "T.Thitima",
            "lastname_en": "Chantasri (ENS)",
            "firstname_th": "\u0e10\u0e34\u0e15\u0e34\u0e21\u0e32",
            "lastname_th": "\u0e08\u0e31\u0e19\u0e17\u0e30\u0e2a\u0e35 (ENS)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ENS "
        },
        {
            "id": 660,
            "firstname_en": "T.Uraiwan",
            "lastname_en": "Suadache (CSN)",
            "firstname_th": "\u0e2d\u0e38\u0e44\u0e23\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e40\u0e2a\u0e37\u0e2d\u0e40\u0e14\u0e0a (CSN)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CSN "
        },
        {
            "id": 580,
            "firstname_en": "T.Waeaisah",
            "lastname_en": "Nimat (BMO)",
            "firstname_th": "\u0e41\u0e27\u0e44\u0e2d\u0e0b\u0e30\u0e2b\u0e4c",
            "lastname_th": "\u0e19\u0e34\u0e21\u0e30 (BMO)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BMO "
        },
        {
            "id": 576,
            "firstname_en": "T.Waniccha",
            "lastname_en": "Dueramae (BSK)",
            "firstname_th": "\u0e27\u0e13\u0e34\u0e0a\u0e0a\u0e32",
            "lastname_th": "\u0e14\u0e37\u0e2d\u0e23\u0e32\u0e41\u0e21 (BSK)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BSK "
        },
        {
            "id": 841,
            "firstname_en": "T.Wanngam",
            "lastname_en": "Suksangdao (CBP)",
            "firstname_th": "\u0e27\u0e23\u0e23\u0e13\u0e07\u0e32\u0e21",
            "lastname_th": "\u0e2a\u0e38\u0e02\u0e41\u0e2a\u0e07\u0e14\u0e32\u0e27 (CBP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CBP "
        },
        {
            "id": 627,
            "firstname_en": "T.Waraluck",
            "lastname_en": "Sukchok (CMW)",
            "firstname_th": "\u0e2a\u0e38\u0e02\u0e42\u0e0a\u0e04 (CMW)",
            "lastname_th": "Sukchok (CMW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CMW "
        },
        {
            "id": 634,
            "firstname_en": "T.Waraporn",
            "lastname_en": "Khunpanit (CUP)",
            "firstname_th": "\u0e27\u0e23\u0e32\u0e20\u0e23\u0e13\u0e4c",
            "lastname_th": "\u0e02\u0e38\u0e19\u0e1e\u0e32\u0e19\u0e34\u0e0a (CUP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CUP "
        },
        {
            "id": 855,
            "firstname_en": "T.Warasinee",
            "lastname_en": "Prawirat (EMS)",
            "firstname_th": "\u0e27\u0e23\u0e32\u0e2a\u0e34\u0e19\u0e35",
            "lastname_th": "\u0e1b\u0e23\u0e30\u0e27\u0e34\u0e23\u0e31\u0e15\u0e19\u0e4c (EMS)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "EMS "
        },
        {
            "id": 704,
            "firstname_en": "T.Warinthon",
            "lastname_en": "Suku (ETH)",
            "firstname_th": "\u0e27\u0e23\u0e34\u0e19\u0e17\u0e23",
            "lastname_th": "\u0e2a\u0e38\u0e01\u0e38 (ETH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ETH "
        },
        {
            "id": 905,
            "firstname_en": "T.Watcharee",
            "lastname_en": "Nisalah (UTW)",
            "firstname_th": "\u0e27\u0e31\u0e0a\u0e23\u0e35",
            "lastname_th": "\u0e19\u0e34\u0e2a\u0e32\u0e41\u0e25\u0e30 (UTW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "UTW "
        },
        {
            "id": 859,
            "firstname_en": "T.Wichit",
            "lastname_en": "Thongkasem (ESS)",
            "firstname_th": "\u0e27\u0e34\u0e0a\u0e34\u0e15",
            "lastname_th": "\u0e17\u0e2d\u0e07\u0e40\u0e01\u0e29\u0e21 (ESS)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ESS "
        },
        {
            "id": 710,
            "firstname_en": "T.Winut",
            "lastname_en": "Rattanapisidpaisarn (CWY)",
            "firstname_th": "\u0e27\u0e34\u0e19\u0e38\u0e0a",
            "lastname_th": "\u0e23\u0e31\u0e15\u0e19\u0e1e\u0e34\u0e2a\u0e34\u0e29\u0e10\u0e4c\u0e44\u0e1e\u0e28\u0e32\u0e25 (CWY)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CWY "
        },
        {
            "id": 720,
            "firstname_en": "T.Woraphot",
            "lastname_en": "Longbusri (ENH)",
            "firstname_th": "\u0e27\u0e23\u0e1e\u0e08\u0e19\u0e4c",
            "lastname_th": "\u0e2b\u0e25\u0e48\u0e2d\u0e07\u0e1a\u0e38\u0e28\u0e23\u0e35 (ENH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "ENH "
        },
        {
            "id": 554,
            "firstname_en": "T.Yunainah",
            "lastname_en": "Ngohtalee (BYH)",
            "firstname_th": "\u0e22\u0e39\u0e19\u0e31\u0e22\u0e19\u0e4a\u0e30",
            "lastname_th": "\u0e40\u0e07\u0e4a\u0e32\u0e30\u0e15\u0e32\u0e25\u0e35 (BYH)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BYH "
        },
        {
            "id": 564,
            "firstname_en": "T.Yupa",
            "lastname_en": "Daengpradub (BYY)",
            "firstname_th": "\u0e22\u0e38\u0e1e\u0e32",
            "lastname_th": "\u0e41\u0e14\u0e07\u0e1b\u0e23\u0e30\u0e14\u0e31\u0e1a (BYY)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BYY "
        },
        {
            "id": 635,
            "firstname_en": "T.Yupadee",
            "lastname_en": "Sriinchan (CBK)",
            "firstname_th": "\u0e22\u0e38\u0e1e\u0e14\u0e35",
            "lastname_th": "\u0e28\u0e23\u0e35\u0e2d\u0e34\u0e19\u0e17\u0e23\u0e4c\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c (CBK)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CBK "
        },
        {
            "id": 874,
            "firstname_en": "T.Yutitham",
            "lastname_en": "Thammo (CHS)",
            "firstname_th": "\u0e22\u0e38\u0e15\u0e34\u0e18\u0e23\u0e23\u0e21",
            "lastname_th": "\u0e18\u0e23\u0e23\u0e21\u0e42\u0e21 (CHS)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CHS "
        },
        {
            "id": 896,
            "firstname_en": "T10",
            "lastname_en": "Test",
            "firstname_th": "T10",
            "lastname_th": "Test",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 897,
            "firstname_en": "T11",
            "lastname_en": "Test",
            "firstname_th": "T11",
            "lastname_th": "Test",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 892,
            "firstname_en": "T6",
            "lastname_en": "Test",
            "firstname_th": "T6",
            "lastname_th": "Test",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 893,
            "firstname_en": "T7",
            "lastname_en": "Test",
            "firstname_th": "T7",
            "lastname_th": "Test",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 894,
            "firstname_en": "T8",
            "lastname_en": "Test",
            "firstname_th": "T8",
            "lastname_th": "Test",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 895,
            "firstname_en": "T9",
            "lastname_en": "Test",
            "firstname_th": "T9",
            "lastname_th": "Test",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 766,
            "firstname_en": "Tasnee",
            "lastname_en": "Tamard",
            "firstname_th": "\u0e17\u0e31\u0e28\u0e19\u0e35\u0e22\u0e4c",
            "lastname_th": "\u0e15\u0e32\u0e2b\u0e21\u0e32\u0e14",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTB "
        },
        {
            "id": 592,
            "firstname_en": "Teppalex",
            "lastname_en": "Borriboon (SWM)",
            "firstname_th": "\u0e40\u0e17\u0e1e\u0e23\u0e31\u0e01\u0e29\u0e4c",
            "lastname_th": "\u0e1a\u0e23\u0e34\u0e1a\u0e39\u0e23\u0e13\u0e4c (SWM)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SWM "
        },
        {
            "id": 929,
            "firstname_en": "Testing",
            "lastname_en": "Teacher",
            "firstname_th": "Testing",
            "lastname_th": "Teacher",
            "type": "Local",
            "status": "Enabled",
            "school_code": "TRN "
        },
        {
            "id": 612,
            "firstname_en": "Thabit",
            "lastname_en": "Walls",
            "firstname_th": "Thabit",
            "lastname_th": "Walls",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 444,
            "firstname_en": "Thanachote",
            "lastname_en": "Adthawimonporn",
            "firstname_th": "Thanachote",
            "lastname_th": "Adthawimonporn",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 313,
            "firstname_en": "Thanaporn",
            "lastname_en": "Khonphien",
            "firstname_th": "\u0e18\u0e19\u0e32\u0e20\u0e23\u0e13\u0e4c",
            "lastname_th": "\u0e04\u0e19\u0e40\u0e1e\u0e35\u0e22\u0e23",
            "type": "Local",
            "status": "Enabled",
            "school_code": "TNW "
        },
        {
            "id": 340,
            "firstname_en": "Thanaporn",
            "lastname_en": "Sirilak",
            "firstname_th": "\u0e18\u0e19\u0e20\u0e23\u0e13\u0e4c",
            "lastname_th": "\u0e28\u0e34\u0e23\u0e34\u0e23\u0e31\u0e01\u0e29\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SWD "
        },
        {
            "id": 782,
            "firstname_en": "Thanatchaporn",
            "lastname_en": "Namsawat",
            "firstname_th": "\u0e18\u0e19\u0e31\u0e0a\u0e1e\u0e23",
            "lastname_th": "\u0e19\u0e32\u0e21\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e34\u0e4c",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 398,
            "firstname_en": "Thaninthara",
            "lastname_en": "Wongthongdee",
            "firstname_th": "\u0e18\u0e19\u0e34\u0e19\u0e17\u0e23\u0e32",
            "lastname_th": "\u0e27\u0e07\u0e28\u0e4c\u0e17\u0e2d\u0e07\u0e14\u0e35",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BDB "
        },
        {
            "id": 452,
            "firstname_en": "Thannaree",
            "lastname_en": "Panbon",
            "firstname_th": "\u0e18\u0e31\u0e0d\u0e0d\u0e4c\u0e19\u0e23\u0e35",
            "lastname_th": "\u0e1e\u0e31\u0e19\u0e18\u0e38\u0e4c\u200b\u0e1a\u0e38\u0e0d\u200b",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BTG "
        },
        {
            "id": 753,
            "firstname_en": "Thanwarin",
            "lastname_en": "Aunsri",
            "firstname_th": "\u0e18\u0e31\u0e19\u0e0d\u0e30\u0e40\u0e1e\u0e0a\u0e23",
            "lastname_th": "\u0e2d\u0e27\u0e19\u0e28\u0e23\u0e35",
            "type": "Local",
            "status": "Disabled",
            "school_code": "HSS "
        },
        {
            "id": 271,
            "firstname_en": "Thareeya",
            "lastname_en": "Kornketkaew",
            "firstname_th": "\u0e18\u0e23\u0e35\u0e22\u0e32",
            "lastname_th": "\u0e01\u0e23\u0e40\u0e01\u0e29\u0e41\u0e01\u0e49\u0e27",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 324,
            "firstname_en": "Thirayut",
            "lastname_en": "Chukrin",
            "firstname_th": "\u0e18\u0e35\u0e23\u0e22\u0e38\u0e17\u0e18",
            "lastname_th": "\u0e0a\u0e39\u0e01\u0e25\u0e34\u0e48\u0e19",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PBB "
        },
        {
            "id": 419,
            "firstname_en": "Thitiporn",
            "lastname_en": "Poodsua",
            "firstname_th": "\u0e18\u0e34\u0e15\u0e34\u0e1e\u0e23",
            "lastname_th": "\u0e1e\u0e38\u0e14\u0e2a\u0e27\u0e22",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LBM "
        },
        {
            "id": 908,
            "firstname_en": "Thomas",
            "lastname_en": "Hollier",
            "firstname_th": "Thomas",
            "lastname_th": "Hollier",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 244,
            "firstname_en": "Thomas",
            "lastname_en": "Howell",
            "firstname_th": "Thomas",
            "lastname_th": "Howell",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 658,
            "firstname_en": "Tiarna",
            "lastname_en": "Moore",
            "firstname_th": "Tiarna",
            "lastname_th": "Moore",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 662,
            "firstname_en": "Tidarattana",
            "lastname_en": "Kludpom (CKC)",
            "firstname_th": "T.Tidarattana",
            "lastname_th": "Kludpom( (CKC)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CKC "
        },
        {
            "id": 281,
            "firstname_en": "Tim",
            "lastname_en": "Walton",
            "firstname_th": "Tim",
            "lastname_th": "Walton",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 510,
            "firstname_en": "Timothy",
            "lastname_en": "Sorota",
            "firstname_th": "Timothy",
            "lastname_th": "Sorota",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 521,
            "firstname_en": "Toby",
            "lastname_en": "Carlos",
            "firstname_th": "Toby",
            "lastname_th": "Carlos",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 469,
            "firstname_en": "Tony",
            "lastname_en": "Remmel",
            "firstname_th": "Tony",
            "lastname_th": "Remmel",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 221,
            "firstname_en": "Training",
            "lastname_en": "Teacher",
            "firstname_th": "Training",
            "lastname_th": "Teacher",
            "type": "Local",
            "status": "Enabled",
            "school_code": "TRN "
        },
        {
            "id": 441,
            "firstname_en": "Tummabhorn",
            "lastname_en": "Kumken",
            "firstname_th": "Tummabhorn",
            "lastname_th": "Kumken",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 335,
            "firstname_en": "Usa",
            "lastname_en": "Boonlam",
            "firstname_th": "Usa",
            "lastname_th": "Boonlam",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 470,
            "firstname_en": "Valerie",
            "lastname_en": "Vucko",
            "firstname_th": "Valerie",
            "lastname_th": "Vucko",
            "type": "Online",
            "status": "Disabled",
            "school_code": "TRN "
        },
        {
            "id": 374,
            "firstname_en": "Verena",
            "lastname_en": "Baer",
            "firstname_th": "Verena",
            "lastname_th": "Baer",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 535,
            "firstname_en": "Viriya",
            "lastname_en": "Phovithoon",
            "firstname_th": "\u0e27\u0e34\u0e23\u0e34\u0e22\u0e30",
            "lastname_th": "\u0e42\u0e1e\u0e18\u0e34\u0e4c\u0e27\u0e34\u0e11\u0e39\u0e23\u0e22\u0e4c",
            "type": "Local",
            "status": "Enabled",
            "school_code": "JVS "
        },
        {
            "id": 279,
            "firstname_en": "Waheeda",
            "lastname_en": "Nita",
            "firstname_th": "\u0e27\u0e32\u0e2e\u0e35\u0e14\u0e32",
            "lastname_th": "\u0e19\u0e34\u0e15\u0e32",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 216,
            "firstname_en": "Wanna",
            "lastname_en": "Sangphut",
            "firstname_th": "\u0e27\u0e23\u0e23\u0e13\u0e32",
            "lastname_th": "\u0e2a\u0e31\u0e07\u0e02\u0e4c\u0e1c\u0e38\u0e14",
            "type": "Local",
            "status": "Enabled",
            "school_code": ""
        },
        {
            "id": 414,
            "firstname_en": "Waraiporn",
            "lastname_en": "Roonbud",
            "firstname_th": "\u0e27\u0e25\u0e31\u0e22\u0e1e\u0e23",
            "lastname_th": "\u0e25\u0e38\u0e19\u0e1a\u0e38\u0e15\u0e23",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BNY "
        },
        {
            "id": 492,
            "firstname_en": "Waraiporn",
            "lastname_en": "Roonbud (BNO)",
            "firstname_th": "\u0e27\u0e25\u0e31\u0e22\u0e1e\u0e23",
            "lastname_th": "\u0e25\u0e38\u0e19\u0e1a\u0e38\u0e15\u0e23 (BNO)",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BNO "
        },
        {
            "id": 315,
            "firstname_en": "Warissara",
            "lastname_en": "Yawikien",
            "firstname_th": "\u0e27\u0e23\u0e34\u0e28\u0e23\u0e32",
            "lastname_th": "\u0e22\u0e32\u0e27\u0e34\u0e40\u0e04\u0e35\u0e22\u0e19",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LNC "
        },
        {
            "id": 423,
            "firstname_en": "Weerawat",
            "lastname_en": "Khamkaew",
            "firstname_th": "\u0e27\u0e35\u0e23\u0e27\u0e31\u0e12\u0e19\u0e4c",
            "lastname_th": "\u0e04\u0e33\u0e41\u0e01\u0e49\u0e27",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LSJ "
        },
        {
            "id": 596,
            "firstname_en": "Weeraya",
            "lastname_en": "Inthirak (SMP)",
            "firstname_th": "\u0e27\u0e35\u0e23\u0e22\u0e32",
            "lastname_th": "\u0e2d\u0e34\u0e19\u0e17\u0e34\u0e23\u0e31\u0e01\u0e29\u0e4c (SMP)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SMP "
        },
        {
            "id": 866,
            "firstname_en": "Wilaiporn",
            "lastname_en": "Ngoenkaeng (CCT)",
            "firstname_th": "\u0e27\u0e34\u0e25\u0e31\u0e22\u0e1e\u0e23",
            "lastname_th": "\u0e40\u0e07\u0e34\u0e19\u0e41\u0e01\u0e4a\u0e07 (CCT)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "CCT "
        },
        {
            "id": 258,
            "firstname_en": "Wilaiwan",
            "lastname_en": "Singhol",
            "firstname_th": "\u0e27\u0e34\u0e44\u0e25\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e2a\u0e34\u0e07\u0e2b\u0e25",
            "type": "Local",
            "status": "Enabled",
            "school_code": "VSS "
        },
        {
            "id": 369,
            "firstname_en": "Wilawan",
            "lastname_en": "Phonjarung",
            "firstname_th": "\u0e27\u0e34\u0e25\u0e32\u0e27\u0e31\u0e13\u0e22\u0e4c ",
            "lastname_th": "\u0e1c\u0e25\u0e08\u0e23\u0e38\u0e07",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BNK "
        },
        {
            "id": 547,
            "firstname_en": "Will",
            "lastname_en": "Beukes",
            "firstname_th": "Will",
            "lastname_th": "Beukes",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 225,
            "firstname_en": "Willem",
            "lastname_en": "Beukes",
            "firstname_th": "Willem",
            "lastname_th": "Beukes",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 936,
            "firstname_en": "William",
            "lastname_en": "McEvoy",
            "firstname_th": "William",
            "lastname_th": "McEvoy",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 432,
            "firstname_en": "Wirat",
            "lastname_en": "Rachapanya",
            "firstname_th": "\u0e27\u0e34\u0e23\u0e31\u0e0a",
            "lastname_th": "\u0e23\u0e32\u0e0a\u0e1b\u0e31\u0e0d\u0e0d\u0e32",
            "type": "Local",
            "status": "Enabled",
            "school_code": "HBP "
        },
        {
            "id": 318,
            "firstname_en": "Wirawan",
            "lastname_en": "Saiweaw",
            "firstname_th": "\u0e27\u0e34\u0e23\u0e32\u0e27\u0e23\u0e23\u0e13",
            "lastname_th": "\u0e2a\u0e32\u0e22\u0e41\u0e27\u0e27",
            "type": "Local",
            "status": "Enabled",
            "school_code": "LNS "
        },
        {
            "id": 308,
            "firstname_en": "Yaroh",
            "lastname_en": "Mama",
            "firstname_th": "\u0e22\u0e32\u0e40\u0e23\u0e32\u0e30",
            "lastname_th": "\u0e21\u0e32\u0e21\u0e30",
            "type": "Local",
            "status": "Disabled",
            "school_code": "MLY "
        },
        {
            "id": 809,
            "firstname_en": "Yurina",
            "lastname_en": "Bukuh",
            "firstname_th": "\u0e22\u0e39\u0e23\u0e35\u0e19\u0e32",
            "lastname_th": "\u0e1a\u0e39\u0e01\u0e38",
            "type": "Local",
            "status": "Enabled",
            "school_code": "BPD "
        },
        {
            "id": 587,
            "firstname_en": "Yuwaret",
            "lastname_en": "Polyeum (SKH)",
            "firstname_th": "\u0e22\u0e38\u0e27\u0e40\u0e23\u0e28",
            "lastname_th": "\u0e1e\u0e25\u0e40\u0e22\u0e35\u0e48\u0e22\u0e21 (SKH)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKH "
        },
        {
            "id": 222,
            "firstname_en": "Zach",
            "lastname_en": "MacDonald",
            "firstname_th": "Zach",
            "lastname_th": "MacDonald",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 914,
            "firstname_en": "Zach",
            "lastname_en": "Randolph",
            "firstname_th": "Zach",
            "lastname_th": "Randolph",
            "type": "Online",
            "status": "Enabled",
            "school_code": "BRN "
        },
        {
            "id": 614,
            "firstname_en": "Zach",
            "lastname_en": "Wilson",
            "firstname_th": "Zach",
            "lastname_th": "Wilson",
            "type": "Online",
            "status": "Disabled",
            "school_code": "BRN "
        },
        {
            "id": 413,
            "firstname_en": "Zaripa",
            "lastname_en": "Rakdee",
            "firstname_th": "\u0e0b\u0e32\u0e23\u0e35\u0e1b\u0e30",
            "lastname_th": "\u0e23\u0e31\u0e01\u0e14\u0e35",
            "type": "Local",
            "status": "Disabled",
            "school_code": "BTG "
        },
        {
            "id": 493,
            "firstname_en": "Zenon",
            "lastname_en": "Ocba (PRW)",
            "firstname_th": "Zenon",
            "lastname_th": "Ocba (PRW)",
            "type": "Local",
            "status": "Enabled",
            "school_code": "PRW "
        },
        {
            "id": 301,
            "firstname_en": "Zurix",
            "lastname_en": "Macapirit",
            "firstname_th": "\u0e0b\u0e39\u0e25\u0e34\u0e04\t",
            "lastname_th": "\u0e21\u0e32\u0e04\u0e32\u0e1b\u0e34\u0e23\u0e34\u0e17",
            "type": "Local",
            "status": "Enabled",
            "school_code": "SKK "
        }
    ]
  };

  // 1. สร้าง Map ค้นหา User (ตัดส่วนหา Max ID ออกแล้ว)
  const dbUserMap = new Map();

  for (let i = 1; i < userData.length; i++) {
    // Map ชื่อเพื่อค้นหา
    let fname = (userData[i][2] || "").toString().toLowerCase().trim();
    let lname = (userData[i][3] || "").toString().toLowerCase().trim();
    if (fname) {
      dbUserMap.set(`${fname} ${lname}`, i + 1); // Fullname Key
      if (!dbUserMap.has(fname)) dbUserMap.set(fname, i + 1); // Firstname Key
    }
  }

  let updateCount = 0;
  let newUsersCount = 0;
  let newRows = []; // เก็บแถวใหม่ที่จะเพิ่ม

  // กำหนดตำแหน่ง Column (Index เริ่มที่ 0)
  // Col A=0 (User ID), C=2 (First EN), D=3 (Last EN), E=4 (First TH), F=5 (Last TH)
  // Col U=20 (Status), W=22 (Braincloud ID - สมมติว่าอยู่ตรงนี้ตามที่คุยกัน)
  const COL_INDEX_BC_ID = 22; 

  // 2. วนลูป JSON
  if (jsonResponse.teachers && jsonResponse.teachers.length > 0) {
    jsonResponse.teachers.forEach(teacher => {
      let jsonFname = (teacher.firstname_en || "").trim();
      let jsonLname = (teacher.lastname_en || "").trim();
      let searchKey = `${jsonFname} ${jsonLname}`.toLowerCase();
      
      let webId = teacher.id;

      // กรณีที่ 1: เจอคนเดิม -> อัปเดต ID
      let targetRow = dbUserMap.get(searchKey) || dbUserMap.get(jsonFname.toLowerCase());
      
      if (targetRow) {
        let currentId = userSheet.getRange(targetRow, COL_INDEX_BC_ID + 1).getValue(); // +1 เพราะ getRange นับ 1
        if (currentId != webId) {
          userSheet.getRange(targetRow, COL_INDEX_BC_ID + 1).setValue(webId);
          updateCount++;
          console.log(`✅ Matched & Updated: ${jsonFname}`);
        }
      } 
      // กรณีที่ 2: ไม่เจอ -> สร้างคนใหม่ (Add New)
      else {
        // สร้างแถวเปล่าที่มีจำนวนคอลัมน์เท่ากับ Header
        let newRow = new Array(userData[0].length).fill(""); 
        
        // เติมข้อมูลลงไป
        newRow[0] = "";                 // user_id: ปล่อยว่างรอ ARRAYFORMULA
        newRow[2] = jsonFname;          // firstname_en
        newRow[3] = jsonLname;          // lastname_en
        newRow[4] = teacher.firstname_th || ""; // firstname_th
        newRow[5] = teacher.lastname_th || "";  // lastname_th
        newRow[20] = (teacher.status || "active").toLowerCase(); // status (Col U)
        newRow[COL_INDEX_BC_ID] = webId; // braincloud_id (Col W)
        
        // เติม default อื่นๆ
        newRow[13] = "External"; // user_type (Col N)

        newRows.push(newRow);
        newUsersCount++;
        console.log(`✨ New User Prepared: ${jsonFname}`);
      }
    });
  }

  // 3. บันทึกคนใหม่ลง Sheet (ทีเดียวรวด)
  if (newRows.length > 0) {
    userSheet.getRange(
      userSheet.getLastRow() + 1, 
      1, 
      newRows.length, 
      newRows[0].length
    ).setValues(newRows);
  }

  let msg = `เสร็จสิ้น! \n- อัปเดต ID เดิม: ${updateCount} คน \n- เพิ่มคนใหม่: ${newUsersCount} คน`;
  console.log(msg);
  SpreadsheetApp.getUi().alert(msg);
}