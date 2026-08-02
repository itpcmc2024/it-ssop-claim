# it-ssop-claim V3.7.5 Production

ต่อยอดจาก V3.4.8 Stable ที่ผ่านการทดสอบ โดยคงระบบ API และ Workflow เดิมทั้งหมด

## เพิ่มในเวอร์ชันนี้

- เพิ่มตัวกรองสถานะในหน้าทะเบียนงาน
- คลิกการ์ด Dashboard เพื่อกรองรายการตามกลุ่มสถานะได้ทันที
- เพิ่มปุ่ม `ล้างตัวกรอง` เพื่อกลับไปแสดงข้อมูลทั้งหมด
- ตัวกรองสถานะทำงานร่วมกับช่องค้นหา การเรียงลำดับ การแบ่งหน้า และส่งออก CSV
- การ์ดที่กำลังใช้กรองจะแสดงกรอบเน้นให้เห็นชัดเจน
- ไม่เปลี่ยน API, โครงสร้างชีต หรือ Workflow ที่ทดสอบผ่านแล้ว
- เลขเวอร์ชันทุกส่วนเป็น V3.6.5

ไม่ต้อง Run setupDatabase และไม่ต้องเพิ่มชีทหรือคอลัมน์

## การปรับปรุง V3.6.5
- ลดความกว้างช่องค้นหาในหน้าทะเบียน
- จัดช่องค้นหา ตัวกรอง การเรียงลำดับ จำนวนแถว ปุ่มล้างตัวกรอง และส่งออก CSV ให้อยู่แถวเดียวกันบนหน้าจอคอมพิวเตอร์
- คง Workflow, API และฐานข้อมูลจาก V3.4.9 Stable ไว้เหมือนเดิม


## การปรับปรุง V3.6.5
- หน้ารายละเอียดเคสแสดงข้อมูลผู้ป่วย ประวัติ Claim Attempt, Error Code, Knowledge Base และ Timeline ในหน้าเดียว
- ตัวกรองสถานะเป็น Dropdown ที่เลือกได้ทั้งแบบกลุ่มและสถานะรายขั้นตอน
- ต่อจาก V3.5.0 Stable โดยไม่เปลี่ยนระบบเชื่อมต่อเดิม


## การปรับปรุง V3.6.5 Production
- ขยายความสูงช่องค้นหาและปรับขนาดตัวอักษรของแถบเครื่องมือให้ชัดเจน
- นำ Error Code ใหม่จาก Reply ZIP เข้าสู่ Knowledge_Base อัตโนมัติแบบรอเติมรายละเอียด โดยไม่เก็บข้อมูลผู้ป่วย
- ส่งออก CSV ตามผลการค้นหาและตัวกรองปัจจุบัน
- CSV เพิ่ม Error Code, ความหมาย, สาเหตุ และแนวทางแก้จาก Knowledge Base


## V3.6.5 Production Hotfix
- แก้ cache ของ JavaScript ด้วย version query ใหม่
- เพิ่ม fallback onclick ให้ปุ่มนำเข้าและปุ่มปิดที่สำคัญ
- ลดตัวกรองสถานะเหลือเฉพาะ 6 กลุ่มงาน
- แสดง Error Code และคำอธิบายเฉพาะเมื่อกรอง ต้องแก้ (C)
- คืนลูกศร dropdown ของตัวกรองสถานะ

## Version 3.6.5 Production
- อ่านคำอธิบาย CheckCode จากไฟล์ SOCDBIL/BIL และแสดงในหน้าต่างนำเข้าผลตอบกลับ
- แสดงสถานะว่ารหัสมีอยู่ใน Knowledge_Base แล้วหรือยัง
- รหัสใหม่กดบันทึกเข้าฐานความรู้ได้ โดยคำอธิบายจากไฟล์ถูกเติมให้อัตโนมัติ
- รายการเดิมเปิดแก้ไขสาเหตุและแนวทางแก้ได้จากหน้าจอนำเข้าผลและหน้ารายละเอียดเคส
- ปรับฟอร์ม Knowledge Base ใหม่ให้เป็นระเบียบ อ่านง่าย และ Responsive
- เพิ่มเมนูประกาศ รหัส Protocol คู่มือฟิลด์ ฐานความรู้ และเครื่องมือแก้ไฟล์บนหน้าทะเบียน
- ยกเลิกการสร้าง Knowledge placeholder อัตโนมัติ ผู้ใช้เป็นผู้ยืนยันการบันทึกเอง

## V3.6.5 Production
- เพิ่ม Tooltip ความหมายหัวคอลัมน์ใน ZIP Reader
- เปิด Knowledge Center ในแท็บใหม่จากหน้าทะเบียน
- แก้ลำดับชั้น Modal ให้ปุ่มเพิ่ม Knowledge แสดงฟอร์มได้แน่นอน
- เพิ่ม Knowledge ใหม่ได้โดยไม่ต้องใช้ PIN; การแก้ไขข้อมูลเดิมยังต้องใช้ PIN
- จัดข้อความคำแนะนำในหน้าผลตอบกลับให้อยู่ภายในกรอบและตัดบรรทัดอ่านง่าย
- ย้ายเครื่องมือแก้ไฟล์เป็นการ์ดเครื่องมือกลางในหน้าหลักสำหรับรองรับทุกโมดูล

