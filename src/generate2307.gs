// BIR Form 2307 Generator
// Generates Certificate of Creditable Tax Withheld at Source

// Expected sheet layout (sheet name: "Form 2307"):
//   C2 = Period From (MM/YYYY)    E2 = Period To (MM/YYYY)
//   C5 = Payor TIN                C6 = Payor Name
//   C7 = Payor Address            C8 = Payor ZIP
//   C11 = Payee TIN               C12 = Payee Name
//   C13 = Payee Address           C14 = Payee ZIP
//   Rows 18+ = Income entries: col B=Nature, C=ATC, D=Q1 Amount, E=Q1 EWT,
//                                               F=Q2 Amount, G=Q2 EWT,
//                                               H=Q3 Amount, I=Q3 EWT,
//                                               J=Q4 Amount, K=Q4 EWT

function generate2307() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Form 2307');

  if (!sheet) {
    showError('Sheet "Form 2307" not found.\nRun "BIR Tools > Setup Form 2307 Sheet" to create it.');
    return;
  }

  const periodFrom = String(sheet.getRange('C2').getValue()).trim();
  const periodTo   = String(sheet.getRange('E2').getValue()).trim();
  const payorTIN   = String(sheet.getRange('C5').getValue()).trim();
  const payorName  = String(sheet.getRange('C6').getValue()).trim();
  const payorAddr  = String(sheet.getRange('C7').getValue()).trim();
  const payorZip   = String(sheet.getRange('C8').getValue()).trim();
  const payeeTIN   = String(sheet.getRange('C11').getValue()).trim();
  const payeeName  = String(sheet.getRange('C12').getValue()).trim();
  const payeeAddr  = String(sheet.getRange('C13').getValue()).trim();
  const payeeZip   = String(sheet.getRange('C14').getValue()).trim();

  // --- Validation ---
  const errors = [];

  if (!periodFrom) errors.push('Period From is required (C2).');
  if (!periodTo)   errors.push('Period To is required (E2).');

  if (!payorName) errors.push('Payor Name is required (C6).');
  if (!payorTIN)  errors.push('Payor TIN is required (C5).');
  else if (!validateTIN(payorTIN)) errors.push('Payor TIN format is invalid (C5). Use XXX-XXX-XXX or XXX-XXX-XXX-XXX.');

  if (!payeeName) errors.push('Payee Name is required (C12).');
  if (!payeeTIN)  errors.push('Payee TIN is required (C11).');
  else if (!validateTIN(payeeTIN)) errors.push('Payee TIN format is invalid (C11). Use XXX-XXX-XXX or XXX-XXX-XXX-XXX.');

  // Read income rows (up to 10 entries starting at row 18)
  const entries = [];
  const ENTRY_START_ROW = 18;
  const ENTRY_MAX_ROWS  = 10;

  for (let i = 0; i < ENTRY_MAX_ROWS; i++) {
    const row      = ENTRY_START_ROW + i;
    const nature   = String(sheet.getRange(row, 2).getValue()).trim(); // col B
    const atc      = String(sheet.getRange(row, 3).getValue()).trim(); // col C
    const q1Amt    = sheet.getRange(row, 4).getValue();  // col D
    const q1Ewt    = sheet.getRange(row, 5).getValue();  // col E
    const q2Amt    = sheet.getRange(row, 6).getValue();  // col F
    const q2Ewt    = sheet.getRange(row, 7).getValue();  // col G
    const q3Amt    = sheet.getRange(row, 8).getValue();  // col H
    const q3Ewt    = sheet.getRange(row, 9).getValue();  // col I
    const q4Amt    = sheet.getRange(row, 10).getValue(); // col J
    const q4Ewt    = sheet.getRange(row, 11).getValue(); // col K

    if (!nature && !atc) continue; // skip blank rows

    if (!nature) errors.push('Row ' + row + ': Nature of Income Payment is required.');
    if (!atc)    errors.push('Row ' + row + ': ATC code is required.');

    // Validate each quarter's amounts (only if either value is present)
    [
      ['Q1', row, q1Amt, q1Ewt],
      ['Q2', row, q2Amt, q2Ewt],
      ['Q3', row, q3Amt, q3Ewt],
      ['Q4', row, q4Amt, q4Ewt],
    ].forEach(function(q) {
      const label = q[0], r = q[1], amt = q[2], ewt = q[3];
      if ((amt || ewt) && !validateAmount(amt)) {
        errors.push('Row ' + r + ' ' + label + ': Income Payment must be a positive number.');
      }
      if ((amt || ewt) && !validateAmount(ewt)) {
        errors.push('Row ' + r + ' ' + label + ': EWT Withheld must be a positive number.');
      }
    });

    entries.push({ nature, atc, q1Amt, q1Ewt, q2Amt, q2Ewt, q3Amt, q3Ewt, q4Amt, q4Ewt });
  }

  if (entries.length === 0) errors.push('At least one income entry is required (starting at row 18).');

  if (errors.length > 0) {
    showError(errors.join('\n'));
    return;
  }

  // --- Build totals ---
  let totalPayment = 0, totalEWT = 0;
  entries.forEach(function(e) {
    totalPayment += (parseFloat(e.q1Amt) || 0) + (parseFloat(e.q2Amt) || 0)
                  + (parseFloat(e.q3Amt) || 0) + (parseFloat(e.q4Amt) || 0);
    totalEWT     += (parseFloat(e.q1Ewt) || 0) + (parseFloat(e.q2Ewt) || 0)
                  + (parseFloat(e.q3Ewt) || 0) + (parseFloat(e.q4Ewt) || 0);
  });

  // --- Generate PDF ---
  const html = build2307Html({
    periodFrom, periodTo,
    payorTIN: formatTIN(payorTIN), payorName, payorAddr, payorZip,
    payeeTIN: formatTIN(payeeTIN), payeeName, payeeAddr, payeeZip,
    entries, totalPayment, totalEWT,
  });

  const blob     = Utilities.newBlob(html, 'text/html', 'form2307.html');
  const pdfBlob  = blob.getAs('application/pdf');
  const filename = 'BIR_Form_2307_' + payeeName.replace(/\s+/g, '_') + '_' + periodFrom.replace(/\//g, '-') + '.pdf';
  pdfBlob.setName(filename);

  DriveApp.getRootFolder().createFile(pdfBlob);
  showSuccess('Form 2307 PDF saved to Google Drive:\n' + filename);
}

