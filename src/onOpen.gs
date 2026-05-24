// Creates the BIR Tools custom menu in Google Sheets
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('BIR Tools')
    .addSubMenu(ui.createMenu('Form 2307')
      .addItem('Setup Form 2307 Sheet', 'setup2307Sheet')
      .addItem('Generate 2307 PDF', 'generate2307'))
    .addItem('Generate 2317 PDF', 'generate2317')
    .addItem('Generate SLSP DAT File', 'generateSLSP')
    .addItem('Generate QAP DAT File', 'generateQAP')
    .addToUi();
}
