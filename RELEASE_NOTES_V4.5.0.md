# PCMC-SSO Toolkit V4.5.0 — Access & Knowledge Naming Cleanup

## Changes
- SSIP Editor is now available to every authenticated user, matching SSOP Editor.
- User permission UI reordered: SSOP Editor, SSIP Editor, Main, Cross, Cancer Care, CPAP, Sleep Test, SSO Knowledge Center.
- Cancer Care permission is intentionally retained so existing non-admin access can still be managed.
- Renamed visible `SSOP Knowledge Center` labels to `SSO Knowledge Center`.
- Knowledge module selectors standardized to: Main / Cross / Cancer / CPAP / Sleep Test / SSIP.
- Removed SSIP / AIPN-CIPN from the SSOP Editor claim-type selector. SSIP work remains isolated in SSIP Editor.
- Version synchronized to V4.5.0 in frontend and Apps Script API.

## Database
No sheet/header migration. `setupDatabase()` is not required.
