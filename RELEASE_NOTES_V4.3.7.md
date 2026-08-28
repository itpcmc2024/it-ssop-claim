# SSOP Toolkit V4.3.7 — Registry Speed & SSO Editor Restore

- คืนการ์ด **เครื่องมือแก้ไฟล์ SSOP (SSO Editor)** บน Dashboard และวางไว้ก่อนการ์ด AIPN/CIPN
- VIEWER ยังคงเปิด SSO Editor แบบ Local Processing ได้ตามสิทธิ์เดิม
- คงการ์ด **เครื่องมือแก้ไขไฟล์ AIPN/CIPN** ไว้เป็นโมดูลเตรียมพัฒนา
- เร่งหน้า Registry โดยไม่สแกนชีต Claim_Attempt ระหว่างโหลดรายการหลัก
- โหลด Claim_Attempt เฉพาะตอนเปิดรายละเอียดเคส
- เพิ่ม Cache ฝั่ง Apps Script 45 วินาที และ Cache ฝั่ง Browser 45 วินาที
- เมื่อกลับเข้าโมดูลเดิม จะแสดงข้อมูลล่าสุดทันทีแล้วตรวจสอบข้อมูลใหม่เบื้องหลัง
- ปุ่มโหลดข้อมูลจะล้าง Cache และดึงข้อมูลสด
- Import, Save และ Reply จะล้าง Cache ก่อนรีเฟรชรายการ
- ไม่เปลี่ยนโครงสร้าง Google Sheets และไม่ต้อง Run setupDatabase()