## V3.6.5 Final Production Fix
- Tooltip หัวคอลัมน์ ZIP Reader แสดงทั้งกล่องคำอธิบายและ title สำรอง
- รองรับเมาส์และคีย์บอร์ด
- เปลี่ยนชื่อเครื่องมือกลางเป็น SSO Editor
- ปุ่มหน้าหลักกลับหน้าแสดงการ์ดทั้งหมด
- เอาปุ่มประกาศและรหัส Protocol ออกจาก SSO Editor
- คงคู่มือฟิลด์ SSOCAC และเตรียมเพิ่มคู่มือรายโมดูล
- ป้องกัน Modal ซ้อนและแถบเลื่อนซ้ำเมื่อแก้ Knowledge Base
- ตั้ง WRITE_PIN ผ่านฟังก์ชัน setWritePin ใน Apps Script


## V3.7.1 Smart Assist

- Knowledge Assistant ดึงคำอธิบาย Error Code จาก Reply BIL มาใส่ในฟอร์มอัตโนมัติ และมีข้อความตั้งต้นเมื่อไฟล์ไม่มีคำอธิบาย
- เพิ่มปุ่ม “ปรับปรุงข้อมูลอัตโนมัติ” ใน ZIP Reader
- เขียนทับ BILLTRAN.AuthCode = SSOCAC, MemberNo = Case Number, VerCode = Protocol Code และ TFlag = ข้อมูลทะเบียน
- ตรวจชื่อยา Chemo_Drug แล้วกำหนด BillItems.ClaimCat = OPR ในรายการที่ตรงกัน
- ไฮไลต์เซลล์ที่ระบบปรับปรุง พร้อมสรุปจำนวนจุดที่แก้ไข
- เลื่อน Toast ลงจากมุมบน เพื่อไม่ให้ทับปุ่มปิด (X) ของ Modal
- ปุ่มหน้าหลักล้างพารามิเตอร์ page และกลับ Dashboard โมดูล


## V3.7.1 UI Polish

- ปรับหน้า Knowledge Center ให้การ์ดกระชับและแสดงข้อมูลได้มากขึ้นต่อหนึ่งหน้าจอ
- ลดความสูงของช่องแนวทางแก้และช่องข้อมูลที่เกี่ยวข้อง โดยยังเลื่อนอ่านข้อความยาวภายในได้
- จัด Error Code เป็นป้ายที่อ่านง่าย และปรับระยะห่างขององค์ประกอบให้สมดุล
- ขยายพื้นที่ทำงาน Knowledge Center บนจอ Desktop โดยไม่กระทบหน้าจอมือถือ
- เลื่อน Toast ลงต่ำกว่าส่วนหัว เพื่อลดการทับปุ่มปิดและปุ่มเมนูด้านขวา
- ไม่เปลี่ยน API, โครงสร้างฐานข้อมูล หรือ Workflow ของ V3.7.0


## V3.7.5 Productivity Polish

- เปลี่ยนหัวคอลัมน์ `Work Order No.` เป็น `Work No.` และลดความกว้างคอลัมน์
- เพิ่มคอลัมน์ `Session : Station` ในทะเบียนงาน เช่น `6812 : 20`
- ช่องค้นหารองรับ Session, Station และรูปแบบ `Session : Station`
- เพิ่ม Session และ Station ในหน้าต่างแก้ไขงานและรายละเอียดเคส
- แสดง Session/Station บริเวณหัว ZIP Reader เพื่อช่วยยืนยันเคส
- เพิ่ม Session และ Station ใน CSV Export
- ไม่เปลี่ยน API, โครงสร้างฐานข้อมูล หรือ Workflow เดิม


## V3.7.5 – Reply CheckCode Coverage

- อ่าน CheckCode ได้ทั้งรหัสที่ไม่ผ่านการตรวจสอบและรหัสเตือนจาก Reply BIL
- รองรับรหัสหลายตัวอักษร เช่น CD2, CE3 และรหัสเตือน เช่น W07
- เก็บรหัสทั้งหมดของแต่ละรายการเพื่อแสดงผลและเชื่อม Knowledge Base
- สถานะ A/C ยังคงอ้างอิงค่า Stat เดิม: รหัสเตือนอาจอยู่ในรายการ A ส่วนรหัสไม่ผ่านอยู่ในรายการ C


## V3.7.5 – Registry UX Enhancement

- ค้นหา Error Code และคำอธิบาย Error ได้จากหน้าทะเบียน
- ย้ายจำนวนรายการและเลขหน้าขึ้นเหนือหัวตาราง
- ยกเลิกแถบเลื่อนแนวตั้งซ้อนในตารางทะเบียน ใช้แถบเลื่อนของ Browser เพียงชุดเดียว
- จัดคำอธิบาย Error แยกบรรทัดตามเครื่องหมาย | เพื่ออ่านง่าย
- แสดง Error Code เป็น Tag พร้อม Tooltip และคลิกเพื่อกรองรหัสได้


