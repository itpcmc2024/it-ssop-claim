# it-ssop-claim — SSOP Toolkit Professional V3.0.0 Base

ระบบทดสอบแยกจาก SSOP Toolkit V2.3.4 โดยคงธีมพาสเทล หน้าเลือก Module, Cancer Care Editor, Knowledge Center, คู่มือฟิลด์ และการประมวลผลไฟล์ใน Browser

## ความปลอดภัย
- ห้ามนำ Spreadsheet ID หรือ Apps Script URL ของระบบเดิมมาใช้
- ใช้ Google Sheets, Apps Script Deployment และ Drive Folder ใหม่เท่านั้น
- V3.0.0 แสดงแถบ “ระบบทดสอบ” ชัดเจน
- ตัวติดตั้งไม่ลบข้อมูลเดิม แต่ควรใช้กับ Google Sheets ใหม่

## ไฟล์สำคัญ
- `index.html` หน้าเว็บ GitHub Pages
- `assets/css/style.css` รูปแบบพาสเทลเดิม
- `assets/js/app.js` ระบบหน้าเว็บเดิม
- `assets/js/config.js` จุดใส่ Apps Script Web App URL ใหม่
- `Code.gs` Google Apps Script API และตัวติดตั้งฐานข้อมูล 10 TAB
- `ติดตั้ง_V3_แบบสั้น.txt` ขั้นตอนติดตั้ง

## เวอร์ชันนี้
- เปลี่ยนชื่อโครงการเป็น `it-ssop-claim`
- เปลี่ยนเลขเวอร์ชันเป็น `3.0.0`
- เพิ่มสถานะ TEST
- เพิ่ม `setupDatabase()` สำหรับสร้าง 10 TAB
- เพิ่ม `checkDatabaseV3()` สำหรับตรวจฐานข้อมูล
- ยังไม่แก้ระบบเดิมและยังไม่เพิ่ม Registry UI

© 2026 PCMC By Kimhan · All Rights Reserved.
