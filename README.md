# it-ssop-claim V3.4.1

เวอร์ชันแก้ไขการสูญหายของ Work Order No. และเพิ่มประวัติไฟล์ส่ง/ตอบกลับ

## สิ่งสำคัญ
- การแก้ไขทะเบียนใช้ Merge Update และรักษา Work_Order_No เดิม
- Excel Update ที่ไม่มี JobNo จะไม่ล้าง Work Order เดิม
- Claim_Attempt เพิ่ม Work_Order_No, Source_ZIP_Name, Generated_MD5 และ Reply_BIL_Name อัตโนมัติ
- หน้ารายละเอียดแสดงประวัติ ZIP ส่งและ ZIP/BIL ตอบกลับ
- ไม่ต้อง Run setupDatabase; ระบบเพิ่มคอลัมน์ Claim_Attempt ที่ขาดตอนใช้งาน
