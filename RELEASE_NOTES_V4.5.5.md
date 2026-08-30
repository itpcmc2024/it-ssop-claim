# PCMC-SSO Toolkit V4.5.5 — Cross Focus Fix Desk

## เป้าหมาย
ลดการเลื่อนไปมาใน SSOP Cross Editor และทำให้ผู้ใช้แก้ Error Code ที่มีหลายรายการได้จากจุดเดียว

## สิ่งใหม่
- Cross Fix Desk: เลือก Error Code แล้วเห็นฟิลด์เป้าหมายของแต่ละปัญหา
- ปุ่ม "แก้ฟิลด์นี้" พาไปยังเซลล์จริง ไม่ใช่เพียงแถว และเลื่อนแนวนอนให้อัตโนมัติ
- แถบ Focus แสดงจุดที่กำลังแก้ x/y พร้อม ก่อนหน้า / ถัดไป
- Replace by Value: เลือกค่าเดิมที่พบใน Error Code และแทนค่าใหม่ทุกจุดใน Code เดียวกัน เช่น C07 Hmain HA0000009 -> 60002
- การแทนค่าทำเฉพาะ Issue ที่ตรวจพบใน Code ที่เลือก ไม่แก้แถวอื่นนอกชุด Error
- Cross Custom Rule Manager: เพิ่มกฎระดับฟิลด์ได้เองโดยไม่ Build เวอร์ชันใหม่
- Custom Rule รองรับ EMPTY, EQUALS, NOT_EQUALS, REGEX, NOT_REGEX
- Custom Rule เก็บใน localStorage ของ Browser และ Export/Import JSON ได้
- กฎคำนวณข้ามแฟ้มยังคงใช้ Built-in Rules เพื่อความปลอดภัย

## ความปลอดภัย
- การแก้ไขยังเป็น Local Processing ใน Browser
- Bulk Replace มีหน้าต่างยืนยันก่อนทำงาน
- ทุกการเปลี่ยนแปลงยังไม่เขียนทับ ZIP ต้นฉบับจนกดบันทึก ZIP ลงเครื่อง
- Undo ไฟล์ยังใช้ได้ก่อนบันทึก

## Deployment
GitHub only. ไม่ต้องแก้ Code.gs หรือ Deploy Apps Script
