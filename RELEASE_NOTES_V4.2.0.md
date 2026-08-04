# SSOP Toolkit V4.2.0 — SSOCPAP Development Sprint 1

ฐานพัฒนา: V4.1.5 Production Module Access & UI Final

## เพิ่มในรอบนี้
- เปิดใช้งานการ์ด SSOCPAP ตามสิทธิ์โมดูล STCPAP
- ใช้หน้า Registry กลางร่วมกับ SSOCAC แต่โหลดข้อมูลแยกตาม Module_Code
- เพิ่มโครงสร้างชีต Case_SSOCPAP โดยไม่แก้ Case_SSOCAC
- รองรับนำเข้า CPAP-Pattern.xlsx จากชีต CPAP
- Mapping วันที่รับบริการ, CID, HN, VN, ชื่อ, เลขกำกับเบิก, TFlag, Session และ Station
- รองรับค้นหา กรอง แบ่งหน้า ดูรายละเอียด แก้ไขทะเบียน และส่งออก CSV
- Case_ID ของ CPAP ใช้รูปแบบ CP-พ.ศ.-เลขลำดับ

## ยังไม่เปิดในรอบนี้
- Auto Fill ภายใน ZIP
- Validation CPAP
- MD5/ZIP ที่ผูกกับแถว CPAP
- นำเข้าผลตอบกลับและ Error Work Queue ของ CPAP

ฟังก์ชันข้างต้นจะเพิ่มหลังทดสอบ Registry และ Excel Import ผ่านก่อน

## JobNo / Work Order

- เพิ่มหัวคอลัมน์ `JobNo`