// Creates the "Form 2307" sheet with labeled input cells
function setup2307Sheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName('Form 2307');
  if (sheet) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Sheet "Form 2307" already exists. Overwrite it?',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
    ss.deleteSheet(sheet);
  }

  sheet = ss.insertSheet('Form 2307');
  sheet.setColumnWidth(1, 30);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 70);
  sheet.setColumnWidth(5, 140);

  const labels = [
    [1,  'B', 'BIR Form 2307 — Certificate of Creditable Tax Withheld at Source'],
    [2,  'B', 'Period:'],
    [2,  'C', ''],          // periodFrom  (C2)
    [2,  'D', 'to'],
    [2,  'E', ''],          // periodTo    (E2)
    [4,  'B', '--- PAYOR INFORMATION ---'],
    [5,  'B', 'Payor TIN:'],
    [5,  'C', ''],          // payorTIN    (C5)
    [6,  'B', 'Payor Name:'],
    [6,  'C', ''],          // payorName   (C6)
    [7,  'B', 'Payor Address:'],
    [7,  'C', ''],          // payorAddr   (C7)
    [8,  'B', 'Payor ZIP:'],
    [8,  'C', ''],          // payorZip    (C8)
    [10, 'B', '--- PAYEE INFORMATION ---'],
    [11, 'B', 'Payee TIN:'],
    [11, 'C', ''],          // payeeTIN    (C11)
    [12, 'B', 'Payee Name:'],
    [12, 'C', ''],          // payeeName   (C12)
    [13, 'B', 'Payee Address:'],
    [13, 'C', ''],          // payeeAddr   (C13)
    [14, 'B', 'Payee ZIP:'],
    [14, 'C', ''],          // payeeZip    (C14)
    [16, 'B', '--- INCOME PAYMENTS (fill rows 18 and below) ---'],
    [17, 'B', 'Nature of Income'],
    [17, 'C', 'ATC'],
    [17, 'D', 'Q1 Amount'],
    [17, 'E', 'Q1 EWT'],
    [17, 'F', 'Q2 Amount'],
    [17, 'G', 'Q2 EWT'],
    [17, 'H', 'Q3 Amount'],
    [17, 'I', 'Q3 EWT'],
    [17, 'J', 'Q4 Amount'],
    [17, 'K', 'Q4 EWT'],
  ];

  labels.forEach(function(l) {
    sheet.getRange(l[0], columnLetterToIndex_(l[1])).setValue(l[2]);
  });

  // Bold header rows
  sheet.getRange('B1').setFontWeight('bold').setFontSize(12);
  sheet.getRange('B4').setFontWeight('bold');
  sheet.getRange('B10').setFontWeight('bold');
  sheet.getRange('B16').setFontWeight('bold');
  sheet.getRange('B17:K17').setFontWeight('bold').setBackground('#d9e1f2');

  showSuccess('"Form 2307" sheet created. Fill in the yellow cells then click Generate 2307 PDF.');
}

function columnLetterToIndex_(letter) {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64);
  }
  return result;
}

