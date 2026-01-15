// Braincloud Holiday - Main Logic v2.2.0

// ***********************************************
// 🔍 IMMEDIATE DIAGNOSTICS & UTILS
// ***********************************************
function logStatus(msg) {
    console.log(msg);
    const el = document.getElementById('status-text');
    if(el) {
      let color = 'gray';
      if(msg.includes('Error') || msg.includes('Err') || msg.includes('Fail')) color = 'red';
      if(msg.includes('Success') || msg.includes('Ready') || msg.includes('Loaded')) color = 'green';
      
      if(el.innerText === 'Waiting for JS...') el.innerHTML = `<span style="color:${color}">${msg}</span>`;
      else el.innerHTML += `<br><span style="color:${color}">${msg}</span>`;
    }
}
logStatus("app.js Loaded & Parsed.");

// ***********************************************
// ⚙️ SETUP
// ***********************************************
const MY_LIFF_ID = "2008775079-PKwtDJOx"; 
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbw0Z_hAvk8N27w4SUNiRiisKplikxiVvntTDbBTmllC4uzT3rHp2QMwkMvpAVKS4yQWyA/exec";
const SUPABASE_URL = "https://cgznmxcecljfybcgujjb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2NTI1MywiZXhwIjoyMDgzMzQxMjUzfQ.kTov9RFS-FVDNZokkslR0jFH2zaKTUYSBH9NQ8aItlQ";
const DISCORD_WEBHOOK_URL = "https://discordapp.com/api/webhooks/1461190566518853737/u7Fc4QlRExojVwUDAyMEiKSlTsVt6M5NzBW55oegDqLwDr1aSm4lmUNnq1xQBi_bmc_w";
const APP_VERSION = "v2.2.0 (External JS)"; 

let userProfile = { userId: "U_GUEST", displayName: "Guest" };
let selectedSessions = new Set();
let schoolsMap = {}; 
let supabase = null;
let appInitialized = false;

// ***********************************************
// 🚀 BOOTSTRAP
// ***********************************************
document.addEventListener('DOMContentLoaded', initApp);
// Backup trigger in case DOMContentLoaded fired before script loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initApp();
}

async function initApp() {
    if (appInitialized) return;
    appInitialized = true;
    
    logStatus("InitApp: Starting...");

    // 1. Init Supabase
    if (typeof window.supabase !== 'undefined') {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            logStatus("Supabase: Client Created.");
        } catch(e) { logStatus("Supabase Init Fail: " + e.message); }
    } else {
        logStatus("CRITICAL: Supabase SDK Missing.");
    }

    // 2. Load Data (Parallel)
    try {
        logStatus("Fetching Data...");
        
        const schoolTask = fetchSchools();

        const liffTask = (async () => {
             try {
                 logStatus("LIFF: Init...");
                 if (typeof liff === 'undefined') throw new Error("LIFF SDK Missing");
                 
                 await liff.init({ liffId: MY_LIFF_ID });
                 if (liff.isLoggedIn()) {
                     logStatus("LIFF: Logged In.");
                     const profile = await liff.getProfile();
                     userProfile = profile;
                     try {
                       document.getElementById('userNameDisplay').innerText = profile.displayName;
                       document.getElementById('userPic').src = profile.pictureUrl;
                     } catch(domErr) { console.error(domErr); }
                 } else {
                     logStatus("LIFF: Guest (Not Logged In)");
                     liff.login(); 
                 }
             } catch (liffErr) {
                 logStatus("LIFF Error: " + liffErr.message);
             }
        })();

        await Promise.allSettled([schoolTask, liffTask]);
        
        logStatus("Boot Complete. Opening UI.");
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('main-container').classList.remove('hidden');
        }, 500);

    } catch (fatal) {
        logStatus("Fatal Boot Error: " + fatal.message);
    }
}

