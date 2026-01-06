# Braincloud Operations System - AI Coding Instructions

## 1. Project Architecture & Boundaries
This workspace consists of two distinct Google Apps Script (GAS) projects and a frontend:

### A. API & LIFF Backend (`line/`)
- **Role:** External API for the LIFF App and Dashboard.
- **Entry Point:** `line/holiday.js` (`doGet`, `doPost`).
- **Type:** Standalone Script (likely).
- **Data Access:** Uses `SpreadsheetApp.openById()` to access the Central Database.
- **Key Config:** `CONFIG` object in `holiday.js` defines Sheet IDs.

### B. Core Logic & Automation (`database/`)
- **Role:** Internal automation, scheduled jobs, and data synchronization.
- **Entry Point:** Triggers (e.g., `syncDailySchedule` in `ScheduleSync.js`).
- **Type:** Container-bound Script (bound to `[bc]_central_db.xlsx`).
- **Data Access:** Uses `SpreadsheetApp.getActiveSpreadsheet()` for the bound sheet.

### C. Frontend (`bc-school-holiday/`)
- **Role:** User interface for teachers/staff.
- **Tech Stack:** HTML5, Tailwind CSS (CDN), LIFF SDK.
- **Hosting:** GitHub Pages.
- **Communication:** Fetches data from the `line/` GAS Web App URL.

## 2. Critical Coding Conventions
- **Timezone:** **STRICTLY** use `Asia/Bangkok` (GMT+7).
  - Use `Utilities.formatDate(date, "Asia/Bangkok", "format")`.
  - Avoid `new Date()` without context in logic that affects dates.
- **Date/Time Parsing:**
  - Prefer `getDisplayValues()` for time columns to avoid 1899-epoch date issues.
  - Parse dates manually (e.g., `YYYY-MM-DD` split) rather than relying on JS `Date` parsing of ambiguous strings.
- **Concurrency:**
  - Use `LockService.getScriptLock()` for **ALL** write operations (e.g., `saveHoliday`).
  - Wait time: `lock.tryLock(10000)`.
- **API Responses:**
  - Always return JSON: `ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)`.

## 3. Data Schema & Business Logic
- **Source of Truth:** See `projectcontext.md` for the definitive schema.
- **Key Sheets:**
  - `dim_school`: School master data.
  - `dim_user`: Teacher profiles (Full-time code: 210, Part-time: 220).
  - `fact_daily_session`: The massive schedule table.
  - `fact_teacher_unavailability`: Leave records.
- **Caching:** `cache_today_session` is generated daily by `database/DailyCacheJob.js` to optimize read performance for the API.

## 4. Developer Workflow
- **Deployment:**
  - Frontend: Commit & Push to `main` (GitHub Pages).
  - Backend: Use `clasp push` if configured, or manually update GAS.
- **Debugging:**
  - Use `console.log` and check GAS Executions.
  - For API errors, check the JSON response `message` field.
- **Ignored Paths:**
  - **STRICTLY IGNORE** `New folder/`. It is a backup. Do not read or edit files in there. Focus ONLY on `database/` and `line/`.

## 5. Common Tasks
- **Adding a new API Action:**
  1. Modify `doGet` in `line/holiday.js` to add a new `if (action === 'newAction')`.
  2. Implement the handler function in `line/holiday.js`.
  3. Update `bc-school-holiday/index.html` to `fetch` with `?action=newAction`.

## 6. Interaction Guidelines (User Persona: Beginner/Data Science)
- **User Level:** Beginner in Web/App Dev, but understands Data/Logic.
- **Preferred Style:** "Do it for me." Provide complete, copy-pasteable code or apply edits directly. Avoid "Here is a snippet, put it where it belongs."
- **Explanation:** Explain *what* you did and *why* in simple terms. Avoid deep jargon unless necessary.
- **Safety:** Always double-check that edits don't break existing logic.