## V3.7.5 Registry UX Hotfix
- แก้โครงสร้างตารางทะเบียนให้ใช้ Browser vertical scrollbar เพียงชุดเดียว
- แยก horizontal scrollbar ไปไว้ใน wrapper เฉพาะ โดยไม่สร้าง vertical scrollbar ซ้อน
- แสดง Error Code เป็นป้าย [CODE] พร้อม tooltip และคลิกเพื่อกรอง
- แยกคำอธิบาย Error เป็นคนละบรรทัดตาม |, line break หรือรหัสถัดไป
- เพิ่ม cache-busting เป็น v=3.7.5 เพื่อให้ GitHub Pages โหลด CSS/JS ใหม่ทันที


## V3.8.1 — Authentication & Multi-user Baseline
- Login ด้วย User ID/Email และรหัสผ่าน
- Role: ADMIN / USER
- ADMIN จัดการผู้ใช้และ System_Config ผ่านการ์ด “จัดการระบบ”
- USER ใช้งานทุกโมดูลและ Knowledge ได้ แต่ไม่เห็นเมนูจัดการระบบ
- ทุกการบันทึกใช้ Display_Name ของผู้ล็อกอินเป็นผู้ทำรายการจากฝั่ง Backend
- หน้า C Registry ตัดคอลัมน์คำอธิบายซ้ำออก ใช้ Error Code Tag + Tooltip
- เรียงปุ่ม: ดู | แก้ไข | แก้ไข ZIP | ปุ่มตามเงื่อนไข

### เปิดใช้งานครั้งแรก
1. เปิด `Code.gs` และแก้ค่าใน `setupInitialAdmin()` โดยเฉพาะ `INITIAL_ADMIN_PASSWORD`
2. Run `setupAllSheets()` หนึ่งครั้งเพื่อเพิ่มคอลัมน์ Password_Hash/Password_Salt โดยไม่ลบข้อมูลเดิม
3. Run `setupInitialAdmin()` เพื่อสร้าง Admin คนแรก
4. Deploy Apps Script เป็นเวอร์ชันใหม่ แล้วอัปโหลดไฟล์ GitHub Pages


## V3.8.1 Login API Hotfix
- Uses the new Apps Script deployment URL.
- Accepts JSON, form parameters, and URL-encoded POST bodies.
- Adds public `ping` diagnostic action.
- Unknown-action responses now include backend version and received action.


## V4.1.1 — ZIP Row Tools

- เพิ่ม Checkbox หน้าแถวทุกแถวในหน้าแก้ไข ZIP
- ปุ่ม − จะเปิดใช้งานเมื่อมีแถวถูกเลือก และลบหลายแถวพร้อมกันได้
- ปุ่ม + เพิ่มแถวว่างท้ายส่วนข้อมูลที่กำลังเปิด เพื่อกรอกข้อมูลใหม่
- รองรับการเลือกทั้งหมดเฉพาะรายการที่กำลังแสดง/กรอง
- การเพิ่มและลบถือเป็นการแก้ไขไฟล์ ระบบจะสร้าง Checksum ใหม่เมื่อสร้าง ZIP
- ปุ่ม “คืนค่าไฟล์นี้” สามารถย้อนกลับการเพิ่ม/ลบทั้งหมดของไฟล์ที่เปิดได้


## V4.1.1 — Unified ZIP Editor
- แยกโหมดเปิด ZIP อิสระออกจากโหมดแก้ไข ZIP รายผู้ป่วย
- ซ่อน Smart Auto Fill ในโหมดเปิด ZIP อิสระ
- แก้การเขียนข้อมูลจาก Grid กลับเข้าไฟล์ SSOP จริง
- เพิ่มปุ่มบันทึกไฟล์และสร้าง MD5 ใหม่ก่อนสร้าง ZIP
- ปุ่ม ZIP กลับชื่อเดิมจะบันทึกทุกไฟล์ที่ยังแก้ไขค้างโดยอัตโนมัติ
- รองรับแก้ไข เพิ่มแถว และลบแถวทั้งสองโหมด
- แสดงสถานะยังไม่บันทึก/บันทึกแล้ว และเตือนก่อนปิดหน้าต่าง


## V4.1.1 Production Baseline
- Smart Error Dashboard and Error Work Queue
- Work Queue displays Session : Station and Work No.
- Error colors: solved knowledge (green), warning W (yellow), unresolved error (red)
- Knowledge Center compact expandable rows
- Knowledge opens in a new browser tab
- ZIP status badge moved before file search


## V4.1.1 Production Hotfix
- แก้ปุ่มปิด/แสดงในทะเบียนงานใน Error Work Queue
- เพิ่ม VN และส่งออก CSV ราย Error Code
- Work Queue แสดงเฉพาะตัวกรองต้องแก้ (C)
- ไปทะเบียนข้ามหน้าและคงไฮไลต์
- อ่าน Error Code จากทั้งรหัสและคำอธิบาย
- SSO Editor รองรับไฟล์ ZIP และหลายโมดูล
