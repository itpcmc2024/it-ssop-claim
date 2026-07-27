SSOP Claim Management V2.4.7 – Identifier & Request Fixed
=============================================================

แก้ไข:
1. HN / VN / CID / Session / Station / JobNo เก็บเป็น Plain text
2. เลข 0 นำหน้าไม่หายสำหรับข้อมูลใหม่
3. ตรวจข้อมูลซ้ำแบบไม่สนเลข 0 นำหน้า
   ตัวอย่าง 000861835 และ 861835 ถือว่าเป็น HN เดียวกัน
4. แก้ข้อความ "ไม่พบ requestId"
5. เปลี่ยนการ POST จาก hidden iframe เป็น no-cors POST
   จึงไม่มี X-Frame-Options sameorigin จาก iframe
6. หน้าโปรแกรมดึงข้อมูลกลับจาก Google Sheet ได้ตามปกติ

ติดตั้ง Apps Script:
- แทนที่ Code.gs
- Run setupClaimSheets
- Run repairIdentifierColumns หนึ่งครั้ง
- Run repairClaimData หนึ่งครั้ง (หากยังมีรายการซ้ำเดิม)
- Deploy > Manage deployments > Edit > New version > Deploy
- Execute as Me / Who has access Anyone

ติดตั้ง GitHub:
- แทนที่ index.html
- assets/css/style.css
- assets/js/app.js
- assets/js/config.js
- Commit แล้ว Ctrl+Shift+R

หมายเหตุ:
เลข 0 ที่เคยหายไปแล้วใน Google Sheet ไม่สามารถเดาคืนได้อัตโนมัติ
แต่ระบบตรวจซ้ำรุ่นนี้จะเทียบค่าเลขโดยไม่สน 0 นำหน้า จึงยังตรวจเจอรายการซ้ำได้
