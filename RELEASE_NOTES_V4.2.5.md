# SSOP Toolkit V4.2.5 — Strict ZIP Case Guard & Version Sync

- ซิงก์เลขเวอร์ชันทุกหน้าจอ, footer, meta, config, API และ cache-busting เป็น 4.2.5
- ปุ่มตรวจใน SSOCPAP แสดง “ตรวจ STCPAP”
- ตรวจ ZIP ทันทีหลังเลือกไฟล์ ก่อนเปิดพื้นที่แก้ไข
- บล็อกเมื่อ HN, Session หรือ Station ไม่พบ/ไม่ตรง
- ตรวจชื่อ ZIP ว่ามี Session_Station และตรงกับทะเบียน
- ตรวจ CID เมื่อมีข้อมูลใน ZIP และแจ้ง VN เมื่อแฟ้มรองรับ
- ZIP ที่ไม่ตรงจะไม่เปิด editor และไม่เปลี่ยนสถานะทะเบียน
