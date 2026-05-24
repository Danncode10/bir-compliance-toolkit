// Seed functions — populate sheets with sample data for testing
// Run via: clasp run loadSample2307Data (or ./seed.sh for all)
//
// getSpreadsheet_() uses the ID stored by onOpen() because clasp run has no
// active UI session and getActiveSpreadsheet() returns null in that context.
function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID not set. Open the Google Sheet once to initialize it.');
  return SpreadsheetApp.openById(id);
}

function loadSample2307Data() {
  const ss    = getSpreadsheet_();
  const sheet = ss.getSheetByName('Form 2307');
  if (!sheet) {
    throw new Error('Sheet "Form 2307" not found. Run Setup first.');
  }

  sheet.getRange('C2').setValue('01/2026');
  sheet.getRange('E2').setValue('03/2026');

  sheet.getRange('C5').setValue('123-456-789-000');
  sheet.getRange('C6').setValue('FullSuite Inc.');
  sheet.getRange('C7').setValue('123 Ayala Avenue, Makati City');
  sheet.getRange('C8').setValue('1226');

  sheet.getRange('C11').setValue('987-654-321-000');
  sheet.getRange('C12').setValue('Juan Dela Cruz');
  sheet.getRange('C13').setValue('456 Bonifacio Street, Taguig City');
  sheet.getRange('C14').setValue('1634');

  // Income row 1: Professional fees, 10% EWT
  sheet.getRange('B18').setValue('Professional Fees');
  sheet.getRange('C18').setValue('WC158');
  sheet.getRange('D18').setValue(50000);
  sheet.getRange('E18').setValue(5000);
  sheet.getRange('F18').setValue(50000);
  sheet.getRange('G18').setValue(5000);
  sheet.getRange('H18').setValue(50000);
  sheet.getRange('I18').setValue(5000);
}

function loadSample2317Data() {
  const ss    = getSpreadsheet_();
  const sheet = ss.getSheetByName('Form 2317');
  if (!sheet) {
    throw new Error('Sheet "Form 2317" not found. Run Setup first.');
  }

  sheet.getRange('C2').setValue('2025');

  sheet.getRange('C5').setValue('123-456-789-000');
  sheet.getRange('C6').setValue('FullSuite Inc.');
  sheet.getRange('C7').setValue('123 Ayala Avenue, Makati City');
  sheet.getRange('C8').setValue('1226');

  sheet.getRange('C11').setValue('987-654-321-000');
  sheet.getRange('C12').setValue('Maria Santos');
  sheet.getRange('C13').setValue('789 Rizal Street, Quezon City');
  sheet.getRange('C14').setValue('1100');

  // Compensation
  sheet.getRange('C17').setValue(360000);  // Basic salary
  sheet.getRange('C18').setValue(10000);   // Holiday pay
  sheet.getRange('C19').setValue(5000);    // Overtime
  sheet.getRange('C20').setValue(2000);    // Night differential
  sheet.getRange('C21').setValue(0);       // Hazard pay
  sheet.getRange('C22').setValue(90000);   // 13th month
  sheet.getRange('C23').setValue(10000);   // De minimis
  sheet.getRange('C24').setValue(24000);   // SSS/PHIC/Pag-IBIG
  sheet.getRange('C25').setValue(0);       // Other

  // Non-taxable ceilings
  sheet.getRange('C28').setValue(90000);   // 13th month cap
  sheet.getRange('C29').setValue(10000);   // De minimis
  sheet.getRange('C30').setValue(24000);   // SSS/PHIC/Pag-IBIG

  // Previous employer (optional — left blank)
  sheet.getRange('C33').setValue(0);
  sheet.getRange('C34').setValue(0);

  // Monthly breakdown (rows 38–49)
  var monthly = [30000, 30000, 30000, 30000, 30000, 30000,
                 30000, 30000, 30000, 30000, 30000, 30000];
  var withheld = [1500, 1500, 1500, 1500, 1500, 1500,
                  1500, 1500, 1500, 1500, 1500, 1500];
  for (var i = 0; i < 12; i++) {
    sheet.getRange(38 + i, 3).setValue(monthly[i]);
    sheet.getRange(38 + i, 4).setValue(withheld[i]);
  }
}

function loadSampleSLSPData() {
  const ss    = getSpreadsheet_();
  const sheet = ss.getSheetByName('SLSP');
  if (!sheet) {
    throw new Error('Sheet "SLSP" not found. Run Setup first.');
  }

  sheet.getRange('C2').setValue('123-456-789-000');
  sheet.getRange('C3').setValue('2025');
  sheet.getRange('C4').setValue('1');

  const rows = [
    ['SLS', '234-567-890-000', 'ABC Trading Co.',       'OR', 100000, 12000, 0, 0],
    ['SLS', '345-678-901-000', 'XYZ Retail Inc.',       'SI', 50000,  6000,  0, 0],
    ['SLP', '456-789-012-000', 'Sample Supplier Corp.', 'OR', 80000,  9600,  0, 0],
    ['SLP', '567-890-123-000', 'Metro Goods Inc.',      'SI', 25000,  3000,  0, 0],
  ];

  // Clear old sample data and write fresh
  sheet.getRange(8, 1, rows.length, 8).setValues(rows);
}

function loadSampleQAPData() {
  const ss    = getSpreadsheet_();
  const sheet = ss.getSheetByName('QAP');
  if (!sheet) {
    throw new Error('Sheet "QAP" not found. Run Setup first.');
  }

  sheet.getRange('C2').setValue('123-456-789-000');
  sheet.getRange('C3').setValue('2025');
  sheet.getRange('C4').setValue('1');

  const rows = [
    ['234-567-890-000', 'Juan Dela Cruz Consulting', 'WC158', 50000,  '10%', 5000],
    ['345-678-901-000', 'Maria Santos Services',     'WC158', 30000,  '10%', 3000],
    ['456-789-012-000', 'ABC IT Solutions',          'WC010', 100000, '2%',  2000],
    ['567-890-123-000', 'XYZ Legal Firm',            'WC158', 75000,  '15%', 11250],
  ];

  sheet.getRange(8, 1, rows.length, 6).setValues(rows);
}

// Convenience: seed all sheets at once
function loadAllSampleData() {
  loadSample2307Data();
  loadSample2317Data();
  loadSampleSLSPData();
  loadSampleQAPData();
}
