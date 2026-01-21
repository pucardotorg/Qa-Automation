const { execSync } = require('child_process');
const { ExcelHelper } = require('./excelHelper');
const path = require('path');

/**
 * Run tests for all rows in Excel file sequentially
 */
async function runAllExcelRows() {
  const excelFile = process.env.EXCEL_FILE_PATH || path.join(__dirname, '../data/test-data.xlsx');
  const excelSheet = process.env.EXCEL_SHEET_NAME || null;
  const headed = process.env.HEADED === 'true' || process.argv.includes('--headed');
  const testFile = process.argv.find(arg => !arg.includes('--') && arg.includes('.spec.js')); // Optional: specific test file to run
  
  const helper = new ExcelHelper(excelFile, excelSheet);
  const rowCount = helper.getRowCount();
  
  console.log(`\n========================================`);
  console.log(`Found ${rowCount} rows in Excel file`);
  console.log(`Mode: ${headed ? 'HEADED (visible browser)' : 'HEADLESS'}`);
  console.log(`========================================\n`);
  
  // Reset to start from first row
  helper.resetRowIndex();
  
  for (let i = 0; i < rowCount; i++) {
    console.log(`\n========================================`);
    console.log(`RUNNING TESTS FOR ROW ${i + 1} of ${rowCount}`);
    console.log(`========================================\n`);
    
    try {
      // Build the test command
      let command = 'USE_EXCEL_DATA=true npx playwright test';
      if (headed) {
        command += ' --headed';
      }
      if (testFile) {
        command += ` ${testFile}`;
      }
      
      // Run the tests
      execSync(command, { 
        stdio: 'inherit',
        env: { ...process.env, USE_EXCEL_DATA: 'true' }
      });
      
      console.log(`\n✓ Row ${i + 1} completed successfully\n`);
      
    } catch (error) {
      console.error(`\n✗ Row ${i + 1} failed with error\n`);
      
      // Ask user if they want to continue
      const continueOnError = process.env.CONTINUE_ON_ERROR === 'true';
      if (!continueOnError) {
        console.log('Stopping execution. Set CONTINUE_ON_ERROR=true to continue on failures.');
        process.exit(1);
      }
    }
    
    // Move to next row for next iteration
    if (i < rowCount - 1) {
      helper.saveCurrentRowIndex(i + 1);
    }
  }
  
  console.log(`\n========================================`);
  console.log(`COMPLETED ALL ${rowCount} ROWS`);
  console.log(`========================================\n`);
  
  // Reset back to first row
  helper.resetRowIndex();
}

runAllExcelRows().catch(console.error);
