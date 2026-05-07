const TRAINING_METRICS = ['VR', 'CP', 'LH', 'RH', 'HS'];
const REQUIRED_SHEETS = ['Data', 'Customers', 'Routes', 'Settings', 'Logbook', 'Customer Profile', 'Route Profile'];
const EVENT_LOG_SCHEMA_VERSION = 1;
const TRACKER_PATCH_VERSION = '2026-05-07.6';
const SUPPORT_URL_EN = 'https://github.com/karolszostekclaw/bouldering-tracker/blob/main/SUPPORT.md';
const SUPPORT_URL_JA = 'https://github.com/karolszostekclaw/bouldering-tracker/blob/main/SUPPORT_ja.md';
const GUIDE_URL_EN = 'https://github.com/karolszostekclaw/bouldering-tracker/blob/main/bouldering_tracker_user_guide.md';
const GUIDE_URL_JA = 'https://github.com/karolszostekclaw/bouldering-tracker/blob/main/bouldering_tracker_user_guide_ja.md';
const README_URL_EN = 'https://github.com/karolszostekclaw/bouldering-tracker/blob/main/README.md';
const README_URL_JA = 'https://github.com/karolszostekclaw/bouldering-tracker/blob/main/README_ja.md';
const EVENT_ENTRY_TYPES = ['CUSTOMER_CREATED', 'CUSTOMER_UPDATED', 'ROUTE_CREATED', 'CLIMB_LOGGED', 'TRAINING_LOGGED'];
const GRADE_CONVERSION_SHEET = 'GradeConversion';
const SHEET_KEY_PREFIX = '[BT:';
const SHEET_KEY_SUFFIX = ']';
const LOCALIZABLE_SHEETS = {
  'Data': { EN: 'Data', JA: 'データ' },
  'Customers': { EN: 'Customers', JA: '顧客' },
  'Routes': { EN: 'Routes', JA: '課題' },
  'Settings': { EN: 'Settings', JA: '設定' },
  'Logbook': { EN: 'Logbook', JA: '登攀ログ' },
  'TrainingLog': { EN: 'TrainingLog', JA: 'トレーニングログ' },
  'EventLog': { EN: 'EventLog', JA: 'イベントログ' },
  'GradeConversion': { EN: 'GradeConversion', JA: 'グレード変換' },
  'Customer Profile': { EN: 'Customer Profile', JA: '顧客プロフィール' },
  'Route Profile': { EN: 'Route Profile', JA: '課題プロフィール' },
  'Rankings View': { EN: 'Rankings View', JA: 'ランキング表示' },
  'New Routes': { EN: 'New Routes', JA: '新着課題' },
  'Event Entry': { EN: 'Event Entry', JA: 'イベント入力' }
};

const I18N = {
  EN: {
    MENU: '🧗‍♂️ Tracker Tools / ツール',
    SETUP: 'Setup / Repair Spreadsheet',
    POST_UPDATE: 'Run Post-Update Routine',
    SYNC: 'Sync IDs & Dashboards',
    TRIGGER: 'Install / Repair Edit Trigger',
    REFRESH_PUBLIC: 'Refresh Rankings & New Routes Views',
    REBUILD: 'Rebuild Tables from EventLog',
    EVENT_ENTRY: 'Prepare Event Entry Tab',
    APPLY_EVENT_ROWS: 'Apply Event Entry Rows',
    MIGRATE: 'Migrate Existing Tables to EventLog',
    IMPORT_DEMO: 'Import Demo/Test Data',
    RESET: 'Reset Data (Safe)',
    APPLY_LANG: 'Apply UI Language',
    LOG_CLIMB_DATA: 'Log Climb from Data Sheet',
    LOG_CLIMB_PROFILE: 'Log Climb from Customer Profile',
    LOG_TRAINING: 'Log Training from Customer Profile'
  },
  JA: {
    MENU: '🧗‍♂️ Tracker Tools / ツール',
    SETUP: '初期設定 / 修復',
    POST_UPDATE: '更新後ルーチン実行',
    SYNC: 'ID・ダッシュボード同期',
    TRIGGER: '編集トリガー再設定',
    REFRESH_PUBLIC: 'ランキング・新規課題更新',
    REBUILD: 'EventLog から再構築',
    EVENT_ENTRY: 'イベント入力タブ作成',
    APPLY_EVENT_ROWS: 'イベント行を適用',
    MIGRATE: '既存テーブルを EventLog へ移行',
    IMPORT_DEMO: 'デモ/テストデータ投入',
    RESET: 'データ初期化（安全）',
    APPLY_LANG: 'UI言語を反映',
    LOG_CLIMB_DATA: 'Data から登攀記録',
    LOG_CLIMB_PROFILE: 'Profile から登攀記録',
    LOG_TRAINING: 'Profile からトレーニング記録'
  }
};

function onOpen() {
  SpreadsheetApp.getUi().createMenu(t_('MENU'))
    .addItem(t_('SETUP'), 'setupSpreadsheet')
    .addItem(t_('POST_UPDATE'), 'runPostUpdateRoutine')
    .addItem(t_('SYNC'), 'syncTracker')
    .addItem(t_('TRIGGER'), 'installTriggers')
    .addItem(t_('REFRESH_PUBLIC'), 'refreshPublicViews')
    .addItem(t_('REBUILD'), 'rebuildTablesFromEventLog')
    .addItem(t_('EVENT_ENTRY'), 'prepareEventEntryTab')
    .addItem(t_('APPLY_EVENT_ROWS'), 'applyEventEntryRows')
    .addItem(t_('MIGRATE'), 'migrateExistingTablesToEventLog')
    .addItem(t_('IMPORT_DEMO'), 'importDemoTestData')
    .addItem(t_('RESET'), 'resetDataSafe')
    .addItem(t_('APPLY_LANG'), 'applyUiLanguage')
    .addSeparator()
    .addItem(t_('LOG_CLIMB_DATA'), 'logFromDataSheet')
    .addItem(t_('LOG_CLIMB_PROFILE'), 'logClimbFromProfile')
    .addItem(t_('LOG_TRAINING'), 'logTrainingFromCustomerProfile')
    .addToUi();
}

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  ensureSheetWithHeaders_(ss, 'Data', ['Open Profile', 'Customer', 'Route']);
  ensureSheetWithHeaders_(ss, 'Customers', ['ID', 'Name', 'Completion Rate', 'Points', 'V Scale Level', 'Birthday', 'Age', 'Height', 'Experience', 'Gender', 'Japanese Level', 'V Scale Level', 'Full Name', 'School Grade', 'Guardian Name', 'Contact', 'Registration Date', 'Visit Count', 'Last Visit Date', 'Primary Category', 'Detailed Tier']);
  ensureSheetWithHeaders_(ss, 'Routes', ['ID', 'Name', 'V Scale Difficulty', 'Link', 'Created At', 'Japanese Grade', 'V Scale Grade']);
  ensureSheetWithHeaders_(ss, 'Settings', ['Status', 'Label', 'Score', 'Complete?']);
  ensureSheetWithHeaders_(ss, 'Logbook', ['Timestamp', 'Customer ID', 'Route ID', 'Status', 'Grade', 'Height', 'Age', 'Experience', 'Gender']);
  ensureSheetWithHeaders_(ss, 'TrainingLog', ['Timestamp', 'Customer ID', 'Customer Name', 'Metric', 'Value', 'Unit', 'Notes']);
  ensureSheetWithHeaders_(ss, 'EventLog', ['Timestamp', 'Event Type', 'Entity Type', 'Entity ID', 'Payload JSON', 'Actor', 'Schema Version']);
  ensureSheetWithHeaders_(ss, 'Event Entry', ['Apply?', 'Event Type', 'Entity Type', 'Entity ID', 'Payload JSON', 'Actor (optional)']);
  ensureSheetWithHeaders_(ss, 'Customer Profile', ['Customer ID']);
  ensureSheetWithHeaders_(ss, 'Route Profile', ['Route ID']);

  cleanupDefaultSheet_(ss);
  seedDefaultSettings_();
  ensureUiLanguageSetting_(sheetByKey_(ss, 'Settings'));
  ensureTrainingMetricConfig_(sheetByKey_(ss, 'Settings'));
  ensureGradeConversionSheet_(ss);
  ensureLocalizedSheetNames_();
  prepareEventEntryTab();
  installTriggers();
  syncTracker();
  refreshPublicViews();
  refreshProfileTabs_();
  ss.toast('Spreadsheet setup complete.', 'Tracker Tools');
}

function applyUiLanguage() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureUiLanguageSetting_(sheetByKey_(ss, 'Settings'));
  const lang = getUiLanguage_();
  const settings = sheetByKey_(ss, 'Settings');
  if (settings) {
    settings.getRange('J1').setValue('UI Language');
    settings.getRange('J2').setValue(lang);
  }
  ensureLocalizedSheetNames_();
  prepareEventEntryTab();
  refreshProfileTabs_();
  refreshPublicViews();
  applySheetHeadersLanguage_();
  onOpen();
  SpreadsheetApp.getActive().toast(`UI language applied: ${lang}`, 'Tracker Tools');
}

function runPostUpdateRoutine() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureRequiredSheets_(ss);
  ensureUiLanguageSetting_(sheetByKey_(ss, 'Settings'));
  forceResetLanguageDropdown_();
  ensureTrainingMetricConfig_(sheetByKey_(ss, 'Settings'));
  ensureGradeConversionSheet_(ss);
  applySheetHeadersLanguage_();
  installTriggers();
  syncTracker();
  refreshPublicViews();
  refreshProfileTabs_();
  SpreadsheetApp.getActive().toast(`Post-update routine completed. Patch ${TRACKER_PATCH_VERSION}`, 'Tracker Tools');
}

function installTriggers() {
  const ss = SpreadsheetApp.getActive();

  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'handleEdit')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('handleEdit')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  ss.toast('Edit trigger installed.', 'Tracker Tools');
}

/**
 * Main function: syncs databases, refreshes formulas, and rebuilds the Data grid.
 */
