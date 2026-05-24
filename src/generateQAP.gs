// QAP DAT File Generator
// Quarterly Alphalist of Payees — BIR Form 1601-EQ eSubmission

// Expected sheet layout (sheet name: "QAP"):
//   C2 = Company TIN   C3 = Year (YYYY)   C4 = Quarter (1–4)
//   Data rows start at row 7:
//     col A = Payee TIN
//     col B = Payee Name
//     col C = ATC Code  (e.g. WC010, WC158, WC120)
//     col D = Amount Paid
//     col E = EWT Rate  (1%, 2%, 5%, 10%, or 15% — enter as number or percentage string)
//     col F = Tax Withheld (must equal Amount × Rate ±₱0.02)

var QAP_VALID_RATES_ = [0.01, 0.02, 0.05, 0.10, 0.15];
var QAP_VALID_QUARTERS_ = ['1', '2', '3', '4'];

function generateQAP() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('QAP');

  if (!sheet) {
    showError('Sheet "QAP" not found.\nRun "BIR Tools > QAP > Setup QAP Sheet" to create it.');
    return;
  }

  // --- Read header fields ---
  const companyTIN = String(sheet.getRange('C2').getValue()).trim();
  const year       = String(sheet.getRange('C3').getValue()).trim();
  const quarter    = String(sheet.getRange('C4').getValue()).trim();

  // --- Read all data rows ---
  const lastRow   = sheet.getLastRow();
  const DATA_START = 7;

  if (lastRow < DATA_START) {
    showError('No payee rows found. Add data starting at row ' + DATA_START + '.');
    return;
  }

  const dataRange = sheet.getRange(DATA_START, 1, lastRow - DATA_START + 1, 6);
  const rawRows   = dataRange.getValues();

  // --- Validation ---
  const errors = [];

  if (!companyTIN) {
    errors.push('Company TIN is required (C2).');
  } else if (!validateTIN(companyTIN)) {
    errors.push('Company TIN format is invalid (C2). Use XXX-XXX-XXX or XXX-XXX-XXX-XXX.');
  }

  if (!year || !/^\d{4}$/.test(year)) {
    errors.push('Year is required and must be a 4-digit number (C3).');
  }

  if (!quarter || QAP_VALID_QUARTERS_.indexOf(quarter) === -1) {
    errors.push('Quarter is required and must be 1, 2, 3, or 4 (C4).');
  }

  const rows = [];

  rawRows.forEach(function(r, i) {
    const rowNum   = DATA_START + i;
    const tin      = String(r[0]).trim();
    const name     = String(r[1]).trim();
    const atc      = String(r[2]).trim().toUpperCase();
    const amount   = r[3];
    const rateRaw  = r[4];
    const withheld = r[5];

    // Skip completely blank rows
    if (!tin && !name && !atc && amount === '' && rateRaw === '' && withheld === '') return;

    if (!tin) {
      errors.push('Row ' + rowNum + ': Payee TIN is required.');
    } else if (!validateTIN(tin)) {
      errors.push('Row ' + rowNum + ': TIN "' + tin + '" is invalid. Use XXX-XXX-XXX or XXX-XXX-XXX-XXX.');
    }

    if (!name) {
      errors.push('Row ' + rowNum + ': Payee Name is required.');
    }

    if (!atc) {
      errors.push('Row ' + rowNum + ': ATC Code is required.');
    }

    if (amount === '' || amount === null || !validateAmount(amount)) {
      errors.push('Row ' + rowNum + ': Amount Paid must be a positive number.');
    }

    // Parse rate: accept "10%", "10", or 0.10
    const rateDecimal = parseRate_(rateRaw);
    if (rateDecimal === null) {
      errors.push('Row ' + rowNum + ': EWT Rate "' + rateRaw + '" is invalid. Valid rates: 1%, 2%, 5%, 10%, 15%.');
    } else if (QAP_VALID_RATES_.indexOf(rateDecimal) === -1) {
      errors.push('Row ' + rowNum + ': EWT Rate must be one of: 1%, 2%, 5%, 10%, 15%.');
    }

    if (withheld === '' || withheld === null || isNaN(parseFloat(withheld)) || parseFloat(withheld) < 0) {
      errors.push('Row ' + rowNum + ': Tax Withheld must be a non-negative number.');
    } else if (rateDecimal !== null && parseFloat(amount) > 0) {
      const expectedWithheld = Math.round(parseFloat(amount) * rateDecimal * 100) / 100;
      const actualWithheld   = Math.round(parseFloat(withheld) * 100) / 100;
      if (Math.abs(expectedWithheld - actualWithheld) > 0.02) {
        errors.push('Row ' + rowNum + ': Tax Withheld (' + formatAmount(withheld) + ') must equal Amount × Rate ('
          + formatAmount(parseFloat(amount)) + ' × ' + (rateDecimal * 100) + '% = ' + formatAmount(expectedWithheld) + ').');
      }
    }

    rows.push({
      tin, name, atc,
      amount:   parseFloat(amount)   || 0,
      rate:     rateDecimal          || 0,
      withheld: parseFloat(withheld) || 0,
    });
  });

  if (rows.length === 0) {
    errors.push('No valid payee rows found starting at row ' + DATA_START + '.');
  }

  if (errors.length > 0) {
    showError(errors.join('\n'));
    return;
  }

  // --- Build DAT content ---
  const tinStripped = companyTIN.replace(/[^\d]/g, '');

  let dat = 'MAP|' + tinStripped + '|' + year + '|' + quarter + '|\n';

  rows.forEach(function(r) {
    dat += 'D|'
      + r.tin.replace(/[^\d]/g, '') + '|'
      + r.name + '|'
      + r.atc + '|'
      + formatAmount(r.amount) + '|'
      + formatAmount(r.rate * 100) + '|'
      + formatAmount(r.withheld) + '|\n';
  });

  // --- Save DAT file to Google Drive ---
  const filename = 'QAP_' + tinStripped + '_' + year + '_Q' + quarter + '.DAT';
  const blob = Utilities.newBlob(dat, 'text/plain', filename);
  DriveApp.getRootFolder().createFile(blob);

  showSuccess('QAP DAT file saved to Google Drive:\n'
    + filename + '\n\n'
    + 'Payee rows: ' + rows.length);
}

