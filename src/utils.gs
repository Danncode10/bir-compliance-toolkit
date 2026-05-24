// Shared utility functions for all BIR tools

// Format TIN to XXX-XXX-XXX-XXX format
function formatTIN(tin) {
  const cleaned = String(tin).replace(/[^\d]/g, '');
  if (cleaned.length === 9) {
    return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 6) + '-' + cleaned.slice(6, 9);
  } else if (cleaned.length === 12) {
    return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 6) + '-' + cleaned.slice(6, 9) + '-' + cleaned.slice(9, 12);
  }
  return tin;
}

// Format amount to 2 decimal places
function formatAmount(amount) {
  return parseFloat(amount).toFixed(2);
}

// Validate TIN format
function validateTIN(tin) {
  const cleaned = String(tin).replace(/[^\d]/g, '');
  return cleaned.length === 9 || cleaned.length === 12;
}

// Validate amount is positive number
function validateAmount(amount) {
  return !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
}

// Download file to Google Drive
function downloadFile(content, filename) {
  const folder = DriveApp.getRootFolder();
  const blob = Utilities.newBlob(content, 'text/plain', filename);
  folder.createFile(blob);
}

// Show error popup to user
function showError(message) {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Error: ' + message, ui.ButtonSet.OK);
}

// Show success popup to user
function showSuccess(message) {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Success: ' + message, ui.ButtonSet.OK);
}