function syncTracker() {
  const lock = LockService.getDocumentLock();

  if (!lock.tryLock(30000)) {
    SpreadsheetApp.getActive().toast('Sync already running. Try again shortly.', 'Busy');
    return;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureRequiredSheets_(ss);
    applySheetHeadersLanguage_();
    const sheet = sheetByKey_(ss, 'Data');
    const custSheet = sheetByKey_(ss, 'Customers');
    const routeSheet = sheetByKey_(ss, 'Routes');
    const settingsSheet = sheetByKey_(ss, 'Settings');
    const logSheet = sheetByKey_(ss, 'Logbook');

    if (!sheet || !custSheet || !routeSheet || !settingsSheet || !logSheet) return;

    const settingsLastRow = Math.max(settingsSheet.getLastRow(), 2);
    const dataRef = sn_(ss, 'Data');
    const settingsRef = sn_(ss, 'Settings');
    const routesRef = sn_(ss, 'Routes');

    // --- 1. GENERATE MISSING IDs IN DATABASES ---
    generateMissingIds_(custSheet, 'C-');
    generateMissingIds_(routeSheet, 'R-');
    ensureGradeConversionSheet_(ss);
    refreshRouteGradeFormulas_(routeSheet);

    // --- 2. GLOBAL FORMULA REFRESH (Customers Sheet) ---
    const custLastRow = custSheet.getLastRow();
    if (custLastRow >= 2) {
      const formulasC = [];
      const formulasD = [];
      const formulasE = [];
      const formulasG = [];

      for (let row = 2; row <= custLastRow; row++) {
        formulasC.push([`=IF(A${row}="", "", IFERROR(LET(comp, FILTER(${settingsRef}!$A$2:$A$${settingsLastRow}, ${settingsRef}!$D$2:$D$${settingsLastRow}=1), scores, FILTER(${dataRef}!$E$5:$ZZ, ${dataRef}!$B$5:$B=A${row}), tops, SUM(MAP(scores, LAMBDA(s, --ISNUMBER(MATCH(s, comp, 0))))), tops / COUNTA(${dataRef}!$E$2:$2)), 0))`]);
        formulasD.push([`=IF(A${row}="", "", SUM(ARRAYFORMULA(IFERROR(XLOOKUP(FILTER(${dataRef}!$E$5:$ZZ, ${dataRef}!$B$5:$B=A${row}), ${settingsRef}!$A$2:$A$${settingsLastRow}, ${settingsRef}!$C$2:$C$${settingsLastRow}), 0))))`]);
        formulasE.push([`=IF(A${row}="", "", IFERROR(LET(comp, FILTER(${settingsRef}!$A$2:$A$${settingsLastRow}, ${settingsRef}!$D$2:$D$${settingsLastRow}=1), scores, FILTER(${dataRef}!$E$5:$ZZ, ${dataRef}!$B$5:$B=A${row}), valid, MAP(scores, LAMBDA(s, ISNUMBER(MATCH(s, comp, 0)))), sent_ids, FILTER(${dataRef}!$E$2:$ZZ$2, valid), grades, MAP(TRANSPOSE(sent_ids), LAMBDA(id, XLOOKUP(id, ${routesRef}!$A$2:$A, ${routesRef}!$C$2:$C, 0))), AVERAGE(ARRAY_CONSTRAIN(SORT(grades, 1, FALSE), 5, 1))), "No Sends"))`]);
        formulasG.push([`=IF(F${row}="", "", IFERROR(DATEDIF(F${row}, TODAY(), "Y"), "Invalid Date"))`]);
      }

      const numRows = custLastRow - 1;
      custSheet.getRange(2, 3, numRows, 1).setFormulas(formulasC);
      custSheet.getRange(2, 4, numRows, 1).setFormulas(formulasD);
      custSheet.getRange(2, 5, numRows, 1).setFormulas(formulasE);
      custSheet.getRange(2, 7, numRows, 1).setFormulas(formulasG);
    }
    refreshCustomerGradeDisplayFormulas_(custSheet);

    // --- 3. REFRESH DATA TAB HEADERS ---
    const finalCusts = getNonEmptyRows_(custSheet, 2, 1, 2);
    const finalRoutes = getNonEmptyRows_(routeSheet, 2, 1, 2);

    const maxR = sheet.getMaxRows();
    const maxC = sheet.getMaxColumns();

    if (maxR >= 4) {
      sheet.getRange(4, 1, 1, 4).clearContent();
      sheet.getRange(4, 1, 1, 1).removeCheckboxes();
    }

    if (maxR >= 5) {
      sheet.getRange(5, 1, maxR - 4, 4).clearContent();
      sheet.getRange(5, 1, maxR - 4, 1).removeCheckboxes();
    }

    if (maxC >= 4) {
      sheet.getRange(1, 4, 3, maxC - 3).clearContent();
      sheet.getRange(1, 4, 1, maxC - 3).removeCheckboxes();
      sheet.getRange(1, 4, 3, maxC - 3).clearDataValidations();
      if (maxR >= 5) sheet.getRange(5, 5, maxR - 4, maxC - 4).clearContent().clearDataValidations();
    }

    if (finalCusts.length > 0) {
      sheet.getRange(5, 2, finalCusts.length, 2).setValues(finalCusts);
    }

    if (finalRoutes.length > 0) {
      sheet.getRange(2, 5, 1, finalRoutes.length).setValues([finalRoutes.map(r => r[0])]);
      sheet.getRange(3, 5, 1, finalRoutes.length).setValues([finalRoutes.map(r => r[1])]);
    }

    const ja = getUiLanguage_() === 'JA';
    sheet.getRange('D4').setValue(ja ? '完登率' : 'Comp %');
    ensureDataQuickAction_(sheet, ja);
    sheet.setFrozenRows(4);
    sheet.setFrozenColumns(4);

    // --- 4. PROCESS LOGBOOK DATA (Filtering) ---
    const rawDate = sheet.getRange('B1').getValue();
    const rawTime = sheet.getRange('C1').getValue();
    let filterTimestamp = null;

    if (rawDate instanceof Date) {
      filterTimestamp = new Date(rawDate.getTime());
      if (rawTime instanceof Date) {
        filterTimestamp.setHours(rawTime.getHours(), rawTime.getMinutes(), 0, 0);
      } else {
        filterTimestamp.setHours(0, 0, 0, 0);
      }
    }

    const scoresMap = {};
    settingsSheet.getRange('A2:C' + settingsLastRow).getValues().forEach(row => {
      if (row[0]) scoresMap[row[0]] = Number(row[2]) || 0;
    });

    const logs = getLogRows_(logSheet);
    const bestScores = {};

    logs.forEach(log => {
      if (!log[0] || !log[1] || !log[2] || !log[3]) return;

      const logTime = new Date(log[0]);
      if (isNaN(logTime.getTime())) return;
      if (filterTimestamp && logTime < filterTimestamp) return;

      const key = log[1] + '_' + log[2];
      const currentScore = scoresMap[log[3]] || 0;
      const bestExistingScore = scoresMap[bestScores[key]] || -1;

      if (currentScore > bestExistingScore) bestScores[key] = log[3];
    });

    // --- 5. FILL GRID & FINAL UI ---
    if (finalCusts.length > 0 && finalRoutes.length > 0) {
      const gridValues = finalCusts.map(c => finalRoutes.map(r => bestScores[c[0] + '_' + r[0]] || ''));
      sheet.getRange(5, 5, finalCusts.length, finalRoutes.length).setValues(gridValues);
      sheet.getRange(5, 1, finalCusts.length, 1).insertCheckboxes();
      sheet.getRange(1, 5, 1, finalRoutes.length).insertCheckboxes();

      const completeSet = new Set(settingsSheet.getRange(2,1,Math.max(0,settingsSheet.getLastRow()-1),4).getValues().filter(r=>Number(r[3])===1).map(r=>r[0]));
      const routeComp = finalRoutes.map(r => {
        const routeId = r[0];
        const routeLogs = logs.filter(l => l[2] === routeId);
        const attempts = routeLogs.length;
        const completes = routeLogs.filter(l => completeSet.has(l[3])).length;
        return [attempts ? completes/attempts : 0];
      });
      sheet.getRange(4,5,1,finalRoutes.length).setValues([routeComp.map(x=>x[0])]).setNumberFormat('0%');

      const customerComp = gridValues.map(row => {
        const completes = row.filter(v => completeSet.has(v)).length;
        return [row.length ? completes / row.length : 0];
      });
      sheet.getRange(5,4,finalCusts.length,1).setValues(customerComp).setNumberFormat('0%');
    }

    updateLogDropdowns();
    refreshProfileTabs_();
    ss.toast('Database Synced & Formulae Refreshed!', 'Success');
  } finally {
    lock.releaseLock();
  }
}

/**
 * Automates tab switching and filter refreshing.
 * Installed via installTriggers().
 */
function handleEdit(e) {
  if (!e || !e.range || e.value === undefined) return;

  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();
  const sheetKey = extractSheetKey_(sheetName) || sheetName;

  if (sheetKey === 'Settings' && e.range.getA1Notation() === 'J2') {
    normalizeUiLanguageCell_();
    return;
  }

  if (sheetKey === 'Customer Profile') {
    const a1cp = e.range.getA1Notation();

    if (a1cp === 'A1') {
      refreshProfileTabs_();
      return;
    }

    if (a1cp === 'J8') {
      autofillTrainingUnitFromMetric_();
      return;
    }

    if (e.value === 'TRUE' && a1cp === 'K3') {
      e.range.setValue(false);
      logClimbFromProfile();
      return;
    }

    if (e.value === 'TRUE' && a1cp === 'K11') {
      e.range.setValue(false);
      logTrainingFromCustomerProfile();
      return;
    }
    return;
  }

  if (sheetKey === 'Route Profile') {
    if (e.range.getA1Notation() === 'A1') refreshProfileTabs_();
    return;
  }

  if (sheetKey === 'Rankings View') {
    if (e.range.getA1Notation() === 'B1') refreshRankingsView_();
    return;
  }

  if (sheetKey === 'Event Entry') {
    if (e.value === 'TRUE') applyEventEntryUiActions_(e.range.getA1Notation());
    return;
  }

  if (sheetKey !== 'Data') return;

  const row = e.range.getRow();
  const col = e.range.getColumn();
  const a1 = e.range.getA1Notation();
  const ss = e.source;

  if (e.value === 'TRUE' && a1 === 'D3') {
    e.range.setValue(false);
    logFromDataSheet();
    return;
  }

  if (a1 === 'B1' || a1 === 'C1') {
    syncTracker();
    return;
  }

  if (e.value !== 'TRUE') return;

  // Customer checkbox: column A, rows 4+
  if (col === 1 && row >= 4) {
    const customerId = sheet.getRange(row, 2).getValue();
    e.range.setValue(false);
    if (!customerId) return;

    const profileSheet = sheetByKey_(ss, 'Customer Profile');
    if (!profileSheet) {
      ss.toast('Sheet "Customer Profile" not found.', 'Navigation Error');
      return;
    }

    profileSheet.getRange('A1').setValue(customerId);
    refreshProfileTabs_();
    SpreadsheetApp.flush();
    profileSheet.activate();
    profileSheet.getRange('A1').activate();
    return;
  }

  // Route checkbox: row 1, columns D+
  if (row === 1 && col >= 4) {
    const routeId = sheet.getRange(2, col).getValue();
    e.range.setValue(false);
    if (!routeId) return;

    const routeProfileSheet = sheetByKey_(ss, 'Route Profile');
    if (!routeProfileSheet) {
      ss.toast('Sheet "Route Profile" not found.', 'Navigation Error');
      return;
    }

    routeProfileSheet.getRange('A1').setValue(routeId);
    refreshProfileTabs_();
    SpreadsheetApp.flush();
    routeProfileSheet.activate();
    routeProfileSheet.getRange('A1').activate();
    return;
  }
}

