/**
 * ฟังก์ชันช่วยจับคู่ School ID จาก Web JSON เข้ากับ Database ของเรา
 * [UPDATE]: เพิ่มฟีเจอร์ Auto-Add School (ถ้าไม่เจอ ให้เพิ่มใหม่พร้อมรายละเอียดทันที)
 */
function mapSchoolIDs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const schoolSheet = ss.getSheetByName('dim_school');
  
  if (!schoolSheet) {
    console.error("❌ ไม่พบ Sheet ชื่อ 'dim_school'");
    return;
  }

  // --- ตั้งค่า ---
  // ระบุตำแหน่ง Column ที่จะเก็บ Braincloud School ID (Col I = 9)
  // *แก้เลขนี้ให้ตรงกับคอลัมน์ที่คุณสร้างจริง*
  const COL_TARGET_ID = 9; 

  // --- ส่วนจำลอง JSON (เอาของจริงมาแปะทับตรงนี้) ---
  const jsonResponse = {
    "schools": [
        {
            "id": 98,
            "name_en": "Anuban Khamhang",
            "name_th": "\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e04\u0e33\u0e41\u0e2b\u0e07",
            "type_name_en": "Private School",
            "province_name_en": "Nakhon Si Thammarat",
            "city_name_en": "Thung Song",
            "code": "AKH",
            "status": "Disabled"
        },
        {
            "id": 71,
            "name_en": "Anuban Ra-Ngae",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e23\u0e30\u0e41\u0e07\u0e30",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Mueang Narathiwat",
            "code": "ARN",
            "status": "Disabled"
        },
        {
            "id": 97,
            "name_en": "Anubarn Sangsuntiposun",
            "name_th": "\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e41\u0e2a\u0e07\u0e2a\u0e31\u0e19\u0e15\u0e34\u0e1b\u0e2d\u0e0b\u0e31\u0e19",
            "type_name_en": "Private School",
            "province_name_en": "Pattani",
            "city_name_en": "Yarang",
            "code": "ASP",
            "status": "Disabled"
        },
        {
            "id": 29,
            "name_en": "Thesaban 3 Wat Phuttha Phum",
            "name_th": "\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25 3 \u0e27\u0e31\u0e14\u0e1e\u0e38\u0e17\u0e18\u0e20\u0e39\u0e21\u0e34",
            "type_name_en": "Thesaban",
            "province_name_en": "Yala",
            "city_name_en": "Mueang Yala",
            "code": "BDB",
            "status": "Enabled"
        },
        {
            "id": 193,
            "name_en": "Ban Dusongyow School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e14\u0e38\u0e0b\u0e07\u0e22\u0e2d",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Chanae",
            "code": "BDY",
            "status": "Enabled"
        },
        {
            "id": 73,
            "name_en": "Ban Hua Klong",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e2b\u0e31\u0e27\u0e04\u0e25\u0e2d\u0e07",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Mueang Narathiwat",
            "code": "BHK",
            "status": "Enabled"
        },
        {
            "id": 194,
            "name_en": "Ban Kok-Ta School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e42\u0e04\u0e01\u0e15\u0e32",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Su-ngai Padi",
            "code": "BKT",
            "status": "Enabled"
        },
        {
            "id": 113,
            "name_en": "Ban Khokyamu School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e42\u0e04\u0e01\u0e22\u0e32\u0e21\u0e39",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Tak Bai",
            "code": "BKY",
            "status": "Enabled"
        },
        {
            "id": 109,
            "name_en": "Ban Maruebo-Ok School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e21\u0e30\u0e23\u0e37\u0e2d\u0e42\u0e1a\u0e2d\u0e2d\u0e01",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Cho-airong",
            "code": "BMO",
            "status": "Enabled"
        },
        {
            "id": 195,
            "name_en": "Ban Maruebo-Tok School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e21\u0e30\u0e23\u0e37\u0e2d\u0e42\u0e1a\u0e15\u0e01",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Ra-ngae",
            "code": "BMT",
            "status": "Enabled"
        },
        {
            "id": 74,
            "name_en": "Ban Manangyong",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e21\u0e30\u0e19\u0e31\u0e07\u0e22\u0e07",
            "type_name_en": "OBEC",
            "province_name_en": "Pattani",
            "city_name_en": "Mueang Pattani",
            "code": "BMY",
            "status": "Enabled"
        },
        {
            "id": 46,
            "name_en": "Ban Non Chai",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25\u0e1a\u0e49\u0e32\u0e19\u0e42\u0e19\u0e19\u0e0a\u0e31\u0e22",
            "type_name_en": "Thesaban",
            "province_name_en": "Khon Kaen",
            "city_name_en": "Mueang Khon Kaen",
            "code": "BNC",
            "status": "Disabled"
        },
        {
            "id": 118,
            "name_en": "Ban Nakoi School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e19\u0e32\u0e02\u0e48\u0e2d\u0e22",
            "type_name_en": "OBEC",
            "province_name_en": "Yala",
            "city_name_en": "Betong",
            "code": "BNI",
            "status": "Enabled"
        },
        {
            "id": 75,
            "name_en": "Ban Naket",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e19\u0e32\u0e40\u0e01\u0e15\u0e38",
            "type_name_en": "OBEC",
            "province_name_en": "Pattani",
            "city_name_en": "Mueang Pattani",
            "code": "BNK",
            "status": "Disabled"
        },
        {
            "id": 107,
            "name_en": "Anuban Nong Ying (On Demand)",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e19\u0e49\u0e2d\u0e07\u0e2b\u0e0d\u0e34\u0e07 (On Demand)",
            "type_name_en": "Private School",
            "province_name_en": "Ubon Ratchathani",
            "city_name_en": "Trakan Phuet Phon",
            "code": "BNO",
            "status": "Enabled"
        },
        {
            "id": 77,
            "name_en": "Anuban Nong Ying",
            "name_th": "\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e19\u0e49\u0e2d\u0e07\u0e2b\u0e0d\u0e34\u0e07",
            "type_name_en": "Private School",
            "province_name_en": "Ubon Ratchathani",
            "city_name_en": "Mueang Ubon Ratchathani",
            "code": "BNY",
            "status": "Enabled"
        },
        {
            "id": 104,
            "name_en": "Braincloud On-Demand Demo School",
            "name_th": "Braincloud On-Demand Demo School",
            "type_name_en": "Private School",
            "province_name_en": "Bangkok",
            "city_name_en": "Bang Phlat",
            "code": "BOD",
            "status": "Enabled"
        },
        {
            "id": 196,
            "name_en": "Ban Padador School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e1b\u0e30\u0e14\u0e30\u0e14\u0e2d",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Tak Bai",
            "code": "BPD",
            "status": "Enabled"
        },
        {
            "id": 76,
            "name_en": "Ban Bang Pla Mor",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e1a\u0e32\u0e07\u0e1b\u0e25\u0e32\u0e2b\u0e21\u0e2d",
            "type_name_en": "OBEC",
            "province_name_en": "Pattani",
            "city_name_en": "Mueang Pattani",
            "code": "BPM",
            "status": "Disabled"
        },
        {
            "id": 43,
            "name_en": "Braincloud",
            "name_th": "Braincloud",
            "type_name_en": "Private School",
            "province_name_en": "Bangkok",
            "city_name_en": "Bang Phlat",
            "code": "BRN",
            "status": "Enabled"
        },
        {
            "id": 119,
            "name_en": "Ban Sakorn School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e2a\u0e32\u0e04\u0e23",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Si Sakhon",
            "code": "BSK",
            "status": "Enabled"
        },
        {
            "id": 203,
            "name_en": "Bansalamai",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e28\u0e32\u0e25\u0e32\u0e43\u0e2b\u0e21\u0e48",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Tak Bai",
            "code": "BSM",
            "status": "Enabled"
        },
        {
            "id": 192,
            "name_en": "Ban Ta Ba School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e15\u0e32\u0e1a\u0e32",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Tak Bai",
            "code": "BTB",
            "status": "Enabled"
        },
        {
            "id": 31,
            "name_en": "Thesaban 5 Ban Talat Kao",
            "name_th": "\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25 5 \u0e1a\u0e49\u0e32\u0e19\u0e15\u0e25\u0e32\u0e14\u0e40\u0e01\u0e48\u0e32",
            "type_name_en": "Thesaban",
            "province_name_en": "Yala",
            "city_name_en": "Mueang Yala",
            "code": "BTG",
            "status": "Enabled"
        },
        {
            "id": 110,
            "name_en": "Ban Tha Kham School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e17\u0e48\u0e32\u0e02\u0e49\u0e32\u0e21",
            "type_name_en": "OBEC",
            "province_name_en": "Pattani",
            "city_name_en": "Panare",
            "code": "BTK",
            "status": "Disabled"
        },
        {
            "id": 67,
            "name_en": "Baan Tabingting Ngi",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e15\u0e30\u0e1a\u0e34\u0e07\u0e15\u0e34\u0e07\u0e07\u0e35",
            "type_name_en": "OBEC",
            "province_name_en": "Yala",
            "city_name_en": "Mueang Yala",
            "code": "BTN",
            "status": "Enabled"
        },
        {
            "id": 69,
            "name_en": "Ban Ta Sap",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e17\u0e48\u0e32\u0e2a\u0e32\u0e1a",
            "type_name_en": "OBEC",
            "province_name_en": "Yala",
            "city_name_en": "Mueang Yala",
            "code": "BTS",
            "status": "Enabled"
        },
        {
            "id": 120,
            "name_en": "Thairath Witthaya School (Ban Mai)",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e44\u0e17\u0e22\u0e23\u0e31\u0e10\u0e27\u0e34\u0e17\u0e22\u0e32 (\u0e1a\u0e49\u0e32\u0e19\u0e43\u0e2b\u0e21\u0e48)",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Mueang Narathiwat",
            "code": "BTW",
            "status": "Enabled"
        },
        {
            "id": 111,
            "name_en": "Wat Ma Krud School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e21\u0e30\u0e01\u0e23\u0e39\u0e14",
            "type_name_en": "OBEC",
            "province_name_en": "Pattani",
            "city_name_en": "Khok Pho",
            "code": "BWK",
            "status": "Enabled"
        },
        {
            "id": 70,
            "name_en": "Ban Wang Mai",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e27\u0e31\u0e07\u0e43\u0e2b\u0e21\u0e48",
            "type_name_en": "OBEC",
            "province_name_en": "Yala",
            "city_name_en": "Mueang Yala",
            "code": "BWM",
            "status": "Enabled"
        },
        {
            "id": 121,
            "name_en": "Ban Yaha School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e22\u0e30\u0e2b\u0e32",
            "type_name_en": "OBEC",
            "province_name_en": "Yala",
            "city_name_en": "Yaha",
            "code": "BYH",
            "status": "Enabled"
        },
        {
            "id": 122,
            "name_en": "Chumchon Ban Yuyo School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e0a\u0e38\u0e21\u0e0a\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e22\u0e39\u0e42\u0e22",
            "type_name_en": "OBEC",
            "province_name_en": "Pattani",
            "city_name_en": "Mueang Pattani",
            "code": "BYY",
            "status": "Disabled"
        },
        {
            "id": 137,
            "name_en": "Banbangkaew School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e1a\u0e32\u0e07\u0e41\u0e01\u0e49\u0e27 (\u0e2a\u0e33\u0e19\u0e31\u0e01\u0e07\u0e32\u0e19\u0e2a\u0e25\u0e32\u0e01\u0e01\u0e34\u0e19\u0e41\u0e1a\u0e48\u0e07\u0e2a\u0e07\u0e40\u0e04\u0e23\u0e32\u0e30\u0e2b\u0e4c 44)",
            "type_name_en": "OBEC",
            "province_name_en": "Phetchaburi",
            "city_name_en": "Ban Laem",
            "code": "CBK",
            "status": "Enabled"
        },
        {
            "id": 148,
            "name_en": "Watpobunlung School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e42\u0e1e\u0e18\u0e34\u0e4c\u0e1a\u0e31\u0e25\u0e25\u0e31\u0e07\u0e01\u0e4c",
            "type_name_en": "OBEC",
            "province_name_en": "Ratchaburi",
            "city_name_en": "Ban Pong",
            "code": "CBL",
            "status": "Enabled"
        },
        {
            "id": 155,
            "name_en": "Bannongmoungkai School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e2b\u0e19\u0e2d\u0e07\u0e21\u0e48\u0e27\u0e07\u0e44\u0e02\u0e48(\u0e21\u0e48\u0e27\u0e07\u0e44\u0e02\u0e48\u0e27\u0e34\u0e17\u0e22\u0e32\u0e04\u0e32\u0e23)",
            "type_name_en": "OBEC",
            "province_name_en": "Phrae",
            "city_name_en": "Mueang Phrae",
            "code": "CBM",
            "status": "Enabled"
        },
        {
            "id": 134,
            "name_en": "Bannongkern School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e2b\u0e19\u0e2d\u0e07\u0e40\u0e02\u0e34\u0e19",
            "type_name_en": "OBEC",
            "province_name_en": "Chonburi",
            "city_name_en": "Ban Bueng",
            "code": "CBN",
            "status": "Enabled"
        },
        {
            "id": 144,
            "name_en": "Watbangpidlang School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e1a\u0e32\u0e07\u0e1b\u0e34\u0e14\u0e25\u0e48\u0e32\u0e07(\u0e23\u0e32\u0e29\u0e0e\u0e23\u0e4c\u0e2a\u0e07\u0e40\u0e04\u0e23\u0e32\u0e30\u0e2b\u0e4c)",
            "type_name_en": "OBEC",
            "province_name_en": "Trat",
            "city_name_en": "Laem Ngop",
            "code": "CBP",
            "status": "Enabled"
        },
        {
            "id": 167,
            "name_en": "Banborthai School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e1a\u0e48\u0e2d\u0e44\u0e17\u0e22",
            "type_name_en": "OBEC",
            "province_name_en": "Phetchabun",
            "city_name_en": "Mueang Phetchabun",
            "code": "CBT",
            "status": "Enabled"
        },
        {
            "id": 149,
            "name_en": "Chumchon Bungba School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e0a\u0e38\u0e21\u0e0a\u0e19\u0e1a\u0e36\u0e07\u0e1a\u0e32",
            "type_name_en": "OBEC",
            "province_name_en": "Pathum Thani",
            "city_name_en": "Nong Suea",
            "code": "CCB",
            "status": "Enabled"
        },
        {
            "id": 165,
            "name_en": "Banchumnum Prokfa School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e0a\u0e38\u0e21\u0e19\u0e38\u0e21\u0e1b\u0e23\u0e01\u0e1f\u0e49\u0e32",
            "type_name_en": "OBEC",
            "province_name_en": "Chonburi",
            "city_name_en": "Mueang Chonburi",
            "code": "CCP",
            "status": "Disabled"
        },
        {
            "id": 143,
            "name_en": "Chumchonbantakam School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e0a\u0e38\u0e21\u0e0a\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e17\u0e48\u0e32\u0e02\u0e49\u0e32\u0e21",
            "type_name_en": "OBEC",
            "province_name_en": "Chiang Mai",
            "city_name_en": "Hot",
            "code": "CCT",
            "status": "Enabled"
        },
        {
            "id": 94,
            "name_en": "Guidance Education",
            "name_th": "Guidance Education",
            "type_name_en": "Private School",
            "province_name_en": "Bangkok",
            "city_name_en": "Bang Khae",
            "code": "CGE",
            "status": "Enabled"
        },
        {
            "id": 151,
            "name_en": "Banhuadong School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e2b\u0e31\u0e27\u0e14\u0e07",
            "type_name_en": "OBEC",
            "province_name_en": "Phrae",
            "city_name_en": "Sung Men",
            "code": "CHD",
            "status": "Enabled"
        },
        {
            "id": 139,
            "name_en": "AnubanHuaysak School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e2b\u0e49\u0e27\u0e22\u0e2a\u0e31\u0e01",
            "type_name_en": "OBEC",
            "province_name_en": "Chiang Rai",
            "city_name_en": "Mueang Chiang Rai",
            "code": "CHS",
            "status": "Enabled"
        },
        {
            "id": 68,
            "name_en": "Canadian International Education Organization",
            "name_th": "Canadian International Education Organization",
            "type_name_en": "Private School",
            "province_name_en": "Bangkok",
            "city_name_en": "Bang Khae",
            "code": "CIE",
            "status": "Enabled"
        },
        {
            "id": 153,
            "name_en": "Chumchonwatkoeichainua School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e0a\u0e38\u0e21\u0e0a\u0e19\u0e27\u0e31\u0e14\u0e40\u0e01\u0e22\u0e44\u0e0a\u0e22\u0e40\u0e2b\u0e19\u0e37\u0e2d (\u0e19\u0e34\u0e23\u0e20\u0e31\u0e22\u0e1b\u0e23\u0e30\u0e0a\u0e32\u0e19\u0e38\u0e01\u0e39\u0e25)",
            "type_name_en": "OBEC",
            "province_name_en": "Nakhon Sawan",
            "city_name_en": "Mueang Nakhon Sawan",
            "code": "CKC",
            "status": "Enabled"
        },
        {
            "id": 141,
            "name_en": "Banklongsue School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e04\u0e25\u0e2d\u0e07\u0e0b\u0e37\u0e48\u0e2d",
            "type_name_en": "OBEC",
            "province_name_en": "Samut Sakhon",
            "city_name_en": "Mueang Samut Sakhon",
            "code": "CKS",
            "status": "Enabled"
        },
        {
            "id": 142,
            "name_en": "Banmaeramadnoi School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e41\u0e21\u0e48\u0e23\u0e30\u0e21\u0e32\u0e14\u0e19\u0e49\u0e2d\u0e22",
            "type_name_en": "OBEC",
            "province_name_en": "Tak",
            "city_name_en": "Mae Sot",
            "code": "CMM",
            "status": "Enabled"
        },
        {
            "id": 152,
            "name_en": "Anubanmuangratchaburi School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e40\u0e21\u0e37\u0e2d\u0e07\u0e23\u0e32\u0e0a\u0e1a\u0e38\u0e23\u0e35",
            "type_name_en": "OBEC",
            "province_name_en": "Ratchaburi",
            "city_name_en": "Mueang Ratchaburi",
            "code": "CMR",
            "status": "Enabled"
        },
        {
            "id": 133,
            "name_en": "Watmuangwan School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e21\u0e48\u0e27\u0e07\u0e2b\u0e27\u0e32\u0e19(\u0e2a\u0e48\u0e27\u0e19\u0e01\u0e23\u0e30\u0e1a\u0e27\u0e19\u0e22\u0e38\u0e17\u0e18\u0e1b\u0e23\u0e30\u0e0a\u0e32\u0e2a\u0e23\u0e23\u0e04\u0e4c)",
            "type_name_en": "OBEC",
            "province_name_en": "Phra Nakhon Si Ayutthaya",
            "city_name_en": "Bang Ban",
            "code": "CMW",
            "status": "Enabled"
        },
        {
            "id": 130,
            "name_en": "Watnongchim School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e2b\u0e19\u0e2d\u0e07\u0e0a\u0e34\u0e48\u0e21",
            "type_name_en": "OBEC",
            "province_name_en": "Chanthaburi",
            "city_name_en": "Laem Sing",
            "code": "CNC",
            "status": "Enabled"
        },
        {
            "id": 95,
            "name_en": "Nan Hua",
            "name_th": "Nan Hua",
            "type_name_en": "Private School",
            "province_name_en": "Bangkok",
            "city_name_en": "Bang Khae",
            "code": "CNH",
            "status": "Disabled"
        },
        {
            "id": 166,
            "name_en": "Watnongkun School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e2b\u0e19\u0e2d\u0e07\u0e04\u0e31\u0e19 (\u0e44\u0e08 \u0e1e\u0e34\u0e17\u0e22\u0e32\u0e04\u0e32\u0e23)",
            "type_name_en": "OBEC",
            "province_name_en": "Chanthaburi",
            "city_name_en": "Mueang Chanthaburi",
            "code": "CNK",
            "status": "Enabled"
        },
        {
            "id": 168,
            "name_en": "Banromluang School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e23\u0e48\u0e21\u0e2b\u0e25\u0e27\u0e07",
            "type_name_en": "OBEC",
            "province_name_en": "Chiang Mai",
            "city_name_en": "Mueang Chiang Mai",
            "code": "CRL",
            "status": "Enabled"
        },
        {
            "id": 164,
            "name_en": "Rajapiyorasa Yupparachanusorn School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e23\u0e32\u0e0a\u0e1b\u0e34\u0e42\u0e22\u0e23\u0e2a\u0e32 \u0e22\u0e38\u0e1e\u0e23\u0e32\u0e0a\u0e32\u0e19\u0e38\u0e2a\u0e23\u0e13\u0e4c",
            "type_name_en": "OBEC",
            "province_name_en": "Nan",
            "city_name_en": "Mueang Nan",
            "code": "CRP",
            "status": "Disabled"
        },
        {
            "id": 186,
            "name_en": "Bansrakrajome School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e2a\u0e23\u0e30\u0e01\u0e23\u0e30\u0e42\u0e08\u0e21",
            "type_name_en": "OBEC",
            "province_name_en": "Suphan Buri",
            "city_name_en": "Mueang Suphanburi",
            "code": "CSJ",
            "status": "Disabled"
        },
        {
            "id": 132,
            "name_en": "Bansamyaeknampen School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e2a\u0e32\u0e21\u0e41\u0e22\u0e01\u0e19\u0e49\u0e33\u0e40\u0e1b\u0e47\u0e19",
            "type_name_en": "OBEC",
            "province_name_en": "Rayong",
            "city_name_en": "Khao Chamao",
            "code": "CSN",
            "status": "Enabled"
        },
        {
            "id": 138,
            "name_en": "Tambonbanpan School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e15\u0e33\u0e1a\u0e25\u0e1a\u0e49\u0e32\u0e19\u0e41\u0e1b\u0e49\u0e19",
            "type_name_en": "OBEC",
            "province_name_en": "Lamphun",
            "city_name_en": "Mueang Lamphun",
            "code": "CTB",
            "status": "Enabled"
        },
        {
            "id": 140,
            "name_en": "Thungsadaoprachasan School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e17\u0e38\u0e48\u0e07\u0e2a\u0e30\u0e40\u0e14\u0e32\u0e1b\u0e23\u0e30\u0e0a\u0e32\u0e2a\u0e23\u0e23\u0e04\u0e4c",
            "type_name_en": "OBEC",
            "province_name_en": "Chachoengsao",
            "city_name_en": "Plaeng Yao",
            "code": "CTP",
            "status": "Enabled"
        },
        {
            "id": 136,
            "name_en": "Thanthahan School (Saeng Sawang Up Patham)",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e18\u0e32\u0e23\u0e17\u0e2b\u0e32\u0e23(\u0e41\u0e2a\u0e07\u0e2a\u0e27\u0e48\u0e32\u0e07\u0e2d\u0e38\u0e1b\u0e16\u0e31\u0e21\u0e20\u0e4c)",
            "type_name_en": "OBEC",
            "province_name_en": "Nakhon Sawan",
            "city_name_en": "Nong Bua",
            "code": "CUP",
            "status": "Enabled"
        },
        {
            "id": 145,
            "name_en": "Anubanwangmuang School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e27\u0e31\u0e07\u0e21\u0e48\u0e27\u0e07",
            "type_name_en": "OBEC",
            "province_name_en": "Saraburi",
            "city_name_en": "Wang Muang",
            "code": "CWM",
            "status": "Enabled"
        },
        {
            "id": 135,
            "name_en": "Wat Nak School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e19\u0e32\u0e04",
            "type_name_en": "OBEC",
            "province_name_en": "Phra Nakhon Si Ayutthaya",
            "city_name_en": "Bang Pahan",
            "code": "CWN",
            "status": "Enabled"
        },
        {
            "id": 131,
            "name_en": "Banwangploeng School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e27\u0e31\u0e07\u0e40\u0e1e\u0e25\u0e34\u0e07",
            "type_name_en": "OBEC",
            "province_name_en": "Lopburi",
            "city_name_en": "Khok Samrong",
            "code": "CWP",
            "status": "Enabled"
        },
        {
            "id": 185,
            "name_en": "Banwangsing School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e27\u0e31\u0e07\u0e2a\u0e34\u0e07\u0e2b\u0e4c",
            "type_name_en": "OBEC",
            "province_name_en": "Kanchanaburi",
            "city_name_en": "Mueang Kanchanaburi",
            "code": "CWS",
            "status": "Enabled"
        },
        {
            "id": 177,
            "name_en": "Sriwiangsawittayakarn School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e28\u0e23\u0e35\u0e40\u0e27\u0e35\u0e22\u0e07\u0e2a\u0e32\u0e27\u0e34\u0e17\u0e22\u0e32\u0e04\u0e32\u0e23",
            "type_name_en": "OBEC",
            "province_name_en": "Nan",
            "city_name_en": "Mueang Nan",
            "code": "CWY",
            "status": "Enabled"
        },
        {
            "id": 146,
            "name_en": "Muangyaowittaya School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e40\u0e21\u0e37\u0e2d\u0e07\u0e22\u0e32\u0e27\u0e27\u0e34\u0e17\u0e22\u0e32",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Hang Chat",
            "code": "CYW",
            "status": "Enabled"
        },
        {
            "id": 78,
            "name_en": "Boribalpumkhet",
            "name_th": "\u0e1a\u0e23\u0e34\u0e1a\u0e32\u0e25\u0e20\u0e39\u0e21\u0e34\u0e40\u0e02\u0e15\u0e15\u0e4c",
            "type_name_en": "Private School",
            "province_name_en": "Udon Thani",
            "city_name_en": "Mueang Udon Thani",
            "code": "DBB",
            "status": "Disabled"
        },
        {
            "id": 99,
            "name_en": "Anubanbunditnoi School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e1a\u0e31\u0e13\u0e11\u0e34\u0e15\u0e19\u0e49\u0e2d\u0e22",
            "type_name_en": "Private School",
            "province_name_en": "Nakhon Ratchasima",
            "city_name_en": "Mueang Nakhon Ratchasima",
            "code": "DBN",
            "status": "Disabled"
        },
        {
            "id": 204,
            "name_en": "Huathale Municipality School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25\u0e15\u0e4d\u0e32\u0e1a\u0e25\u0e2b\u0e31\u0e27\u0e17\u0e30\u0e40\u0e25",
            "type_name_en": "Trial School",
            "province_name_en": "Nakhon Ratchasima",
            "city_name_en": "Mueang Nakhon Ratchasima",
            "code": "DHM",
            "status": "Enabled"
        },
        {
            "id": 182,
            "name_en": "AnubanBanphiaMittraphab 138",
            "name_th": "\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e1a\u0e49\u0e32\u0e19\u0e40\u0e1e\u0e35\u0e22\u0e21\u0e34\u0e15\u0e23\u0e20\u0e32\u0e1e\u0e17\u0e35\u0e48 138",
            "type_name_en": "OBEC",
            "province_name_en": "Udon Thani",
            "city_name_en": "Mueang Udon Thani",
            "code": "EBM",
            "status": "Enabled"
        },
        {
            "id": 176,
            "name_en": "Banpao School (Sumranchaivittaya)",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e40\u0e1b\u0e49\u0e32 (\u0e2a\u0e33\u0e23\u0e32\u0e0d\u0e44\u0e0a\u0e22\u0e27\u0e34\u0e17\u0e22\u0e32)",
            "type_name_en": "OBEC",
            "province_name_en": "Chaiyaphum",
            "city_name_en": "Mueang Chaiyaphum",
            "code": "EBP",
            "status": "Enabled"
        },
        {
            "id": 180,
            "name_en": "Bupuaiwitthayakarn School",
            "name_th": "\u0e1a\u0e38\u0e40\u0e1b\u0e37\u0e2d\u0e22\u0e27\u0e34\u0e17\u0e22\u0e32\u0e04\u0e32\u0e23",
            "type_name_en": "OBEC",
            "province_name_en": "Ubon Ratchathani",
            "city_name_en": "Mueang Ubon Ratchathani",
            "code": "EBW",
            "status": "Disabled"
        },
        {
            "id": 147,
            "name_en": "Huaimekratnukul School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2b\u0e49\u0e27\u0e22\u0e40\u0e21\u0e47\u0e01\u0e23\u0e32\u0e29\u0e0e\u0e23\u0e4c\u0e19\u0e38\u0e01\u0e39\u0e25",
            "type_name_en": "OBEC",
            "province_name_en": "Kalasin",
            "city_name_en": "Huai Mek",
            "code": "EHR",
            "status": "Enabled"
        },
        {
            "id": 160,
            "name_en": "Bankhambong1 School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e04\u0e33\u0e1a\u0e071",
            "type_name_en": "OBEC",
            "province_name_en": "Mukdahan",
            "city_name_en": "Mueang Mukdahan",
            "code": "EKB",
            "status": "Enabled"
        },
        {
            "id": 158,
            "name_en": "Choomchondongmafaicharoensin School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e0a\u0e38\u0e21\u0e0a\u0e19\u0e14\u0e07\u0e21\u0e30\u0e44\u0e1f\u0e40\u0e08\u0e23\u0e34\u0e0d\u0e28\u0e34\u0e25\u0e1b\u0e4c",
            "type_name_en": "OBEC",
            "province_name_en": "Sakon Nakhon",
            "city_name_en": "Mueang Sakon Nakhon",
            "code": "EMC",
            "status": "Enabled"
        },
        {
            "id": 161,
            "name_en": "Anuban Mueang Si Somdet School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e40\u0e21\u0e37\u0e2d\u0e07\u0e28\u0e23\u0e35\u0e2a\u0e21\u0e40\u0e14\u0e47\u0e08(\u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e04\u0e38\u0e23\u0e38\u0e23\u0e32\u0e29\u0e0e\u0e23\u0e4c\u0e1a\u0e33\u0e23\u0e38\u0e07)",
            "type_name_en": "OBEC",
            "province_name_en": "Roi Et",
            "city_name_en": "Kaset Wisai",
            "code": "EMS",
            "status": "Enabled"
        },
        {
            "id": 181,
            "name_en": "Bannonghin School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e2b\u0e19\u0e2d\u0e07\u0e2b\u0e34\u0e19",
            "type_name_en": "OBEC",
            "province_name_en": "Khon Kaen",
            "city_name_en": "Khao Suan Kwang",
            "code": "ENH",
            "status": "Enabled"
        },
        {
            "id": 178,
            "name_en": "Nongnokkhiansamukkee School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2b\u0e19\u0e2d\u0e07\u0e19\u0e01\u0e40\u0e02\u0e35\u0e22\u0e19\u0e2a\u0e32\u0e21\u0e31\u0e04\u0e04\u0e35",
            "type_name_en": "OBEC",
            "province_name_en": "Nakhon Ratchasima",
            "city_name_en": "Mueang Nakhon Ratchasima",
            "code": "ENK",
            "status": "Disabled"
        },
        {
            "id": 162,
            "name_en": "Chumchon Nong Song Hong Kururat Rangsan School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e0a\u0e38\u0e21\u0e0a\u0e19\u0e2b\u0e19\u0e2d\u0e07\u0e2a\u0e2d\u0e07\u0e2b\u0e49\u0e2d\u0e07\u0e04\u0e38\u0e23\u0e38\u0e23\u0e32\u0e29\u0e0e\u0e23\u0e4c\u0e23\u0e31\u0e07\u0e2a\u0e23\u0e23\u0e04\u0e4c",
            "type_name_en": "OBEC",
            "province_name_en": "Khon Kaen",
            "city_name_en": "Mueang Khon Kaen",
            "code": "ENS",
            "status": "Enabled"
        },
        {
            "id": 187,
            "name_en": "Nikomsangtonang 1 School",
            "name_th": "\u0e19\u0e34\u0e04\u0e21\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e15\u0e19\u0e40\u0e2d\u0e07 1",
            "type_name_en": "OBEC",
            "province_name_en": "Buriram",
            "city_name_en": "Mueang Buriram",
            "code": "ENT",
            "status": "Enabled"
        },
        {
            "id": 169,
            "name_en": "NathonWittayanukool School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e19\u0e32\u0e16\u0e48\u0e2d\u0e19\u0e27\u0e34\u0e17\u0e22\u0e32\u0e19\u0e38\u0e01\u0e39\u0e25",
            "type_name_en": "OBEC",
            "province_name_en": "Nakhon Phanom",
            "city_name_en": "Mueang Nakhon Phanom",
            "code": "ENW",
            "status": "Enabled"
        },
        {
            "id": 154,
            "name_en": "Pipatratbumroong School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1e\u0e34\u0e1e\u0e31\u0e12\u0e19\u0e4c\u0e23\u0e32\u0e29\u0e0e\u0e23\u0e4c\u0e1a\u0e33\u0e23\u0e38\u0e07",
            "type_name_en": "OBEC",
            "province_name_en": "Kalasin",
            "city_name_en": "Mueang Kalasin",
            "code": "EPB",
            "status": "Enabled"
        },
        {
            "id": 150,
            "name_en": "Banpiamat School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e40\u0e1e\u0e35\u0e22\u0e21\u0e32\u0e15(\u0e23\u0e31\u0e10\u0e23\u0e32\u0e29\u0e0e\u0e23\u0e4c\u0e1e\u0e34\u0e17\u0e22\u0e32\u0e04\u0e32\u0e23)",
            "type_name_en": "OBEC",
            "province_name_en": "Sisaket",
            "city_name_en": "Rasi Salai",
            "code": "EPM",
            "status": "Enabled"
        },
        {
            "id": 157,
            "name_en": "Choomchonprathai School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e0a\u0e38\u0e21\u0e0a\u0e19\u0e1b\u0e23\u0e30\u0e17\u0e32\u0e22",
            "type_name_en": "OBEC",
            "province_name_en": "Nakhon Ratchasima",
            "city_name_en": "Mueang Nakhon Ratchasima",
            "code": "EPT",
            "status": "Enabled"
        },
        {
            "id": 183,
            "name_en": "Sanomsuksakarn school",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2a\u0e19\u0e21\u0e28\u0e36\u0e01\u0e29\u0e32\u0e04\u0e32\u0e23",
            "type_name_en": "OBEC",
            "province_name_en": "Surin",
            "city_name_en": "Mueang Surin",
            "code": "ESS",
            "status": "Enabled"
        },
        {
            "id": 159,
            "name_en": "Subyaiwitthayakhom School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e0b\u0e31\u0e1a\u0e43\u0e2b\u0e0d\u0e48\u0e27\u0e34\u0e17\u0e22\u0e32\u0e04\u0e21",
            "type_name_en": "OBEC",
            "province_name_en": "Chaiyaphum",
            "city_name_en": "Mueang Chaiyaphum",
            "code": "ESW",
            "status": "Enabled"
        },
        {
            "id": 174,
            "name_en": "Anubanhuataphan School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e2b\u0e31\u0e27\u0e15\u0e30\u0e1e\u0e32\u0e19(\u0e23\u0e31\u0e15\u0e19\u0e27\u0e32\u0e23\u0e35)",
            "type_name_en": "OBEC",
            "province_name_en": "Amnat Charoen",
            "city_name_en": "Hua Taphan",
            "code": "ETH",
            "status": "Enabled"
        },
        {
            "id": 184,
            "name_en": "Ban Trum School (TrumWittayanukroh)",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e15\u0e23\u0e36\u0e21 (\u0e15\u0e23\u0e36\u0e21\u0e27\u0e34\u0e17\u0e22\u0e32\u0e19\u0e38\u0e40\u0e04\u0e23\u0e32\u0e30\u0e2b\u0e4c)",
            "type_name_en": "OBEC",
            "province_name_en": "Surin",
            "city_name_en": "Mueang Surin",
            "code": "ETW",
            "status": "Enabled"
        },
        {
            "id": 156,
            "name_en": "Wichitwittaya School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e40\u0e0a\u0e35\u0e22\u0e07\u0e04\u0e32\u0e19 \"\u0e27\u0e34\u0e08\u0e34\u0e15\u0e23\u0e27\u0e34\u0e17\u0e22\u0e32\"",
            "type_name_en": "OBEC",
            "province_name_en": "Loei",
            "city_name_en": "Mueang Loei",
            "code": "EWW",
            "status": "Enabled"
        },
        {
            "id": 163,
            "name_en": "Anubanbandan School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e1a\u0e49\u0e32\u0e19\u0e14\u0e48\u0e32\u0e19",
            "type_name_en": "OBEC",
            "province_name_en": "Ranong",
            "city_name_en": "Mueang Ranong",
            "code": "FBD",
            "status": "Enabled"
        },
        {
            "id": 188,
            "name_en": "Bandinkong School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e14\u0e34\u0e19\u0e01\u0e49\u0e2d\u0e07",
            "type_name_en": "OBEC",
            "province_name_en": "Surat Thani",
            "city_name_en": "Mueang Surat Thani",
            "code": "FDK",
            "status": "Disabled"
        },
        {
            "id": 170,
            "name_en": "Banklongna Mittraphap 201",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e04\u0e25\u0e2d\u0e07\u0e19\u0e32\u0e21\u0e34\u0e15\u0e23\u0e20\u0e32\u0e1e\u0e17\u0e35\u0e48 201",
            "type_name_en": "OBEC",
            "province_name_en": "Surat Thani",
            "city_name_en": "Mueang Surat Thani",
            "code": "FKM",
            "status": "Enabled"
        },
        {
            "id": 179,
            "name_en": "Banmaekree School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e41\u0e21\u0e48\u0e02\u0e23\u0e35(\u0e2a\u0e27\u0e34\u0e07\u0e1b\u0e23\u0e30\u0e0a\u0e32\u0e2a\u0e23\u0e23\u0e04\u0e4c)",
            "type_name_en": "OBEC",
            "province_name_en": "Phatthalung",
            "city_name_en": "Tamot",
            "code": "FMK",
            "status": "Enabled"
        },
        {
            "id": 189,
            "name_en": "Ban Mamuang Ngam School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e21\u0e30\u0e21\u0e48\u0e27\u0e07\u0e07\u0e32\u0e21",
            "type_name_en": "OBEC",
            "province_name_en": "Surat Thani",
            "city_name_en": "Mueang Surat Thani",
            "code": "FMN",
            "status": "Disabled"
        },
        {
            "id": 171,
            "name_en": "Banneonthong School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e40\u0e19\u0e34\u0e19\u0e17\u0e2d\u0e07",
            "type_name_en": "OBEC",
            "province_name_en": "Chumphon",
            "city_name_en": "Mueang Chumphon",
            "code": "FNT",
            "status": "Enabled"
        },
        {
            "id": 173,
            "name_en": "Taladnongvai School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e15\u0e25\u0e32\u0e14\u0e2b\u0e19\u0e2d\u0e07\u0e2b\u0e27\u0e32\u0e22",
            "type_name_en": "OBEC",
            "province_name_en": "Surat Thani",
            "city_name_en": "Tha Chana",
            "code": "FNV",
            "status": "Enabled"
        },
        {
            "id": 190,
            "name_en": "Banpaknamthakrajai School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e1b\u0e32\u0e01\u0e19\u0e49\u0e33\u0e17\u0e48\u0e32\u0e01\u0e23\u0e30\u0e08\u0e32\u0e22",
            "type_name_en": "OBEC",
            "province_name_en": "Surat Thani",
            "city_name_en": "Mueang Surat Thani",
            "code": "FPT",
            "status": "Disabled"
        },
        {
            "id": 191,
            "name_en": "Watumpawas School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e2d\u0e31\u0e21\u0e1e\u0e32\u0e27\u0e32\u0e2a",
            "type_name_en": "OBEC",
            "province_name_en": "Surat Thani",
            "city_name_en": "Mueang Surat Thani",
            "code": "FPW",
            "status": "Disabled"
        },
        {
            "id": 175,
            "name_en": "Watsatitphotaram School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e2a\u0e16\u0e34\u0e15\u0e42\u0e1e\u0e18\u0e32\u0e23\u0e32\u0e21",
            "type_name_en": "OBEC",
            "province_name_en": "Krabi",
            "city_name_en": "Mueang Krabi",
            "code": "FSP",
            "status": "Enabled"
        },
        {
            "id": 172,
            "name_en": "Watsuwannawas School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e2a\u0e38\u0e27\u0e23\u0e23\u0e13\u0e32\u0e27\u0e32\u0e2a",
            "type_name_en": "OBEC",
            "province_name_en": "Phang Nga",
            "city_name_en": "Mueang Phang Nga",
            "code": "FSW",
            "status": "Enabled"
        },
        {
            "id": 86,
            "name_en": "Thesaban 4 Ban Ka Pae Hulu",
            "name_th": "\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25 4 \u0e1a\u0e49\u0e32\u0e19\u0e01\u0e32\u0e41\u0e1b\u0e4a\u0e30\u0e2e\u0e39\u0e25\u0e39",
            "type_name_en": "Thesaban",
            "province_name_en": "Yala",
            "city_name_en": "Betong",
            "code": "GHL",
            "status": "Disabled"
        },
        {
            "id": 83,
            "name_en": "Thesaban 1 Ban Ka Pae",
            "name_th": "\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25 1 \u0e1a\u0e49\u0e32\u0e19\u0e01\u0e32\u0e41\u0e1b\u0e4a\u0e30",
            "type_name_en": "Thesaban",
            "province_name_en": "Yala",
            "city_name_en": "Betong",
            "code": "GKP",
            "status": "Disabled"
        },
        {
            "id": 84,
            "name_en": "Thesaban 2 Ban Ka Pae Kor Tor",
            "name_th": "\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25 2 \u0e1a\u0e49\u0e32\u0e19\u0e01\u0e32\u0e41\u0e1b\u0e4a\u0e30\u0e01\u0e2d\u0e15\u0e2d",
            "type_name_en": "Thesaban",
            "province_name_en": "Yala",
            "city_name_en": "Betong",
            "code": "GKT",
            "status": "Disabled"
        },
        {
            "id": 85,
            "name_en": "Thesaban 3 Ban Ku Nung Chanong",
            "name_th": "\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25 3 \u0e1a\u0e49\u0e32\u0e19\u0e01\u0e38\u0e19\u0e38\u0e07\u0e08\u0e19\u0e2d\u0e07",
            "type_name_en": "Thesaban",
            "province_name_en": "Yala",
            "city_name_en": "Betong",
            "code": "GNC",
            "status": "Disabled"
        },
        {
            "id": 87,
            "name_en": "Thesaban 6 Prachasan",
            "name_th": "\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25 6 \u0e1b\u0e23\u0e30\u0e0a\u0e32\u0e2a\u0e31\u0e19\u0e15\u0e34\u0e4c",
            "type_name_en": "Thesaban",
            "province_name_en": "Yala",
            "city_name_en": "Betong",
            "code": "GPC",
            "status": "Disabled"
        },
        {
            "id": 88,
            "name_en": "Ban Phaiprathomsuksa",
            "name_th": "\u0e1a\u0e49\u0e32\u0e19\u0e44\u0e1c\u0e48\u0e1b\u0e23\u0e30\u0e16\u0e21\u0e28\u0e36\u0e01\u0e29\u0e32",
            "type_name_en": "Private School",
            "province_name_en": "Khon Kaen",
            "city_name_en": "Ban Phai",
            "code": "HBP",
            "status": "Disabled"
        },
        {
            "id": 101,
            "name_en": "Manchachristian School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e21\u0e31\u0e0d\u0e08\u0e32\u0e04\u0e23\u0e34\u0e2a\u0e40\u0e15\u0e35\u0e22\u0e19",
            "type_name_en": "Private School",
            "province_name_en": "Khon Kaen",
            "city_name_en": "Mancha Khiri",
            "code": "HMC",
            "status": "Disabled"
        },
        {
            "id": 114,
            "name_en": "Suansanuk Municipal School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25\u0e2a\u0e27\u0e19\u0e2a\u0e19\u0e38\u0e01",
            "type_name_en": "Thesaban",
            "province_name_en": "Khon Kaen",
            "city_name_en": "Mueang Khon Kaen",
            "code": "HSS",
            "status": "Enabled"
        },
        {
            "id": 65,
            "name_en": "Chiangsaen Academy",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e40\u0e0a\u0e35\u0e22\u0e07\u0e41\u0e2a\u0e19\u0e2d\u0e32\u0e04\u0e32\u0e40\u0e14\u0e21\u0e35",
            "type_name_en": "Private School",
            "province_name_en": "Chiang Rai",
            "city_name_en": "Chiang Saen",
            "code": "JCA",
            "status": "Disabled"
        },
        {
            "id": 66,
            "name_en": "Tessaban 1 Wianchiangsaen",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25 1 \u0e40\u0e27\u0e35\u0e22\u0e07\u0e40\u0e0a\u0e35\u0e22\u0e07\u0e41\u0e2a\u0e19",
            "type_name_en": "Thesaban",
            "province_name_en": "Chiang Rai",
            "city_name_en": "Chiang Saen",
            "code": "JCS",
            "status": "Disabled"
        },
        {
            "id": 92,
            "name_en": "Jongruksat Wittaya",
            "name_th": "\u0e08\u0e07\u0e23\u0e31\u0e01\u0e2a\u0e31\u0e15\u0e22\u0e4c\u0e27\u0e34\u0e17\u0e22\u0e32",
            "type_name_en": "OBEC",
            "province_name_en": "Pattani",
            "city_name_en": "Mueang Pattani",
            "code": "JRS",
            "status": "Disabled"
        },
        {
            "id": 44,
            "name_en": "Jaipian Vittayanusorn School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e43\u0e08\u0e40\u0e1e\u0e35\u0e22\u0e23\u0e27\u0e34\u0e17\u0e22\u0e32\u0e19\u0e38\u0e2a\u0e23\u0e13\u0e4c",
            "type_name_en": "Private School",
            "province_name_en": "Sing Buri",
            "city_name_en": "Tha Chang",
            "code": "JVS",
            "status": "Disabled"
        },
        {
            "id": 64,
            "name_en": "Anubanwiangchai School",
            "name_th": "\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e40\u0e27\u0e35\u0e22\u0e07\u0e0a\u0e31\u0e22",
            "type_name_en": "OBEC",
            "province_name_en": "Chiang Rai",
            "city_name_en": "Wiang Chai",
            "code": "JWC",
            "status": "Disabled"
        },
        {
            "id": 79,
            "name_en": "Wisanusorn",
            "name_th": "\u0e27\u0e34\u0e28\u0e32\u0e19\u0e38\u0e2a\u0e23\u0e13\u0e4c",
            "type_name_en": "Private School",
            "province_name_en": "Chiang Rai",
            "city_name_en": "Mueang Chiang Rai",
            "code": "JWS",
            "status": "Disabled"
        },
        {
            "id": 81,
            "name_en": "Coral Bay Kindergarten",
            "name_th": "Coral Bay Kindergarten",
            "type_name_en": "Private School",
            "province_name_en": "Bangkok",
            "city_name_en": "Bang Khae",
            "code": "KCB",
            "status": "Enabled"
        },
        {
            "id": 103,
            "name_en": "Khonkaen University",
            "name_th": "\u0e21\u0e2b\u0e32\u0e27\u0e34\u0e17\u0e22\u0e32\u0e25\u0e31\u0e22\u0e02\u0e2d\u0e19\u0e41\u0e01\u0e48\u0e19",
            "type_name_en": "University",
            "province_name_en": "Khon Kaen",
            "city_name_en": "Mueang Khon Kaen",
            "code": "KKU",
            "status": "Disabled"
        },
        {
            "id": 50,
            "name_en": "Ratchamangkhalanuson School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e23\u0e31\u0e0a\u0e21\u0e07\u0e04\u0e25\u0e32\u0e19\u0e38\u0e2a\u0e23\u0e13\u0e4c",
            "type_name_en": "Thesaban",
            "province_name_en": "Sisaket",
            "city_name_en": "Mueang Sisaket",
            "code": "KRM",
            "status": "Disabled"
        },
        {
            "id": 62,
            "name_en": "Chumchon Baan Wanghin",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e0a\u0e38\u0e21\u0e0a\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e27\u0e31\u0e07\u0e2b\u0e34\u0e19",
            "type_name_en": "OBEC",
            "province_name_en": "Nakhon Ratchasima",
            "city_name_en": "Phimai",
            "code": "KWH",
            "status": "Disabled"
        },
        {
            "id": 82,
            "name_en": "Kai Ying Si Kindergarten",
            "name_th": "Kai Ying Si Kindergarten",
            "type_name_en": "Private School",
            "province_name_en": "Bangkok",
            "city_name_en": "Bang Khae",
            "code": "KYS",
            "status": "Disabled"
        },
        {
            "id": 58,
            "name_en": "Wat Baan Keam",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e1a\u0e49\u0e32\u0e19\u0e41\u0e02\u0e21",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Mae Mo",
            "code": "LBK",
            "status": "Disabled"
        },
        {
            "id": 90,
            "name_en": "Ban Maesarn",
            "name_th": "\u0e1a\u0e49\u0e32\u0e19\u0e41\u0e21\u0e48\u0e2a\u0e49\u0e32\u0e19",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Mae Mo",
            "code": "LBM",
            "status": "Disabled"
        },
        {
            "id": 52,
            "name_en": "Baan Than",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e17\u0e32\u0e19",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Mae Mo",
            "code": "LBT",
            "status": "Disabled"
        },
        {
            "id": 89,
            "name_en": "Ban Jampui",
            "name_th": "\u0e1a\u0e49\u0e32\u0e19\u0e08\u0e33\u0e1b\u0e38\u0e22",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Mae Mo",
            "code": "LJP",
            "status": "Disabled"
        },
        {
            "id": 91,
            "name_en": "Anuban Mae Mo",
            "name_th": "\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e41\u0e21\u0e48\u0e40\u0e21\u0e32\u0e30",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Mae Mo",
            "code": "LMM",
            "status": "Disabled"
        },
        {
            "id": 55,
            "name_en": "Baan Mai Rattana",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e43\u0e2b\u0e21\u0e48\u0e23\u0e31\u0e15\u0e19",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Mae Mo",
            "code": "LMR",
            "status": "Disabled"
        },
        {
            "id": 54,
            "name_en": "Sob Mo Wittaya",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2a\u0e1a\u0e40\u0e21\u0e32\u0e30\u0e27\u0e34\u0e17\u0e22\u0e32",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Mae Mo",
            "code": "LMW",
            "status": "Disabled"
        },
        {
            "id": 53,
            "name_en": "Baan NaChae",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e19\u0e32\u0e41\u0e0a\u0e48",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Mae Mo",
            "code": "LNC",
            "status": "Disabled"
        },
        {
            "id": 56,
            "name_en": "Baan Nasak",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e19\u0e32\u0e2a\u0e31\u0e01",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Mae Mo",
            "code": "LNS",
            "status": "Disabled"
        },
        {
            "id": 57,
            "name_en": "Sob Paad Wittaya",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2a\u0e1a\u0e1b\u0e49\u0e32\u0e14\u0e27\u0e34\u0e17\u0e22\u0e32",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Mae Mo",
            "code": "LPW",
            "status": "Disabled"
        },
        {
            "id": 93,
            "name_en": "Wat Sob Jang",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e2a\u0e1a\u0e08\u0e32\u0e07",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Mae Mo",
            "code": "LSJ",
            "status": "Disabled"
        },
        {
            "id": 59,
            "name_en": "Wat Tha Si",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e17\u0e48\u0e32\u0e2a\u0e35",
            "type_name_en": "OBEC",
            "province_name_en": "Lampang",
            "city_name_en": "Mae Mo",
            "code": "LTS",
            "status": "Disabled"
        },
        {
            "id": 28,
            "name_en": "Thesaban 2 Ban Malayu Bangkok",
            "name_th": "\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25 2 \u0e1a\u0e49\u0e32\u0e19\u0e21\u0e25\u0e32\u0e22\u0e39\u0e1a\u0e32\u0e07\u0e01\u0e2d\u0e01",
            "type_name_en": "Thesaban",
            "province_name_en": "Yala",
            "city_name_en": "Mueang Yala",
            "code": "MLY",
            "status": "Enabled"
        },
        {
            "id": 51,
            "name_en": "Tha Bo",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e17\u0e48\u0e32\u0e1a\u0e48\u0e2d",
            "type_name_en": "Thesaban",
            "province_name_en": "Nong Khai",
            "city_name_en": "Tha Bo",
            "code": "NTB",
            "status": "Disabled"
        },
        {
            "id": 61,
            "name_en": "Baan Bai",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e44\u0e1a\u0e01\u0e4c",
            "type_name_en": "Border Patrol Police",
            "province_name_en": "Yala",
            "city_name_en": "Mueang Yala",
            "code": "PBB",
            "status": "Disabled"
        },
        {
            "id": 106,
            "name_en": "Anuban Pornprasartwittaya",
            "name_th": "\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e1e\u0e23\u0e1b\u0e23\u0e30\u0e2a\u0e32\u0e17\u0e27\u0e34\u0e17\u0e22\u0e32",
            "type_name_en": "Private School",
            "province_name_en": "Suphan Buri",
            "city_name_en": "Doem Bang Nang Buat",
            "code": "PPV",
            "status": "Disabled"
        },
        {
            "id": 80,
            "name_en": "Piyamitwittaya",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1b\u0e34\u0e22\u0e21\u0e34\u0e15\u0e23\u0e27\u0e34\u0e17\u0e22\u0e32",
            "type_name_en": "Private School",
            "province_name_en": "Phayao",
            "city_name_en": "Chiang Kham",
            "code": "PPW",
            "status": "Disabled"
        },
        {
            "id": 108,
            "name_en": "Phairot Witchalai School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e44\u0e1e\u0e42\u0e23\u0e08\u0e19\u0e4c\u0e27\u0e34\u0e0a\u0e0a\u0e32\u0e25\u0e31\u0e22",
            "type_name_en": "Private School",
            "province_name_en": "Roi Et",
            "city_name_en": "Mueang Roi Et",
            "code": "PRW",
            "status": "Disabled"
        },
        {
            "id": 112,
            "name_en": "Sanfun Phrae School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2a\u0e32\u0e19\u0e1d\u0e31\u0e19\u0e41\u0e1e\u0e23\u0e48",
            "type_name_en": "Private School",
            "province_name_en": "Phrae",
            "city_name_en": "Mueang Phrae",
            "code": "PSF",
            "status": "Disabled"
        },
        {
            "id": 63,
            "name_en": "Sawanwittayakaan ",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2a\u0e27\u0e23\u0e23\u0e04\u0e4c\u0e27\u0e34\u0e17\u0e22\u0e32\u0e04\u0e32\u0e23",
            "type_name_en": "Private School",
            "province_name_en": "Narathiwat",
            "city_name_en": "Rueso",
            "code": "PSW",
            "status": "Disabled"
        },
        {
            "id": 100,
            "name_en": "Anubanphairot School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e44\u0e1e\u0e42\u0e23\u0e08\u0e19\u0e4c",
            "type_name_en": "Private School",
            "province_name_en": "Roi Et",
            "city_name_en": "Mueang Roi Et",
            "code": "RAP",
            "status": "Disabled"
        },
        {
            "id": 116,
            "name_en": "Prasong Wittayanusorn",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1b\u0e23\u0e30\u0e2a\u0e07\u0e04\u0e4c\u0e27\u0e34\u0e17\u0e22\u0e32\u0e19\u0e38\u0e2a\u0e23\u0e13\u0e4c",
            "type_name_en": "Private School",
            "province_name_en": "Roi Et",
            "city_name_en": "Mueang Roi Et",
            "code": "RPW",
            "status": "Disabled"
        },
        {
            "id": 117,
            "name_en": "Anuban Chuleekorn",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e0a\u0e38\u0e25\u0e35\u0e01\u0e23",
            "type_name_en": "Private School",
            "province_name_en": "Surat Thani",
            "city_name_en": "Don Sak",
            "code": "SAC",
            "status": "Disabled"
        },
        {
            "id": 27,
            "name_en": "Thesaban 1 Ban Sateng",
            "name_th": "\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25 1 \u0e1a\u0e49\u0e32\u0e19\u0e2a\u0e30\u0e40\u0e15\u0e07",
            "type_name_en": "Thesaban",
            "province_name_en": "Yala",
            "city_name_en": "Mueang Yala",
            "code": "SAT",
            "status": "Enabled"
        },
        {
            "id": 124,
            "name_en": "Anuban Khaochakan",
            "name_th": "\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e40\u0e02\u0e32\u0e09\u0e01\u0e23\u0e23\u0e08\u0e4c",
            "type_name_en": "OBEC",
            "province_name_en": "Sa Kaeo",
            "city_name_en": "Khao Chakan",
            "code": "SKC",
            "status": "Disabled"
        },
        {
            "id": 125,
            "name_en": "Anuban Khlong Had",
            "name_th": "\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e04\u0e25\u0e2d\u0e07\u0e2b\u0e32\u0e14",
            "type_name_en": "OBEC",
            "province_name_en": "Sa Kaeo",
            "city_name_en": "Khlong Hat",
            "code": "SKH",
            "status": "Disabled"
        },
        {
            "id": 49,
            "name_en": "Anuban Kittikorn School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e01\u0e34\u0e15\u0e15\u0e34\u0e01\u0e23",
            "type_name_en": "Private School",
            "province_name_en": "Chai Nat",
            "city_name_en": "Hankha",
            "code": "SKK",
            "status": "Disabled"
        },
        {
            "id": 126,
            "name_en": "Ban Khaomaka",
            "name_th": "\u0e1a\u0e49\u0e32\u0e19\u0e40\u0e02\u0e32\u0e21\u0e30\u0e01\u0e32",
            "type_name_en": "OBEC",
            "province_name_en": "Sa Kaeo",
            "city_name_en": "Mueang Sa Kaeo",
            "code": "SKM",
            "status": "Disabled"
        },
        {
            "id": 127,
            "name_en": "Anuban Wangnamyen Mittraphap 179",
            "name_th": "\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e27\u0e31\u0e07\u0e19\u0e49\u0e33\u0e40\u0e22\u0e47\u0e19\u0e21\u0e34\u0e15\u0e23\u0e20\u0e32\u0e1e\u0e17\u0e35\u0e48 179",
            "type_name_en": "OBEC",
            "province_name_en": "Sa Kaeo",
            "city_name_en": "Wang Nam Yen",
            "code": "SMP",
            "status": "Disabled"
        },
        {
            "id": 129,
            "name_en": "Manitanukroh School",
            "name_th": "\u0e21\u0e32\u0e19\u0e34\u0e15\u0e32\u0e19\u0e38\u0e40\u0e04\u0e23\u0e32\u0e30\u0e2b\u0e4c",
            "type_name_en": "Private School",
            "province_name_en": "Surat Thani",
            "city_name_en": "Mueang Surat Thani",
            "code": "SMT",
            "status": "Disabled"
        },
        {
            "id": 115,
            "name_en": "Anubal Piamrak School (On Demand)",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e40\u0e1b\u0e35\u0e48\u0e22\u0e21\u0e23\u0e31\u0e01 On Demand",
            "type_name_en": "Private School",
            "province_name_en": "Surat Thani",
            "city_name_en": "Phanom",
            "code": "SPO",
            "status": "Disabled"
        },
        {
            "id": 102,
            "name_en": "Anubal Piamrak School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e40\u0e1b\u0e35\u0e48\u0e22\u0e21\u0e23\u0e31\u0e01",
            "type_name_en": "Private School",
            "province_name_en": "Surat Thani",
            "city_name_en": "Phanom",
            "code": "SPR",
            "status": "Disabled"
        },
        {
            "id": 105,
            "name_en": "Phetphadungwiangchai School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e40\u0e1e\u0e0a\u0e23\u0e1c\u0e14\u0e38\u0e07\u0e40\u0e27\u0e35\u0e22\u0e07\u0e44\u0e0a\u0e22",
            "type_name_en": "Private School",
            "province_name_en": "Surat Thani",
            "city_name_en": "Chaiya",
            "code": "SPW",
            "status": "Disabled"
        },
        {
            "id": 47,
            "name_en": "Wang Dee",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2b\u0e27\u0e31\u0e07\u0e14\u0e35",
            "type_name_en": "Private School",
            "province_name_en": "Songkhla",
            "city_name_en": "Mueang Songkhla",
            "code": "SWD",
            "status": "Disabled"
        },
        {
            "id": 128,
            "name_en": "Ban Wangmai",
            "name_th": "\u0e1a\u0e49\u0e32\u0e19\u0e27\u0e31\u0e07\u0e43\u0e2b\u0e21\u0e48",
            "type_name_en": "OBEC",
            "province_name_en": "Sa Kaeo",
            "city_name_en": "Wang Sombun",
            "code": "SWM",
            "status": "Enabled"
        },
        {
            "id": 96,
            "name_en": "Thewphaingarm Canadian Bilingual School",
            "name_th": "Thewphaingarm Canadian Bilingual School",
            "type_name_en": "Private School",
            "province_name_en": "Bangkok",
            "city_name_en": "Bang Khae",
            "code": "TCB",
            "status": "Enabled"
        },
        {
            "id": 30,
            "name_en": "Thesaban 4 Thon Withi",
            "name_th": "\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25 4 \u0e18\u0e19\u0e27\u0e34\u0e16\u0e35",
            "type_name_en": "Thesaban",
            "province_name_en": "Yala",
            "city_name_en": "Mueang Yala",
            "code": "TNW",
            "status": "Enabled"
        },
        {
            "id": 197,
            "name_en": "Taladpregee School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e15\u0e25\u0e32\u0e14\u0e1b\u0e23\u0e35\u0e01\u0e35",
            "type_name_en": "OBEC",
            "province_name_en": "Pattani",
            "city_name_en": "Yarang",
            "code": "TPR",
            "status": "Enabled"
        },
        {
            "id": 42,
            "name_en": "Braincloud Training",
            "name_th": "Braincloud Training",
            "type_name_en": "Private School",
            "province_name_en": "Bangkok",
            "city_name_en": "Bang Phlat",
            "code": "TRN",
            "status": "Enabled"
        },
        {
            "id": 205,
            "name_en": "Banlanga School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e25\u0e32\u0e2b\u0e07\u0e32",
            "type_name_en": "OBEC",
            "province_name_en": "Satun",
            "city_name_en": "La-ngu",
            "code": "UBL",
            "status": "Enabled"
        },
        {
            "id": 198,
            "name_en": "Anuban Khuandon School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e04\u0e27\u0e19\u0e42\u0e14\u0e19",
            "type_name_en": "OBEC",
            "province_name_en": "Satun",
            "city_name_en": "Khuan Don",
            "code": "UKD",
            "status": "Enabled"
        },
        {
            "id": 199,
            "name_en": "Thairathwittaya40 School (Ban Kaun Po)",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e44\u0e17\u0e22\u0e23\u0e31\u0e10\u0e27\u0e34\u0e17\u0e22\u0e3240 (\u0e1a\u0e49\u0e32\u0e19\u0e04\u0e27\u0e19\u0e42\u0e1e\u0e18\u0e34\u0e4c)",
            "type_name_en": "OBEC",
            "province_name_en": "Satun",
            "city_name_en": "Mueang Satun",
            "code": "UKP",
            "status": "Enabled"
        },
        {
            "id": 200,
            "name_en": "Anuban Thaphae School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e17\u0e48\u0e32\u0e41\u0e1e",
            "type_name_en": "OBEC",
            "province_name_en": "Satun",
            "city_name_en": "Tha Phae",
            "code": "UTP",
            "status": "Disabled"
        },
        {
            "id": 201,
            "name_en": "Anuban Thungwa School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2d\u0e19\u0e38\u0e1a\u0e32\u0e25\u0e17\u0e38\u0e48\u0e07\u0e2b\u0e27\u0e49\u0e32",
            "type_name_en": "OBEC",
            "province_name_en": "Satun",
            "city_name_en": "Thung Wa",
            "code": "UTW",
            "status": "Enabled"
        },
        {
            "id": 45,
            "name_en": "Vijitsuksa School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e34\u0e08\u0e34\u0e15\u0e23\u0e28\u0e36\u0e01\u0e29\u0e32",
            "type_name_en": "Private School",
            "province_name_en": "Sing Buri",
            "city_name_en": "Bang Rachan",
            "code": "VSS",
            "status": "Disabled"
        },
        {
            "id": 123,
            "name_en": "Ratchaprachanukroh School 44  Wat Chattansanan",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e23\u0e32\u0e0a\u0e1b\u0e23\u0e30\u0e0a\u0e32\u0e19\u0e38\u0e40\u0e04\u0e23\u0e32\u0e30\u0e2b\u0e4c 44 \u0e27\u0e31\u0e14\u0e09\u0e31\u0e17\u0e17\u0e31\u0e19\u0e15\u0e4c\u0e2a\u0e19\u0e32\u0e19",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Tak Bai",
            "code": "WCT",
            "status": "Disabled"
        },
        {
            "id": 32,
            "name_en": "Thesaban 6 Wat Mueang Yala",
            "name_th": "\u0e40\u0e17\u0e28\u0e1a\u0e32\u0e25 6 \u0e27\u0e31\u0e14\u0e40\u0e21\u0e37\u0e2d\u0e07\u0e22\u0e30\u0e25\u0e32",
            "type_name_en": "Thesaban",
            "province_name_en": "Yala",
            "city_name_en": "Mueang Yala",
            "code": "WMY",
            "status": "Enabled"
        },
        {
            "id": 72,
            "name_en": "Wat Rat Samoson",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e27\u0e31\u0e14\u0e23\u0e32\u0e29\u0e2a\u0e42\u0e21\u0e2a\u0e23",
            "type_name_en": "OBEC",
            "province_name_en": "Narathiwat",
            "city_name_en": "Mueang Narathiwat",
            "code": "WRS",
            "status": "Enabled"
        },
        {
            "id": 202,
            "name_en": "Banto School",
            "name_th": "\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e1a\u0e49\u0e32\u0e19\u0e42\u0e15",
            "type_name_en": "OBEC",
            "province_name_en": "Yala",
            "city_name_en": "Than To",
            "code": "YBT",
            "status": "Enabled"
        }
    ],
    "school_types": {
        "4": "Border Patrol Police",
        "2": "OBEC",
        "3": "Private School",
        "1": "Thesaban",
        "6": "Trial School",
        "5": "University"
    }
  };

  // 1. ดึงข้อมูลเดิมมาสร้าง Map และหา Max ID
  const range = schoolSheet.getDataRange();
  const schoolData = range.getValues();
  const dbSchoolMap = new Map();
  let maxId = 0;

  // เริ่มแถวที่ 1 (ข้าม Header)
  for (let i = 1; i < schoolData.length; i++) {
    // Col B (Index 1) = School Code
    let code = (schoolData[i][1] || "").toString().trim().toUpperCase();
    if (code) {
      dbSchoolMap.set(code, i + 1); // เก็บเลขบรรทัด
    }

    // หา Max ID (sc-XXXXX) เพื่อรันเลขต่อ
    let scId = schoolData[i][0]; // Col A
    if (typeof scId === 'string' && scId.startsWith('sc-')) {
      let numPart = parseInt(scId.split('-')[1]);
      if (!isNaN(numPart) && numPart > maxId) {
        maxId = numPart;
      }
    }
  }

  let updateCount = 0;
  let newSchoolCount = 0;
  let newRows = [];

  // 2. วนลูป JSON เพื่อจับคู่หรือเพิ่มใหม่
  if (jsonResponse.schools && jsonResponse.schools.length > 0) {
    jsonResponse.schools.forEach(school => {
      let jsonCode = (school.code || "").trim().toUpperCase();
      let webId = school.id;

      // กรณีที่ 1: เจอโรงเรียนเดิม -> อัปเดต ID
      if (dbSchoolMap.has(jsonCode)) {
        let targetRow = dbSchoolMap.get(jsonCode);
        
        // เช็คค่าเดิมก่อนเขียนทับ
        let currentId = schoolSheet.getRange(targetRow, COL_TARGET_ID).getValue();
        
        if (currentId != webId) {
          schoolSheet.getRange(targetRow, COL_TARGET_ID).setValue(webId);
          updateCount++;
          console.log(`✅ Matched & Updated: ${jsonCode}`);
        }
      } 
      // กรณีที่ 2: ไม่เจอ -> เพิ่มโรงเรียนใหม่ (Append)
      else {
        maxId++; // รันเลข ID ต่อ
        let newScId = 'sc-' + String(maxId).padStart(5, '0');
        
        // สร้างแถวเปล่าตามจำนวนคอลัมน์ของ Header
        // (สมมติว่า Header มีอย่างน้อยถึง Col I ถ้ามีมากกว่าก็รองรับได้)
        let totalCols = Math.max(schoolData[0].length, COL_TARGET_ID);
        let newRow = new Array(totalCols).fill("");

        // Mapping Field (อ้างอิงตาม dim_school.csv)
        // Col A [0]: school_id
        newRow[0] = newScId;
        
        // Col B [1]: school_code
        newRow[1] = jsonCode;
        
        // Col C [2]: school_name_en
        newRow[2] = school.name_en || "";
        
        // Col D [3]: school_name_th
        newRow[3] = school.name_th || "";
        
        // Col E [4]: school_group (Mapping type_name_en)
        newRow[4] = school.type_name_en || "";
        
        // Col F [5]: school_province
        newRow[5] = school.province_name_en || "";
        
        // Col G [6]: school_amphoe (Mapping city_name_en)
        newRow[6] = school.city_name_en || "";
        
        // Col H [7]: learning_model (ไม่มีข้อมูลใน JSON ปล่อยว่าง)
        
        // Col I [8]: braincloud_school_id (Mapping ID จากเว็บ)
        // *Index 8 คือ Column 9 (I)*
        newRow[COL_TARGET_ID - 1] = webId; 

        newRows.push(newRow);
        newSchoolCount++;
        console.log(`✨ New School Prepared: ${jsonCode} (${school.name_en})`);
      }
    });
  }

  // 3. บันทึกโรงเรียนใหม่ลง Sheet (ทีเดียวรวด)
  if (newRows.length > 0) {
    schoolSheet.getRange(
      schoolSheet.getLastRow() + 1, 
      1, 
      newRows.length, 
      newRows[0].length
    ).setValues(newRows);
  }

  let msg = `เสร็จสิ้น! \n- อัปเดต ID เดิม: ${updateCount} แห่ง \n- เพิ่มโรงเรียนใหม่: ${newSchoolCount} แห่ง`;
  console.log(msg);
  SpreadsheetApp.getUi().alert(msg);
}