function build2307Html(d) {
  const amt = function(v) { return v ? formatAmount(v) : '0.00'; };

  const entryRows = d.entries.map(function(e) {
    return '<tr>'
      + '<td>' + e.nature + '</td>'
      + '<td>' + e.atc + '</td>'
      + '<td class="num">' + amt(e.q1Amt) + '</td>'
      + '<td class="num">' + amt(e.q1Ewt) + '</td>'
      + '<td class="num">' + amt(e.q2Amt) + '</td>'
      + '<td class="num">' + amt(e.q2Ewt) + '</td>'
      + '<td class="num">' + amt(e.q3Amt) + '</td>'
      + '<td class="num">' + amt(e.q3Ewt) + '</td>'
      + '<td class="num">' + amt(e.q4Amt) + '</td>'
      + '<td class="num">' + amt(e.q4Ewt) + '</td>'
      + '</tr>';
  }).join('');

  return '<!DOCTYPE html><html><head><meta charset="UTF-8">'
    + '<style>'
    + 'body{font-family:Arial,sans-serif;font-size:9pt;margin:20px;}'
    + '.title{text-align:center;font-size:13pt;font-weight:bold;margin-bottom:2px;}'
    + '.subtitle{text-align:center;font-size:10pt;margin-bottom:12px;}'
    + '.period{text-align:center;margin-bottom:10px;}'
    + 'table{width:100%;border-collapse:collapse;margin-bottom:10px;}'
    + 'th,td{border:1px solid #333;padding:4px 6px;font-size:8.5pt;}'
    + 'th{background:#d9e1f2;text-align:center;}'
    + '.num{text-align:right;}'
    + '.section{font-weight:bold;background:#eef;padding:4px;margin:8px 0 4px;}'
    + '.info-table td{border:none;padding:2px 6px;}'
    + '.info-table td:first-child{font-weight:bold;width:130px;}'
    + '.total-row td{font-weight:bold;background:#f2f2f2;}'
    + '</style></head><body>'
    + '<div class="title">BIR Form 2307</div>'
    + '<div class="subtitle">Certificate of Creditable Tax Withheld at Source</div>'
    + '<div class="period">For the period: <strong>' + d.periodFrom + '</strong> to <strong>' + d.periodTo + '</strong></div>'

    + '<div class="section">Payor Information</div>'
    + '<table class="info-table"><tr><td>TIN:</td><td>' + d.payorTIN + '</td></tr>'
    + '<tr><td>Name:</td><td>' + d.payorName + '</td></tr>'
    + '<tr><td>Address:</td><td>' + d.payorAddr + '</td></tr>'
    + '<tr><td>ZIP Code:</td><td>' + d.payorZip + '</td></tr></table>'

    + '<div class="section">Payee Information</div>'
    + '<table class="info-table"><tr><td>TIN:</td><td>' + d.payeeTIN + '</td></tr>'
    + '<tr><td>Name:</td><td>' + d.payeeName + '</td></tr>'
    + '<tr><td>Address:</td><td>' + d.payeeAddr + '</td></tr>'
    + '<tr><td>ZIP Code:</td><td>' + d.payeeZip + '</td></tr></table>'

    + '<div class="section">Income Payments and Creditable Tax Withheld</div>'
    + '<table><thead><tr>'
    + '<th>Nature of Income Payment</th><th>ATC</th>'
    + '<th>Q1 Payment</th><th>Q1 EWT</th>'
    + '<th>Q2 Payment</th><th>Q2 EWT</th>'
    + '<th>Q3 Payment</th><th>Q3 EWT</th>'
    + '<th>Q4 Payment</th><th>Q4 EWT</th>'
    + '</tr></thead><tbody>'
    + entryRows
    + '<tr class="total-row">'
    + '<td colspan="2">TOTAL</td>'
    + '<td class="num" colspan="2">' + formatAmount(d.totalPayment) + '</td>'
    + '<td class="num" colspan="2"></td>'
    + '<td class="num" colspan="2"></td>'
    + '<td class="num">' + formatAmount(d.totalPayment) + '</td>'
    + '<td class="num">' + formatAmount(d.totalEWT) + '</td>'
    + '</tr>'
    + '</tbody></table>'

    + '<p style="margin-top:40px;font-size:8pt;">'
    + 'I hereby certify that the above information is true and correct to the best of my knowledge.'
    + '</p>'
    + '<table style="width:60%;margin-top:20px;" class="info-table">'
    + '<tr><td style="border-bottom:1px solid #000;width:220px;">&nbsp;</td>'
    + '<td>&nbsp;</td><td style="border-bottom:1px solid #000;">&nbsp;</td></tr>'
    + '<tr><td style="text-align:center;font-size:8pt;">Authorized Signatory / Payor</td>'
    + '<td></td><td style="text-align:center;font-size:8pt;">Date</td></tr>'
    + '</table>'
    + '</body></html>';
}
