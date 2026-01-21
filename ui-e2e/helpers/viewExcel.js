const { ExcelHelper } = require('./excelHelper');
const path = require('path');

/**
 * View Excel data in a readable format
 */
function viewExcelData() {
  const excelFile = process.env.EXCEL_FILE_PATH || path.join(__dirname, '../data/test-data.xlsx');
  const excelSheet = process.env.EXCEL_SHEET_NAME || null;
  
  console.log(`\n📊 Reading Excel file: ${excelFile}\n`);
  
  try {
    const helper = new ExcelHelper(excelFile, excelSheet);
    const allRows = helper.getAllRows();
    
    if (allRows.length === 0) {
      console.log('❌ No data found in Excel file\n');
      return;
    }
    
    console.log(`✅ Found ${allRows.length} data row(s)\n`);
    console.log('='.repeat(80));
    
    // Display each row
    allRows.forEach((row, index) => {
      console.log(`\n📝 ROW ${index + 1}:`);
      console.log('-'.repeat(80));
      
      // Display each field in the row
      Object.entries(row).forEach(([key, value]) => {
        const displayValue = value || '(empty)';
        console.log(`  ${key.padEnd(30)} : ${displayValue}`);
      });
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Total rows: ${allRows.length}\n`);
    
  } catch (error) {
    console.error('❌ Error reading Excel file:', error.message);
    process.exit(1);
  }
}

viewExcelData();