/**
 * Log a climb directly from the Data dashboard.
 */
function logFromDataSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = sheetByKey_(ss, 'Data');
  const logSheet = sheetByKey_(ss, 'Logbook');
  const routeSheet = sheetByKey_(ss, 'Routes');
  const custSheet = sheetByKey_(ss, 'Customers');

  if (!sheet || !logSheet || !routeSheet || !custSheet) return;

  const customerEntry = sheet.getRange('B2').getValue();
  const routeEntry = sheet.getRange('B3').getValue();
  const status = sheet.getRange('C3').getValue();

  const custData = custSheet.getRange('A2:J' + custSheet.getLastRow()).getValues();
  const routeData = routeSheet.getRange('A2:C' + routeSheet.getLastRow()).getValues();

  const customerId = resolveCustomerId_(customerEntry, custData);
  const routeResult = resolveRouteId_(routeEntry, routeData);

  if (!customerId || !routeResult.id || !status) {
    SpreadsheetApp.getUi().alert(routeResult.error || 'Please ensure Customer, Route, and Status are selected.');
    return;
  }

  const routeId = routeResult.id;
  const rMatch = routeData.find(r => r[0] === routeId);
  const grade = rMatch ? rMatch[2] : 0;

  const cMatch = custData.find(c => c[0] === customerId);

  const age = cMatch ? cMatch[6] : 'N/A';
  const height = cMatch ? cMatch[7] : 'N/A';
  const exp = cMatch ? cMatch[8] : 'N/A';
  const gen = cMatch ? cMatch[9] : 'N/A';

  const now = new Date();
  logSheet.appendRow([now, customerId, routeId, status, grade, height, age, exp, gen]);
  appendStructuredEvent_('CLIMB_LOGGED', 'climb', customerId + '_' + routeId, {
    timestamp: now.toISOString(),
    customerId,
    routeId,
    status,
    grade,
    height,
    age,
    experience: exp,
    gender: gen
  });
  sheet.getRange('B2:B3').clearContent();

  ss.toast('Climb logged!');
  syncTracker();
}

/**
 * Log a climb from the Customer Profile tab.
 */
function logClimbFromProfile() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const profileSheet = sheetByKey_(ss, 'Customer Profile');
  const logSheet = sheetByKey_(ss, 'Logbook');
  const routeSheet = sheetByKey_(ss, 'Routes');
  const custSheet = sheetByKey_(ss, 'Customers');

  if (!profileSheet || !logSheet || !routeSheet || !custSheet) return;

  const customerId = profileSheet.getRange('A1').getValue();
  const routeEntry = profileSheet.getRange('J2').getValue();
  const status = profileSheet.getRange('J3').getValue();

  const routeData = routeSheet.getRange('A2:C' + routeSheet.getLastRow()).getValues();
  const routeResult = resolveRouteId_(routeEntry, routeData);

  if (!customerId || !routeResult.id || !status) {
    SpreadsheetApp.getUi().alert(routeResult.error || 'Please select a Route and Status.');
    return;
  }

  const routeId = routeResult.id;
  const rMatch = routeData.find(r => r[0] === routeId);
  const grade = rMatch ? rMatch[2] : 0;

  const custData = custSheet.getRange('A2:J' + custSheet.getLastRow()).getValues();
  const cMatch = custData.find(c => c[0] === customerId);

  const age = cMatch ? cMatch[6] : 'N/A';
  const height = cMatch ? cMatch[7] : 'N/A';
  const exp = cMatch ? cMatch[8] : 'N/A';
  const gen = cMatch ? cMatch[9] : 'N/A';

  const now = new Date();
  logSheet.appendRow([now, customerId, routeId, status, grade, height, age, exp, gen]);
  appendStructuredEvent_('CLIMB_LOGGED', 'climb', customerId + '_' + routeId, {
    timestamp: now.toISOString(),
    customerId,
    routeId,
    status,
    grade,
    height,
    age,
    experience: exp,
    gender: gen
  });
  profileSheet.getRange('J2:J3').clearContent();

  syncTracker();
  ss.toast('Logged climb for ' + (cMatch ? cMatch[1] : 'User'), 'Success');
}

/**
 * Log one training result from the Customer Profile tab.
 *
 * Expected Customer Profile inputs:
 * - A1: customer ID
 * - J7: metric, e.g. VR, CP, LH, RH, HS
 * - J8: result value, e.g. 12, 34.5, 8.2
 * - J9: optional unit, e.g. sec, cm, rung, reps
 * - J10: optional notes
 *
 * Timestamp is automatic via new Date().
 */
function logTrainingFromCustomerProfile() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const profileSheet = sheetByKey_(ss, 'Customer Profile');
  const custSheet = sheetByKey_(ss, 'Customers');

  if (!profileSheet || !custSheet) return;

  const customerId = profileSheet.getRange('A1').getValue();
  const metric = profileSheet.getRange('J8').getValue();
  const value = profileSheet.getRange('J9').getValue();
  const unit = profileSheet.getRange('J10').getValue();
  const notes = profileSheet.getRange('J11').getValue();

  if (!customerId || !metric || value === '') {
    SpreadsheetApp.getUi().alert('Please ensure Customer ID, Training Metric, and Value are filled in.');
    return;
  }

  const custData = custSheet.getRange('A2:J' + custSheet.getLastRow()).getValues();
  const cMatch = custData.find(c => c[0] === customerId);
  const customerName = cMatch ? cMatch[1] : '';

  const trainingLogSheet = ensureTrainingLogSheet_(ss);
  const now = new Date();
  trainingLogSheet.appendRow([
    now,
    customerId,
    customerName,
    metric,
    value,
    unit,
    notes
  ]);
  appendStructuredEvent_('TRAINING_LOGGED', 'training', customerId, {
    timestamp: now.toISOString(),
    customerId,
    customerName,
    metric,
    value,
    unit,
    notes
  });

  profileSheet.getRange('J8:J11').clearContent();
  ss.toast('Training log added for ' + (customerName || customerId), 'Success');
}

/**
 * Keeps Data tab and Customer Profile dropdowns in sync with databases.
 */
function updateLogDropdowns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = sheetByKey_(ss, 'Data');
  const profileSheet = sheetByKey_(ss, 'Customer Profile');
  const custSheet = sheetByKey_(ss, 'Customers');
  const routeSheet = sheetByKey_(ss, 'Routes');
  const settingsSheet = sheetByKey_(ss, 'Settings');

  if (!dataSheet || !custSheet || !routeSheet || !settingsSheet) return;

  const custData = getNonEmptyRows_(custSheet, 2, 1, 2);
  const custDropdownList = custData.map(row => row[1] + ' (' + row[0] + ')');

  const routeData = getNonEmptyRows_(routeSheet, 2, 1, 2);
  const routeList = routeData.map(row => row[1] + ' (' + row[0] + ')');

  const statusList = settingsSheet
    .getRange(2, 1, Math.max(1, settingsSheet.getLastRow() - 1), 1)
    .getValues()
    .flat()
    .filter(String);

  dataSheet.getRange('B2').setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(custDropdownList.length ? custDropdownList : ['No customers yet'])
      .build()
  );

  const routeValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(routeList.length ? routeList : ['No routes yet'])
    .build();
  dataSheet.getRange('B3').setDataValidation(routeValidation);
  if (profileSheet) profileSheet.getRange('J2').setDataValidation(routeValidation);

  const statusValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusList.length ? statusList : ['◎', '◯', '△', '✓'])
    .build();
  dataSheet.getRange('C3').setDataValidation(statusValidation);
  if (profileSheet) profileSheet.getRange('J3').setDataValidation(statusValidation);

  if (profileSheet) {
    const metricCfg = getTrainingMetricConfig_(settingsSheet);
    const metricList = metricCfg.list.length ? metricCfg.list : TRAINING_METRICS;
    const trainingMetricValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(metricList)
      .build();

    profileSheet.getRange('J8').setDataValidation(trainingMetricValidation);

    // Quick-action checkboxes replacing drawing buttons
    profileSheet.getRange('K3').insertCheckboxes();
    profileSheet.getRange('K11').insertCheckboxes();

    // Optional direct ID selection in profile A1
    const custIdList = custData.map(row => row[0]).filter(String);
    profileSheet.getRange('A1').setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(custIdList.length ? custIdList : ['No customers yet'])
        .build()
    );
  }

  const routeProfileSheet = sheetByKey_(ss, 'Route Profile');
  if (routeProfileSheet) {
    const routeIdList = routeData.map(row => row[0]).filter(String);
    routeProfileSheet.getRange('A1').setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(routeIdList.length ? routeIdList : ['No routes yet'])
        .build()
    );
  }
}

