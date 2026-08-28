# PCMC-SSO Toolkit V4.4.9 — SSIP Reply CSV Patient Name Hotfix

- เปลี่ยนชื่อส่วนรับไฟล์ตอบกลับ SSIP เป็น `SIGNREP / CIGNREP` เพื่อให้ตรงกับรูปแบบผลตอบกลับที่ผู้ใช้ทำงานจริง
- ปรับปุ่ม `ส่งออก Error CSV` ให้เพิ่มคอลัมน์ `PatientName` จากชื่อผู้ป่วยที่ Parser อ่านและแสดงอยู่บนหน้าจอ
- CSV ใหม่เรียงคอลัมน์เป็น `AN, HN, PatientName, Result, ErrorCode, Description, SourceFile`
- ไม่เปลี่ยนโครงสร้าง Google Sheets และไม่ต้อง Run `setupDatabase()`
