# SSOP Toolkit V4.2.1 — SSOCPAP Development Sprint 1

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

- เพิ่มหัวคอลัมน์ `JobNo` เป็นข้อมูลจำเป็นของไฟล์ Excel CPAP
- Mapping `JobNo` ไปยัง `Case_SSOCPAP.Work_Order_No`
- แสดง Work No. ในหน้าตรวจสอบก่อนนำเข้า
- เก็บเป็นข้อความเพื่อรักษาเลข 0 นำหน้า (ถ้ามี)

## Migration Edition Hotfix
- `setupDatabase()` เปลี่ยนเป็นการ Migration แบบเพิ่มเฉพาะคอลัมน์ที่ขาดต่อท้าย
- ไม่ลบ ไม่ย้าย ไม่เรียง และไม่เปลี่ยนหัวตารางเดิม
- คงลำดับ `Claim_Case` ตาม V4.1.5 Production เดิม
- ฟิลด์เฉพาะ CPAP/JobNo เก็บใน `Case_SSOCPAP.Work_Order_No`
- `checkDatabaseV3()` ตรวจจากชื่อหัวตาราง ไม่บังคับตำแหน่งคอลัมน์


## Sprint 1 Import Hotfix
- สร้าง Case_ID แยกทุกแถวในชุดนำเข้า ไม่เขียนทับเคสเดิม
- แก้วันที่จาก Excel แบบพุทธศักราช/Serial Date ของไฟล์ต้นทาง
- JobNo ยังคง Mapping ไป Case_SSOCPAP.Work_Order_No