function ensureTrainingLogSheet_(ss) {
  let sheet = sheetByKey_(ss, 'TrainingLog');

  if (!sheet) {
    sheet = ss.insertSheet('TrainingLog');
  }

  const headers = ['Timestamp', 'Customer ID', 'Customer Name', 'Metric', 'Value', 'Unit', 'Notes'];
  const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeaders = headers.some((header, index) => currentHeaders[index] !== header);

  if (needsHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function generateMissingIds_(sheet, prefix) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const isRoute = sheet.getName() === 'Routes';
  const colCount = isRoute ? 5 : 2;
  const idRange = sheet.getRange(2, 1, lastRow - 1, colCount);
  const values = idRange.getValues();
  const existingIds = new Set(values.map(row => row[0]).filter(String));
  let updated = false;

  values.forEach(row => {
    if (row[1] !== '' && row[0] === '') {
      row[0] = makeUniqueId_(prefix, existingIds);
      existingIds.add(row[0]);
      if (isRoute && !row[4]) row[4] = new Date();

      appendStructuredEvent_(
        prefix === 'C-' ? 'CUSTOMER_CREATED' : 'ROUTE_CREATED',
        prefix === 'C-' ? 'customer' : 'route',
        row[0],
        {
          id: row[0],
          name: row[1],
          difficulty: isRoute ? row[2] : undefined,
          link: isRoute ? row[3] : undefined,
          createdAt: isRoute && row[4] instanceof Date ? row[4].toISOString() : undefined
        }
      );
      updated = true;
    }
  });

  if (updated) idRange.setValues(values);
}

function makeUniqueId_(prefix, existingIds) {
  let id = '';

  do {
    id = prefix + Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase();
  } while (existingIds.has(id));

  return id;
}

function getNonEmptyRows_(sheet, startRow, startCol, numCols) {
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return [];

  return sheet
    .getRange(startRow, startCol, lastRow - startRow + 1, numCols)
    .getValues()
    .filter(row => row[0] !== '');
}

function getLogRows_(logSheet) {
  const logLastRow = logSheet.getLastRow();
  if (logLastRow < 2) return [];

  return logSheet.getRange(2, 1, logLastRow - 1, 4).getValues();
}

function extractIdFromDropdown_(value) {
  if (!value || typeof value !== 'string') return '';

  const match = value.match(/\(([^)]+)\)$/);
  return match ? match[1] : '';
}

function resolveCustomerId_(value, customerRows) {
  if (!value) return '';

  const text = String(value).trim();
  const idFromDropdown = extractIdFromDropdown_(text);

  if (idFromDropdown) return idFromDropdown;
  if (/^C-[A-Z0-9]+$/i.test(text)) return text.toUpperCase();

  const matches = customerRows.filter(row => String(row[1]).trim() === text);
  return matches.length === 1 ? matches[0][0] : '';
}

function resolveRouteId_(value, routeRows) {
  if (!value) return { id: '', error: '' };

  const text = String(value).trim();
  const idFromDropdown = extractIdFromDropdown_(text);

  if (idFromDropdown) return { id: idFromDropdown, error: '' };
  if (/^R-[A-Z0-9]+$/i.test(text)) return { id: text.toUpperCase(), error: '' };

  const matches = routeRows.filter(row => String(row[1]).trim() === text);

  if (matches.length === 1) return { id: matches[0][0], error: '' };

  if (matches.length > 1) {
    return {
      id: '',
      error: 'More than one route has this name. Please select the route from the dropdown in the format "Route Name (Route ID)".'
    };
  }

  return { id: '', error: 'Route not found. Please select a route from the dropdown.' };
}

function makeSheetDisplayName_(key, lang) {
  const base = (LOCALIZABLE_SHEETS[key] && LOCALIZABLE_SHEETS[key][lang]) || key;
  return `${base} ${SHEET_KEY_PREFIX}${key}${SHEET_KEY_SUFFIX}`;
}

function extractSheetKey_(name) {
  const text = String(name || '');
  const start = text.lastIndexOf(SHEET_KEY_PREFIX);
  const end = text.lastIndexOf(SHEET_KEY_SUFFIX);
  if (start < 0 || end < start) return '';
  return text.slice(start + SHEET_KEY_PREFIX.length, end).trim();
}

function sheetByKey_(ss, key) {
  if (!ss) return null;
  const exact = ss.getSheetByName(key);
  if (exact) return exact;

  const sheets = ss.getSheets();
  for (const sheet of sheets) {
    if (extractSheetKey_(sheet.getName()) === key) return sheet;
  }
  return null;
}

function ensureSheetByKey_(ss, key) {
  let sheet = sheetByKey_(ss, key);
  if (sheet) return sheet;
  const lang = getUiLanguage_();
  const name = LOCALIZABLE_SHEETS[key] ? makeSheetDisplayName_(key, lang) : key;
  return ss.insertSheet(name);
}

function ensureDataQuickAction_(dataSheet, ja) {
  if (!dataSheet) return;
  dataSheet.getRange('D2').setValue(ja ? '登攀を記録' : 'Log Climb');
  const cell = dataSheet.getRange('D3');
  cell.insertCheckboxes();
  if (cell.getValue() !== true && cell.getValue() !== false) cell.setValue(false);
}

function colorCodeCustomersHeader_(sheet) {
  if (!sheet) return;
  const REQUIRED = '#f4cccc';
  const OPTIONAL = '#fff2cc';
  const CALCULATED = '#cfe2f3';
  sheet.getRange('A1:U1').setBackgrounds([[
    CALCULATED,
    REQUIRED,
    CALCULATED,
    CALCULATED,
    CALCULATED,
    OPTIONAL,
    CALCULATED,
    OPTIONAL,
    OPTIONAL,
    OPTIONAL,
    CALCULATED,
    CALCULATED,
    OPTIONAL,
    OPTIONAL,
    OPTIONAL,
    OPTIONAL,
    OPTIONAL,
    CALCULATED,
    CALCULATED,
    OPTIONAL,
    OPTIONAL
  ]]);
}

function colorCodeRoutesHeader_(sheet) {
  if (!sheet) return;
  const REQUIRED = '#f4cccc';
  const OPTIONAL = '#fff2cc';
  const CALCULATED = '#cfe2f3';
  sheet.getRange('A1:G1').setBackgrounds([[
    CALCULATED,
    REQUIRED,
    REQUIRED,
    OPTIONAL,
    OPTIONAL,
    CALCULATED,
    CALCULATED
  ]]);
}

function ensureLocalizedSheetNames_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lang = getUiLanguage_();

  Object.keys(LOCALIZABLE_SHEETS).forEach(key => {
    const sheet = sheetByKey_(ss, key);
    if (!sheet) return;
    const target = makeSheetDisplayName_(key, lang);
    if (sheet.getName() !== target) sheet.setName(target);
  });
}

function ensureRequiredSheets_(ss) {
  REQUIRED_SHEETS.forEach(name => {
    if (!sheetByKey_(ss, name)) ss.insertSheet(name);
  });
}

function ensureSheetWithHeaders_(ss, name, headers) {
  let sheet = ensureSheetByKey_(ss, name);

  const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const empty = existing.every(v => v === '');
  if (empty) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function cleanupDefaultSheet_(ss) {
  if (!ss) return;
  const defaultNames = ['Sheet1', 'シート1'];
  defaultNames.forEach(name => {
    const sh = ss.getSheetByName(name);
    if (!sh) return;
    if (ss.getSheets().length <= 1) return;
    const rows = sh.getLastRow();
    const cols = sh.getLastColumn();
    const hasData = rows > 1 || cols > 1 || String(sh.getRange('A1').getDisplayValue() || '').trim() !== '';
    if (!hasData) ss.deleteSheet(sh);
  });
}

function seedDefaultSettings_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = sheetByKey_(ss, 'Settings');
  if (!settings) return;

  const hasRows = settings.getLastRow() > 1;
  if (hasRows) return;

  settings.getRange(2, 1, 4, 4).setValues([
    ['◎', 'Flash', 10, 1],
    ['◯', 'Red-Point', 7, 1],
    ['△', 'Foot-Follow', 5, 0],
    ['✓', 'Attempt', 1, 0]
  ]);
}

function appendStructuredEvent_(eventType, entityType, entityId, payload, actor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = sheetByKey_(ss, 'EventLog');
  if (!sheet) return;

  const payloadText = JSON.stringify(payload || {});
  sheet.appendRow([
    new Date(),
    eventType,
    entityType || '',
    entityId || '',
    payloadText,
    actor || Session.getActiveUser().getEmail() || 'unknown',
    EVENT_LOG_SCHEMA_VERSION
  ]);
}

function rebuildTablesFromEventLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventSheet = sheetByKey_(ss, 'EventLog');
  if (!eventSheet || eventSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('EventLog is empty. Nothing to rebuild.');
    return;
  }

  const custSheet = sheetByKey_(ss, 'Customers');
  const routeSheet = sheetByKey_(ss, 'Routes');
  const logSheet = sheetByKey_(ss, 'Logbook');
  const trainingSheet = ensureTrainingLogSheet_(ss);
  if (!custSheet || !routeSheet || !logSheet || !trainingSheet) return;

  clearDataRows_(custSheet, 12);
  clearDataRows_(routeSheet, 7);
  clearDataRows_(logSheet, 9);
  clearDataRows_(trainingSheet, 7);

  const events = eventSheet.getRange(2, 1, eventSheet.getLastRow() - 1, 7).getValues();
  const customers = [];
  const routes = [];
  const climbs = [];
  const trainings = [];

  events.forEach(ev => {
    const eventType = String(ev[1] || '');
    const payload = safeParseJson_(ev[4]);

    if (eventType === 'CUSTOMER_CREATED' && payload.id && payload.name) {
      customers.push([
        payload.id,
        payload.name,
        '', '', '',
        parseMaybeDate_(payload.birthday),
        '',
        payload.height || '',
        payload.experience || '',
        payload.gender || '',
        '', ''
      ]);
    }

    if (eventType === 'CUSTOMER_UPDATED' && payload.id) {
      const idx = customers.findIndex(c => c[0] === payload.id);
      if (idx >= 0) {
        if (payload.name !== undefined) customers[idx][1] = payload.name;
        if (payload.birthday !== undefined) customers[idx][5] = parseMaybeDate_(payload.birthday);
        if (payload.height !== undefined) customers[idx][7] = payload.height;
        if (payload.experience !== undefined) customers[idx][8] = payload.experience;
        if (payload.gender !== undefined) customers[idx][9] = payload.gender;
      }
    }

    if (eventType === 'ROUTE_CREATED' && payload.id && payload.name) {
      routes.push([
        payload.id,
        payload.name,
        payload.difficulty || '',
        payload.link || '',
        payload.createdAt ? new Date(payload.createdAt) : '',
        '',
        ''
      ]);
    }

    if (eventType === 'CLIMB_LOGGED' && payload.customerId && payload.routeId) {
      const c = customers.find(x => x[0] === payload.customerId);
      climbs.push([
        payload.timestamp ? new Date(payload.timestamp) : new Date(),
        payload.customerId,
        payload.routeId,
        payload.status || '',
        payload.grade || '',
        payload.height || (c ? c[7] : ''),
        payload.age || (c ? c[6] : ''),
        payload.experience || (c ? c[8] : ''),
        payload.gender || (c ? c[9] : '')
      ]);
    }

    if (eventType === 'TRAINING_LOGGED' && payload.customerId) {
      trainings.push([
        payload.timestamp ? new Date(payload.timestamp) : new Date(),
        payload.customerId,
        payload.customerName || '',
        payload.metric || '',
        payload.value || '',
        payload.unit || '',
        payload.notes || ''
      ]);
    }
  });

  if (customers.length) custSheet.getRange(2, 1, customers.length, 12).setValues(customers);
  if (routes.length) routeSheet.getRange(2, 1, routes.length, 7).setValues(routes);
  if (climbs.length) logSheet.getRange(2, 1, climbs.length, 9).setValues(climbs);
  if (trainings.length) trainingSheet.getRange(2, 1, trainings.length, 7).setValues(trainings);

  syncTracker();
  refreshPublicViews();
  refreshProfileTabs_();
  SpreadsheetApp.getActive().toast('Rebuilt tables from EventLog.', 'Tracker Tools');
}

