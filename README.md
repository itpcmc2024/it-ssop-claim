SSOP Claim Management V2.4.6 – Duplicate & Display Fixed

แก้ไขหลัก
- ตรวจข้อมูลซ้ำทั้งกับข้อมูลเดิมใน Google Sheet และข้อมูลซ้ำภายในไฟล์ Excel เดียวกัน
- เกณฑ์ซ้ำ: วันที่บริการ + HN + VN + Case No. + Session + Station + JobNo
- ข้อมูลซ้ำจะถูกข้าม ไม่สร้าง CaseID ใหม่
- แสดงจำนวน นำเข้าใหม่ / ข้ามข้อมูลซ้ำ / ไม่สำเร็จ
- หน้า Cancer Care อ่านข้อมูลเดิมได้ แม้ Module ใน Claim_Case จะว่าง แต่มีรายละเอียดใน Case_SSOCAC
- เพิ่มฟังก์ชัน repairClaimData สำหรับซ่อมข้อมูลเดิมและปิด Active ของแถวซ้ำ โดยไม่ลบข้อมูล

ติดตั้ง
1. แทนที่ Code.gs ใน Apps Script
2. Run setupClaimSheets
3. Run repairClaimData หนึ่งครั้ง
4. Deploy > Manage deployments > Edit > New version > Deploy
5. แทนที่ index.html, assets/js/app.js, assets/js/config.js และ assets/css/style.css ใน GitHub
6. รอ GitHub Pages แล้วกด Ctrl+Shift+R
