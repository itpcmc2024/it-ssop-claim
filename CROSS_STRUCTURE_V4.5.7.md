# SSOP Cross Structure Review — V4.5.7

อ้างอิงโครงสร้าง SSOP 0.93 ของ สกส.

## BILLTRAN (19 fields)
Station | AuthCode | DTTran | Hcode | InvNo | BillNo | HN | MemberNo | Amount | Paid | VerCode | Tflag | PID | Name | Hmain | PayPlan | ClaimAmt | OtherPayPlan | OtherPay

## BillItems (13 fields)
InvNo | SvDate | BillMuad | LCCode | STDCode | Description | Quantity | UnitPrice | ChargeAmt | ClaimUP | ClaimAmount | SvRefID | ClaimCat

## Dispensing (18 fields)
ProviderID | DispID | InvNo | HN | PID | PrescDate | DispDate | PrescBy | DispBy | ChargeAmt | ClaimAmt | Paid | OtherPay | Reimburser | BenefitPlan | DispeStat | SvID | DayCover

## DispensedItems (19 fields)
DispID | PrdCat | HospDrgID | DrgID | dfsCode | dfsText | Packsize | sigCode | sigText | Quantity | UnitPrice | ChargeAmt | ReimbPrice | ReimbAmt | PrdSeCode | ClaimCont | ClaimCat | MultiDisp | SupplyFor

## OPServices (22 fields)
InvNo | SvID | Class | Hcode | HN | PID | CareAccount | TypeServ | TypeIn | TypeOut | DTAppoint | SvPID | Clinic | BegDT | EndDT | LCCode | CodeSet | STDCode | SvCharge | Completion | SvTxCode | ClaimCat

## OPDx (6 fields)
Class | SvID | SL | CodeSet | Code | Desc

## ความสัมพันธ์หลัก
- InvNo เชื่อม BILLTRAN ↔ BillItems ↔ Dispensing ↔ OPServices
- DispID เชื่อม Dispensing ↔ DispensedItems
- SvID เชื่อม OPServices ↔ OPDx
- Hcode/HN/PID ต้องสัมพันธ์กันในธุรกรรมเดียวกัน
- DispensedItems.ChargeAmt = Quantity × UnitPrice
- DispensedItems.ReimbAmt = Quantity × ReimbPrice

## แหล่งอ้างอิง
- https://ww2.chi.or.th/dataupload/Ssop/Ref/2561/SSOP-2.pdf
- https://ww2.chi.or.th/dataupload/Ssop/Ref/2561/SSOP093-PdfManual-611026.pdf
- https://pyh.moph.go.th/images/documents/error-ssop-edit1ByWITTAYA.pdf
