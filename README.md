# it-ssop-claim V3.4.4 Stable

ฐานระบบ: Recovery Stable ที่ยืนยันแล้วว่าโหลดข้อมูลได้

ปรับเพิ่มเฉพาะ 4 เรื่อง:
- แยกการอ่าน ZIP ออกจากการอัปเดตสถานะ ป้องกันแจ้งว่า ZIP เสียทั้งที่อ่านได้
- เปลี่ยนสถานะเป็น `รอตรวจสอบ` หลังเปิด ZIP จากแถวผู้ป่วยและหลังสร้าง ZIP สำเร็จ
- การ์ด Dashboard และป้ายสถานะใช้สีพาสเทลตาม Workflow
- ตรวจ `ClaimCat = OPR` เฉพาะรายการที่ตรงกับ `Case_SSOCAC.Chemo_Drug`

ยังคงระบบเชื่อมต่อ API เดิมจาก Recovery Stable โดยไม่ใช้ iframe, postMessage หรือ JSONP

ติดตั้ง:
1. แทนไฟล์ทั้งหมดใน GitHub
2. แทน `Code.gs` ใน Apps Script
3. Deploy เป็น New version โดยใช้ Deployment เดิม
4. กลับหน้าเว็บและกด Ctrl+F5

ไม่ต้อง Run `setupDatabase`
