# SSOP Toolkit V4.4.2 — SSIP Normal Patient Validation & Field Guide

## อ้างอิงโครงสร้าง
หัวฟิลด์และคำอธิบายของ Header, ClaimAuth, IPADT, IPDx, IPOp, Invoices, BillItems และ Coinsurance ปรับตามเอกสาร CIPNnov2019-Edt7.

## เพิ่มใน SSIP Editor
- ชื่อหัวตารางจริงแทน Field 1, Field 2 พร้อม Required / Format / Tooltip
- หน้า Invoices แยกข้อมูล InvNumber, InvDT, InvAddDiscount, DRGCharge, XDRGClaim และ BillItems ให้อ่าน/แก้ไขง่าย
- ตรวจหัตถการ: DateIn/DateOut ต้องอยู่ในช่วง DTAdm–DTDisch
- ตรวจ LAB: BillGrCS=07 + CodeSys=TMLT ต้องมี STDCode
- ตรวจยา: BillGrCS=03/04 + CodeSys=TMT ต้องมี STDCode
- ตรวจ ClaimCat สำหรับ workflow ผู้ป่วยปกติ: ทุกรายการต้องเป็น D
- ปรับ DRGCharge: ย้ายยอด XDRGClaim ไป DRGCharge และตั้ง XDRGClaim = 0.000
- Highlight เซลล์ผิด + Validation Summary + คลิกรายการ Error เพื่อไปยังตำแหน่ง
- Undo การแก้ไขก่อนหน้าเฉพาะแฟ้มที่เลือก
- Reset การแก้ไขทั้งหมดเฉพาะแฟ้มที่เลือกกลับเป็นไฟล์ต้นฉบับตอนเปิด ZIP
- คู่มือฟิลด์ในตัวระบบจาก CIPN specification
- เปลี่ยนชื่อ SSO Editor เป็น SSOP Editor ตามมาตรฐานชื่อระบบ

## หมายเหตุสำคัญ
กฎ ClaimCat=D และการย้าย XDRGClaim เข้า DRGCharge เป็นกฎ Workflow ผู้ป่วยปกติที่ผู้ใช้งานกำหนดเพิ่มเติม ไม่ใช่ข้อกำหนดทั่วไปของ CIPN specification ซึ่ง specification รองรับ ClaimCat T/D/X.
