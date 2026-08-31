# PCMC-SSO Toolkit V4.5.6 — Filter Totals & Knowledge-assisted Cross Rules

## เพิ่มในรุ่นนี้

- แสดงผลรวมตามข้อมูลที่กรองจริงสำหรับคอลัมน์การเงิน เช่น Amount, ChargeAmt, ClaimAmt, ClaimAmount, Paid, OtherPay และ ReimbAmt
- ผลรวมคำนวณจากผล Filter/Search ทั้งหมด ไม่จำกัด 500 แถวที่แสดงบนหน้าจอ
- Cross Rule Manager เชื่อม SSO Knowledge Center: กรอก Error Code แล้วกดตรวจ Knowledge เพื่อดึง Description/Solution มาใช้
- Cross Preflight จะโหลดแนวทางแก้จาก Knowledge Base และแสดง badge Knowledge เมื่อมีข้อมูล
- เพิ่ม Research Request JSON สำหรับ Error Code ที่ยังไม่มี Knowledge
- เพิ่ม Knowledge Pack Import: นำไฟล์ที่ ChatGPT ค้นคว้าแล้วกลับมา Import เพื่อบันทึก Knowledge + Rule ได้โดยไม่ต้อง Build เวอร์ชันใหม่
- เพิ่มปุ่มเปิด/เพิ่ม Knowledge จากหน้าจัดการกฎ Cross

## แนวทางใช้งาน Error Code ใหม่

1. กรอก Error Code ใน จัดการกฎ Cross
2. กด ตรวจ Knowledge
3. ถ้ามี ระบบเติมความหมายและวิธีแก้
4. ถ้ายังไม่มี กด Export Research Request แล้วส่ง JSON ให้ ChatGPT
5. นำ Knowledge Pack ที่ได้รับกลับมา Import
6. ระบบบันทึก Knowledge Base และเพิ่มกฎตรวจ จากนั้นใช้ได้ทันทีโดยไม่ Build ใหม่

> กฎข้ามแฟ้ม/กฎคำนวณซับซ้อนยังต้องเป็น Built-in Rule เพื่อป้องกันสูตรผิดพลาด
