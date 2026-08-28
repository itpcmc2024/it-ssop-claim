# PCMC-SSO Toolkit V4.4.8 — SSIP CIPN Reply & ErrorCode Hotfix

## Changes
- About dialog brand changed from `SSOP Toolkit` to `PCMC-SSO Toolkit`.
- SSIP reply reader now supports CIPN `CIGNREP` reply format in addition to AIPN `SIGNREP/SIGNSUP`.
- Reply area displays the selected ZIP/REP filename, detected reply format, and inner REP filenames.
- CIPN CIGNREP parser reads A/C results, AN, patient name, Error/Warning codes, and code data.
- Error/Warning descriptions are read from the `รหัสผลการตรวจรับ` section and can be saved to Knowledge Base under module `SSIP`.
- Added `ErrorCode` button to SSIP Editor header.
- Added Drive document key `SSIP_ERROR_CODE` -> `ErrorCode.pdf` in the configured document folder.

## Verified sample
`13815_CIGNREP_4165.zip` was analyzed during development:
- sent: 72
- passed A: 66
- failed C: 6
- detected codes: 254, 467, 501, 525, 602, 807, 837, 83A, 923

No Google Sheet schema changes are required.
