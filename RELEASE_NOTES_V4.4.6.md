# SSOP Toolkit V4.4.6 — Cross-Module Validation Rules

## เปลี่ยนแปลงหลัก
- เปลี่ยนชื่อแถบระบบเป็น **ระบบงาน PCMC-SSO Toolkit V4 · Production**
- Cancer: ตรวจ BILLTRAN.AuthCode = SSOCAC, Hmain/PayPlan ห้ามว่าง, BillItems.ClaimCat = OPR และ OPDx.DiagnosisCode ต้องพบ Z511 อย่างน้อย 1 รายการ
- CPAP: ตรวจ BILLTRAN.AuthCode = STCPAP, Hmain/PayPlan ห้ามว่าง และ BillItems.ClaimCat = OPF
- Sleep Test: ตรวจ BILLTRAN.AuthCode = STCPAP, Hmain/PayPlan ห้ามว่าง และ BillItems.ClaimCat = OPF
- AuthCode ยังคงถูกปรับอัตโนมัติด้วยฟังก์ชัน Auto Fill ตามโมดูลเดิม
- เพิ่มการเน้น Hmain, PayPlan และ DiagnosisCode ใน ZIP Editor เพื่อให้ผู้ใช้สังเกตได้ง่ายขึ้น

## หมายเหตุ
- ไม่เปลี่ยนโครงสร้าง Google Sheets
- ไม่ต้อง Run setupDatabase()
- อัปเดต Code.gs และ Deploy Apps Script เป็น New version เพื่อให้ API version ตรงกับ V4.4.6
