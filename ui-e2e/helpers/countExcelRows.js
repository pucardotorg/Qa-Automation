const { ExcelHelper } = require('./excelHelper');
const path = require('path');

const excelFile = process.env.EXCEL_FILE_PATH || path.join(__dirname, '../data/test-data.xlsx');
const excelSheet = process.env.EXCEL_SHEET_NAME || null;

try {
  const helper = new ExcelHelper(excelFile, excelSheet);
  const rowCount = helper.getRowCount();
  
  console.log(`\n📊 Excel File: ${path.basename(excelFile)}`);
  console.log(`📝 Total data rows: ${rowCount}\n`);
  
  if (rowCount === 0) {
    console.log('⚠️  Warning: No data rows found in Excel file\n');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
