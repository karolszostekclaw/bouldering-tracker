# Bouldering Tracker

This directory contains all project-specific code and docs for the Google Sheets bouldering tracker.

## Files
- `bouldering_tracker.gs` — main Apps Script
- `bouldering_tracker_views.gs` — rankings/new-routes views
- `appsscript.json` — Apps Script manifest
- `.claspignore` — push only `Code.gs`, `Views.gs`, `appsscript.json`
- `bouldering_tracker_user_guide.md` — manual (EN)
- `bouldering_tracker_user_guide_ja.md` — manual (JA)
- `ARCHITECTURE.md` — project architecture
- `SECURITY.md` — security model
- `TESTING.md` — pre-push test checklist
- `CHANGELOG.md` — release changelog

## Clone and setup

### Private repo (recommended test flow)
```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
./setup.sh <SPREADSHEET_ID>
```

Prerequisite (one-time per Google account):
- Enable Apps Script API access in your account settings:
  `https://script.google.com/home/usersettings`
- If you just enabled it, wait 1–3 minutes before running setup.

How to get `<SPREADSHEET_ID>`:
1. Open the Google Sheet in browser.
2. In URL, copy the part between `/d/` and `/edit`.

Example:
```text
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit#gid=0
```
Spreadsheet ID is:
```text
1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

If GitHub asks for auth on private repos, use GitHub CLI first:
```bash
gh auth login
```

### Update later
```bash
cd <repo>
git pull
./update.sh
```

## Data model (important)
Source-of-truth tabs:
- `Customers`
- `Routes`
- `Logbook`
- `TrainingLog`
- `Settings`
- `EventLog`

Generated/rebuildable tabs:
- `Data`
- `Customer Profile`
- `Route Profile`
- `Rankings View`
- `New Routes`

Use `Setup / Repair Spreadsheet` + `Sync IDs & Dashboards` to rebuild generated tabs safely.

## EventLog-first rebuild
- Event schema columns: `Timestamp, Event Type, Entity Type, Entity ID, Payload JSON, Actor, Schema Version`.
- Use menu: **Tracker Tools → Rebuild Tables from EventLog** to regenerate `Customers`, `Routes`, `Logbook`, `TrainingLog`.
- Use menu: **Prepare Event Entry Tab** to generate an input sheet for manual events.
- Use menu: **Apply Event Entry Rows** to append checked rows into EventLog and rebuild tables.
- Use menu: **Migrate Existing Tables to EventLog** when onboarding an existing spreadsheet.

## Test fixture
- Seed file: `testdata/events_fixture.csv`
- Import it into `EventLog` (starting from row 2, keeping headers), then run:
  - **Rebuild Tables from EventLog**
  - **Sync IDs & Dashboards**
  - **Refresh Rankings & New Routes Views**

## Process rule
Any script change must include:
1. changelog update,
2. EN + JA docs update,
3. testing evidence.