async function fetchSchools() {
    if(!supabase) { logStatus("Skip DB (No Client)"); return; }
    
    const { data, error } = await supabase
      .from('dim_school')
      .select('school_id, school_code, school_name_th, school_name_en')
      .neq('status', 'Inactive')
      .order('school_code');

    if (error) {
        logStatus("DB Error: " + error.message);
        throw error;
    }

    logStatus(`DB: Loaded ${data.length} schools.`);
    const select = document.getElementById('schoolSelect');
    select.innerHTML = '<option value="" disabled selected>-- เลือกโรงเรียน --</option>';
    
    data.forEach(s => {
       s.school_name = s.school_name_th; 
       schoolsMap[s.school_code] = s;
       const option = document.createElement('option');
       option.value = s.school_code;
       option.text = `${s.school_code} : ${s.school_name_th}`;
       select.appendChild(option);
    });
}

// ***********************************************
// 📉 LOGIC & EVENTS
// ***********************************************

async function fetchSchedule(code, date) {
  document.getElementById('loadingSchedule').classList.remove('hidden');
  document.getElementById('scheduleList').innerHTML = "";
  
  try {
    const school = schoolsMap[code];
    if (!school) throw new Error("School ID not found for code: " + code);

    const { data, error } = await supabase
      .from('fact_daily_session')
      .select('session_id, class_name, start_time, end_time, status, actual_teacher_id')
      .eq('school_id', school.school_id)
      .eq('date', date)
      .order('start_time');

    if (error) throw error;
    
    const schedules = data.map(s => ({
        id: s.session_id,
        className: s.class_name,
        time: `${s.start_time.slice(0,5)} - ${s.end_time.slice(0,5)}`,
        teacher: s.actual_teacher_id || "TBA", 
        status: s.status
    }));
    
    renderSchedule(schedules);

  } catch (err) {
    console.error(err);
    alert("โหลดตารางไม่ได้ (Supabase): " + err.message);
    document.getElementById('loadingSchedule').classList.add('hidden');
  }
}

async function submitData() {
  const schoolSelect = document.getElementById('schoolSelect');
  if (!schoolSelect.value) return alert("กรุณาเลือกโรงเรียน");

  const schoolCode = schoolSelect.value;
  const schoolObj = schoolsMap[schoolCode] || { school_name: schoolSelect.options[schoolSelect.selectedIndex].text.split(' : ')[1] };

  const data = {
    userId: userProfile.userId,
    displayName: userProfile.displayName,
    schoolCode: schoolCode,
    schoolName: schoolObj.school_name,
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value,
    reason: document.getElementById('reason').value,
    type: "Whole Day", 
    selectedSessions: []
  };

  if (selectedSessions.size > 0) { 
    data.type = "Specific Sessions"; 
    data.selectedSessions = Array.from(selectedSessions); 
  } else { 
    const radio = document.querySelector('input[name="periodType"]:checked'); 
    if (radio) data.type = radio.value; 
  }

  const confirmMsg = `ยืนยันการส่งข้อมูล?\n\nผู้แจ้ง: ${data.displayName}\nโรงเรียน: ${data.schoolName}\nวันที่: ${data.startDate} ${data.startDate !== data.endDate ? ' - ' + data.endDate : ''}\nเหตุผล: ${data.reason}`;

  if (confirm(confirmMsg)) {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('status-text').innerText = "กำลังบันทึกข้อมูล (Supabase)...";
    
    try {
        const sbPayload = {
            user_id: data.userId,
            user_name: data.displayName,
            school_code: data.schoolCode,
            start_date: data.startDate,
            end_date: data.endDate,
            type: data.type,
            reason: data.reason,
            status: 'Pending',
            affected_sessions: data.selectedSessions.length > 0 ? JSON.stringify(data.selectedSessions) : null,
            created_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase.from('requests_log').insert([sbPayload]);
        
        if (insertError) throw insertError;
        
        document.getElementById('status-text').innerText = "กำลังแจ้งเตือน Discord...";
        await sendToDiscord(data);

        document.getElementById('status-text').innerText = "กำลังส่งอีเมล...";
        fetch(GAS_API_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            mode: 'no-cors'
        }).catch(e => console.warn("Email trigger failed", e));

        alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
        liff.closeWindow();

    } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
        document.getElementById('loading').style.display = 'none';
    }
  }
}

