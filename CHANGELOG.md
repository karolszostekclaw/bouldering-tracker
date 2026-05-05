# Changelog

All notable changes to this tracker should be documented here.

## Format
- Date (UTC)
- Version/tag
- Changed
- Docs updated (EN/JA)
- Test evidence

---

## [Unreleased]
### Added
- Architecture and security/process documentation (`ARCHITECTURE.md`, `SECURITY.md`, `TESTING.md`).
- Public view script scaffold for `Rankings View` and `New Routes` tabs (`bouldering_tracker_views.gs`).
- `Setup / Repair Spreadsheet` flow that creates/repairs core tabs and seeds default Settings.
- Structured EventLog schema (`payload_json`, `actor`, `schema_version`) and event appends for customer/route creation + climb/training logs.
- `Rebuild Tables from EventLog` menu action to regenerate materialized tables.
- Integration fixture: `testdata/events_fixture.csv`.
- Data sheet freeze panes enforced to row 3 / column C during sync.
- Customer/Route profile tabs now auto-populate with richer stats and recent activity.
- Rankings View now includes Japanese Level and supports user-selected sort field.
- Added Event Entry workflow (`Prepare Event Entry Tab`, `Apply Event Entry Rows`) for manual event creation.
- Added migration utility (`Migrate Existing Tables to EventLog`) for onboarding existing spreadsheets.
- Added support for `CUSTOMER_UPDATED` events during EventLog rebuild.
- `.claspignore` + `appsscript.json` to prevent duplicate file pushes and stabilize deploys.
- Setup/update helper scripts for macOS + Google Sheets deployment (`setup.sh`, `update.sh`).
- Manual updates for first-time setup + public views in EN/JA guides.

### Process
- Enforced rule: every script change must include changelog + EN/JA manual update + pre-push testing evidence.

### Test evidence
- `node --check /tmp/bouldering_tracker.js` (copied from `.gs`)
- `node --check /tmp/bouldering_tracker_views.js` (copied from `.gs`)
- Helper scripts marked executable (`setup.sh`, `update.sh`).
- Manual in-sheet verification checklist documented in `TESTING.md`.
