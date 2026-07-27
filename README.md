SSOP Claim Management V2.4.2 – SSOCAC Pastel

เวอร์ชันนี้ปรับหน้าตาให้ใกล้เคียงภาพตัวอย่างมากขึ้น โดยคงฟังก์ชัน SSOCAC เดิม:
- นำเข้าเคสจาก Excel
- อ่าน/บันทึก Claim_Case, Case_SSOCAC และ Claim_Attempt
- ค้นหาและกรองสถานะ
- แสดง Batch ล่าสุด และ JobNo
- Timeline เรียงเก่าไปใหม่
- ส่งออก CSV

วิธีใช้:
1) นำ Code.gs ไปแทนใน Apps Script เฉพาะเมื่อยังไม่ได้ใช้ Code.gs ของ V2.4.1
2) ใน GitHub แทนที่ index.html, assets/css/style.css, assets/js/app.js และ assets/js/config.js
3) ตรวจ apiUrl ใน config.js ให้เป็น Web App URL ปัจจุบัน
4) Commit และกด Ctrl+Shift+R หลัง GitHub Pages อัปเดต

หมายเหตุ: รุ่นนี้ยังใช้ mock user และยังไม่ควรใช้กับข้อมูลผู้ป่วยจริงจนกว่าจะเพิ่ม Google Sign-In และสิทธิ์ผู้ใช้
