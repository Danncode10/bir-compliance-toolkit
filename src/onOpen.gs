// Creates the BIR Tools custom menu in Google Sheets
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('BIR Tools')
    .addSubMenu(ui.createMenu('Form 2307')
      .addItem('Setup Form 2307 Sheet', 'setup2307Sheet')
      .addItem('Generate 2307 PDF', 'generate2307'))
    .addSubMenu(ui.createMenu('Form 2317')
      .addItem('Setup Form 2317 Sheet', 'setup2317Sheet')
      .addItem('Generate 2317 PDF', 'generate2317'))
    .addSubMenu(ui.createMenu('SLSP')
      .addItem('Setup SLSP Sheet', 'setupSLSPSheet')
      .addItem('Generate SLSP DAT File', 'generateSLSP'))
    .addSubMenu(ui.createMenu('QAP')
      .addItem('Setup QAP Sheet', 'setupQAPSheet')
      .addItem('Generate QAP DAT File', 'generateQAP'))
    .addToUi();
}
