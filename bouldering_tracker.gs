const TRAINING_METRICS = ['VR', 'CP', 'LH', 'RH', 'HS'];

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🧗‍♂️ Tracker Tools')
    .addItem('Sync IDs & Dashboards', 'syncTracker')
    .addItem('Install / Repair Edit Trigger', 'installTriggers')
    .addSeparator()
    .addItem('Log Climb from Data Sheet', 'logFromDataSheet')
    .addItem('Log Climb from Customer Profile', 'logClimbFromProfile')
    .addItem('Log Training from Customer Profile', 'logTrainingFromCustomerProfile')
    .addToUi();
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
    const sheet = ss.getSheetByName('Data');
    const custSheet = ss.getSheetByName('Customers');
    const routeSheet = ss.getSheetByName('Routes');
    const settingsSheet = ss.getSheetByName('Settings');
    const logSheet = ss.getSheetByName('Logbook');

    if (!sheet || !custSheet || !routeSheet || !settingsSheet || !logSheet) return;

    const settingsLastRow = Math.max(settingsSheet.getLastRow(), 2);

    // --- 1. GENERATE MISSING IDs IN DATABASES ---
    generateMissingIds_(custSheet, 'C-');
    generateMissingIds_(routeSheet, 'R-');

    // --- 2. GLOBAL FORMULA REFRESH (Customers Sheet) ---
    const custLastRow = custSheet.getLastRow();
    if (custLastRow >= 2) {
      const formulasC = [];
      const formulasD = [];
      const formulasE = [];
      const formulasG = [];

      for (let row = 2; row <= custLastRow; row++) {
        formulasC.push([`=IF(A${row}="", "", IFERROR(LET(comp, FILTER(Settings!$A$2:$A$${settingsLastRow}, Settings!$D$2:$D$${settingsLastRow}=1), scores, FILTER(Data!$D$4:$ZZ, Data!$B$4:$B=A${row}), tops, SUM(MAP(scores, LAMBDA(s, --ISNUMBER(MATCH(s, comp, 0))))), tops / COUNTA(Data!$D$2:$2)), 0))`]);
        formulasD.push([`=IF(A${row}="", "", SUM(ARRAYFORMULA(IFERROR(XLOOKUP(FILTER(Data!$D$4:$ZZ, Data!$B$4:$B=A${row}), Settings!$A$2:$A$${settingsLastRow}, Settings!$C$2:$C$${settingsLastRow}), 0))))`]);
        formulasE.push([`=IF(A${row}="", "", IFERROR(LET(comp, FILTER(Settings!$A$2:$A$${settingsLastRow}, Settings!$D$2:$D$${settingsLastRow}=1), scores, FILTER(Data!$D$4:$ZZ, Data!$B$4:$B=A${row}), valid, MAP(scores, LAMBDA(s, ISNUMBER(MATCH(s, comp, 0)))), sent_ids, FILTER(Data!$D$2:$ZZ$2, valid), grades, MAP(TRANSPOSE(sent_ids), LAMBDA(id, XLOOKUP(id, Routes!$A$2:$A, Routes!$C$2:$C, 0))), AVERAGE(ARRAY_CONSTRAIN(SORT(grades, 1, FALSE), 5, 1))), "No Sends"))`]);
        formulasG.push([`=IF(F${row}="", "", IFERROR(DATEDIF(F${row}, TODAY(), "Y"), "Invalid Date"))`]);
      }

      const numRows = custLastRow - 1;
      custSheet.getRange(2, 3, numRows, 1).setFormulas(formulasC);
      custSheet.getRange(2, 4, numRows, 1).setFormulas(formulasD);
      custSheet.getRange(2, 5, numRows, 1).setFormulas(formulasE);
      custSheet.getRange(2, 7, numRows, 1).setFormulas(formulasG);
    }

    // --- 3. REFRESH DATA TAB HEADERS ---
    const finalCusts = getNonEmptyRows_(custSheet, 2, 1, 2);
    const finalRoutes = getNonEmptyRows_(routeSheet, 2, 1, 2);

    const maxR = sheet.getMaxRows();
    const maxC = sheet.getMaxColumns();

    if (maxR >= 4) {
      sheet.getRange(4, 1, maxR - 3, 3).clearContent();
      sheet.getRange(4, 1, maxR - 3, 1).removeCheckboxes();
    }

    if (maxC >= 4) {
      sheet.getRange(1, 4, 3, maxC - 3).clearContent();
      sheet.getRange(1, 4, 1, maxC - 3).removeCheckboxes();
      sheet.getRange(4, 4, maxR - 3, maxC - 3).clearContent().clearDataValidations();
    }

    if (finalCusts.length > 0) {
      sheet.getRange(4, 2, finalCusts.length, 2).setValues(finalCusts);
    }

    if (finalRoutes.length > 0) {
      sheet.getRange(2, 4, 1, finalRoutes.length).setValues([finalRoutes.map(r => r[0])]);
      sheet.getRange(3, 4, 1, finalRoutes.length).setValues([finalRoutes.map(r => r[1])]);
    }

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
      sheet.getRange(4, 4, finalCusts.length, finalRoutes.length).setValues(gridValues);
      sheet.getRange(4, 1, finalCusts.length, 1).insertCheckboxes();
      sheet.getRange(1, 4, 1, finalRoutes.length).insertCheckboxes();
    }

    updateLogDropdowns();
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
  if (sheet.getName() !== 'Data') return;

  const row = e.range.getRow();
  const col = e.range.getColumn();
  const a1 = e.range.getA1Notation();
  const ss = e.source;

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

    const profileSheet = ss.getSheetByName('Customer Profile');
    if (!profileSheet) {
      ss.toast('Sheet "Customer Profile" not found.', 'Navigation Error');
      return;
    }

    profileSheet.getRange('A1').setValue(customerId);
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

    const routeProfileSheet = ss.getSheetByName('Route Profile');
    if (!routeProfileSheet) {
      ss.toast('Sheet "Route Profile" not found.', 'Navigation Error');
      return;
    }

    routeProfileSheet.getRange('A1').setValue(routeId);
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
  const sheet = ss.getSheetByName('Data');
  const logSheet = ss.getSheetByName('Logbook');
  const routeSheet = ss.getSheetByName('Routes');
  const custSheet = ss.getSheetByName('Customers');

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

  logSheet.appendRow([new Date(), customerId, routeId, status, grade, height, age, exp, gen]);
  sheet.getRange('B2:B3').clearContent();

  ss.toast('Climb logged!');
  syncTracker();
}

