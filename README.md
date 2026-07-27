SSOP Claim Management V2.4.4 – SSOCAC Ready
© 2026 PCMC By Kimhan

ตั้งค่าให้แล้ว:
- Apps Script Web App URL:
  https://script.google.com/macros/s/AKfycbztQYOpzMGJ16oCWviNFuEOqMgC-wMWb0cmtusxGAA9E62SzczHp93TJxaqoXVrS_N2/exec
- Google Sheet ID:
  1lHOUP0tf3AJdZ3ADvLTxeHggTar-Do-__slBY1za-ro

ติดตั้ง Backend
1) เปิด Apps Script โปรเจกต์ SSOP Claim Management
2) แทนที่ Code.gs ด้วยไฟล์ในชุดนี้
3) เลือก setupClaimSheets แล้วกด Run
4) ตรวจว่า Execution completed
5) Deploy > Manage deployments > Edit > New version > Deploy
6) Execute as: Me
7) Who has access: Anyone

ติดตั้ง GitHub
แทนที่ไฟล์:
- index.html
- assets/css/style.css
- assets/js/app.js
- assets/js/config.js

หลัง Commit รอ GitHub Pages แล้วกด Ctrl+Shift+R

ชีตที่ต้องมี:
- Claim_Case
- Case_SSOCAC
- Claim_Attempt
- Audit_Log

ข้อควรระวัง:
เวอร์ชันนี้ยังใช้ Mock User และ Web App endpoint แบบไม่มี Google Sign-In
จึงเหมาะสำหรับทดสอบ Workflow และข้อมูลสมมติเท่านั้น
ห้ามใช้ข้อมูลผู้ป่วยจริงจนกว่าจะเพิ่มการยืนยันตัวตนและตรวจสิทธิ์ System_Users
