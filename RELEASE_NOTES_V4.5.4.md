# PCMC-SSO Toolkit V4.5.4 — Cross Workflow & MD5 UX Refinement

## Scope
GitHub frontend only. No Apps Script / database migration required.

## Cross / SSOP Editor
- Lock “รับไฟล์ตอบกลับ SSOP” to the active SSOP Rule Profile (Main / Cross / Cancer / CPAP / Sleep Test).
- Add Cross-specific field guide based on SSOP field relationships and SSOP error guidance.
- Add extensible Cross rule catalog and new preliminary rules:
  - C07 Hmain validation (local format/blank precheck; full eligibility validation still requires external entitlement data for DTTran).
  - C08 Hcode consistency across BILLTRAN / Dispensing / OPServices by InvNo.
- Keep existing Cross Preflight rules and allow more codes to be added in future releases.

## Bulk correction
For deterministic rules, when one Error Code is selected, “แก้ <CODE> ทั้งหมด” is available with confirmation.
Supported in V4.5.4:
- C08 — copy BILLTRAN.Hcode to matching Dispensing.ProviderID / OPServices.Hcode.
- S32 — copy BILLTRAN.HN to matching Dispensing / OPServices rows.
- S33 — copy BILLTRAN.PID to matching Dispensing / OPServices rows.
- R04 — recalculate Dispensing ChargeAmt / ClaimAmt from DispensedItems totals.
- T33 — recalculate BILLTRAN.Amount from BillItems.ChargeAmt.
- T44 — recalculate BillItems.ClaimAmount = ClaimUP × Quantity.
- T45 — recalculate BILLTRAN.ClaimAmt from BillItems.ClaimAmount.

Rules that require clinical/business judgement or external masters remain manual/reference only.

## Edited markers
- Persistent row/cell marker for data edited in the current browser session.
- Cross Preflight shows “มีการแก้ไข” for issues whose target row has been edited.
- Internal ZIP file list indicates whether a file has unsaved edits or has been saved into the in-memory working ZIP.

## MD5 / Save behavior
- Renamed action to “บันทึกในงาน + MD5” to make browser-local behavior explicit.
- The action updates the working ZIP in browser memory and recalculates the EndNote checksum; it does NOT overwrite the original file on disk.
- “บันทึก ZIP ลงเครื่อง...” persists the edited ZIP to disk.
- On browsers supporting the File System Access API, the user is prompted to choose the save location.
- Clear status/toast text explains where the data currently exists.

## Cross field guide references
- สำนักสารสนเทศบริการสุขภาพ (สกส.) SSOP relationship diagram / SSOP structure.
- SSOP error guidance covering C/T/R/S groups.
- Cross guide marks rules needing external reference data such as entitlement master, ICD/code set, and Drugcatalog.
