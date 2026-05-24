// BIR Form 2317 Generator
// Generates Certificate of Compensation Payment / Tax Withheld

// Expected sheet layout (sheet name: "Form 2317"):
//   C2  = Year (YYYY)
//   C5  = Employer TIN          C6  = Employer Name
//   C7  = Employer Address      C8  = Employer ZIP
//   C11 = Employee TIN          C12 = Employee Name
//   C13 = Employee Address      C14 = Employee ZIP
//   --- Compensation (present employer) ---
//   C17 = Basic Salary
//   C18 = Holiday Pay
//   C19 = Overtime Pay
//   C20 = Night Shift Differential
//   C21 = Hazard Pay
//   C22 = 13th Month Pay & Other Benefits
//   C23 = De Minimis Benefits
//   C24 = SSS / GSIS / PHIC / Pag-IBIG Contributions
//   C25 = Other Compensation
//   --- Non-taxable ceiling ---
//   C28 = Non-taxable 13th Month (max 90,000)
//   C29 = Non-taxable De Minimis
//   C30 = SSS / GSIS / PHIC / Pag-IBIG Deduction
//   --- Previous employer (optional) ---
//   C33 = Gross Compensation (previous employer)
//   C34 = Tax Withheld (previous employer)
//   --- Monthly breakdown (rows 38-49) ---
//   col B = Month label (auto-set by setup)
//   col C = Compensation this month
//   col D = Tax withheld this month

