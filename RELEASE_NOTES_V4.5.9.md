# PCMC-SSO Toolkit V4.5.9 — Version Sync, Knowledge Enrichment & R31 Guided Repair

- เลขเวอร์ชันทุกหน้าจอ/โมดูล/ส่วนแสดงผลใช้ V4.5.9 และเพิ่ม runtime sync จาก SSOP_CONFIG.version
- เติม Cross Knowledge ที่ตรวจสอบจากคู่มือ SSOP เพิ่มเติม
- ปรับ R31 เป็น 2 แนวทางตามข้อมูลจริง: เติม BILLDISP หรือ Guided Repair กรณีผู้ป่วยชำระเอง
- R31 Guided Repair ทำงานเฉพาะเมื่อยอดขอเบิกยาหมวด 3/5 เท่ากับ BILLTRAN.Paid
- จัดข้อความ Logic ใน dialog ให้เนื้อหาชิดซ้าย อ่านขั้นตอนได้ง่าย
- Rule Manager ระบุชัดว่ากฎข้ามแฟ้ม/ยอดเงินต้องใช้ Built-in/Guided Repair

หมายเหตุ: Guided Repair R31 เป็น logic ช่วยงานของ Toolkit ไม่ใช่นิยาม R31 โดยตรง และจะไม่ทำงานเมื่อเงื่อนไขยอดเงินไม่ชัดเจน
