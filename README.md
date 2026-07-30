# it-ssop-claim V3.4.3

## เพิ่มในเวอร์ชันนี้
- เมื่อเปิดไฟล์ ZIP จากปุ่ม “แก้ไข ZIP” ในแถวผู้ป่วย และระบบอ่าน ZIP สำเร็จ สถานะจะเปลี่ยนจาก `รอเตรียมข้อมูล` เป็น `รอตรวจสอบ` อัตโนมัติ
- ไม่เขียนทับ `Work_Order_No` และฟิลด์สำคัญเดิม
- บันทึก Timeline ประเภท `ZIP_LOADED` พร้อมชื่อไฟล์ ZIP
- หากเคสอยู่สถานะอื่นแล้ว ระบบจะไม่ย้อนสถานะกลับ
- คงระบบ Knowledge Base และประวัติไฟล์จาก V3.4.2 ทั้งหมด

## การติดตั้ง
1. แทนที่ `index.html`, `assets/css/style.css`, `assets/js/app.js`, `assets/js/config.js` ใน GitHub
2. ใส่ `apiUrl` เดิมกลับใน `assets/js/config.js`
3. แทนที่ `Code.gs` ใน Apps Script แล้วใส่ Spreadsheet ID / Folder ID เดิม
4. Deploy Apps Script เป็น New version
5. กด Ctrl+F5 ที่หน้าเว็บ

ไม่ต้อง Run setupDatabase และไม่ต้องสร้างชีทเพิ่ม
