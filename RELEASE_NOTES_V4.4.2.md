# SSOP Toolkit V4.4.2 — SSIP UI & Validation Refinement

- ปรับ DRGCharge/XDRGClaim ตาม CIPN specification: DRGCharge = sum(ChargeAmt-Discount) เฉพาะ ClaimCat D และ XDRGClaim = sum(min(ClaimAmt, ChargeAmt-Discount)) เฉพาะ ClaimCat T
- เปลี่ยนปุ่มเป็น “คำนวณยอด CIPN” ไม่รวม XDRGClaim เข้า DRGCharge แบบเดิม
- ยกเลิก browser confirm ในการคืนค่าแฟ้ม ใช้ dialog ของ Toolkit
- แถบแฟ้มด้านซ้ายขยายตามเนื้อหา ไม่ใช้ scrollbar ภายใน
- Header/ClaimAuth/ฟอร์มแบบ element แสดงเป็น compact table พร้อม Req/Format และ tooltip
- ผลตรวจ LAB/ยาแสดงรหัสและชื่อรายการ และคลิกเพื่อไปยัง cell ที่ผิด
- ปรับ validation summary เป็นตารางอ่านง่าย
