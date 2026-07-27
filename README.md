SSOP Claim Management V2.4.1 – SSOCAC Cute Pastel
© 2026 PCMC By Kimhan

สิ่งที่ปรับในรุ่นนี้
1) ปรับหน้าตาเป็นโทนพาสเทลน่ารัก สบายตา ตามภาพตัวอย่าง
2) เปลี่ยนไอคอนเมนูและการ์ดให้สื่อความหมายมากขึ้น
3) หน้า Cancer Care เหลือปุ่มเดียว: “นำเข้าเคสจาก Excel”
4) เปลี่ยนเมนู “ผู้ใช้งานระบบ” เป็น “USER”
5) เพิ่มหน้าว่างแบบน่ารักเมื่อยังไม่มีข้อมูล
6) คงระบบ SSOCAC, การค้นหา, Batch ล่าสุด, JobNo, Timeline และ Import Excel เดิม

การติดตั้ง GitHub
- แทนที่ index.html
- แทนที่ assets/css/style.css
- แทนที่ assets/js/app.js
- แทนที่ assets/js/config.js
- รอ GitHub Pages อัปเดต แล้วกด Ctrl+Shift+R

การติดตั้ง Apps Script
- Code.gs ใช้ไฟล์เดิมในชุดนี้ได้
- ตรวจ SPREADSHEET_ID ให้เป็นชีตของคุณ
- หากแก้ Code.gs ให้ Deploy > Manage deployments > Edit > New version > Deploy

หมายเหตุ
- รุ่นนี้ยังใช้ Mock User เช่นเดิม
- ยังไม่ควรใช้ข้อมูลผู้ป่วยจริงจนกว่าจะเพิ่ม Google Sign-In และตรวจสิทธิ์ USER
