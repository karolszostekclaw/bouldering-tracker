# Bouldering Tracker Architecture

## Goal
Keep customer data in their spreadsheet, while keeping your codebase maintainable, versioned, and recoverable.

## Recommended model
1. **Client-owned spreadsheet** (Google Sheets, MacBook or any browser).
2. **Thin bound script wrapper** in the client sheet.
3. **Canonical tracker logic** maintained in your repo + Apps Script project.
4. **Versioned releases** with changelog and doc updates (EN + JA).

## Trust boundaries
- Spreadsheet editors can change sheet data and bound script behavior.
- Viewers cannot edit script, but copied sheets can expose copied script logic.
- Do not rely on code secrecy; rely on access control + recovery process.

## Safety principles
- Avoid privileged web apps running as your account for this use case.
- Keep source-of-truth data tabs separate from generated/dashboard tabs.
- Make generated tabs rebuildable from source data.

## Source-of-truth tabs
- Customers
- Routes
- Logbook
- Settings
- GradeConversion
- TrainingLog

## Generated tabs (rebuildable)
- Data
- Customer Profile
- Route Profile
- Rankings View
- New Routes

## Minimal wrapper pattern (if using library model)
```javascript
function onOpen() { TrackerApp.onOpen(); }
function setupTracker() { TrackerApp.setupTracker(); }
function syncTracker() { TrackerApp.syncTracker(); }
function handleEdit(e) { TrackerApp.handleEdit(e); }
function installTriggers() { TrackerApp.installTriggers(); }
function refreshPublicViews() { TrackerApp.refreshPublicViews(); }
```

## Release flow
1. Implement change in canonical source.
2. Run test checklist.
3. Update docs (`bouldering_tracker_user_guide.md` + `_ja.md`).
4. Add changelog entry.
5. Push/release.
