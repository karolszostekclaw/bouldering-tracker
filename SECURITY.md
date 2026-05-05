# Security Model

## Practical threat model
Primary risks are:
1. Accidental spreadsheet/script edits by editors.
2. Unauthorized edit access to production sheet.
3. Broken dashboards/triggers after copy or manual changes.

## Non-goals
- Full code secrecy inside a bound script project.

## Rules
- Only trusted people get **Editor** access.
- Everyone else gets **Viewer** access.
- Keep sensitive assets outside spreadsheet script.
- Never deploy privileged endpoints that execute as your account unless strictly required and audited.

## Permission setup
### Live customer sheet
- Owner: customer/org
- Editors: trusted operators only
- Viewers: read-only audience
- You: editor only when actively supporting

### Canonical code project/repo
- Owner: you
- Editors: you + approved dev account only

## Recovery controls
- Keep generated views rebuildable (`syncTracker`, `refreshPublicViews`).
- Keep code in Git with changelog.
- Keep first-time setup instructions in both EN/JA manuals.

## Incident response (quick)
1. Remove unexpected editors.
2. Restore script from repo.
3. Re-run trigger install.
4. Run full sync + public views refresh.
5. Log incident in changelog/ops notes.
