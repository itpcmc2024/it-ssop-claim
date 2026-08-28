# SSOP Toolkit V4.4.0 — SSIP Editor Prototype Sprint 1

## เพิ่มใหม่
- เปลี่ยนชื่อเครื่องมือเดิมเป็น **SSOP Editor**
- เปิดใช้งานการ์ด **SSIP Editor** สำหรับ AIPN/CIPN
- เปิด ZIP และอ่าน XML ภายใน Browser
- รองรับ Windows-874 ทั้งการอ่านและการเขียน
- แสดงรายการแฟ้ม พร้อม AN/HN ที่ระบบตรวจพบ
- แก้ไข Header, ClaimAuth, IPADT และ Section ระดับหลัก
- แก้ไขตารางข้อความแบบ pipe-delimited เช่น IPDx/IPOp/BillItems
- เพิ่มและลบแถว พร้อมปรับ Reccount
- Raw XML Editor
- ตรวจโครงสร้างและ Reccount เบื้องต้น
- สร้าง MD5/HMAC ใหม่ และ ZIP กลับชื่อเดิม

## ข้อจำกัด Prototype
- ยังไม่มี SIGNREP Reader
- ยังไม่เชื่อม Knowledge Center สำหรับ AIPN/CIPN
- Validation ยังเป็นระดับโครงสร้าง ไม่ใช่กฎเบิกฉบับเต็ม
- ฟิลด์ตารางใน Sprint 1 ใช้ชื่อ Field 1, Field 2 ... ก่อนเพิ่ม Dictionary ฉบับสมบูรณ์

## การติดตั้ง
อัปโหลดไฟล์ทั้งหมดขึ้น GitHub และ Deploy Code.gs เป็น New version ตามปกติ ไม่ต้อง Run setupDatabase()
