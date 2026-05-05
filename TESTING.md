# Testing Checklist (Required Before Push)

## 1) Static validation (local)
- `node --check bouldering_tracker.gs`
- `node --check bouldering_tracker_views.gs`

## 2) In-sheet functional checks (Google Sheets)
Run in a test copy before production:

1. Reload sheet → menu appears (`🧗‍♂️ Tracker Tools`).
2. Run `Install / Repair Edit Trigger`.
3. Run `Sync IDs & Dashboards`.
4. Add one customer + one route, run sync, verify IDs generated.
5. Log one climb from **Data**.
6. Log one climb from **Customer Profile**.
7. Verify Data checkbox navigation to Customer/Route profile.
8. Run `Refresh Rankings & New Routes Views`.
9. Verify:
   - `Rankings View` sorted by points desc.
   - `New Routes` contains recent routes based on timestamp.

## 3) Regression checks
- Existing dashboard formulas still populate.
- Dropdowns for customer/route/status still valid.
- Trigger not duplicated (only one `handleEdit` installable trigger).

### Data layout invariants (must always hold)
- Row 4 is **header-only** (`A:D`) and must not contain customer entries.
- Customer rows start at **row 5**.
- Column `D` is reserved for customer completion %.
- Route headers/checkboxes start at **column E**.
- Freeze pane must be **row 4 + column D**.

### Mirror-change rule
When changing grid anchors (row/column offsets), update and verify **both sides**:
1. cleanup/clear ranges, and
2. write/fill ranges.

No push until both are validated in-sheet.

## 4) Documentation gate (must pass)
For any script change:
- Update `bouldering_tracker_user_guide.md` (EN)
- Update `bouldering_tracker_user_guide_ja.md` (JA)
- Add entry in `CHANGELOG.md`

No push if any item above is missing.
