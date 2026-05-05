# Bouldering Tracker — User Guide

## What this spreadsheet does

This spreadsheet tracks climbers, routes, climb attempts, completion status, points, and profile dashboards.

Main workflow:

1. Add/edit climbers in **Customers**.
2. Add/edit routes in **Routes**.
3. Run **Tracker Tools → Sync IDs & Dashboards**.
4. Log climbs from **Data** or **Customer Profile**.
5. Use checkbox shortcuts to jump to customer/route profiles.
6. Refresh customer-facing tabs (**Rankings View** and **New Routes**).

---

## First-time setup

Prerequisite (one-time per Google account):
- Enable Apps Script API access: `https://script.google.com/home/usersettings`
- If just enabled, wait 1–3 minutes before running setup/push commands.

After pasting/updating the Apps Script:

1. Reload the spreadsheet.
2. Open the custom menu: **🧗‍♂️ Tracker Tools**.
3. Click **Setup / Repair Spreadsheet**.
4. Approve the Google permissions if prompted.
5. If needed, click **Sync IDs & Dashboards** once.

You only need to install/repair the edit trigger when:

- the script was newly added,
- the spreadsheet was copied,
- checkbox navigation stops working,
- the trigger was deleted or corrupted.

---

## Sheet overview

### Data

Main dashboard.

Important areas:

- **B1 / C1** — optional start date/time filter. Editing these refreshes the dashboard.
- Pane is frozen at row 3 / column C for stable navigation.
- **B2** — select a customer for quick climb logging.
- **B3** — select a route for quick climb logging.
- **C3** — select climb status.
- **Column A checkboxes** — open a customer profile.
- **Row 1 route checkboxes** — open a route profile.
- **Rows 4+ / Columns D+** — customer-vs-route grid showing each customer’s best logged status per route.

### Settings

Defines climb status symbols and scoring.

Default symbols:

- **◎** — Flash — 10 points — complete
- **◯** — Red-Point — 7 points — complete
- **△** — Foot-Follow — 5 points — not complete
- **✓** — Attempt — 1 point — not complete

The **Complete?** column controls which statuses count toward completion rate and V-scale level.

### Routes

Route database.

Columns:

- **ID** — generated route ID, e.g. `R-500102`
- **Name** — route display name
- **V Scale Difficulty** — numeric difficulty, e.g. `4` for V4
- **Link** — optional route image/video/reference URL

Route names do **not** need to be unique. Route ID is the real unique identifier.

### Customers

Customer/climber database.

Columns:

- **ID** — generated customer ID, e.g. `C-04E020`
- **Name** — customer name
- **Completion Rate** — calculated
- **Points** — calculated
- **V Scale Level** — calculated from completed routes
- **Birthday** — optional
- **Age** — calculated
- **Height** — optional
- **Experience** — optional
- **Gender** — optional

### Customer Profile

Shows one customer’s details and recent/important route data.

- **A1** contains the active customer ID.
- Quick log inputs (right side):
  - **J2** route dropdown
  - **J3** status dropdown
  - tick **K3** checkbox to submit climb event
- Training inputs:
  - **J8** metric
  - **J9** value
  - **J10** unit (auto-filled from Settings metric config)
  - **J11** notes
  - tick **K11** checkbox to submit training event

### Route Profile

Shows one route’s details and related climber data.

- **A1** contains the active route ID.

### Rankings View

Customer-facing ranking tab.

- Includes both **Japanese Level** and **V Scale Level**.
- Sort field is selectable in the sheet (`Sort By`).
- Built from `Customers` data.

### New Routes

Customer-facing tab for recently added routes.

- Uses route created timestamp (Routes column E).
- Default window in script: last 14 days.
- Shows newest routes first.

### EventLog

Operational event log (e.g. climb/training logging events) for audit/recovery context.

### Logbook

Raw history of every logged climb.

Usually you should not edit this manually unless correcting mistakes.

Columns include:

- timestamp
- customer ID
- route ID
- status
- grade
- customer snapshot fields such as height, age, experience, gender

---

## Normal usage

### Add a new customer

1. Go to **Customers**.
2. Add the customer name in the next empty row under **Name**.
3. Optionally add birthday, height, experience, and gender.
4. Run **Tracker Tools → Sync IDs & Dashboards**.
5. The spreadsheet generates a customer ID automatically.

