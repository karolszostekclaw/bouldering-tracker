/**
 * Public/Customer-facing views.
 *
 * Add this menu item in onOpen() if desired:
 * .addItem('Refresh Rankings & New Routes Views', 'refreshPublicViews')
 */
function refreshPublicViews() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getDocumentLock();

  if (!lock.tryLock(30000)) {
    ss.toast('Public view refresh already running. Try again shortly.', 'Busy');
    return;
  }

  try {
    refreshRankingsView_();
    refreshNewRoutesView_(14); // default: show routes added in last 14 days
    ss.toast('Rankings and New Routes views refreshed.', 'Success');
  } finally {
    lock.releaseLock();
  }
}

function refreshRankingsView_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const customers = ss.getSheetByName('Customers');
  if (!customers) return;

  const target = ensureSheet_('Rankings View');
  const lastRow = customers.getLastRow();

  target.clear();
  target.getRange('A1:F1').setValues([[
    'Rank',
    'Customer ID',
    'Name',
    'Points',
    'Completion Rate',
    'V Scale Level'
  ]]);
  target.setFrozenRows(1);

  if (lastRow < 2) return;

  const rows = customers.getRange(2, 1, lastRow - 1, 12).getValues()
    .filter(r => r[0] && r[1])
    .map(r => ({
      id: r[0],
      name: r[1],
      completion: Number(r[2]) || 0,
      points: Number(r[3]) || 0,
      vlevel: r[11] || r[4] || ''
    }))
    .sort((a, b) => (b.points - a.points) || (b.completion - a.completion) || String(a.name).localeCompare(String(b.name)));

  if (!rows.length) return;

  const out = rows.map((r, idx) => [
    idx + 1,
    r.id,
    r.name,
    r.points,
    r.completion,
    r.vlevel
  ]);

  target.getRange(2, 1, out.length, out[0].length).setValues(out);
  target.getRange(2, 5, out.length, 1).setNumberFormat('0.00%');
  target.autoResizeColumns(1, 6);
}

function refreshNewRoutesView_(daysWindow) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const routes = ss.getSheetByName('Routes');
  if (!routes) return;

  const target = ensureSheet_('New Routes');
  const lastRow = routes.getLastRow();

  target.clear();
  target.getRange('A1:F1').setValues([[
    'Added At',
    'Route ID',
    'Route Name',
    'Difficulty Number',
    'Japanese Grade',
    'V Scale Grade'
  ]]);
  target.setFrozenRows(1);

  if (lastRow < 2) return;

  const now = new Date();
  const cutoff = new Date(now.getTime() - (Number(daysWindow) || 14) * 24 * 60 * 60 * 1000);

  // A:G => ID, Name, Difficulty, Link, AddedAt, JP, VScale
  const rows = routes.getRange(2, 1, lastRow - 1, 7).getValues()
    .map(r => ({
      id: r[0],
      name: r[1],
      difficulty: r[2],
      addedAt: r[4],
      jp: r[5] || '',
      v: r[6] || ''
    }))
    .filter(r => r.id && r.name && r.addedAt instanceof Date && !isNaN(r.addedAt.getTime()) && r.addedAt >= cutoff)
    .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());

  if (!rows.length) {
    target.getRange('A2').setValue('No new routes in selected window.');
    return;
  }

  const out = rows.map(r => [r.addedAt, r.id, r.name, r.difficulty, r.jp, r.v]);
  target.getRange(2, 1, out.length, out[0].length).setValues(out);
  target.getRange(2, 1, out.length, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  target.autoResizeColumns(1, 6);
}

function ensureSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}
