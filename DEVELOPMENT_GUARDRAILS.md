# Development Guardrails

## Layout-change guardrail
For any Data-grid structural change (row/column anchors), update both:
1. **clear/reset ranges**, and
2. **fill/write ranges**.

Do not merge if only one side changed.

## Current Data-grid contract
- Row 4: header-only (A:D)
- Data rows: start at row 5
- Column D: customer completion %
- Route section: starts at column E
- Freeze: row 4, column D

## PR/commit checklist
- [ ] `./update.sh` run
- [ ] Post-update routine run in sheet
- [ ] Visual check: no stale row 4 customer entries
- [ ] Visual check: no duplicate route first column in D/E
- [ ] Visual check: checkboxes in correct row/column bands
