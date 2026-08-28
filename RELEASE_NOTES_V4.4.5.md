# SSOP Toolkit V4.4.5 — SSIP Selective Export & Reply Knowledge

- ส่งออก Error CSV จากผล Validation เพื่อส่งต่อผู้ดูแลข้อมูล HIS
- ตรวจ ClaimCat ผู้ป่วยปกติแบบแยกปุ่ม (ฟิลด์ที่ 17 ของ BillItems) ให้เป็น D
- Raw XML ล็อกจำนวนตัวคั่น `|` ป้องกันโครงสร้าง record เสียจากการลบเกิน
- เลือกผู้ป่วยรายแฟ้มก่อนสร้าง ZIP กลับชื่อเดิม พร้อมเลือกทั้งหมด/ไม่เลือก
- เพิ่มตัวอ่าน SIGNREP/SIGNSUP (.ZIP/.REP) แบบ Local Processing
- แสดงผล A/C, Error/Warning Code และคำอธิบายจากไฟล์ตอบกลับ
- ส่งออกผลตอบกลับเป็น CSV
- เพิ่ม Knowledge Module `SSIP` และบันทึกรหัสใหม่เข้า Knowledge Base โดยไม่ส่งข้อมูลผู้ป่วย
- อัปเดต Version ทุกหน้าจอเป็น V4.4.5
