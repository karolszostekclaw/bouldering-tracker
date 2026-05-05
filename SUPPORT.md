# Support, Bug Reports, and Troubleshooting

## Fastest way to report a bug
Open a GitHub issue in this repo with:

1. **Title**: short summary
2. **Environment**:
   - Google account type (personal/workspace)
   - Browser + version
   - Sheet URL (or redacted)
   - Script version/commit (if known)
3. **Steps to reproduce** (numbered)
4. **Expected result**
5. **Actual result**
6. **Screenshots/video**
7. **Event sample** (if related): relevant EventLog rows

## Screenshot proof checklist
When possible include these in screenshots:
- Active tab name
- Cell reference where issue happens (e.g. `J2`)
- Formula bar (if formula/display issue)
- Data validation panel (if dropdown issue)
- Menu used before issue (`Tracker Tools -> ...`)

## Common issues and fixes

### 1) Data not populated after CSV import
Run:
1. `Tracker Tools -> Rebuild Tables from EventLog`
2. `Tracker Tools -> Run Post-Update Routine`

### 2) Dropdown looks broken / validation error
Run:
1. `Tracker Tools -> Run Post-Update Routine`
2. Reload sheet tab

### 3) Wrong language / mixed labels
1. Set `Settings!J2` to `EN` or `JA`
2. Run `Tracker Tools -> Apply UI Language`
3. Reload sheet tab

### 4) Duplicate demo data
Run `Tracker Tools -> Reset Data (Safe)` before `Import Demo/Test Data`.

### 5) Rankings sort not updating
Change sort in `Rankings View!B1`.
If stale, run `Refresh Rankings & New Routes Views`.
