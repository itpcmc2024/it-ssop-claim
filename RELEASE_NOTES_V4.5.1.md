# PCMC-SSO Toolkit V4.5.1 — SSOP Editor Rule Profiles

ฐาน: V4.5.0 Access & Knowledge Naming Cleanup

## เปลี่ยนแปลง
- แยก Rule Profile ใน SSOP Editor ตามประเภทการส่งเบิก 5 โมดูล: Main, Cross, Cancer, CPAP, Sleep Test
- ปุ่มตรวจสอบข้อมูลเรียก Validation ตามโมดูลที่เลือกจริง ไม่ใช้กฎ Cancer กับทุกไฟล์อีกต่อไป
- Main/Cross ใช้การตรวจโครงสร้าง SSOP พื้นฐาน
- Cancer ตรวจ AuthCode=SSOCAC, Hmain/PayPlan, MemberNo และ Z511 โดยไม่บังคับ OPR ทุก BillItems
- CPAP ตรวจ AuthCode=STCPAP, Hmain/PayPlan, 3012/3013=>OPF, เพดาน 20,000/4,000, SvTxCode/SvPID และ Class=ED
- Sleep Test ตรวจ AuthCode=STCPAP, Hmain/PayPlan, 51120/51121=>OPF, เพดาน 7,000/6,000, SvTxCode และความสัมพันธ์ Class
- เมื่อเปลี่ยนประเภทการส่งเบิก ระบบสลับ Rule Profile และผลตรวจทันที

## Deployment
Frontend-only: ไม่เปลี่ยน Code.gs หรือฐานข้อมูล ไม่ต้อง Deploy Apps Script และไม่ต้อง Run setupDatabase().