function clearDataRows_(sheet, cols) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  sheet.getRange(2, 1, lastRow - 1, cols).clearContent();
}

function safeParseJson_(value) {
  try {
    return value ? JSON.parse(String(value)) : {};
  } catch (e) {
    return {};
  }
}

function prepareEventEntryTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureSheetByKey_(ss, 'Event Entry');
  const ja = getUiLanguage_() === 'JA';
  sheet.clear();
  sheet.setFrozenRows(20);

  sheet.getRange('A1').setValue(ja ? '顧客イベント' : 'Customer Event');
  sheet.getRange('A2:B8').setValues([
    [ja ? 'モード (CREATE/UPDATE)' : 'Mode (CREATE/UPDATE)', 'CREATE'],
    [ja ? '顧客ID' : 'Customer ID', ''],
    [ja ? '名前' : 'Name', ''],
    [ja ? '誕生日' : 'Birthday', ''],
    [ja ? '身長' : 'Height', ''],
    [ja ? '経験' : 'Experience', ''],
    [ja ? '性別' : 'Gender', '']
  ]);
  sheet.getRange('A9').setValue(ja ? '顧客イベントを適用' : 'Apply Customer Event');
  sheet.getRange('B9').insertCheckboxes();
  sheet.getRange('B2').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['CREATE', 'UPDATE']).build());
  sheet.getRange('B8').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['M', 'F', 'Other']).build());

  sheet.getRange('D1').setValue(ja ? '課題イベント' : 'Route Event');
  sheet.getRange('D2:E7').setValues([
    [ja ? '課題ID' : 'Route ID', ''],
    [ja ? '課題名' : 'Route Name', ''],
    [ja ? '難易度値' : 'Difficulty Number', ''],
    [ja ? 'リンク' : 'Link', ''],
    [ja ? '作成日時 (任意 ISO)' : 'Created At (optional ISO)', ''],
    [ja ? '課題イベントを適用' : 'Apply Route Event', false]
  ]);
  sheet.getRange('E7').insertCheckboxes();

  sheet.getRange('G1').setValue(ja ? '登攀イベント' : 'Climb Event');
  sheet.getRange('G2:H10').setValues([
    [ja ? '日時 (任意 ISO)' : 'Timestamp (optional ISO)', ''],
    [ja ? '顧客ID' : 'Customer ID', ''],
    [ja ? '課題ID' : 'Route ID', ''],
    [ja ? '状態' : 'Status', ''],
    [ja ? 'グレード' : 'Grade', ''],
    [ja ? '身長 (任意)' : 'Height (optional)', ''],
    [ja ? '年齢 (任意)' : 'Age (optional)', ''],
    [ja ? '経験 (任意)' : 'Experience (optional)', ''],
    [ja ? '性別 (任意)' : 'Gender (optional)', '']
  ]);
  sheet.getRange('G11').setValue(ja ? '登攀イベントを適用' : 'Apply Climb Event');
  sheet.getRange('H11').insertCheckboxes();

  const settings = sheetByKey_(ss, 'Settings');
  if (settings && settings.getLastRow() > 1) {
    const statusList = settings.getRange(2, 1, settings.getLastRow() - 1, 1).getValues().flat().filter(String);
    if (statusList.length) {
      sheet.getRange('H5').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(statusList).build());
    }
  }

  sheet.getRange('J1').setValue(ja ? 'トレーニングイベント' : 'Training Event');
  sheet.getRange('J2:K8').setValues([
    [ja ? '日時 (任意 ISO)' : 'Timestamp (optional ISO)', ''],
    [ja ? '顧客ID' : 'Customer ID', ''],
    [ja ? '顧客名 (任意)' : 'Customer Name (optional)', ''],
    [ja ? '指標' : 'Metric', ''],
    [ja ? '値' : 'Value', ''],
    [ja ? '単位' : 'Unit', ''],
    [ja ? 'メモ' : 'Notes', '']
  ]);
  sheet.getRange('J9').setValue(ja ? 'トレーニングイベントを適用' : 'Apply Training Event');
  sheet.getRange('K9').insertCheckboxes();
  const metricCfg = getTrainingMetricConfig_(sheetByKey_(ss, 'Settings'));
  const metricList = metricCfg.list.length ? metricCfg.list : TRAINING_METRICS;
  sheet.getRange('K5').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(metricList).build());

  sheet.getRange('A20:F20').setValues([['Apply?', 'Event Type', 'Entity Type', 'Entity ID', 'Payload JSON', 'Actor (optional)']]);
  if (ja) {
    sheet.getRange('A20:F20').setValues([['適用?', 'イベント種別', 'エンティティ種別', 'エンティティID', 'ペイロードJSON', '実行者 (任意)']]);
  }
  if (sheet.getMaxRows() < 60) sheet.insertRowsAfter(sheet.getMaxRows(), 60 - sheet.getMaxRows());
  sheet.getRange(21, 1, 39, 1).insertCheckboxes();
  const dv = SpreadsheetApp.newDataValidation().requireValueInList(EVENT_ENTRY_TYPES).build();
  sheet.getRange(21, 2, 39, 1).setDataValidation(dv);
  applyEventEntrySingleEntryColors_(sheet);
  sheet.autoResizeColumns(1, 11);
  SpreadsheetApp.getActive().toast('Event Entry tab prepared.', 'Tracker Tools');
}

function applyEventEntrySingleEntryColors_(sheet) {
  if (!sheet) return;

  const REQUIRED = '#f4cccc';
  const OPTIONAL = '#fff2cc';
  const CALCULATED = '#cfe2f3';

  // Customer Event (A:B)
  sheet.getRangeList(['A2:B2','A4:B4']).setBackground(REQUIRED);
  sheet.getRangeList(['A3:B3','A5:B8']).setBackground(OPTIONAL);
  sheet.getRange('A9:B9').setBackground(CALCULATED);

  // Route Event (D:E)
  sheet.getRangeList(['D3:E3','D4:E4']).setBackground(REQUIRED);
  sheet.getRangeList(['D2:E2','D5:E6']).setBackground(OPTIONAL);
  sheet.getRange('D7:E7').setBackground(CALCULATED);

  // Climb Event (G:H)
  sheet.getRangeList(['G3:H3','G4:H4','G5:H5']).setBackground(REQUIRED);
  sheet.getRangeList(['G2:H2','G6:H10']).setBackground(OPTIONAL);
  sheet.getRange('G11:H11').setBackground(CALCULATED);

  // Training Event (J:K)
  sheet.getRangeList(['J3:K3','J5:K5','J6:K6']).setBackground(REQUIRED);
  sheet.getRangeList(['J2:K2','J4:K4','J7:K8']).setBackground(OPTIONAL);
  sheet.getRange('J9:K9').setBackground(CALCULATED);
}

function applyEventEntryRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = sheetByKey_(ss, 'Event Entry');
  if (!sheet || sheet.getLastRow() < 2) return;

  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
  let applied = 0;

  rows.forEach((r, idx) => {
    const isChecked = r[0] === true;
    if (!isChecked) return;

    const eventType = String(r[1] || '').trim();
    const entityType = String(r[2] || '').trim();
    const entityId = String(r[3] || '').trim();
    const payload = safeParseJson_(r[4]);
    const actor = String(r[5] || '').trim();
    if (!eventType) return;

    appendStructuredEvent_(eventType, entityType, entityId, payload, actor || undefined);
    sheet.getRange(idx + 2, 1).setValue(false);
    applied++;
  });

  if (!applied) {
    SpreadsheetApp.getActive().toast('No checked Event Entry rows to apply.', 'Tracker Tools');
    return;
  }

  rebuildTablesFromEventLog();
  SpreadsheetApp.getActive().toast(`Applied ${applied} event row(s).`, 'Tracker Tools');
}

function migrateExistingTablesToEventLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const custSheet = sheetByKey_(ss, 'Customers');
  const routeSheet = sheetByKey_(ss, 'Routes');
  const logSheet = sheetByKey_(ss, 'Logbook');
  const trainingSheet = sheetByKey_(ss, 'TrainingLog');
  if (!custSheet || !routeSheet || !logSheet || !trainingSheet) return;

  const actor = 'migration';
  const existingEventSheet = sheetByKey_(ss, 'EventLog');
  if (existingEventSheet && existingEventSheet.getLastRow() > 1) {
    const ui = SpreadsheetApp.getUi();
    const res = ui.alert('EventLog already has data', 'Append migration events anyway?', ui.ButtonSet.YES_NO);
    if (res !== ui.Button.YES) return;
  }

  const customers = custSheet.getRange(2, 1, Math.max(0, custSheet.getLastRow() - 1), 12).getValues().filter(r => r[0] && r[1]);
  customers.forEach(c => {
    appendStructuredEvent_('CUSTOMER_CREATED', 'customer', c[0], {
      id: c[0], name: c[1], birthday: c[5] || '', height: c[7] || '', experience: c[8] || '', gender: c[9] || ''
    }, actor);
  });

  const routes = routeSheet.getRange(2, 1, Math.max(0, routeSheet.getLastRow() - 1), 7).getValues().filter(r => r[0] && r[1]);
  routes.forEach(r => {
    appendStructuredEvent_('ROUTE_CREATED', 'route', r[0], {
      id: r[0], name: r[1], difficulty: r[2] || '', link: r[3] || '', createdAt: r[4] instanceof Date ? r[4].toISOString() : ''
    }, actor);
  });

  const climbs = logSheet.getRange(2, 1, Math.max(0, logSheet.getLastRow() - 1), 9).getValues().filter(r => r[1] && r[2]);
  climbs.forEach(l => {
    appendStructuredEvent_('CLIMB_LOGGED', 'climb', `${l[1]}_${l[2]}`, {
      timestamp: l[0] instanceof Date ? l[0].toISOString() : '',
      customerId: l[1], routeId: l[2], status: l[3], grade: l[4], height: l[5], age: l[6], experience: l[7], gender: l[8]
    }, actor);
  });

  const trainings = trainingSheet.getRange(2, 1, Math.max(0, trainingSheet.getLastRow() - 1), 7).getValues().filter(r => r[1]);
  trainings.forEach(t => {
    appendStructuredEvent_('TRAINING_LOGGED', 'training', t[1], {
      timestamp: t[0] instanceof Date ? t[0].toISOString() : '',
      customerId: t[1], customerName: t[2], metric: t[3], value: t[4], unit: t[5], notes: t[6]
    }, actor);
  });

  SpreadsheetApp.getActive().toast('Migration events appended to EventLog.', 'Tracker Tools');
}

