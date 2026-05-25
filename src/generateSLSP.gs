// SLSP DAT File Generator
// Summary List of Sales and Purchases — quarterly BIR eSubmission

// Expected sheet layout (sheet name: "SLSP"):
//   C2 = Company TIN   C3 = Year (YYYY)   C4 = Quarter (1–4)
//   Data rows start at row 7:
//     col A = Type (SLS or SLP)
//     col B = Counterparty TIN
//     col C = Counterparty Name
//     col D = Nature Code  (SI / OR / DR / CN / DM / CD)
//     col E = Gross Amount
//     col F = VAT Amount   (must equal Gross × 0.12 for VATable rows)
//     col G = Exempt Amount  (optional, default 0)
//     col H = Zero-rated Amount  (optional, default 0)

// Valid BIR nature codes for SLSP
var SLSP_NATURE_CODES_ = ['SI', 'OR', 'DR', 'CN', 'DM', 'CD'];
var SLSP_VALID_QUARTERS_ = ['1', '2', '3', '4'];

function generateSLSP() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('SLSP');

  if (!sheet) {
    showError('Sheet "SLSP" not found.\nRun "BIR Tools > SLSP > Setup SLSP Sheet" to create it.');
    return;
  }

  // --- Read header fields ---
  const companyTIN = String(sheet.getRange('C2').getValue()).trim();
  const year       = String(sheet.getRange('C3').getValue()).trim();
  const quarter    = String(sheet.getRange('C4').getValue()).trim();

  // --- Read all data rows (skip blanks) ---
  const lastRow    = sheet.getLastRow();
  const DATA_START = 8;

  if (lastRow < DATA_START) {
    showError('No transaction rows found. Add data starting at row ' + DATA_START + '.');
    return;
  }

  const dataRange = sheet.getRange(DATA_START, 1, lastRow - DATA_START + 1, 8);
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

  if (!quarter || SLSP_VALID_QUARTERS_.indexOf(quarter) === -1) {
    errors.push('Quarter is required and must be 1, 2, 3, or 4 (C4).');
  }

  const rows = [];

  rawRows.forEach(function(r, i) {
    const rowNum  = DATA_START + i;
    const type    = String(r[0]).trim().toUpperCase();
    const tin     = String(r[1]).trim();
    const name    = String(r[2]).trim();
    const nature  = String(r[3]).trim().toUpperCase();
    const gross   = r[4];
    const vat     = r[5];
    const exempt  = r[6];
    const zero    = r[7];

    // Skip completely blank rows
    if (!type && !tin && !name && !nature && gross === '' && vat === '') return;

    if (type !== 'SLS' && type !== 'SLP') {
      errors.push('Row ' + rowNum + ': Type must be SLS or SLP (got "' + r[0] + '").');
    }

    if (!tin) {
      errors.push('Row ' + rowNum + ': TIN is required.');
    } else if (!validateTIN(tin)) {
      errors.push('Row ' + rowNum + ': TIN "' + tin + '" is invalid. Use XXX-XXX-XXX or XXX-XXX-XXX-XXX.');
    }

    if (!name) {
      errors.push('Row ' + rowNum + ': Name is required.');
    }

    if (!nature) {
      errors.push('Row ' + rowNum + ': Nature Code is required.');
    } else if (SLSP_NATURE_CODES_.indexOf(nature) === -1) {
      errors.push('Row ' + rowNum + ': Nature Code "' + nature + '" is invalid. Valid codes: ' + SLSP_NATURE_CODES_.join(', ') + '.');
    }

    if (gross === '' || gross === null || !validateAmount(gross)) {
      errors.push('Row ' + rowNum + ': Gross Amount must be a positive number.');
    }

    if (vat === '' || vat === null || isNaN(parseFloat(vat)) || parseFloat(vat) < 0) {
      errors.push('Row ' + rowNum + ': VAT Amount must be a non-negative number.');
    } else if (parseFloat(gross) > 0) {
      // Only validate 12% rule when row has no explicit exempt/zero-rated amounts
      const exemptAmt = parseFloat(exempt) || 0;
      const zeroAmt   = parseFloat(zero) || 0;
      const vatableGross = parseFloat(gross) - exemptAmt - zeroAmt;
      if (vatableGross > 0) {
        const expectedVAT = Math.round(vatableGross * 0.12 * 100) / 100;
        const actualVAT   = Math.round(parseFloat(vat) * 100) / 100;
        if (Math.abs(expectedVAT - actualVAT) > 0.02) {
          errors.push('Row ' + rowNum + ': VAT (' + formatAmount(vat) + ') must equal 12% of VATable Gross ('
            + formatAmount(vatableGross) + ' → expected ' + formatAmount(expectedVAT) + ').');
        }
      }
    }

    if (exempt !== '' && exempt !== null && isNaN(parseFloat(exempt))) {
      errors.push('Row ' + rowNum + ': Exempt Amount must be a number if provided.');
    }

    if (zero !== '' && zero !== null && isNaN(parseFloat(zero))) {
      errors.push('Row ' + rowNum + ': Zero-rated Amount must be a number if provided.');
    }

    rows.push({
      type, tin, name, nature,
      gross:  parseFloat(gross)   || 0,
      vat:    parseFloat(vat)     || 0,
      exempt: parseFloat(exempt)  || 0,
      zero:   parseFloat(zero)    || 0,
    });
  });

  if (rows.length === 0) {
    errors.push('No valid transaction rows found starting at row ' + DATA_START + '.');
  }

  if (errors.length > 0) {
    showError(errors.join('\n'));
    return;
  }

  // --- Build DAT content ---
  const tinStripped = companyTIN.replace(/[^\d]/g, '');
  const salesRows     = rows.filter(function(r) { return r.type === 'SLS'; });
  const purchaseRows  = rows.filter(function(r) { return r.type === 'SLP'; });

  let dat = '';

  if (salesRows.length > 0) {
    dat += 'SLS|' + tinStripped + '|' + year + '|' + quarter + '|\n';
    salesRows.forEach(function(r) {
      dat += 'D|'
        + r.tin.replace(/[^\d]/g, '') + '|'
        + r.name + '|'
        + r.nature + '|'
        + formatAmount(r.gross) + '|'
        + formatAmount(r.vat) + '|'
        + formatAmount(r.exempt) + '|'
        + formatAmount(r.zero) + '|\n';
    });
  }

  if (purchaseRows.length > 0) {
    dat += 'SLP|' + tinStripped + '|' + year + '|' + quarter + '|\n';
    purchaseRows.forEach(function(r) {
      dat += 'D|'
        + r.tin.replace(/[^\d]/g, '') + '|'
        + r.name + '|'
        + r.nature + '|'
        + formatAmount(r.gross) + '|'
        + formatAmount(r.vat) + '|'
        + formatAmount(r.exempt) + '|'
        + formatAmount(r.zero) + '|\n';
    });
  }

  // --- Save DAT file to Google Drive ---
  const filename = 'SLSP_' + tinStripped + '_' + year + '_Q' + quarter + '.DAT';
  const blob = Utilities.newBlob(dat, 'text/plain', filename);
  DriveApp.getRootFolder().createFile(blob);

  const summary = 'SLSP DAT file saved to Google Drive:\n'
    + filename + '\n\n'
    + 'Sales rows: '    + salesRows.length + '\n'
    + 'Purchase rows: ' + purchaseRows.length + '\n'
    + 'Total rows: '    + rows.length;

  showSuccess(summary);
}

