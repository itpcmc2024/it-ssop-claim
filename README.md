# it-ssop-claim V3.5.0 Stable

เวอร์ชันฐานเสถียรสำหรับ GitHub Pages + Google Apps Script

- ใช้ JSONP สำหรับการเชื่อมต่อ Web App จึงไม่ติด CORS
- ใส่ Spreadsheet ID, Document Folder ID และ apiUrl ให้แล้ว
- เลขเวอร์ชัน V3.5.0 ตรงกันทุกส่วน
- คงฟังก์ชัน Registry, ZIP Editor, Reply Import, Knowledge Base และการป้องกัน Work Order No.

## ติดตั้ง
1. นำไฟล์ทั้งหมดขึ้น GitHub แทนชุดเดิม
2. นำ Code.gs ไปแทนใน Apps Script
3. Deploy เป็น New version โดยใช้ Deployment เดิม
4. ตั้ง Web App ให้ Execute as: Me และ Who has access: Anyone
5. กลับหน้าเว็บ กด Ctrl+F5
