const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Excel Helper for Data-Driven Testing
 * Reads test data from Excel files and manages row iteration
 */
class ExcelHelper {
  constructor(excelFilePath, sheetName = null) {
    this.excelFilePath = excelFilePath;
    this.sheetName = sheetName;
    this.workbook = null;
    this.currentRowIndex = 0;
    this.testData = [];
    this.stateFilePath = path.join(path.dirname(excelFilePath), '.excel-state.json');
  }

  /**
   * Load Excel file and parse data
   */
  loadExcelData() {
    if (!fs.existsSync(this.excelFilePath)) {
      throw new Error(`Excel file not found: ${this.excelFilePath}`);
    }

    this.workbook = XLSX.readFile(this.excelFilePath);
    
    // Use specified sheet or first sheet
    const sheet = this.sheetName 
      ? this.workbook.Sheets[this.sheetName]
      : this.workbook.Sheets[this.workbook.SheetNames[0]];

    if (!sheet) {
      throw new Error(`Sheet not found: ${this.sheetName || 'first sheet'}`);
    }

    // Convert sheet to JSON with header row
    // The first row is automatically treated as headers
    this.testData = XLSX.utils.sheet_to_json(sheet, { 
      raw: false,
      defval: '',
      header: 1 // Read as array first to check structure
    });

    // Check if we have data
    if (this.testData.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Convert to object format using first row as headers
    const headers = this.testData[0];
    const dataRows = this.testData.slice(1); // Skip header row
    
    this.testData = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    }).filter(row => {
      // Filter out completely empty rows
      return Object.values(row).some(val => val !== '');
    });

    console.log(`Loaded ${this.testData.length} data rows from Excel file (excluding header)`);
    return this.testData;
  }

  /**
   * Get current row index from state file
   */
  getCurrentRowIndex() {
    if (fs.existsSync(this.stateFilePath)) {
      const state = JSON.parse(fs.readFileSync(this.stateFilePath, 'utf8'));
      return state.currentRowIndex || 0;
    }
    return 0;
  }

  /**
   * Save current row index to state file
   */
  saveCurrentRowIndex(index) {
    const state = { currentRowIndex: index };
    fs.writeFileSync(this.stateFilePath, JSON.stringify(state, null, 2));
  }

  /**
   * Reset row index to start from beginning
   */
  resetRowIndex() {
    this.currentRowIndex = 0;
    this.saveCurrentRowIndex(0);
    console.log('Row index reset to 0');
  }

  /**
   * Get data for the current row
   */
  getCurrentRowData() {
    this.currentRowIndex = this.getCurrentRowIndex();
    
    if (this.testData.length === 0) {
      this.loadExcelData();
    }

    if (this.currentRowIndex >= this.testData.length) {
      console.log('All rows processed. Resetting to first row.');
      this.resetRowIndex();
    }

    const rowData = this.testData[this.currentRowIndex];
    console.log(`Using data from row ${this.currentRowIndex + 1}:`, rowData);
    return rowData;
  }

  /**
   * Move to next row and return its data
   */
  getNextRowData() {
    this.currentRowIndex = this.getCurrentRowIndex();
    this.currentRowIndex++;
    
    if (this.currentRowIndex >= this.testData.length) {
      console.log('Reached end of data. Resetting to first row.');
      this.currentRowIndex = 0;
    }

    this.saveCurrentRowIndex(this.currentRowIndex);
    return this.getCurrentRowData();
  }

  /**
   * Get data for a specific row by index (0-based)
   */
  getRowDataByIndex(index) {
    if (this.testData.length === 0) {
      this.loadExcelData();
    }

    if (index < 0 || index >= this.testData.length) {
      throw new Error(`Invalid row index: ${index}. Valid range: 0-${this.testData.length - 1}`);
    }

    return this.testData[index];
  }

  /**
   * Get all test data rows
   */
  getAllRows() {
    if (this.testData.length === 0) {
      this.loadExcelData();
    }
    return this.testData;
  }

  /**
   * Get total number of data rows
   */
  getRowCount() {
    if (this.testData.length === 0) {
      this.loadExcelData();
    }
    return this.testData.length;
  }

  /**
   * Filter rows based on a condition
   */
  filterRows(filterFn) {
    if (this.testData.length === 0) {
      this.loadExcelData();
    }
    return this.testData.filter(filterFn);
  }

  /**
   * Get available sheet names
   */
  getSheetNames() {
    if (!this.workbook) {
      this.workbook = XLSX.readFile(this.excelFilePath);
    }
    return this.workbook.SheetNames;
  }
}

/**
 * Load test data from Excel file for current row
 */
function loadTestDataFromExcel(excelFilePath, sheetName = null) {
  const helper = new ExcelHelper(excelFilePath, sheetName);
  return helper.getCurrentRowData();
}

/**
 * Load test data from Excel file and move to next row
 */
function loadAndMoveToNextRow(excelFilePath, sheetName = null) {
  const helper = new ExcelHelper(excelFilePath, sheetName);
  const currentData = helper.getCurrentRowData();
  helper.getNextRowData(); // Move pointer to next row for next test run
  return currentData;
}

/**
 * Get all test data rows from Excel (useful for data-driven tests)
 */
function getAllTestDataFromExcel(excelFilePath, sheetName = null) {
  const helper = new ExcelHelper(excelFilePath, sheetName);
  return helper.getAllRows();
}

/**
 * Reset Excel row pointer to start from beginning
 */
function resetExcelRowPointer(excelFilePath) {
  const helper = new ExcelHelper(excelFilePath);
  helper.resetRowIndex();
}

module.exports = {
  ExcelHelper,
  loadTestDataFromExcel,
  loadAndMoveToNextRow,
  getAllTestDataFromExcel,
  resetExcelRowPointer
};
