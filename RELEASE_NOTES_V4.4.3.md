# SSOP Toolkit V4.4.5 — SSIP Navigation, Tooltip & Raw XML Guidance

- Fix SSIP Field Guide state: returning Home and opening SSIP Editor always returns to the editor, not the guide.
- Field Guide mode hides patient list, editor toolbar, validation toolbar, and other editor-only controls.
- Add Announcement button before Field Guide; opens bundled `assets/docs/CIPNnov2019-Edt7.pdf` in a new tab.
- Improve compact field tables to use available width.
- Validation automatically navigates to the first detected issue; each issue also has a Raw XML jump button.
- Rename `คำนวณยอด CIPN` to `คำนวณ DRGCharge`; calculations continue to follow CIPN specification: DRGCharge from ClaimCat D and XDRGClaim from ClaimCat T.
- Add visible hover/focus tooltips for table headers and field names.
- Simplify data-table headers to field names only; Req/Format/definition are moved to tooltips.
- Simplify Invoice header cards: field name + Req/Format + input, with expandable descriptions.
- Raw XML validation can jump/select the relevant XML record.
- Save XML + MD5 remains disabled until the selected file has been modified.
- File list has no internal scrollbar; the page scrolls naturally with content.