function refreshProfileTabs_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ja = getUiLanguage_() === 'JA';
  const custSheet = sheetByKey_(ss, 'Customers');
  const routeSheet = sheetByKey_(ss, 'Routes');
  const logSheet = sheetByKey_(ss, 'Logbook');
  const customerProfile = sheetByKey_(ss, 'Customer Profile');
  const routeProfile = sheetByKey_(ss, 'Route Profile');

  if (!custSheet || !routeSheet || !logSheet || !customerProfile || !routeProfile) return;

  // Customer Profile input labels (right-side quick log UI)
  customerProfile.getRange('I2:I3').setValues([[ja ? '登攀ルート' : 'Log Climb Route'], [ja ? '登攀ステータス' : 'Log Climb Status']]);
  customerProfile.getRange('I8:I11').setValues([[ja ? 'トレーニング指標' : 'Training Metric'], [ja ? 'トレーニング値' : 'Training Value'], [ja ? '単位' : 'Training Unit'], [ja ? 'メモ' : 'Training Notes']]);
  customerProfile.getRange('I1').setValue(ja ? 'クイック操作' : 'Quick Actions');
  customerProfile.getRange('I12').setValue(ja ? 'K3で登攀記録 / K11でトレ記録' : 'Tick K3 to log climb / K11 to log training');

  const customerId = String(customerProfile.getRange('A1').getValue() || '');
  customerProfile.getRange('A3:B12').clearContent();
  customerProfile.getRange('A3:A12').setValues([
    [ja ? '名前' : 'Name'], [ja ? '完登率' : 'Completion Rate'], [ja ? 'ポイント' : 'Points'], [ja ? '和グレード' : 'Japanese Level'], [ja ? 'Vグレード' : 'V Scale Level'],
    [ja ? '年齢' : 'Age'], [ja ? '身長' : 'Height'], [ja ? '経験' : 'Experience'], [ja ? '性別' : 'Gender'], [ja ? '最近の登攀 (5件)' : 'Recent Climbs (5)']
  ]);

  if (customerId) {
    const rows = custSheet.getLastRow() >= 2
      ? custSheet.getRange(2, 1, custSheet.getLastRow() - 1, 12).getValues()
      : [];
    const c = rows.find(r => String(r[0]) === customerId);
    if (c) {
      customerProfile.getRange('B3').setValue(c[1] || '');
      customerProfile.getRange('B4').setValue(c[2] || 0).setNumberFormat('0.00%');
      customerProfile.getRange('B5').setValue(c[3] || 0);
      customerProfile.getRange('B6').setValue(c[10] || '');
      customerProfile.getRange('B7').setValue(c[11] || c[4] || '');
      customerProfile.getRange('B8').setValue(c[6] || '');
      customerProfile.getRange('B9').setValue(c[7] || '');
      customerProfile.getRange('B10').setValue(c[8] || '');
      customerProfile.getRange('B11').setValue(c[9] || '');
    }

    const tz = Session.getScriptTimeZone();
    const baseLogs = logSheet.getLastRow() >= 2
      ? logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 4).getValues()
      : [];
    const logs = baseLogs
      .filter(r => String(r[1]) === customerId)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .slice(0, 5)
      .map(r => `${r[0] instanceof Date ? Utilities.formatDate(r[0], tz, 'yyyy-MM-dd HH:mm') : r[0]} | ${r[2]} | ${r[3]}`);
    customerProfile.getRange('B12').setValue(logs.join('\n'));
  }

  const routeId = String(routeProfile.getRange('A1').getValue() || '');
  routeProfile.getRange('A3:B11').clearContent();
  routeProfile.getRange('A3:A11').setValues([
    [ja ? '課題名' : 'Route Name'], [ja ? '難易度 #' : 'Difficulty #'], [ja ? '和グレード' : 'Japanese Grade'], [ja ? 'Vグレード' : 'V Scale Grade'], [ja ? '作成日時' : 'Created At'],
    [ja ? '試行回数' : 'Attempts'], [ja ? '完登数 (◎/◯)' : 'Sends (◎/◯)'], [ja ? 'ユニーク人数' : 'Unique Climbers'], [ja ? '最近の試行 (5件)' : 'Recent Attempts (5)']
  ]);

  if (routeId) {
    const rows = routeSheet.getLastRow() >= 2
      ? routeSheet.getRange(2, 1, routeSheet.getLastRow() - 1, 7).getValues()
      : [];
    const r = rows.find(x => String(x[0]) === routeId);
    if (r) {
      routeProfile.getRange('B3').setValue(r[1] || '');
      routeProfile.getRange('B4').setValue(r[2] || '');
      routeProfile.getRange('B5').setValue(r[5] || '');
      routeProfile.getRange('B6').setValue(r[6] || '');
      routeProfile.getRange('B7').setValue(r[4] || '');
      if (r[4] instanceof Date) routeProfile.getRange('B7').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    }

    const tz = Session.getScriptTimeZone();
    const routeLogsBase = logSheet.getLastRow() >= 2
      ? logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 4).getValues()
      : [];
    const routeLogs = routeLogsBase
      .filter(x => String(x[2]) === routeId);
    const sends = routeLogs.filter(x => x[3] === '◎' || x[3] === '◯').length;
    const unique = new Set(routeLogs.map(x => x[1])).size;
    const recent = routeLogs
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .slice(0, 5)
      .map(x => `${x[0] instanceof Date ? Utilities.formatDate(x[0], tz, 'yyyy-MM-dd HH:mm') : x[0]} | ${x[1]} | ${x[3]}`)
      .join('\n');

    routeProfile.getRange('B8').setValue(routeLogs.length);
    routeProfile.getRange('B9').setValue(sends);
    routeProfile.getRange('B10').setValue(unique);
    routeProfile.getRange('B11').setValue(recent);
  }

  // Route image area (large merged patch)
  try {
    routeProfile.getRange('C13:H28').breakApart();
  } catch (e) {}
  routeProfile.getRange('C13:H28').merge();
  const routesRef = sn_(ss, 'Routes');
  routeProfile.getRange('C13').setFormula(`=IF(A1="", "", LET(raw_url, XLOOKUP(A1, ${routesRef}!A:A, ${routesRef}!D:D), IFERROR(IMAGE("https://drive.google.com/uc?id=" & REGEXEXTRACT(raw_url, "/d/([a-zA-Z0-9_-]+)")), IMAGE(raw_url))))`);
}

function ensureTrainingMetricConfig_(settingsSheet) {
  if (!settingsSheet) return;

  settingsSheet.getRange('F1:H1').setValues([['Metric', 'Default Unit', 'Higher Is Better']]);
  if (settingsSheet.getLastRow() < 2 || !settingsSheet.getRange('F2').getValue()) {
    const seed = TRAINING_METRICS.map(m => [m, '', 1]);
    settingsSheet.getRange(2, 6, seed.length, 3).setValues(seed);
  }
}

function getTrainingMetricConfig_(settingsSheet) {
  if (!settingsSheet || settingsSheet.getLastRow() < 2) return { list: [], byMetric: {} };

  const values = settingsSheet.getRange(2, 6, settingsSheet.getLastRow() - 1, 3).getValues();
  const list = [];
  const byMetric = {};
  values.forEach(r => {
    const metric = String(r[0] || '').trim();
    if (!metric) return;
    list.push(metric);
    byMetric[metric] = {
      unit: String(r[1] || '').trim(),
      higherIsBetter: r[2] === '' ? true : Boolean(r[2])
    };
  });
  return { list, byMetric };
}

function autofillTrainingUnitFromMetric_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const profile = sheetByKey_(ss, 'Customer Profile');
  const settings = sheetByKey_(ss, 'Settings');
  if (!profile || !settings) return;

  const metric = String(profile.getRange('J8').getValue() || '').trim();
  if (!metric) return;
  const cfg = getTrainingMetricConfig_(settings);
  const unit = cfg.byMetric[metric] ? cfg.byMetric[metric].unit : '';
  if (unit) profile.getRange('J10').setValue(unit);
}

function importDemoTestData() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert(
    'Import Demo/Test Data',
    'This appends demo events to EventLog and rebuilds tables. Continue?',
    ui.ButtonSet.YES_NO
  );
  if (res !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventSheet = sheetByKey_(ss, 'EventLog');
  if (!eventSheet) return;

  const base = new Date();
  const customers = Array.from({ length: 20 }, (_, i) => ({
    id: `C-${String(i + 1).padStart(3, '0')}`,
    name: `Climber${String(i + 1).padStart(2, '0')}`,
    height: String(160 + (i % 20)),
    experience: `${i % 6}y`,
    gender: i % 2 ? 'M' : 'F'
  }));
  const routes = Array.from({ length: 10 }, (_, i) => ({
    id: `R-${String(i + 1).padStart(3, '0')}`,
    name: `Route-${String(i + 1).padStart(2, '0')}`,
    difficulty: (i % 10) + 1,
    createdAt: new Date(base.getTime() - (10 - i) * 3600000).toISOString()
  }));
  const statuses = ['◎', '◯', '△', '✓'];
  const metrics = ['VR', 'CP', 'LH', 'RH', 'HS'];
  const units = { VR: 'reps', CP: 'sec', LH: 'kg', RH: 'kg', HS: 'sec' };

  customers.forEach(c => appendStructuredEvent_('CUSTOMER_CREATED', 'customer', c.id, c, 'demo-seed'));
  routes.forEach(r => appendStructuredEvent_('ROUTE_CREATED', 'route', r.id, r, 'demo-seed'));

  for (let i = 0; i < 1400; i++) {
    const c = customers[i % customers.length];
    const r = routes[(i * 3) % routes.length];
    const ts = new Date(base.getTime() - (1400 - i) * 4 * 60000).toISOString();
    appendStructuredEvent_('CLIMB_LOGGED', 'climb', `${c.id}_${r.id}`, {
      timestamp: ts,
      customerId: c.id,
      routeId: r.id,
      status: i % 10 < 3 ? '◎' : (i % 10 < 6 ? '◯' : (i % 10 < 8 ? '△' : '✓')),
      grade: r.difficulty,
      height: c.height,
      experience: c.experience,
      gender: c.gender
    }, 'demo-seed');
  }

  for (let i = 0; i < 240; i++) {
    const c = customers[(i * 5) % customers.length];
    const metric = metrics[i % metrics.length];
    const ts = new Date(base.getTime() - (80 - i) * 15 * 60000).toISOString();
    appendStructuredEvent_('TRAINING_LOGGED', 'training', c.id, {
      timestamp: ts,
      customerId: c.id,
      customerName: c.name,
      metric,
      value: Math.round((5 + (i % 50) * 1.1) * 10) / 10,
      unit: units[metric],
      notes: 'demo fixture'
    }, 'demo-seed');
  }

  rebuildTablesFromEventLog();
  SpreadsheetApp.getActive().toast('Demo/test data imported.', 'Tracker Tools');
}

