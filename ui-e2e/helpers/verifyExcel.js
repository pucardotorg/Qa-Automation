const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Verify Excel file structure and show missing columns
 */
function verifyExcelStructure(excelFilePath, expectedJsonPath = null) {
  if (!fs.existsSync(excelFilePath)) {
    console.error(`❌ Excel file not found: ${excelFilePath}`);
    return;
  }

  // Read Excel file
  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Get data with first row as headers
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  if (data.length === 0) {
    console.error('❌ Excel file is empty');
    return;
  }

  const headers = data[0];
  const dataRows = data.slice(1).filter(row => row.some(cell => cell));

  console.log('\n📊 Excel File Analysis');
  console.log('='.repeat(60));
  console.log(`📁 File: ${excelFilePath}`);
  console.log(`📄 Sheet: ${sheetName}`);
  console.log(`📋 Total columns: ${headers.length}`);
  console.log(`📝 Data rows: ${dataRows.length}`);
  console.log('\n📌 Column Headers:');
  headers.forEach((header, index) => {
    console.log(`   ${index + 1}. ${header}`);
  });

  // If expected JSON is provided, compare
  if (expectedJsonPath && fs.existsSync(expectedJsonPath)) {
    const expectedData = JSON.parse(fs.readFileSync(expectedJsonPath, 'utf8'));
    const expectedKeys = Object.keys(expectedData);
    
    console.log('\n🔍 Comparison with Expected Data:');
    console.log('='.repeat(60));
    
    const missingInExcel = expectedKeys.filter(key => !headers.includes(key));
    const extraInExcel = headers.filter(header => !expectedKeys.includes(header));
    
    if (missingInExcel.length > 0) {
      console.log('\n⚠️  Missing columns in Excel (present in JSON):');
      missingInExcel.forEach(key => console.log(`   - ${key}`));
    }
    
    if (extraInExcel.length > 0) {
      console.log('\n➕ Extra columns in Excel (not in JSON):');
      extraInExcel.forEach(key => console.log(`   - ${key}`));
    }
    
    if (missingInExcel.length === 0 && extraInExcel.length === 0) {
      console.log('\n✅ All columns match perfectly!');
    }
  }

  // Show sample data from first row
  if (dataRows.length > 0) {
    console.log('\n📄 Sample Data (Row 1):');
    console.log('='.repeat(60));
    const firstRow = dataRows[0];
    headers.forEach((header, index) => {
      const value = firstRow[index] || '(empty)';
      console.log(`   ${header}: ${value}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Verification complete!\n');
}

// Main execution
if (require.main === module) {
  const dataDir = path.join(__dirname, '..', 'data');
  const args = process.argv.slice(2);
  
  const excelFile = args[0] || path.join(dataDir, 'test-data.xlsx');
  const jsonFile = args[1] || path.join(dataDir, 'global-variablesdemo.json');
  
  verifyExcelStructure(excelFile, jsonFile);
}

module.exports = { verifyExcelStructure };