// Creates the "SLSP" sheet with labeled header cells and column headers
function setupSLSPSheet() {
  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('SLSP');

  if (sheet) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Sheet "SLSP" already exists. Overwrite it?',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
    ss.deleteSheet(sheet);
  }

  sheet = ss.insertSheet('SLSP');

  // Column widths
  sheet.setColumnWidth(1, 70);   // A: Type
  sheet.setColumnWidth(2, 150);  // B: TIN
  sheet.setColumnWidth(3, 220);  // C: Name
  sheet.setColumnWidth(4, 100);  // D: Nature
  sheet.setColumnWidth(5, 120);  // E: Gross
  sheet.setColumnWidth(6, 120);  // F: VAT
  sheet.setColumnWidth(7, 120);  // G: Exempt
  sheet.setColumnWidth(8, 120);  // H: Zero-rated

  // Header block
  sheet.getRange('A1').setValue('BIR SLSP — Summary List of Sales and Purchases').setFontWeight('bold').setFontSize(12);
  sheet.getRange('A2').setValue('Company TIN:');
  sheet.getRange('A3').setValue('Year:');
  sheet.getRange('A4').setValue('Quarter (1–4):');
  sheet.getRange('A5').setValue('Valid Nature Codes: SI, OR, DR, CN, DM, CD');

  sheet.getRange('A2:A5').setFontWeight('bold');

  // Note about VAT rule
  sheet.getRange('A6').setValue('Note: VAT Amount must equal exactly 12% of Gross Amount for VATable rows.')
    .setFontStyle('italic')
    .setFontColor('#555555');

  // Column headers at row 6
  const headers = ['Type', 'TIN', 'Name', 'Nature', 'Gross Amount', 'VAT Amount', 'Exempt Amount', 'Zero-rated Amount'];
  headers.forEach(function(h, i) {
    sheet.getRange(7, i + 1).setValue(h);
  });
  sheet.getRange('A7:H7').setFontWeight('bold').setBackground('#d9e1f2');

  // Sample data row
  sheet.getRange('A8:H8').setValues([['SLS', '123-456-789-000', 'Sample Buyer Inc.', 'OR', 10000.00, 1200.00, 0, 0]]);
  sheet.getRange('A8:H8').setFontColor('#999999').setFontStyle('italic');

  showSuccess('"SLSP" sheet created.\n\nFill in C2 (TIN), C3 (Year), C4 (Quarter), then add rows from row 8.\nDelete the sample row before generating.');
}
