SSOP Claim Management V2.4 Phase 1 - Google Identity Services

ไฟล์ฝั่ง Apps Script:
- Code.gs

ไฟล์ฝั่ง GitHub Pages:
- index.html
- assets/css/style.css
- assets/js/config.js
- assets/js/app.js

ต้องตั้งค่า 2 ค่าให้ตรงกัน:
1) GOOGLE_CLIENT_ID ใน Code.gs
2) googleClientId ใน assets/js/config.js

และใส่ Web App URL ใน apiUrl ของ assets/js/config.js

Deployment Apps Script:
- Execute as: Me
- Who has access: Anyone

ระบบจะไม่ใช้ Session.getActiveUser() และไม่ใช้ google.script.run บน GitHub Pages