function generate2317() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Form 2317');

  if (!sheet) {
    showError('Sheet "Form 2317" not found.\nRun "BIR Tools > Form 2317 > Setup Form 2317 Sheet" to create it.');
    return;
  }

  // --- Read header fields ---
  const year        = String(sheet.getRange('C2').getValue()).trim();
  const employerTIN = String(sheet.getRange('C5').getValue()).trim();
  const employerName= String(sheet.getRange('C6').getValue()).trim();
  const employerAddr= String(sheet.getRange('C7').getValue()).trim();
  const employerZip = String(sheet.getRange('C8').getValue()).trim();
  const employeeTIN = String(sheet.getRange('C11').getValue()).trim();
  const employeeName= String(sheet.getRange('C12').getValue()).trim();
  const employeeAddr= String(sheet.getRange('C13').getValue()).trim();
  const employeeZip = String(sheet.getRange('C14').getValue()).trim();

  // --- Read compensation fields ---
  const basicSalary  = sheet.getRange('C17').getValue();
  const holidayPay   = sheet.getRange('C18').getValue();
  const overtimePay  = sheet.getRange('C19').getValue();
  const nightDiff    = sheet.getRange('C20').getValue();
  const hazardPay    = sheet.getRange('C21').getValue();
  const thirteenthMo = sheet.getRange('C22').getValue();
  const deMinimis    = sheet.getRange('C23').getValue();
  const sssPhicHdmf  = sheet.getRange('C24').getValue();
  const otherComp    = sheet.getRange('C25').getValue();

  // --- Read non-taxable ceilings ---
  const ntThirteenth = sheet.getRange('C28').getValue();
  const ntDeMinimis  = sheet.getRange('C29').getValue();
  const ntSssPhic    = sheet.getRange('C30').getValue();

  // --- Previous employer (optional) ---
  const prevGross    = sheet.getRange('C33').getValue();
  const prevEWT      = sheet.getRange('C34').getValue();

  // --- Read monthly breakdown (rows 38–49) ---
  const MONTH_START = 38;
  const months = [];
  for (let i = 0; i < 12; i++) {
    const row     = MONTH_START + i;
    const label   = String(sheet.getRange(row, 2).getValue()).trim();
    const comp    = sheet.getRange(row, 3).getValue();
    const withheld= sheet.getRange(row, 4).getValue();
    months.push({ label: label || MONTH_NAMES_[i], comp, withheld });
  }

  // --- Validation ---
  const errors = [];

  if (!year || isNaN(parseInt(year, 10))) errors.push('Year is required and must be a number (C2).');

  if (!employerName) errors.push('Employer Name is required (C6).');
  if (!employerTIN)  errors.push('Employer TIN is required (C5).');
  else if (!validateTIN(employerTIN)) errors.push('Employer TIN format is invalid (C5).');

  if (!employeeName) errors.push('Employee Name is required (C12).');
  if (!employeeTIN)  errors.push('Employee TIN is required (C11).');
  else if (!validateTIN(employeeTIN)) errors.push('Employee TIN format is invalid (C11).');

  if (!basicSalary || !validateAmount(basicSalary)) {
    errors.push('Basic Salary is required and must be a positive number (C17).');
  }

  // Validate non-taxable 13th month does not exceed 90,000
  if (ntThirteenth && parseFloat(ntThirteenth) > 90000) {
    errors.push('Non-taxable 13th Month (C28) cannot exceed ₱90,000 per BIR rules.');
  }

  // Validate optional amounts are non-negative when present
  const optionalAmounts = [
    ['Holiday Pay', holidayPay, 'C18'],
    ['Overtime Pay', overtimePay, 'C19'],
    ['Night Shift Differential', nightDiff, 'C20'],
    ['Hazard Pay', hazardPay, 'C21'],
    ['13th Month Pay', thirteenthMo, 'C22'],
    ['De Minimis Benefits', deMinimis, 'C23'],
    ['SSS/GSIS/PHIC/Pag-IBIG Contributions', sssPhicHdmf, 'C24'],
    ['Other Compensation', otherComp, 'C25'],
    ['Non-taxable De Minimis', ntDeMinimis, 'C29'],
    ['SSS/GSIS/PHIC/Pag-IBIG Deduction', ntSssPhic, 'C30'],
    ['Previous Employer Gross', prevGross, 'C33'],
    ['Previous Employer Tax Withheld', prevEWT, 'C34'],
  ];
  optionalAmounts.forEach(function(f) {
    const v = f[1];
    if (v !== '' && v !== null && v !== undefined && isNaN(parseFloat(v))) {
      errors.push(f[0] + ' (' + f[2] + ') must be a number.');
    }
    if (v && parseFloat(v) < 0) {
      errors.push(f[0] + ' (' + f[2] + ') cannot be negative.');
    }
  });

  months.forEach(function(m, idx) {
    const rowNum = MONTH_START + idx;
    if (m.comp && isNaN(parseFloat(m.comp))) {
      errors.push('Row ' + rowNum + ' (' + m.label + '): Compensation must be a number.');
    }
    if (m.withheld && isNaN(parseFloat(m.withheld))) {
      errors.push('Row ' + rowNum + ' (' + m.label + '): Tax Withheld must be a number.');
    }
  });

  if (errors.length > 0) {
    showError(errors.join('\n'));
    return;
  }

  // --- Compute totals ---
  const n = function(v) { return parseFloat(v) || 0; };

  const grossPresent = n(basicSalary) + n(holidayPay) + n(overtimePay) + n(nightDiff)
                     + n(hazardPay) + n(thirteenthMo) + n(deMinimis) + n(sssPhicHdmf) + n(otherComp);

  const totalNonTaxable = n(ntThirteenth) + n(ntDeMinimis) + n(ntSssPhic);
  const taxableComp     = Math.max(0, grossPresent - totalNonTaxable);

  const totalGross      = grossPresent + n(prevGross);

  const monthlyEWTTotal = months.reduce(function(sum, m) { return sum + n(m.withheld); }, 0);
  const totalEWT        = monthlyEWTTotal + n(prevEWT);

  // --- Generate PDF ---
  const html = build2317Html({
    year,
    employerTIN: formatTIN(employerTIN), employerName, employerAddr, employerZip,
    employeeTIN: formatTIN(employeeTIN), employeeName, employeeAddr, employeeZip,
    basicSalary: n(basicSalary),   holidayPay: n(holidayPay),
    overtimePay: n(overtimePay),   nightDiff: n(nightDiff),
    hazardPay: n(hazardPay),       thirteenthMo: n(thirteenthMo),
    deMinimis: n(deMinimis),       sssPhicHdmf: n(sssPhicHdmf),
    otherComp: n(otherComp),       grossPresent,
    ntThirteenth: n(ntThirteenth), ntDeMinimis: n(ntDeMinimis),
    ntSssPhic: n(ntSssPhic),       totalNonTaxable,
    taxableComp,
    prevGross: n(prevGross),       prevEWT: n(prevEWT),
    totalGross,
    months,                        totalEWT,
  });

  const blob     = Utilities.newBlob(html, 'text/html', 'form2317.html');
  const pdfBlob  = blob.getAs('application/pdf');
  const filename = 'BIR_Form_2317_' + employeeName.replace(/\s+/g, '_') + '_' + year + '.pdf';
  pdfBlob.setName(filename);

  DriveApp.getRootFolder().createFile(pdfBlob);
  showSuccess('Form 2317 PDF saved to Google Drive:\n' + filename);
}