// Creates the "QAP" sheet with labeled header cells and column headers
function setupQAPSheet() {
  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('QAP');

  if (sheet) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Sheet "QAP" already exists. Overwrite it?',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
    ss.deleteSheet(sheet);
  }

  sheet = ss.insertSheet('QAP');

  // Column widths
  sheet.setColumnWidth(1, 160);  // A: Payee TIN
  sheet.setColumnWidth(2, 220);  // B: Payee Name
  sheet.setColumnWidth(3, 90);   // C: ATC Code
  sheet.setColumnWidth(4, 130);  // D: Amount Paid
  sheet.setColumnWidth(5, 100);  // E: EWT Rate
  sheet.setColumnWidth(6, 130);  // F: Tax Withheld

  // Header block
  sheet.getRange('A1').setValue('BIR QAP — Quarterly Alphalist of Payees (Form 1601-EQ)').setFontWeight('bold').setFontSize(12);
  sheet.getRange('A2').setValue('Company TIN:');
  sheet.getRange('A3').setValue('Year:');
  sheet.getRange('A4').setValue('Quarter (1–4):');
  sheet.getRange('A5').setValue('Valid EWT Rates: 1%, 2%, 5%, 10%, 15%');

  sheet.getRange('A2:A5').setFontWeight('bold');

  sheet.getRange('A6').setValue('Note: Tax Withheld must equal Amount × Rate (±₱0.02 tolerance for rounding).')
    .setFontStyle('italic')
    .setFontColor('#555555');

  // Column headers at row 7
  const headers = ['Payee TIN', 'Payee Name', 'ATC Code', 'Amount Paid', 'EWT Rate (%)', 'Tax Withheld'];
  headers.forEach(function(h, i) {
    sheet.getRange(7, i + 1).setValue(h);
  });
  sheet.getRange('A7:F7').setFontWeight('bold').setBackground('#d9e1f2');

  // Sample data row
  sheet.getRange('A8:F8').setValues([['123-456-789-000', 'Sample Contractor Inc.', 'WC010', 25000.00, '10%', 2500.00]]);
  sheet.getRange('A8:F8').setFontColor('#999999').setFontStyle('italic');

  showSuccess('"QAP" sheet created.\n\nFill in C2 (TIN), C3 (Year), C4 (Quarter), then add payee rows from row 8.\nDelete the sample row before generating.');
}

// Builds the QAP DAT string — pure function, no side effects
function buildQAPDat(companyTIN, year, quarter, rows) {
  const tinStripped = companyTIN.replace(/[^\d]/g, '');
  let dat = 'MAP|' + tinStripped + '|' + year + '|' + quarter + '|\n';
  rows.forEach(function(r) {
    dat += 'D|'
      + r.tin.replace(/[^\d]/g, '') + '|'
      + r.name + '|'
      + r.atc + '|'
      + formatAmount(r.amount) + '|'
      + formatAmount(r.rate * 100) + '|'
      + formatAmount(r.withheld) + '|\n';
  });
  return dat;
}

// Parses EWT rate from various input formats: "10%", "10", 0.10, 10
// Returns a decimal (e.g. 0.10) or null if unparseable
function parseRate_(raw) {
  if (raw === null || raw === '') return null;
  const s = String(raw).trim();
  if (s.endsWith('%')) {
    const pct = parseFloat(s);
    if (isNaN(pct)) return null;
    return Math.round(pct) / 100;
  }
  const n = parseFloat(s);
  if (isNaN(n)) return null;
  // Treat values > 1 as percentage (e.g. 10 → 0.10)
  return n > 1 ? Math.round(n) / 100 : Math.round(n * 100) / 100;
}
