# PCMC-SSO Toolkit V4.5.3 — Cross Preflight Pilot

## UI
- ย้ายการ์ด Rule Profile สำหรับ SSOP Editor มาไว้เหนือพื้นที่ลาก/เลือกไฟล์ เพื่อลดความสับสนกับส่วนรับไฟล์ตอบกลับ
- เมื่อเลือก Cross แล้วเปิด ZIP จาก SSOP Editor, Unified ZIP Editor จะรับ Rule Profile = CROSS โดยตรง
- การ์ด “ประกันสังคมข้ามเขต” บนหน้าหลักเปิด SSOP Editor ด้วย Cross Profile และแสดงสถานะพร้อมทดลอง

## Cross Preflight
ตรวจทั้ง ZIP หลายผู้ป่วยและรวมข้อมูลข้าม 3 ไฟล์/6 Sections ก่อนชี้จุดแก้ไข
- Structure: BILLTRAN 19, BillItems 13, Dispensing 18, DispensedItems 19, OPServices 22, OPDx 6 คอลัมน์
- Hmain / PayPlan ห้ามว่าง
- R04, R31, R33, R60
- S14, S18, S19, S32, S33, S41
- T01, T06 (เบื้องต้น), T15, T31, T33, T42, T44, T45, T51, T55
- W04, W05, W07 แสดงเป็น Reference Rule เพื่อเตือนว่าต้องเชื่อม Drugcatalog/ช่วงวันที่ราคา ก่อนยืนยันได้เต็มรูปแบบ

## การช่วยแก้ไขข้อมูลจำนวนมาก
- ตาราง Cross Preflight รวม Error Code, ระดับ, Section/แถว, รายละเอียด และแนวทางแก้
- กรองตาม Error Code และค้นหา InvNo/HN/ข้อความได้
- ปุ่ม “ไปแก้จุดนี้” เปิดไฟล์ภายใน ZIP + Section ที่เกี่ยวข้อง และกรองด้วย key เพื่อพาผู้ใช้ไปยังข้อมูลที่ควรแก้
- ปุ่ม “ตรวจใหม่” สำหรับสแกนซ้ำหลังแก้ไข

## ข้อจำกัดที่ตั้งใจไว้ใน Pilot
- S18/S19/T06 ตรวจรูปแบบ/ความสัมพันธ์เบื้องต้นเท่านั้น การยืนยัน codeset/สิทธิจริงต้องมี master reference
- W04/W05/W07 ยังไม่ตัดสินผ่าน/ไม่ผ่านจนกว่าจะเชื่อม Drugcatalog พร้อมช่วงวันที่ราคา
- Local Processing เหมือนเดิม: ไม่อัปโหลดข้อมูลผู้ป่วยจาก ZIP ไป Google Sheets

Frontend only — ไม่ต้องแก้หรือ Deploy Code.gs
