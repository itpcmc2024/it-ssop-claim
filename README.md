SSOP Claim Management V2.5-A Build 1

ไฟล์ในชุด
- backend/code.gs
- frontend/index.html

วิธีติดตั้ง Backend
1. เปิด Google Apps Script เดิม และสำรองโค้ดเก่า
2. เปิด backend/code.gs แล้วคัดลอกทั้งหมดไปวางในไฟล์ code.gs
3. กด Save
4. ที่ช่องเลือกฟังก์ชัน ให้เลือก setupSystem (ไม่มีขีดล่างท้ายชื่อ)
5. กด Run และอนุญาตสิทธิ์
6. เมื่อสำเร็จ สามารถเลือก testConnection แล้วกด Run เพื่อตรวจซ้ำได้
7. Deploy > Manage deployments > Edit
8. เลือก New version แล้ว Deploy
9. Execute as: Me / Who has access: Anyone

หมายเหตุสำคัญ
- getAppBootstrap_ เป็นฟังก์ชันภายใน จึงไม่แสดงในรายการ Run เพราะลงท้ายด้วยขีดล่าง
- ให้เลือก setupSystem แทน
- หาก URL Web App เปลี่ยน ให้แก้ค่าตัวแปร API ใน frontend/index.html

วิธีติดตั้ง Frontend
1. นำ frontend/index.html ไปแทนไฟล์ index.html ใน GitHub repository
2. Commit changes
3. รอ GitHub Pages อัปเดต แล้วเปิดหน้าเว็บใหม่แบบ Ctrl+F5

ฟังก์ชัน Build 1
- Dashboard
- Import Excel และ Preview
- ตรวจข้อมูลไม่ครบ
- ตรวจรายการซ้ำในไฟล์และฐานข้อมูล
- บันทึก Claim_Case, Case_SSOCAC, Case_Work_Log, Audit_Log
- ค้นหา กรอง เรียง แบ่งหน้า และ Export CSV
- รายละเอียดผู้ป่วยและ Timeline

ยังไม่รวม ZIP Editor และ Reply ใน Build นี้
