# PCMC-SSO Toolkit V4.5.8 — Unified SSOP Repair Workflow

- Auto Fix ของ Cross แสดง Logic ก่อนยืนยันทุกครั้ง: ต้นทาง, ปลายทาง, ขั้นตอนคำนวณ, สิ่งที่ไม่แก้, ข้อควรระวัง และการ Undo
- เปลี่ยนปุ่ม Cross เป็น `Auto Fix ตาม Logic` เพื่อแยกจาก `Guided Replace` ที่ผู้ใช้เป็นผู้กำหนดค่าใหม่เอง
- ปรับหน้าจอ Cross Fix Desk ลดคำสั่งที่ความหมายซ้ำ และอธิบาย 2 วิธีแก้ให้ชัดเจน
- ปรับหน้าจอจัดการกฎ Cross เป็น `กฎตรวจ Cross & Knowledge` พร้อมวิธีใช้ 4 ขั้นตอนในหน้าจอ
- งานประจำใช้ `ดึง Knowledge` + `เพิ่มกฎตรวจ`; คำสั่งสำรอง/กู้คืน JSON ถูกย้ายเข้าเมนูรอง
- Error ใหม่ยังส่ง Research Request / Import Knowledge Pack ได้เหมือนเดิม
- กฎที่ขึ้นต้น W จะเป็น Warning; C/R/S/T ที่สร้างจาก Rule Manager จะเริ่มเป็น Error เพื่อให้สอดคล้องแนวทาง Cross
- จัดลำดับ toolbar ของ SSOP Editor ทุกโมดูลให้เป็นแนวทางเดียวกัน: เติม/แก้ → ตรวจ Rule Profile → บันทึกไฟล์+MD5 → สร้าง/บันทึก ZIP
- ไม่เปลี่ยน API, Google Sheets schema หรือ Apps Script backend