// Creates the "Form 2317" sheet with labeled input cells
function setup2317Sheet() {
  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Form 2317');
  if (sheet) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Sheet "Form 2317" already exists. Overwrite it?',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
    ss.deleteSheet(sheet);
  }

  sheet = ss.insertSheet('Form 2317');
  sheet.setColumnWidth(1, 30);
  sheet.setColumnWidth(2, 260);
  sheet.setColumnWidth(3, 180);

  const rows = [
    [1,  'B', 'BIR Form 2317 — Certificate of Compensation Payment / Tax Withheld'],
    [2,  'B', 'Year:'],               [2,  'C', ''],
    [4,  'B', '--- EMPLOYER INFORMATION ---'],
    [5,  'B', 'Employer TIN:'],       [5,  'C', ''],
    [6,  'B', 'Employer Name:'],      [6,  'C', ''],
    [7,  'B', 'Employer Address:'],   [7,  'C', ''],
    [8,  'B', 'Employer ZIP:'],       [8,  'C', ''],
    [10, 'B', '--- EMPLOYEE INFORMATION ---'],
    [11, 'B', 'Employee TIN:'],       [11, 'C', ''],
    [12, 'B', 'Employee Name:'],      [12, 'C', ''],
    [13, 'B', 'Employee Address:'],   [13, 'C', ''],
    [14, 'B', 'Employee ZIP:'],       [14, 'C', ''],
    [16, 'B', '--- COMPENSATION (Present Employer) ---'],
    [17, 'B', 'Basic Salary: *'],     [17, 'C', ''],
    [18, 'B', 'Holiday Pay:'],        [18, 'C', ''],
    [19, 'B', 'Overtime Pay:'],       [19, 'C', ''],
    [20, 'B', 'Night Shift Differential:'], [20, 'C', ''],
    [21, 'B', 'Hazard Pay:'],         [21, 'C', ''],
    [22, 'B', '13th Month Pay & Other Benefits:'], [22, 'C', ''],
    [23, 'B', 'De Minimis Benefits:'], [23, 'C', ''],
    [24, 'B', 'SSS/GSIS/PHIC/Pag-IBIG Contributions:'], [24, 'C', ''],
    [25, 'B', 'Other Compensation:'], [25, 'C', ''],
    [27, 'B', '--- NON-TAXABLE AMOUNTS ---'],
    [28, 'B', 'Non-taxable 13th Month (max ₱90,000):'], [28, 'C', ''],
    [29, 'B', 'Non-taxable De Minimis:'], [29, 'C', ''],
    [30, 'B', 'SSS/GSIS/PHIC/Pag-IBIG Deduction:'], [30, 'C', ''],
    [32, 'B', '--- PREVIOUS EMPLOYER (if any) ---'],
    [33, 'B', 'Gross Compensation (Prev. Employer):'], [33, 'C', ''],
    [34, 'B', 'Tax Withheld (Prev. Employer):'], [34, 'C', ''],
    [36, 'B', '--- MONTHLY BREAKDOWN ---'],
    [37, 'B', 'Month'], [37, 'C', 'Compensation'], [37, 'D', 'Tax Withheld'],
  ];

  rows.forEach(function(r) {
    sheet.getRange(r[0], col_(r[1])).setValue(r[2]);
  });

  // Write month labels
  MONTH_NAMES_.forEach(function(name, i) {
    sheet.getRange(38 + i, 2).setValue(name);
  });

  // Formatting
  sheet.getRange('B1').setFontWeight('bold').setFontSize(12);
  ['B4','B10','B16','B27','B32','B36'].forEach(function(cell) {
    sheet.getRange(cell).setFontWeight('bold');
  });
  sheet.getRange('B37:D37').setFontWeight('bold').setBackground('#d9e1f2');
  sheet.getRange('B38:B49').setFontWeight('bold');

  showSuccess('"Form 2317" sheet created. Fill in the highlighted cells then click Generate 2317 PDF.');
}

