# SSOP Toolkit V4.4.8 — Module Rule & File Guard Hotfix

## เปลี่ยนแปลงหลัก

- Cancer
  - BILLTRAN.AuthCode ต้องเป็น SSOCAC
  - Hmain และ PayPlan ห้ามว่าง
  - OPDx ต้องมี Z511 อย่างน้อย 1 รายการ
  - ยกเลิกกฎที่บังคับ BillItems.ClaimCat = OPR ทุกแถว
  - คงการปรับ OPR เฉพาะรายการมะเร็งที่ระบบจับคู่ได้จากข้อมูลเคส

- CPAP / Sleep Test
  - BILLTRAN.AuthCode ต้องเป็น STCPAP
  - Hmain และ PayPlan ห้ามว่าง
  - ClaimCat = OPF เฉพาะรายการที่เข้าเงื่อนไขตามสิทธิ
    - CPAP/หน้ากาก: STDCode 3012 / 3013
    - Sleep Test: STDCode 51120 / 51121
  - ไม่บังคับ OPF กับ BillItems ทุกรายการ

- File Guard
  - SSIP Editor เปิดเฉพาะ ZIP ที่มี XML AIPN/CIPN ที่รองรับ
  - SSOP Editor ปฏิเสธไฟล์ข้อความที่ไม่ใช่โครงสร้าง SSOP
  - หน้าเปิด ZIP ผู้ป่วยทุกโมดูลปฏิเสธ ZIP ที่ขาด BILLTRAN, BillItems, OPServices หรือ BILLDISP
  - ป้องกันการนำไฟล์ SSIP ไปเปิดใน SSOP และไฟล์ SSOP ไปเปิดใน SSIP

อ้างอิงกฎ CPAP / Sleep Test จาก CHI67-A03 และ mapping ที่ใช้งานในโครงการ