/**
 * Log a climb from the Customer Profile tab.
 */
function logClimbFromProfile() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const profileSheet = ss.getSheetByName('Customer Profile');
  const logSheet = ss.getSheetByName('Logbook');
  const routeSheet = ss.getSheetByName('Routes');
  const custSheet = ss.getSheetByName('Customers');

  if (!profileSheet || !logSheet || !routeSheet || !custSheet) return;

  const customerId = profileSheet.getRange('A1').getValue();
  const routeEntry = profileSheet.getRange('J1').getValue();
  const status = profileSheet.getRange('J2').getValue();

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

  logSheet.appendRow([new Date(), customerId, routeId, status, grade, height, age, exp, gen]);
  profileSheet.getRange('J1:J2').clearContent();

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
  const profileSheet = ss.getSheetByName('Customer Profile');
  const custSheet = ss.getSheetByName('Customers');

  if (!profileSheet || !custSheet) return;

  const customerId = profileSheet.getRange('A1').getValue();
  const metric = profileSheet.getRange('J7').getValue();
  const value = profileSheet.getRange('J8').getValue();
  const unit = profileSheet.getRange('J9').getValue();
  const notes = profileSheet.getRange('J10').getValue();

  if (!customerId || !metric || value === '') {
    SpreadsheetApp.getUi().alert('Please ensure Customer ID, Training Metric, and Value are filled in.');
    return;
  }

  const custData = custSheet.getRange('A2:J' + custSheet.getLastRow()).getValues();
  const cMatch = custData.find(c => c[0] === customerId);
  const customerName = cMatch ? cMatch[1] : '';

  const trainingLogSheet = ensureTrainingLogSheet_(ss);
  trainingLogSheet.appendRow([
    new Date(),
    customerId,
    customerName,
    metric,
    value,
    unit,
    notes
  ]);

  profileSheet.getRange('J7:J10').clearContent();
  ss.toast('Training log added for ' + (customerName || customerId), 'Success');
}

/**
 * Keeps Data tab and Customer Profile dropdowns in sync with databases.
 */
function updateLogDropdowns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName('Data');
  const profileSheet = ss.getSheetByName('Customer Profile');
  const custSheet = ss.getSheetByName('Customers');
  const routeSheet = ss.getSheetByName('Routes');
  const settingsSheet = ss.getSheetByName('Settings');

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

  if (custDropdownList.length > 0) {
    dataSheet.getRange('B2').setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(custDropdownList).build()
    );
  }

  if (routeList.length > 0) {
    const routeValidation = SpreadsheetApp.newDataValidation().requireValueInList(routeList).build();
    dataSheet.getRange('B3').setDataValidation(routeValidation);
    if (profileSheet) profileSheet.getRange('J1').setDataValidation(routeValidation);
  }

  if (statusList.length > 0) {
    const statusValidation = SpreadsheetApp.newDataValidation().requireValueInList(statusList).build();
    dataSheet.getRange('C3').setDataValidation(statusValidation);
    if (profileSheet) profileSheet.getRange('J2').setDataValidation(statusValidation);
  }

  if (profileSheet) {
    const trainingMetricValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(TRAINING_METRICS)
      .build();

    profileSheet.getRange('J7').setDataValidation(trainingMetricValidation);
  }
}

function ensureTrainingLogSheet_(ss) {
  let sheet = ss.getSheetByName('TrainingLog');

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

  const idRange = sheet.getRange(2, 1, lastRow - 1, 2);
  const values = idRange.getValues();
  const existingIds = new Set(values.map(row => row[0]).filter(String));
  let updated = false;

  values.forEach(row => {
    if (row[1] !== '' && row[0] === '') {
      row[0] = makeUniqueId_(prefix, existingIds);
      existingIds.add(row[0]);
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
