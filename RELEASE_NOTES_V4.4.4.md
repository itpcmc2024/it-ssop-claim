# SSOP Toolkit V4.4.5 — SSIP Filter, Tooltip & Export Hotfix

ปรับปรุงจาก V4.4.5 ตามผลทดสอบหน้างาน

- Tooltip แสดงเต็มด้วย floating tooltip ไม่ถูกตัดโดยตาราง/scroll container
- เพิ่มตัวกรองรายคอลัมน์ในตาราง IPADT/IPDx/IPOp/BillItems
- ปุ่ม เพิ่มแถว/ลบแถว แสดงเฉพาะ section ที่เป็นตารางจริง
- รายการแฟ้มด้านซ้ายแสดงประมาณ 9 รายการและใช้ scrollbar เมื่อเกิน
- ZIP กลับชื่อเดิมทำได้ตลอด แม้มีแฟ้มที่แก้ไขค้างอยู่; ระบบใส่ EndNote MD5/HMAC ให้ข้อมูลใน ZIP ขณะส่งออก
- ปุ่มประกาศ SSIP อ่าน CIPNnov2019-Edt7.pdf จาก Google Drive folder ของระบบผ่าน Document API
- เพิ่ม DOCUMENTS.SSIP_ANNOUNCEMENT ใน Code.gs
