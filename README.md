# Bouldering Tracker

This directory contains all project-specific code and docs for the Google Sheets bouldering tracker.

## Files
- `bouldering_tracker.gs` — main Apps Script
- `bouldering_tracker_views.gs` — rankings/new-routes views
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

## Process rule
Any script change must include:
1. changelog update,
2. EN + JA docs update,
3. testing evidence.
