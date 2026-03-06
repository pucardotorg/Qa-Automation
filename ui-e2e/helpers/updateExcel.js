const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Update specific cell values in Excel file
 */
function updateExcelData(excelFilePath, updates) {
  if (!fs.existsSync(excelFilePath)) {
    console.error(`❌ Excel file not found: ${excelFilePath}`);
    return;
  }

  // Read Excel file
  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Get data as array
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  if (data.length === 0) {
    console.error('❌ Excel file is empty');
    return;
  }

  const headers = data[0];
  
  // Apply updates to all data rows
  for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
    Object.keys(updates).forEach(columnName => {
      const colIndex = headers.indexOf(columnName);
      if (colIndex !== -1) {
        // Check if it's a function (for dynamic updates)
        if (typeof updates[columnName] === 'function') {
          data[rowIndex][colIndex] = updates[columnName](rowIndex - 1, data[rowIndex][colIndex]);
        } else {
          data[rowIndex][colIndex] = updates[columnName];
        }
      }
    });
  }

  // Convert back to sheet
  const newSheet = XLSX.utils.aoa_to_sheet(data);
  workbook.Sheets[sheetName] = newSheet;

  // Write back to file
  XLSX.writeFile(workbook, excelFilePath);
  console.log(`✅ Excel file updated successfully: ${excelFilePath}`);
  
  // Show what was updated
  console.log('\n📝 Updates applied:');
  Object.keys(updates).forEach(key => {
    console.log(`   ${key}: ${typeof updates[key] === 'function' ? '(dynamic)' : updates[key]}`);
  });
}

// Main execution
if (require.main === module) {
  const dataDir = path.join(__dirname, '..', 'data');
  const excelFile = path.join(dataDir, 'test-data.xlsx');
  
  // Update citizenUsername to 8721000000 for all rows
  updateExcelData(excelFile, {
    citizenUsername: (rowIndex, currentValue) => {
      // Row 0 = 8721000000, Row 1 = 8721000001, Row 2 = 8721000002, etc.
      return String(8721000000 + rowIndex);
    }
  });
  
  console.log('\n✅ Done! Run npm run excel:verify to see the changes.');
}

module.exports = { updateExcelData };
