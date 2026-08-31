# PCMC-SSO Toolkit V4.5.7 — Selective Resubmit & Safe Auto Repair

- เลือกผู้ป่วยบางรายจาก ZIP Main/Cross แล้วสร้าง ZIP ใหม่ตามความสัมพันธ์ InvNo/DispID/SvID
- บังคับกรอก Session ID 4 หลัก และ Station ID 2 หลักก่อนสร้าง ZIP ย่อย
- อัปเดต Header SESSNO/DATETIME/RECCOUNT, BILLTRAN.Station และ MD5 ใหม่
- เก็บประวัติ Error Code ที่เคยพบเพื่อเลือกผู้ป่วยที่แก้แล้วแม้ Error หายหลัง Preflight
- R04 Safe Auto Fix ใช้ผลรวม DispensedItems.ChargeAmt และ ReimbAmt ไม่ลบรายการ Reimb=0 อัตโนมัติ
- C07 ปรับระดับเป็น Error; Wxx เป็น Warning
- ตรวจทานคู่มือ Cross: แก้ชื่อฟิลด์ BILLTRAN, OPServices และ OPDx ตาม SSOP 0.93
- เพิ่มปุ่ม Admin “อัปเดตวิธีแก้ Cross มาตรฐาน” ใน SSO Knowledge Center (Upsert Module+ErrorCode ไม่สร้างข้อมูลซ้ำ)
