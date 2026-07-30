# it-ssop-claim V3.4.0 (Revised)

ปรับจากไฟล์ตอบกลับจริง `13815_SOCDBIL_8723001.ZIP`

- อ่านไฟล์ `13815_SOCDBIL_xxxxxxx.BIL` ภายใน ZIP
- อ่านงวดส่ง เลขตอบรับ วันที่ตอบรับ และผล A/C
- จับคู่ทะเบียนด้วย CID + วันที่รับบริการ
- เก็บชื่อ ZIP ที่สร้างส่ง ชื่องวดส่ง ชื่อ ZIP ตอบกลับ ชื่อ BIL และเลขตอบรับใน Claim_Attempt
- เชื่อมผลตอบกลับกับ Attempt เดิมด้วย Case_ID + Period_Key
- เก็บ Warning Code เช่น W07 ได้ โดยผลยังคง A ตาม Stat ในไฟล์

ติดตั้งโดยแทนไฟล์ GitHub และ Code.gs จากนั้น Deploy Apps Script เป็น New version
