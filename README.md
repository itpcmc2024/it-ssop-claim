# it-ssop-claim V3.4.7 Stable

ต่อยอดจากฐาน Stable ที่ผ่านการทดสอบ โดยคงระบบ API เดิมทั้งหมด โดยคงระบบ API เดิมทั้งหมด

## เพิ่มในเวอร์ชันนี้

- รายการสถานะ `พร้อมส่ง` มีปุ่ม `บันทึกส่งแล้ว`
- ตรวจว่ามี Work Order No. และเคยสร้าง ZIP ก่อนบันทึก
- เปลี่ยนสถานะเป็น `รอผลตอบกลับ` ทันทีโดยไม่ต้องโหลดข้อมูลใหม่
- อัปเดต Claim_Attempt: Submit_Date, Submission_Status = Submitted, Work_Order_No
- บันทึก Timeline ประเภท SUBMITTED พร้อมชื่อ ZIP และ Work Order
- เลขเวอร์ชันทุกส่วนเป็น V3.4.7

ไม่ต้อง Run setupDatabase และไม่ต้องเพิ่มชีทหรือคอลัมน์
