# SSOP Toolkit V4.2.3 — SSOCPAP Sprint 2 ZIP Auto Fill

## Data fidelity
- HN ถูกปรับเป็นข้อความ 9 หลักทั้ง Frontend และ Backend เพื่อรักษาเลข 0 นำหน้า
- CID รักษา 13 หลัก และ VN/JobNo เก็บเป็นข้อความ
- อ่านคอลัมน์ `สิทธิ`, `สิทธิการรักษา` หรือ `Coverage` ไปยัง `Claim_Case.Coverage`
- Diagnosis_Code ไม่ถูกสร้างจากชีต SleepTest และไม่กำหนดค่าเริ่มต้น
- Diagnosis_Code ยังคงมีช่องในหน้าแก้ไขทะเบียน สามารถเว้นว่าง กรอกใหม่ หรือแก้ไขภายหลังได้

## Sprint 2
- เปิดปุ่ม `แก้ไข ZIP` ในทะเบียน SSOCPAP
- ทุกฟิลด์ภายใน BILLTRAN, BILLDISP, OPServices และ OPDx ยังแก้ไขได้เหมือน SSOCAC
- เพิ่ม Tooltip เฉพาะกฎ CPAP ที่หัวตารางสำคัญ
- Auto Fill CPAP:
  - BILLTRAN.AuthCode = STCPAP
  - BILLTRAN.TFlag จากทะเบียน
  - BillItems.ClaimCat = OPF เมื่อ STDCode = 3012 หรือ 3013
  - OPServices.Class = ED
  - OPServices.SvPID จาก ว.แพทย์
  - OPServices.SvTxCode จากเลขกำกับเบิก
  - OPDx.Class = ED
  - OPDx.DiagnosisCode เติมเฉพาะเมื่อทะเบียนมีค่า ไม่บังคับและแก้เองได้
- เพิ่ม Validation CPAP ก่อนบันทึก MD5 และ ZIP กลับชื่อเดิม

## ความปลอดภัย
- ไม่เปลี่ยนกฎหรือ Workflow ของ SSOCAC
- ใช้ชีต Claim_Case และ Case_SSOCPAP เดิมแบบ Migration