async function sendToDiscord(data) {
    const color = data.type === 'Whole Day' ? 15158332 : 3066993; 
    
    const embed = {
        title: "📢 แจ้งวันหยุด/งดการสอน (Holiday Request)",
        color: color,
        fields: [
            { name: "ผู้แจ้ง (Reporter)", value: data.displayName, inline: true },
            { name: "โรงเรียน (School)", value: `${data.schoolCode} - ${data.schoolName}`, inline: true },
            { name: "วันที่ (Date)", value: `${data.startDate} ${data.startDate !== data.endDate ? ' ➡️ ' + data.endDate : ''}`, inline: false },
            { name: "ประเภท (Type)", value: data.type, inline: true },
            { name: "เหตุผล (Reason)", value: data.reason || "-", inline: false }
        ],
        footer: { text: "Braincloud Operations System", icon_url: "https://via.placeholder.com/20" },
        timestamp: new Date().toISOString()
    };
    
    if (data.type === 'Specific Sessions' && data.selectedSessions.length > 0) {
        embed.fields.push({ name: "คาบที่ได้รับผลกระทบ", value: `${data.selectedSessions.length} sessions selected` });
    }

    const payload = {
        username: "Holiday Bot",
        avatar_url: "https://img.icons8.com/color/96/beach.png",
        embeds: [embed]
    };

    await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

// --- UI Logic ---
function toggleEndDate() {
  const isMulti = document.getElementById('multiDayCheck').checked;
  document.getElementById('endDateContainer').classList.toggle('hidden', !isMulti);
  if(!isMulti) document.getElementById('endDate').value = document.getElementById('startDate').value;
  checkScheduleCondition();
}

function handleDateChange() {
  if (!document.getElementById('multiDayCheck').checked) document.getElementById('endDate').value = document.getElementById('startDate').value;
  checkScheduleCondition();
}

function checkScheduleCondition() {
  const schoolCode = document.getElementById('schoolSelect').value;
  const startDate = document.getElementById('startDate').value;
  const isMulti = document.getElementById('multiDayCheck').checked;
  const today = new Date().toISOString().split('T')[0];

  if (schoolCode && !isMulti && startDate === today) {
    document.getElementById('scheduleSection').classList.remove('hidden');
    document.getElementById('manualTypeSection').classList.add('hidden');
    document.getElementById('noScheduleMsg').classList.add('hidden');
    fetchSchedule(schoolCode, startDate);
  } else {
    document.getElementById('scheduleSection').classList.add('hidden');
    document.getElementById('manualTypeSection').classList.remove('hidden');
    selectedSessions.clear();
  }
}

function renderSchedule(schedules) {
  document.getElementById('loadingSchedule').classList.add('hidden');
  const container = document.getElementById('scheduleList');
  selectedSessions.clear();
  
  if (!schedules || schedules.length === 0) {
    document.getElementById('noScheduleMsg').classList.remove('hidden');
    document.getElementById('manualTypeSection').classList.remove('hidden');
    return;
  }

  schedules.forEach(s => {
    const card = document.createElement('div');
    const isCover = s.status === 'Cover';
    const isCancelled = s.status && s.status.toLowerCase().includes('cancelled');
    let cardClass = "border rounded-lg p-3 bg-white flex justify-between items-center cursor-pointer mb-2 " + (isCancelled ? "opacity-50 pointer-events-none bg-gray-100" : "hover:shadow-md");
    
    card.className = cardClass;
    if (!isCancelled) card.onclick = () => toggleSession(card, s.id);

    card.innerHTML = `<div><div class="font-bold text-gray-800">${s.className}</div><div class="text-xs text-gray-500">${s.time} | ${s.teacher} ${isCover ? '(Sub)' : ''}</div></div><div class="check-icon hidden text-red-600"><i class="fas fa-times-circle fa-lg"></i></div>`;
    container.appendChild(card);
  });
}

function toggleSession(card, id) {
  if (selectedSessions.has(id)) { selectedSessions.delete(id); card.classList.remove('border-red-500', 'bg-red-50'); card.querySelector('.check-icon').classList.add('hidden'); } 
  else { selectedSessions.add(id); card.classList.add('border-red-500', 'bg-red-50'); card.querySelector('.check-icon').classList.remove('hidden'); }
}