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
  const ja = (typeof getUiLanguage_ === 'function' && getUiLanguage_() === 'JA');
  const customers = ss.getSheetByName('Customers');
  if (!customers) return;

  const target = ensureSheet_('Rankings View');
  const lastRow = customers.getLastRow();

  target.clear();
  const prevSort = target.getRange('J1').getValue();
  target.getRange('I1').setValue(ja ? '並び替え' : 'Sort By');
  target.getRange('J1').setValue(prevSort || 'Points');
  target.getRange('A1:H2').clearContent();

  const sortValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Points', 'Completion Rate', 'Japanese Level', 'Name', 'V Scale Level'])
    .build();
  target.getRange('J1').setDataValidation(sortValidation);

  target.getRange('A3:G3').setValues([[
    ja ? '順位' : 'Rank',
    ja ? '顧客ID' : 'Customer ID',
    ja ? '名前' : 'Name',
    'Points',
    ja ? '完登率' : 'Completion Rate',
    ja ? '和グレード' : 'Japanese Level',
    'V Scale Level'
  ]]);
  target.setFrozenRows(3);

  if (lastRow < 2) return;

  const sortBy = String(target.getRange('J1').getValue() || 'Points');

  const rows = customers.getRange(2, 1, lastRow - 1, 12).getValues()
    .filter(r => r[0] && r[1])
    .map(r => ({
      id: r[0],
      name: r[1],
      completion: Number(r[2]) || 0,
      points: Number(r[3]) || 0,
      jlevel: r[10] || (String(r[11] || r[4] || '') === 'No Sends' ? 'No Sends' : ''),
      vlevel: r[11] || r[4] || ''
    }));

  const sorter = {
    'Points': (a, b) => (b.points - a.points),
    'Completion Rate': (a, b) => (b.completion - a.completion),
    'Japanese Level': (a, b) => (levelSortKey_(b.jlevel, b.vlevel) - levelSortKey_(a.jlevel, a.vlevel)),
    'V Scale Level': (a, b) => (vLevelSortKey_(b.vlevel) - vLevelSortKey_(a.vlevel)),
    'Name': (a, b) => String(a.name).localeCompare(String(b.name))
  };

  rows.sort((a, b) => {
    const primary = (sorter[sortBy] || sorter['Points'])(a, b);
    if (primary !== 0) return primary;
    return (b.points - a.points) || (b.completion - a.completion) || String(a.name).localeCompare(String(b.name));
  });

  if (!rows.length) return;

  const out = rows.map((r, idx) => [
    idx + 1,
    r.id,
    r.name,
    r.points,
    r.completion,
    r.jlevel,
    r.vlevel
  ]);

  target.getRange(4, 1, out.length, out[0].length).setValues(out);
  target.getRange(4, 5, out.length, 1).setNumberFormat('0.00%');
  target.setColumnWidth(1, 70);
  target.setColumnWidth(2, 110);
  target.setColumnWidth(3, 140);
  target.setColumnWidth(4, 90);
  target.setColumnWidth(5, 110);
  target.setColumnWidth(6, 120);
  target.setColumnWidth(7, 130);
  target.setColumnWidth(9, 100);
  target.setColumnWidth(10, 140);
}

function vLevelSortKey_(value) {
  const text = String(value || '');
  if (!text || text === 'No Sends') return -1;

  const nums = Array.from(text.matchAll(/V(\d+)/gi)).map(m => Number(m[1]));
  if (!nums.length) return -1;

  // Handle ranges like V0-V1 / V3-V4 by averaging
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;

  // Tiny bonus for '+' and tiny penalty for '-' when present
  const bias = text.includes('+') ? 0.1 : (text.includes('-') && nums.length === 1 ? -0.1 : 0);
  return avg + bias;
}

function levelSortKey_(jLevel, vLevel) {
  const text = String(jLevel || '');
  if (!text || text === 'No Sends') return vLevelSortKey_(vLevel);

  const kyuu = text.match(/(\d+)級/);
  if (kyuu) return 10 - Number(kyuu[1]);

  if (text.includes('初段')) return 10;
  const dan = text.match(/(\d+)段/);
  if (dan) return 10 + Number(dan[1]);

  return vLevelSortKey_(vLevel);
}

function refreshNewRoutesView_(daysWindow) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ja = (typeof getUiLanguage_ === 'function' && getUiLanguage_() === 'JA');
  const routes = ss.getSheetByName('Routes');
  if (!routes) return;

  const target = ensureSheet_('New Routes');
  const lastRow = routes.getLastRow();

  target.clear();
  target.getRange('A1:F1').setValues([[
    ja ? '追加日時' : 'Added At',
    ja ? '課題ID' : 'Route ID',
    ja ? '課題名' : 'Route Name',
    ja ? '難易度値' : 'Difficulty Number',
    ja ? '和グレード' : 'Japanese Grade',
    ja ? 'Vグレード' : 'V Scale Grade'
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
