# SSOP Cross Field Guide — Reference Notes V4.5.4

This file documents the public references used to refine the Cross field guide and validation design.

## Public references
1. สำนักสารสนเทศบริการสุขภาพ (สกส.) — แผนผังแสดงความสัมพันธ์ของข้อมูลการรักษาพยาบาล ผู้ป่วยนอก สิทธิประกันสังคม (SSOP)
   - BILLTRAN is linked to BillItems, Dispensing/DispensedItems and OPServices primarily by InvNo.
   - HN, PID and Hcode/ProviderID are expected to be consistent across linked records.
   - BillItems ClaimAmount is derived from Quantity × ClaimUP; drug item ChargeAmt/ReimbAmt relationships are also defined.

2. คู่มือระบบผู้ป่วยนอก (SSOP) / แนวทาง ERROR
   - C07: Hmain must represent the correct main hospital at the date of service; validation depends on entitlement at BillTran.DTTran.
   - C08: Hcode for the same Invoice No. must be consistent across BillTran, BillDisp and OPServices.
   - Error families are separated into C (entitlement), T (BillTran), R (BillDisp) and S (OPServices).

## Local-only vs external-reference validation
The toolkit can validate structural relationships inside a submitted ZIP. It must not claim definitive validation for rules requiring data not present in the ZIP.

External reference required for definitive validation:
- C07: entitlement / main-hospital history by date of service.
- T06: current health-benefit plan master.
- S18: ICD / diagnosis code set reference.
- S19: service/procedure code set reference.
- W04 / W05 / W07: Drugcatalog, effective dates, prices and TMT mappings.

## Safety principle for bulk correction
Bulk correction is enabled only when the target value can be deterministically recomputed or copied from the linked authoritative row inside the same ZIP. It remains disabled for rules requiring clinical judgement or external master data.
