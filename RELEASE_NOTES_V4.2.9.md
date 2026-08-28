# SSOP Toolkit V4.3.0 — Sleep Test Auto Fill Completion

- เพิ่ม Auto Fill ของโมดูล Sleep Test แยกจาก Cancer/CPAP
- BILLTRAN.AuthCode = STCPAP
- BILLTRAN.TFlag จากทะเบียน Sleep Test
- BillItems.STDCode 51120/51121 เติม ClaimCat = OPF
- OPServices.SvTxCode จากเลขกำกับเบิก
- OPDx.DiagnosisCode จาก PDx.ICD10 เมื่อทะเบียนมีค่า
- รักษา OPServices.Class เดิมและทำให้ OPDx.Class ตรงกัน (ตัวอย่างแฟ้มจริง EC)
- เพิ่ม Validation เฉพาะ Sleep Test
- ปรับ Tooltip/หัวคอลัมน์สำคัญตามโมดูล Sleep Test
