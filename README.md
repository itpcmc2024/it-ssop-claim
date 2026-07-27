SSOP Claim Management V2.4 – Phase 1 UI Prototype
===================================================

ชุดนี้เป็น Frontend สำหรับ GitHub Pages เท่านั้น
- ยังไม่ใช้ Google Login จริง
- ยังไม่เรียก Apps Script
- ยังไม่อ่านหรือเขียนข้อมูลผู้ป่วยจริง
- ใช้ Mock User: Panisara / ADMIN
- ใช้ข้อมูลผู้ป่วยสมมติเท่านั้น

วิธีนำไปใช้
1) สำรอง Repository เดิมก่อน
2) แทนที่ index.html
3) แทนที่ assets/css/style.css
4) แทนที่ assets/js/app.js
5) แทนที่ assets/js/config.js
6) Commit changes
7) รอ GitHub Pages 1–3 นาที
8) เปิด https://itpcmc2024.github.io/ssop-claim-management/
9) กด Ctrl+Shift+R

ไม่ต้อง Deploy Apps Script ใหม่สำหรับชุดนี้
ไม่ต้องสร้าง Google Client ID ในขั้นตอนนี้

เมื่อตรวจหน้าตาและ Workflow ผ่านแล้ว ระยะถัดไปจะเชื่อม:
- Google Sign-In
- System_Users
- Claim_Case
- Case_SSOCAC
- Claim_Attempt
- Audit_Log