function resetDataSafe() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const first = ui.alert(
    'Reset Data (Safe)',
    'This will clear materialized data tables (Customers/Routes/Logbook/TrainingLog) and generated views. Continue?',
    ui.ButtonSet.YES_NO
  );
  if (first !== ui.Button.YES) return;

  clearSheetDataRows_('Customers', 12);
  clearSheetDataRows_('Routes', 7);
  clearSheetDataRows_('Logbook', 9);
  clearSheetDataRows_('TrainingLog', 7);
  clearSheetDataRows_('Data', Math.max(4, sheetByKey_(ss, 'Data') ? sheetByKey_(ss, 'Data').getMaxColumns() : 4));
  clearSheetDataRows_('Rankings View', 7);
  clearSheetDataRows_('New Routes', 6);

  const second = ui.alert(
    'Also clear EventLog?',
    'Choose YES to also remove EventLog history (full reset). Choose NO to keep EventLog.',
    ui.ButtonSet.YES_NO
  );

  if (second === ui.Button.YES) {
    clearSheetDataRows_('EventLog', 7);
  }

  runPostUpdateRoutine();
  SpreadsheetApp.getActive().toast('Reset complete.', 'Tracker Tools');
}

function clearSheetDataRows_(sheetName, cols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = sheetByKey_(ss, sheetName);
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  sheet.getRange(2, 1, lastRow - 1, cols).clearContent();
}

function applyEventEntryUiActions_(a1) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = sheetByKey_(ss, 'Event Entry');
  if (!sheet) return;

  if (a1 === 'B9') {
    const mode = String(sheet.getRange('B2').getValue() || 'CREATE').toUpperCase();
    const customerIdInput = String(sheet.getRange('B3').getValue() || '').trim();
    const customerId = customerIdInput || (mode === 'CREATE' ? generateIdForSheet_('Customers', 'C-') : '');
    const payload = {
      id: customerId,
      name: String(sheet.getRange('B4').getValue() || ''),
      birthday: normalizeDateInput_(sheet.getRange('B5').getValue()),
      height: String(sheet.getRange('B6').getValue() || ''),
      experience: String(sheet.getRange('B7').getValue() || ''),
      gender: String(sheet.getRange('B8').getValue() || '')
    };
    if (!payload.id || (mode === 'CREATE' && !payload.name)) {
      SpreadsheetApp.getActive().toast('Customer event needs at least ID (or CREATE mode) and Name.', 'Event Entry');
      sheet.getRange('B9').setValue(false);
      return;
    }
    appendStructuredEvent_(mode === 'UPDATE' ? 'CUSTOMER_UPDATED' : 'CUSTOMER_CREATED', 'customer', payload.id, payload);
    sheet.getRange('B2:B8').clearContent();
    sheet.getRange('B2').setValue('CREATE');
    sheet.getRange('B9').setValue(false);
    rebuildTablesFromEventLog();
    return;
  }

  if (a1 === 'E7') {
    const routeIdInput = String(sheet.getRange('E2').getValue() || '').trim();
    const routeId = routeIdInput || generateIdForSheet_('Routes', 'R-');
    const payload = {
      id: routeId,
      name: String(sheet.getRange('E3').getValue() || ''),
      difficulty: Number(sheet.getRange('E4').getValue() || 0),
      link: String(sheet.getRange('E5').getValue() || ''),
      createdAt: String(sheet.getRange('E6').getValue() || '') || new Date().toISOString()
    };
    if (!payload.id || !payload.name) {
      SpreadsheetApp.getActive().toast('Route event needs at least Route Name.', 'Event Entry');
      sheet.getRange('E7').setValue(false);
      return;
    }
    appendStructuredEvent_('ROUTE_CREATED', 'route', payload.id, payload);
    sheet.getRange('E2:E6').clearContent();
    sheet.getRange('E7').setValue(false);
    rebuildTablesFromEventLog();
    return;
  }

  if (a1 === 'H11') {
    const payload = {
      timestamp: String(sheet.getRange('H2').getValue() || '') || new Date().toISOString(),
      customerId: String(sheet.getRange('H3').getValue() || ''),
      routeId: String(sheet.getRange('H4').getValue() || ''),
      status: String(sheet.getRange('H5').getValue() || ''),
      grade: Number(sheet.getRange('H6').getValue() || 0),
      height: String(sheet.getRange('H7').getValue() || ''),
      age: String(sheet.getRange('H8').getValue() || ''),
      experience: String(sheet.getRange('H9').getValue() || ''),
      gender: String(sheet.getRange('H10').getValue() || '')
    };
    if (!payload.customerId || !payload.routeId || !payload.status) {
      SpreadsheetApp.getActive().toast('Climb event needs Customer ID, Route ID, and Status.', 'Event Entry');
      sheet.getRange('H11').setValue(false);
      return;
    }
    appendStructuredEvent_('CLIMB_LOGGED', 'climb', `${payload.customerId}_${payload.routeId}`, payload);
    sheet.getRange('H2:H10').clearContent();
    sheet.getRange('H11').setValue(false);
    rebuildTablesFromEventLog();
    return;
  }

  if (a1 === 'K9') {
    const payload = {
      timestamp: String(sheet.getRange('K2').getValue() || '') || new Date().toISOString(),
      customerId: String(sheet.getRange('K3').getValue() || ''),
      customerName: String(sheet.getRange('K4').getValue() || ''),
      metric: String(sheet.getRange('K5').getValue() || ''),
      value: sheet.getRange('K6').getValue(),
      unit: String(sheet.getRange('K7').getValue() || ''),
      notes: String(sheet.getRange('K8').getValue() || '')
    };
    if (!payload.customerId || !payload.metric) {
      SpreadsheetApp.getActive().toast('Training event needs Customer ID and Metric.', 'Event Entry');
      sheet.getRange('K9').setValue(false);
      return;
    }
    appendStructuredEvent_('TRAINING_LOGGED', 'training', payload.customerId, payload);
    sheet.getRange('K2:K8').clearContent();
    sheet.getRange('K9').setValue(false);
    rebuildTablesFromEventLog();
  }
}

function generateIdForSheet_(sheetName, prefix) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return makeUniqueId_(prefix, new Set());
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat().filter(String);
  return makeUniqueId_(prefix, new Set(ids));
}

function ensureGradeConversionSheet_(ss) {
  let sheet = sheetByKey_(ss, GRADE_CONVERSION_SHEET);
  if (!sheet) sheet = ss.insertSheet(GRADE_CONVERSION_SHEET);

  const headers = ['Difficulty Number', 'Japanese Grade', 'V Scale Grade'];
  const rows = [
    [0, '10級', 'VB'], [1, '9級', 'VB'], [2, '8級', 'V0-'], [3, '7級', 'V0'],
    [4, '6級', 'V0-V1'], [5, '5級', 'V1'], [6, '4級', 'V2'], [7, '3級', 'V3-V4'],
    [8, '2級', 'V4-V5'], [9, '1級', 'V5-V6'], [10, '初段', 'V7'], [11, '2段', 'V8'],
    [12, '3段', 'V9'], [13, '4段', 'V10'], [14, '5段', 'V11'], [15, '6段', 'V12']
  ];

  sheet.getRange(1, 1, 1, 3).setValues([headers]);
  if (sheet.getLastRow() < 2) sheet.getRange(2, 1, rows.length, 3).setValues(rows);
  sheet.setFrozenRows(1);
}

function refreshRouteGradeFormulas_(routeSheet) {
  const lastRow = routeSheet.getLastRow();
  if (lastRow < 2) return;
  const numRows = lastRow - 1;

  routeSheet.getRange('F1:G1').setValues([['Japanese Grade', 'V Scale Grade']]);
  const jp = [];
  const v = [];
  for (let row = 2; row <= lastRow; row++) {
    jp.push([
      `=IF($C${row}="", "", IFERROR(XLOOKUP(FLOOR($C${row}), ${sn_(SpreadsheetApp.getActiveSpreadsheet(), GRADE_CONVERSION_SHEET)}!$A:$A, ${sn_(SpreadsheetApp.getActiveSpreadsheet(), GRADE_CONVERSION_SHEET)}!$B:$B, "", -1) & IF(MOD($C${row},1)=0, "", IF(MOD($C${row},1)<0.33, "-", IF(MOD($C${row},1)<0.67, "", "+"))), ""))`
    ]);
    v.push([
      `=IF($C${row}="", "", IFERROR(XLOOKUP(FLOOR($C${row}), ${sn_(SpreadsheetApp.getActiveSpreadsheet(), GRADE_CONVERSION_SHEET)}!$A:$A, ${sn_(SpreadsheetApp.getActiveSpreadsheet(), GRADE_CONVERSION_SHEET)}!$C:$C, "", -1), ""))`
    ]);
  }
  routeSheet.getRange(2, 6, numRows, 1).setFormulas(jp);
  routeSheet.getRange(2, 7, numRows, 1).setFormulas(v);
}

