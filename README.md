# SSOP Toolkit Professional Edition V2.1

ระบบช่วยเปิด แก้ไข ตรวจสอบ และส่งออกไฟล์งานประกันสังคม โดยรุ่นนี้เปิดใช้งานโมดูล **SSO Cancer Care** และเตรียมปุ่มสำหรับ Main, ข้ามเขต, CPAP, Sleep Test และรับไฟล์ตอบกลับ/Error

## ลิขสิทธิ์

Copyright © 2026 PCMC By Kimhan. All Rights Reserved.

โครงการนี้เป็นซอฟต์แวร์ใช้งานภายใน ไม่ได้เผยแพร่ภายใต้สัญญาอนุญาตโอเพนซอร์ส ห้ามคัดลอก ดัดแปลง หรือเผยแพร่โดยไม่ได้รับอนุญาตจากเจ้าของลิขสิทธิ์

## โครงสร้าง

```text
SSOP-Toolkit-Professional-V2.1-GitHub/
├── index.html
├── assets/
│   ├── css/style.css
│   ├── js/app.js
│   └── img/
├── .nojekyll
└── README.md
```

## เปิดบนเครื่องก่อนอัปโหลด

ดับเบิลคลิก `index.html` เพื่อทดสอบได้ทันที หรือเปิดผ่านส่วนเสริม Live Server ใน Visual Studio Code

## เผยแพร่ด้วย GitHub Pages

1. สร้าง Repository ใหม่ เช่น `ssop-toolkit`
2. ตั้ง Repository เป็น **Private** หากไม่ต้องการเปิดเผย Source Code
3. อัปโหลดไฟล์และโฟลเดอร์ทั้งหมดในชุดนี้ไปไว้ที่รากของ Repository
4. ไปที่ **Settings → Pages**
5. ใน **Build and deployment** เลือก **Deploy from a branch**
6. เลือก Branch `main` และ Folder `/(root)` แล้วกด **Save**
7. รอประมาณ 1–3 นาที แล้วเปิด URL ที่ GitHub แสดง

> หมายเหตุ: GitHub Pages โดยทั่วไปเผยแพร่เว็บไซต์สู่สาธารณะ แม้ Repository อาจเป็น Private ขึ้นอยู่กับแผน GitHub ของบัญชี ควรหลีกเลี่ยงการฝังข้อมูลผู้ป่วยหรือรหัสลับลงใน Source Code

## ความเป็นส่วนตัวของข้อมูล

รุ่นนี้อ่านและประมวลผลไฟล์ในเบราว์เซอร์ของผู้ใช้ ไม่ส่งไฟล์ผู้ป่วยขึ้น GitHub และไม่บันทึกลงฐานข้อมูล การนำไฟล์ตัวอย่างจริงไปใส่ใน Repository เป็นสิ่งที่ไม่ควรทำ

## สถาปัตยกรรมปัจจุบัน

รุ่นนี้เป็น Static Web App จึงไม่จำเป็นต้องใช้ Google Apps Script และไม่มีแถบสีเทาของ Apps Script

ในรุ่นที่เพิ่มฐานข้อมูล Error/รับไฟล์ตอบกลับ จะต้องเพิ่ม Backend API แยกต่างหาก เช่น Google Apps Script Web API, Firebase หรือ Supabase โดยหน้า GitHub Pages จะเรียก API ผ่าน `fetch()` ไม่สามารถใช้ `google.script.run` ได้ เพราะคำสั่งนั้นทำงานเฉพาะหน้า HTML ที่เปิดจาก Google Apps Script เท่านั้น