// ---- Private helpers ----

var MONTH_NAMES_ = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function col_(letter) {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64);
  }
  return result;
}

function build2317Html(d) {
  const peso = function(v) { return '&#8369;' + formatAmount(v); };
  const n    = function(v) { return parseFloat(v) || 0; };

  const monthRows = d.months.map(function(m) {
    return '<tr>'
      + '<td>' + m.label + '</td>'
      + '<td class="num">' + (m.comp ? peso(m.comp) : '—') + '</td>'
      + '<td class="num">' + (m.withheld ? peso(m.withheld) : '—') + '</td>'
      + '</tr>';
  }).join('');

  return '<!DOCTYPE html><html><head><meta charset="UTF-8">'
    + '<style>'
    + 'body{font-family:Arial,sans-serif;font-size:9pt;margin:20px;color:#111;}'
    + '.title{text-align:center;font-size:13pt;font-weight:bold;margin-bottom:2px;}'
    + '.subtitle{text-align:center;font-size:10pt;margin-bottom:4px;}'
    + '.year{text-align:center;margin-bottom:12px;font-size:10pt;}'
    + 'table{width:100%;border-collapse:collapse;margin-bottom:10px;}'
    + 'th,td{border:1px solid #555;padding:4px 6px;font-size:8.5pt;}'
    + 'th{background:#d9e1f2;text-align:center;}'
    + '.num{text-align:right;}'
    + '.section{font-weight:bold;background:#e8eaf0;padding:4px 6px;}'
    + '.info-table td{border:none;padding:2px 6px;}'
    + '.info-table td:first-child{font-weight:bold;width:230px;}'
    + '.total-row td{font-weight:bold;background:#f0f0f0;}'
    + '.sub-total td{background:#fafafa;font-style:italic;}'
    + '</style></head><body>'

    + '<div class="title">BIR Form 2317</div>'
    + '<div class="subtitle">Certificate of Compensation Payment / Tax Withheld</div>'
    + '<div class="year">For the Year: <strong>' + d.year + '</strong></div>'

    // Employer
    + '<table><thead><tr><th colspan="2" class="section">Employer Information</th></tr></thead><tbody>'
    + '<tr><td class="info-table" style="width:230px;font-weight:bold;">TIN</td><td>' + d.employerTIN + '</td></tr>'
    + '<tr><td style="font-weight:bold;">Name</td><td>' + d.employerName + '</td></tr>'
    + '<tr><td style="font-weight:bold;">Address</td><td>' + d.employerAddr + '</td></tr>'
    + '<tr><td style="font-weight:bold;">ZIP Code</td><td>' + d.employerZip + '</td></tr>'
    + '</tbody></table>'

    // Employee
    + '<table><thead><tr><th colspan="2" class="section">Employee Information</th></tr></thead><tbody>'
    + '<tr><td style="width:230px;font-weight:bold;">TIN</td><td>' + d.employeeTIN + '</td></tr>'
    + '<tr><td style="font-weight:bold;">Name</td><td>' + d.employeeName + '</td></tr>'
    + '<tr><td style="font-weight:bold;">Address</td><td>' + d.employeeAddr + '</td></tr>'
    + '<tr><td style="font-weight:bold;">ZIP Code</td><td>' + d.employeeZip + '</td></tr>'
    + '</tbody></table>'

    // Compensation
    + '<table><thead><tr><th colspan="2" class="section">Compensation (Present Employer)</th></tr></thead><tbody>'
    + '<tr><td>Basic Salary</td><td class="num">' + peso(d.basicSalary) + '</td></tr>'
    + '<tr><td>Holiday Pay</td><td class="num">' + peso(d.holidayPay) + '</td></tr>'
    + '<tr><td>Overtime Pay</td><td class="num">' + peso(d.overtimePay) + '</td></tr>'
    + '<tr><td>Night Shift Differential</td><td class="num">' + peso(d.nightDiff) + '</td></tr>'
    + '<tr><td>Hazard Pay</td><td class="num">' + peso(d.hazardPay) + '</td></tr>'
    + '<tr><td>13th Month Pay &amp; Other Benefits</td><td class="num">' + peso(d.thirteenthMo) + '</td></tr>'
    + '<tr><td>De Minimis Benefits</td><td class="num">' + peso(d.deMinimis) + '</td></tr>'
    + '<tr><td>SSS / GSIS / PHIC / Pag-IBIG Contributions</td><td class="num">' + peso(d.sssPhicHdmf) + '</td></tr>'
    + '<tr><td>Other Compensation</td><td class="num">' + peso(d.otherComp) + '</td></tr>'
    + '<tr class="total-row"><td>Total Gross Compensation (Present)</td><td class="num">' + peso(d.grossPresent) + '</td></tr>'
    + '</tbody></table>'

    // Non-taxable
    + '<table><thead><tr><th colspan="2" class="section">Non-Taxable Amounts</th></tr></thead><tbody>'
    + '<tr><td>Non-taxable 13th Month Pay (max &#8369;90,000)</td><td class="num">' + peso(d.ntThirteenth) + '</td></tr>'
    + '<tr><td>Non-taxable De Minimis Benefits</td><td class="num">' + peso(d.ntDeMinimis) + '</td></tr>'
    + '<tr><td>SSS / GSIS / PHIC / Pag-IBIG Deductions</td><td class="num">' + peso(d.ntSssPhic) + '</td></tr>'
    + '<tr class="total-row"><td>Total Non-Taxable</td><td class="num">' + peso(d.totalNonTaxable) + '</td></tr>'
    + '<tr class="total-row"><td><strong>Taxable Compensation</strong></td><td class="num"><strong>' + peso(d.taxableComp) + '</strong></td></tr>'
    + '</tbody></table>'

    // Previous employer
    + '<table><thead><tr><th colspan="2" class="section">Previous Employer (if any)</th></tr></thead><tbody>'
    + '<tr><td>Gross Compensation</td><td class="num">' + peso(d.prevGross) + '</td></tr>'
    + '<tr><td>Tax Withheld</td><td class="num">' + peso(d.prevEWT) + '</td></tr>'
    + '</tbody></table>'

    // Totals
    + '<table><thead><tr><th colspan="2" class="section">Summary</th></tr></thead><tbody>'
    + '<tr class="total-row"><td>Total Gross Compensation (Present + Previous)</td><td class="num">' + peso(d.totalGross) + '</td></tr>'
    + '<tr class="total-row"><td>Total Tax Withheld</td><td class="num">' + peso(d.totalEWT) + '</td></tr>'
    + '</tbody></table>'

    // Monthly breakdown
    + '<table><thead><tr><th>Month</th><th>Compensation</th><th>Tax Withheld</th></tr></thead><tbody>'
    + monthRows
    + '</tbody></table>'

    + '<p style="margin-top:40px;font-size:8pt;">'
    + 'I hereby certify that the above information is true and correct to the best of my knowledge.'
    + '</p>'
    + '<table style="width:70%;margin-top:20px;border:none;">'
    + '<tr>'
    + '<td style="border-bottom:1px solid #000;width:250px;">&nbsp;</td>'
    + '<td style="width:30px;border:none;">&nbsp;</td>'
    + '<td style="border-bottom:1px solid #000;width:150px;">&nbsp;</td>'
    + '</tr>'
    + '<tr>'
    + '<td style="text-align:center;font-size:8pt;border:none;">Authorized Signatory / Employer Representative</td>'
    + '<td style="border:none;"></td>'
    + '<td style="text-align:center;font-size:8pt;border:none;">Date</td>'
    + '</tr>'
    + '</table>'
    + '</body></html>';
}
