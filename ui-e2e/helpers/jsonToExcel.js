const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Convert JSON test data to Excel format
 * This script helps you create an Excel file from your existing JSON data
 */

function jsonToExcel(jsonFilePath, excelFilePath, sheetName = 'TestData') {
  // Read JSON file
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`JSON file not found: ${jsonFilePath}`);
    return;
  }

  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
  
  // Convert single JSON object to array format for Excel
  // Each property becomes a column
  const dataArray = [jsonData];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(dataArray);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write to file
  XLSX.writeFile(workbook, excelFilePath);
  console.log(`✓ Excel file created successfully: ${excelFilePath}`);
  console.log(`✓ Sheet name: ${sheetName}`);
  console.log(`✓ Columns: ${Object.keys(jsonData).length}`);
  console.log(`\nTo add more test data rows:`);
  console.log(`1. Open ${excelFilePath} in Excel`);
  console.log(`2. Copy the data row and paste it below`);
  console.log(`3. Modify the values for your next test case`);
  console.log(`4. Save the file`);
}

/**
 * Create Excel template with multiple sample rows
 */
function createExcelTemplate(jsonFilePath, excelFilePath, numberOfRows = 3) {
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`JSON file not found: ${jsonFilePath}`);
    return;
  }

  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
  
  // Create multiple rows with sample data
  const dataArray = [];
  for (let i = 0; i < numberOfRows; i++) {
    const row = { ...jsonData };
    
    // Modify some fields to make rows unique
    if (row.citizenUsername) {
      const baseNumber = row.citizenUsername.replace(/\D/g, '');
      row.citizenUsername = String(Number(baseNumber) + i);
    }
    if (row.litigantUsername) {
      const baseNumber = row.litigantUsername.replace(/\D/g, '');
      row.litigantUsername = String(Number(baseNumber) + i);
    }
    if (row.filingNumber) {
      row.filingNumber = `${row.filingNumber}-${i + 1}`;
    }
    
    dataArray.push(row);
  }

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(dataArray);

  // Auto-size columns
  const colWidths = Object.keys(dataArray[0]).map(key => ({
    wch: Math.max(key.length, 20)
  }));
  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'TestData');

  // Write to file
  XLSX.writeFile(workbook, excelFilePath);
  console.log(`✓ Excel template created successfully: ${excelFilePath}`);
  console.log(`✓ Number of sample rows: ${numberOfRows}`);
  console.log(`✓ Columns: ${Object.keys(dataArray[0]).length}`);
}

// Main execution
if (require.main === module) {
  const dataDir = path.join(__dirname, '..', 'data');
  
  // Default paths
  const jsonFile = path.join(dataDir, 'global-variablesdemo.json');
  const excelFile = path.join(dataDir, 'test-data.xlsx');
  
  // Check command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'template';
  
  if (command === 'convert') {
    // Convert single JSON to Excel with one row
    const inputJson = args[1] || jsonFile;
    const outputExcel = args[2] || excelFile;
    jsonToExcel(inputJson, outputExcel);
  } else if (command === 'template') {
    // Create template with multiple rows
    const inputJson = args[1] || jsonFile;
    const outputExcel = args[2] || excelFile;
    const numRows = parseInt(args[3]) || 3;
    createExcelTemplate(inputJson, outputExcel, numRows);
  } else {
    console.log('Usage:');
    console.log('  node jsonToExcel.js convert [input.json] [output.xlsx]');
    console.log('  node jsonToExcel.js template [input.json] [output.xlsx] [numRows]');
    console.log('');
    console.log('Examples:');
    console.log('  node jsonToExcel.js template');
    console.log('  node jsonToExcel.js template ../data/global-variablesdemo.json ../data/test-data.xlsx 5');
    console.log('  node jsonToExcel.js convert ../data/global-variablesdemo.json ../data/test-data.xlsx');
  }
}

module.exports = {
  jsonToExcel,
  createExcelTemplate
};
