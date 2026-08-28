# V4.3.0 verification

Validated JavaScript syntax with Node.js.

Sleep Test mapping implemented:
- BILLTRAN[AuthCode] = STCPAP
- BILLTRAN[TFlag] = registry TFlag
- BillItems STDCode 51120/51121 => ClaimCat OPF
- OPServices[SvTxCode] = registry Claim_Control_No
- OPDx[DiagnosisCode] = registry Diagnosis_Code when present
- OPDx.Class follows OPServices.Class; existing OPServices.Class is preserved (sample uses EC)

CPAP and SSOCAC branches remain separate.