Do not manually type IDs unless you know what you are doing.

### Add a new route

1. Go to **Routes**.
2. Add the route name in the next empty row under **Name**.
3. Add the V-scale difficulty.
4. Optionally add a link.
5. Run **Tracker Tools → Sync IDs & Dashboards**.
6. The spreadsheet generates a route ID automatically.

Route dropdowns should show routes as:

```text
Route Name (R-ABC123)
```

This avoids problems when two routes have the same name.

### Log a climb from the Data sheet

1. Go to **Data**.
2. Select the customer in **B2**.
3. Select the route in **B3**.
4. Select the status in **C3**.
5. Run the assigned log function/button for logging from Data, if your sheet has one.
6. The climb is appended to **Logbook** and the dashboard refreshes.

### Log a climb from Customer Profile

1. Open a customer profile by ticking that customer’s checkbox in **Data → Column A**.
2. On **Customer Profile**, select route and status.
3. Run the assigned log function/button for logging from profile, if your sheet has one.
4. The climb is appended to **Logbook** and the dashboard refreshes.

### Open a customer profile

1. Go to **Data**.
2. Tick the checkbox in **Column A** next to the customer.
3. The spreadsheet should jump to **Customer Profile**.

If this does not work, run:

**Tracker Tools → Install / Repair Edit Trigger**

### Open a route profile

1. Go to **Data**.
2. Tick the checkbox in **Row 1** above the route.
3. The spreadsheet should jump to **Route Profile**.

If this does not work, run:

**Tracker Tools → Install / Repair Edit Trigger**

### Refresh customer-facing tabs

Run:

**Tracker Tools → Refresh Rankings & New Routes Views**

If this menu item is missing, include `bouldering_tracker_views.gs` in your Apps Script project and add the menu item in `onOpen()`.

### Manual event entry and migration

- **Prepare Event Entry Tab**: creates guided input blocks (Customer / Route / Climb / Training) and advanced row mode.
- **Apply Event Entry Rows**: appends checked advanced rows into `EventLog` and rebuilds tables.
- **Migrate Existing Tables to EventLog**: imports current `Customers/Routes/Logbook/TrainingLog` into `EventLog` for legacy spreadsheet onboarding.
- **Run Post-Update Routine**: one-click recommended routine after script updates.
- **Reset Data (Safe)**: clears materialized/generated tabs and optionally EventLog.

---

## What Sync IDs & Dashboards does

The sync function:

1. Generates missing customer IDs and route IDs.
2. Refreshes formulas in **Customers**.
3. Rebuilds the **Data** dashboard grid.
4. Applies the date/time filter from **Data!B1:C1**.
5. Reads the **Logbook** and shows each customer’s best status per route.
6. Refreshes dropdowns for customer, route, and status selection.

Run it after adding or editing customers, routes, settings, or if the dashboard looks stale.

Then run **Refresh Rankings & New Routes Views** when you want customer-facing tabs updated.

---

## What Install / Repair Edit Trigger does

This menu item installs an **installable edit trigger** for the script function `handleEdit(e)`.

That trigger makes these automatic actions work reliably:

- editing **Data!B1** or **Data!C1** refreshes the dashboard,
- ticking a customer checkbox opens **Customer Profile**,
- ticking a route checkbox opens **Route Profile**.

It also removes old duplicate `handleEdit` triggers before creating a fresh one.

Important: it does **not** log climbs by itself. It only connects spreadsheet edits to the navigation/filter-refresh script.

---

## Troubleshooting

### Checkbox navigation does nothing

Run:

**Tracker Tools → Install / Repair Edit Trigger**

Then authorize the script if Google asks.

### New customer or route does not appear

Run:

**Tracker Tools → Sync IDs & Dashboards**

### Route dropdown has duplicate-looking names

This is okay if route names are duplicated. Use the entry with the correct route ID:

```text
Route Name (R-ABC123)
```

### Dashboard numbers look stale

Run:

**Tracker Tools → Sync IDs & Dashboards**

### Logbook looks wrong

Check that each row has:

- valid timestamp,
- customer ID,
- route ID,
- status symbol.

Avoid manually editing the Logbook unless correcting a known mistake.
