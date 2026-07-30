# it-ssop-claim V3.4.3 Recovery Stable

ชุดกู้คืนจาก V3.4.3 ซึ่งเป็นเวอร์ชันสุดท้ายที่ผู้ใช้ยืนยันว่าโหลดข้อมูลและเปิดระบบได้ ก่อนเริ่มเปลี่ยนวิธีเชื่อมต่อ API ใน V3.4.4–V3.5.0

ค่าที่ใส่ให้แล้ว:
- Spreadsheet ID
- Document Folder ID
- Apps Script Web App URL

ติดตั้ง:
1. อัปโหลดไฟล์หน้าเว็บทั้งหมดขึ้น GitHub แทนชุดปัจจุบัน
2. นำ Code.gs ไปแทนใน Apps Script
3. Deploy เป็น New version โดยใช้ Deployment เดิม
4. เปิด GitHub Pages แล้วกด Ctrl+F5

หมายเหตุ: ชุดนี้ตั้งใจคืนระบบให้โหลดข้อมูลได้ก่อน โดยไม่ใช้ iframe/postMessage หรือ JSONP และไม่มี routeApiAction_ ที่ทำให้ V3.5.0 ล้มเหลว