function refreshCustomerGradeDisplayFormulas_(custSheet) {
  const lastRow = custSheet.getLastRow();
  if (lastRow < 2) return;
  const numRows = lastRow - 1;

  custSheet.getRange('K1:L1').setValues([['Japanese Level', 'V Scale Level']]);
  const jp = [];
  const v = [];
  for (let row = 2; row <= lastRow; row++) {
    jp.push([
      `=IF($E${row}="", "", IFERROR(XLOOKUP(FLOOR($E${row}), ${sn_(SpreadsheetApp.getActiveSpreadsheet(), GRADE_CONVERSION_SHEET)}!$A:$A, ${sn_(SpreadsheetApp.getActiveSpreadsheet(), GRADE_CONVERSION_SHEET)}!$B:$B, "", -1) & IF(MOD($E${row},1)=0, "", IF(MOD($E${row},1)<0.33, "-", IF(MOD($E${row},1)<0.67, "", "+"))), ""))`
    ]);
    v.push([
      `=IF($E${row}="", "", IFERROR(XLOOKUP(FLOOR($E${row}), ${sn_(SpreadsheetApp.getActiveSpreadsheet(), GRADE_CONVERSION_SHEET)}!$A:$A, ${sn_(SpreadsheetApp.getActiveSpreadsheet(), GRADE_CONVERSION_SHEET)}!$C:$C, "", -1), ""))`
    ]);
  }
  custSheet.getRange(2, 11, numRows, 1).setFormulas(jp);
  custSheet.getRange(2, 12, numRows, 1).setFormulas(v);
}

function normalizeDateInput_(value) {
  if (!value) return '';
  if (value instanceof Date && !isNaN(value.getTime())) return value.toISOString();
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toISOString();
}

function parseMaybeDate_(value) {
  if (!value) return '';
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d;
}

function ensureUiLanguageSetting_(settingsSheet) {
  if (!settingsSheet) return;
  settingsSheet.getRange('J1').setValue('UI Language');
  if (!settingsSheet.getRange('J2').getValue()) settingsSheet.getRange('J2').setValue('EN');
  settingsSheet.getRange('J2').clearDataValidations();
  settingsSheet.getRange('J2').setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['EN', 'JA'], true)
      .setAllowInvalid(true)
      .build()
  );
  const ja = String(settingsSheet.getRange('J2').getDisplayValue() || '').trim().toUpperCase() === 'JA';
  settingsSheet.getRange('N1').setValue(ja ? 'パッチバージョン' : 'Patch Version');
  settingsSheet.getRange('N2').setValue(TRACKER_PATCH_VERSION);
  settingsSheet.getRange('N4').setValue(ja ? 'トラブルシューティング' : 'Troubleshooting');
  settingsSheet.getRange('N5').setFormula(`=HYPERLINK("${ja ? SUPPORT_URL_JA : SUPPORT_URL_EN}", "${ja ? 'SUPPORT_ja.md を開く' : 'Open SUPPORT.md'}")`);
  settingsSheet.getRange('N7').setValue(ja ? 'ドキュメント' : 'Documentation');
  settingsSheet.getRange('N8').setFormula(`=HYPERLINK("${ja ? GUIDE_URL_JA : GUIDE_URL_EN}", "${ja ? 'ユーザーガイドを開く' : 'Open User Guide'}")`);
  settingsSheet.getRange('N10').setValue(ja ? 'リポジトリ情報' : 'Repository Info');
  settingsSheet.getRange('N11').setFormula(`=HYPERLINK("${ja ? README_URL_JA : README_URL_EN}", "${ja ? 'README を開く' : 'Open README'}")`);
  normalizeUiLanguageCell_();
}

function getUiLanguage_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settings = sheetByKey_(ss, 'Settings');
    if (!settings) return 'EN';
    const v = String(settings.getRange('J2').getValue() || 'EN').toUpperCase();
    return v === 'JA' ? 'JA' : 'EN';
  } catch (e) {
    return 'EN';
  }
}

function t_(key) {
  const lang = getUiLanguage_();
  return (I18N[lang] && I18N[lang][key]) || I18N.EN[key] || key;
}

function sn_(ss, key) {
  const sheet = sheetByKey_(ss, key);
  const name = sheet ? sheet.getName() : key;
  return `'${String(name).replace(/'/g, "''")}'`;
}

function normalizeUiLanguageCell_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = sheetByKey_(ss, 'Settings');
  if (!settings) return;

  const cell = settings.getRange('J2');
  const raw = cell.getDisplayValue();
  const normalized = String(raw || '').trim().toUpperCase();
  const finalValue = (normalized === 'JA' || normalized === 'EN') ? normalized : 'EN';

  cell.clearDataValidations();
  cell.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['EN', 'JA'], true)
      .setAllowInvalid(true)
      .build()
  );
  cell.setValue(finalValue);
  cell.clearNote();
}

function forceResetLanguageDropdown_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = sheetByKey_(ss, 'Settings');
  if (!settings) return;

  settings.getRange('L1').setValue('EN');
  settings.getRange('L2').setValue('JA');
  settings.hideColumns(12, 1);

  const cell = settings.getRange('J2');
  const v = String(cell.getDisplayValue() || '').trim().toUpperCase();
  const finalValue = (v === 'EN' || v === 'JA') ? v : 'EN';
  cell.clearDataValidations();
  cell.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInRange(settings.getRange('L1:L2'), true)
      .setAllowInvalid(true)
      .build()
  );
  cell.setValue(finalValue);
}

function applySheetHeadersLanguage_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ja = getUiLanguage_() === 'JA';

  const data = sheetByKey_(ss, 'Data');
  if (data) {
    data.getRange('A1:C1').setValues([[ja ? 'プロフィール' : 'Open Profile', ja ? '顧客' : 'Customer', ja ? '課題' : 'Route']]);
    data.getRange('D1').clearContent().clearDataValidations();
    data.getRange('D4').setValue(ja ? '完登率' : 'Comp %');
    ensureDataQuickAction_(data, ja);
  }

  const customers = sheetByKey_(ss, 'Customers');
  if (customers) {
    customers.getRange('A1:U1').setValues([[
      'ID',
      ja ? '名前' : 'Name',
      ja ? '完登率' : 'Completion Rate',
      ja ? 'ポイント' : 'Points',
      ja ? 'Vレベル' : 'V Scale Level',
      ja ? '誕生日' : 'Birthday',
      ja ? '年齢' : 'Age',
      ja ? '身長' : 'Height',
      ja ? '経験' : 'Experience',
      ja ? '性別' : 'Gender',
      ja ? '和グレード' : 'Japanese Level',
      ja ? 'Vグレード' : 'V Scale Level',
      ja ? '本名' : 'Full Name',
      ja ? '学年' : 'School Grade',
      ja ? '保護者名' : 'Guardian Name',
      ja ? '連絡先' : 'Contact',
      ja ? '登録日' : 'Registration Date',
      ja ? '来場回数' : 'Visit Count',
      ja ? '最終来場日' : 'Last Visit Date',
      ja ? '主要カテゴリ' : 'Primary Category',
      ja ? '詳細層' : 'Detailed Tier'
    ]]);
    colorCodeCustomersHeader_(customers);
    if (customers.getLastRow() >= 2) customers.getRange(2,3,customers.getLastRow()-1,1).setNumberFormat('0%');
  }

  const routes = sheetByKey_(ss, 'Routes');
  if (routes) {
    routes.getRange('A1:G1').setValues([[
      'ID',
      ja ? '課題名' : 'Name',
      ja ? '難易度値' : 'V Scale Difficulty',
      ja ? 'リンク' : 'Link',
      ja ? '作成日時' : 'Created At',
      ja ? '和グレード' : 'Japanese Grade',
      ja ? 'Vグレード' : 'V Scale Grade'
    ]]);
    colorCodeRoutesHeader_(routes);
  }

  const settings = sheetByKey_(ss, 'Settings');
  if (settings) {
    settings.getRange('A1:D1').setValues([[
      ja ? '記号' : 'Status',
      ja ? 'ラベル' : 'Label',
      ja ? '点数' : 'Score',
      ja ? '完登?' : 'Complete?'
    ]]);
    settings.getRange('F1:H1').setValues([[ja ? '指標' : 'Metric', ja ? 'デフォルト単位' : 'Default Unit', ja ? '大きいほど良い' : 'Higher Is Better']]);
    settings.getRange('J1').setValue(ja ? 'UI言語' : 'UI Language');
    settings.getRange('N1').setValue(ja ? 'パッチバージョン' : 'Patch Version');
    settings.getRange('N2').setValue(TRACKER_PATCH_VERSION);
    settings.getRange('N4').setValue(ja ? 'トラブルシューティング' : 'Troubleshooting');
    settings.getRange('N5').setFormula(`=HYPERLINK("${ja ? SUPPORT_URL_JA : SUPPORT_URL_EN}", "${ja ? 'SUPPORT_ja.md を開く' : 'Open SUPPORT.md'}")`);
    settings.getRange('N7').setValue(ja ? 'ドキュメント' : 'Documentation');
    settings.getRange('N8').setFormula(`=HYPERLINK("${ja ? GUIDE_URL_JA : GUIDE_URL_EN}", "${ja ? 'ユーザーガイドを開く' : 'Open User Guide'}")`);
    settings.getRange('N10').setValue(ja ? 'リポジトリ情報' : 'Repository Info');
    settings.getRange('N11').setFormula(`=HYPERLINK("${ja ? README_URL_JA : README_URL_EN}", "${ja ? 'README を開く' : 'Open README'}")`);
  }

  const logbook = sheetByKey_(ss, 'Logbook');
  if (logbook) {
    logbook.getRange('A1:I1').setValues([[ja ? '日時' : 'Timestamp', ja ? '顧客ID' : 'Customer ID', ja ? '課題ID' : 'Route ID', ja ? '状態' : 'Status', ja ? 'グレード' : 'Grade', ja ? '身長' : 'Height', ja ? '年齢' : 'Age', ja ? '経験' : 'Experience', ja ? '性別' : 'Gender']]);
  }

  const tlog = sheetByKey_(ss, 'TrainingLog');
  if (tlog) {
    tlog.getRange('A1:G1').setValues([[ja ? '日時' : 'Timestamp', ja ? '顧客ID' : 'Customer ID', ja ? '顧客名' : 'Customer Name', ja ? '指標' : 'Metric', ja ? '値' : 'Value', ja ? '単位' : 'Unit', ja ? 'メモ' : 'Notes']]);
  }

  const elog = sheetByKey_(ss, 'EventLog');
  if (elog) {
    elog.getRange('A1:G1').setValues([[ja ? '日時' : 'Timestamp', ja ? 'イベント種別' : 'Event Type', ja ? 'エンティティ種別' : 'Entity Type', ja ? 'エンティティID' : 'Entity ID', ja ? 'ペイロードJSON' : 'Payload JSON', ja ? '実行者' : 'Actor', ja ? 'スキーマ版' : 'Schema Version']]);
  }

  const gc = ss.getSheetByName(GRADE_CONVERSION_SHEET);
  if (gc) {
    gc.getRange('A1:C1').setValues([[ja ? '難易度値' : 'Difficulty Number', ja ? '和グレード' : 'Japanese Grade', ja ? 'Vグレード' : 'V Scale Grade']]);
  }
}
