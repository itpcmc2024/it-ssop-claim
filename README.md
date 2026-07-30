# it-ssop-claim V3.4.5

แก้การเชื่อมต่อ Google Apps Script จาก GitHub Pages โดยเปลี่ยน API transport จาก `fetch()` เป็น hidden iframe + `postMessage` เพื่อหลีกเลี่ยง CORS พร้อมใส่ Spreadsheet ID, Drive Folder ID และ Web App URL ให้แล้ว และปรับเลขเวอร์ชันที่แสดง/ไฟล์ cache เป็น V3.4.5 ทั้งหมด

## ติดตั้ง
1. แทนไฟล์ GitHub ทั้งชุด
2. แทน `Code.gs`
3. Deploy > Manage deployments > Edit > New version > Deploy
4. เปิดเว็บแล้วกด Ctrl+F5

ไม่ต้องแก้ `config.js`, `SPREADSHEET_ID` หรือ `DOCUMENT_FOLDER_ID` เพิ่ม
