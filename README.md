SSOP Claim Management V2.4 – SSOCAC Beta
========================================

สิ่งที่เพิ่มตามคำขอ
- ตารางค้นหาผู้ป่วยแสดง Batch ล่าสุด และ JobNo
- Timeline เรียงจากเก่าไปใหม่
- เมนูเรียง Main → Cross Area → CPAP → Sleep Test → Cancer Care
- โทนพาสเทลแบบ SSOP Toolkit เดิม
- ใช้งานจริงกับชีต Claim_Case, Case_SSOCAC, Claim_Attempt
- เพิ่มเคส, นำเข้า Excel, ค้นหา, ส่งออก CSV, เพิ่มประวัติส่งเบิก

คำเตือนสำคัญ
รุ่นนี้ยังไม่มี Google Sign-In และใช้ Mock User ดังนั้นให้ใช้ข้อมูลทดสอบเท่านั้น
ห้ามใส่ข้อมูลผู้ป่วยจริงจนกว่าจะเพิ่มระบบยืนยันตัวตนและสิทธิ์ผู้ใช้

ติดตั้ง Backend
1. เปิด Apps Script โปรเจกต์ SSOP Claim Management
2. แทน Code.gs ด้วยไฟล์ Code.gs ชุดนี้
3. Run ฟังก์ชัน setupClaimSheets 1 ครั้ง และกดยอมรับสิทธิ์
4. Deploy > New deployment > Web app
5. Execute as: Me
6. Who has access: Anyone
7. คัดลอก URL ที่ลงท้าย /exec

ติดตั้ง GitHub
1. แทน index.html
2. แทน assets/css/style.css
3. แทน assets/js/app.js
4. เปิด assets/js/config.js
5. เปลี่ยน PUT_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE เป็น URL /exec
6. Commit changes
7. รอ GitHub Pages 1-3 นาที แล้ว Ctrl+Shift+R

หัว Excel ที่รองรับ
วันที่มารับบริการ, HN, VN, เลขบัตรประชาชน, ชื่อ-นามสกุล,
สิทธิการรักษา, ชื่อยา Chemo, Case No., Protocol, Tflag,
Session, Station, เลขที่ใบงาน
