# Excel-Based Data-Driven Testing

This guide explains how to use Excel files for test data management in your Playwright automation tests.

## Overview

The Excel helper allows you to:
- Store test data in Excel files (easier to manage than JSON)
- Automatically iterate through rows for multiple test runs
- Add new test data rows without modifying code
- Track which row is currently being used

## Setup

### 1. Install Dependencies

```bash
cd ui-e2e
npm install
```

This will install the `xlsx` package required for reading Excel files.

### 2. Create Your Excel File

Create an Excel file at `ui-e2e/data/test-data.xlsx` with the following structure:

**First row should contain column headers** (these become the property names):
- baseURL
- citizenUsername
- citizenPassword
- litigantUsername
- litigantPassword
- complainantAge
- respondentFirstName
- respondentAddress
- ... (all other fields from your global-variables.json)

**Subsequent rows contain test data** - one row per test execution.

See `test-data-template.xlsx` for a complete example.

## Usage

### Method 1: Environment Variable (Recommended)

Run your tests with Excel data enabled:

```bash
# Use Excel data from default location (ui-e2e/data/test-data.xlsx)
USE_EXCEL_DATA=true npm test

# Use Excel data from custom location
USE_EXCEL_DATA=true EXCEL_FILE_PATH=/path/to/your/data.xlsx npm test

# Use specific sheet from Excel file
USE_EXCEL_DATA=true EXCEL_SHEET_NAME="TestData" npm test
```

### Method 2: Direct Import in Tests

```javascript
const { loadTestDataFromExcel, getAllTestDataFromExcel } = require('../helpers/excelHelper');
const path = require('path');

// Load current row data
const excelPath = path.join(__dirname, '../data/test-data.xlsx');
const testData = loadTestDataFromExcel(excelPath);

// Or get all rows for data-driven testing
const allTestData = getAllTestDataFromExcel(excelPath);
```

## How Row Iteration Works

1. **First Run**: Reads data from Row 1 (first data row after headers)
2. **Second Run**: Automatically moves to Row 2
3. **Third Run**: Moves to Row 3
4. **And so on...**

The current row index is stored in `ui-e2e/data/.excel-state.json`

### Reset Row Pointer

To start from the beginning again:

```bash
# Delete the state file
rm ui-e2e/data/.excel-state.json
```

Or programmatically:

```javascript
const { resetExcelRowPointer } = require('../helpers/excelHelper');
resetExcelRowPointer('./data/test-data.xlsx');
```

## Example Test Structure

```javascript
const { test } = require('@playwright/test');
const { loadGlobalVariables } = require('../../helpers/env');

test.describe('Excel Data-Driven Tests', () => {
  let globals;

  test.beforeAll(() => {
    // This will automatically load from Excel if USE_EXCEL_DATA=true
    globals = loadGlobalVariables();
    console.log('Test data loaded:', globals);
  });

  test('Test with Excel data', async ({ page }) => {
    // Use globals.citizenUsername, globals.baseURL, etc.
    console.log('Testing with user:', globals.citizenUsername);
  });
});
```

## Advanced Usage

### Run Multiple Tests with Different Data

Create a data-driven test that runs once per Excel row:

```javascript
const { getAllTestDataFromExcel } = require('../helpers/excelHelper');
const path = require('path');

const excelPath = path.join(__dirname, '../data/test-data.xlsx');
const allTestData = getAllTestDataFromExcel(excelPath);

allTestData.forEach((testData, index) => {
  test(`Test case ${index + 1} - ${testData.citizenUsername}`, async ({ page }) => {
    // Run test with testData
    console.log('Running test with:', testData);
  });
});
```

### Filter Specific Rows

```javascript
const { ExcelHelper } = require('../helpers/excelHelper');

const helper = new ExcelHelper('./data/test-data.xlsx');
const filteredData = helper.filterRows(row => row.baseURL.includes('demo'));
```

### Use Specific Sheet

```javascript
const helper = new ExcelHelper('./data/test-data.xlsx', 'TestDataSheet1');
const data = helper.getCurrentRowData();
```

## Excel File Structure Example

| baseURL | citizenUsername | citizenPassword | litigantUsername | complainantAge | respondentFirstName |
|---------|----------------|-----------------|------------------|----------------|---------------------|
| https://demo.pucar.org/ | 8827000000 | 123456 | 9032273758 | 22 | Automation Accused |
| https://demo.pucar.org/ | 8827000001 | 123456 | 9032273759 | 25 | Test Accused 2 |
| https://demo.pucar.org/ | 8827000002 | 123456 | 9032273760 | 30 | Test Accused 3 |

## Tips

1. **Column Names**: Must exactly match the property names in your code
2. **Empty Cells**: Will be treated as empty strings
3. **Data Types**: All data is read as strings, convert if needed
4. **File Format**: Supports .xlsx, .xls, .csv
5. **Multiple Sheets**: Specify sheet name if your Excel has multiple sheets

## Troubleshooting

### "Excel file not found" Error
- Check the file path is correct
- Ensure the file exists in `ui-e2e/data/` directory

### "Sheet not found" Error
- Verify the sheet name matches exactly (case-sensitive)
- Or don't specify a sheet name to use the first sheet

### Data Not Updating
- Check if `.excel-state.json` exists and delete it to reset
- Verify `USE_EXCEL_DATA=true` is set when running tests

### Column Names Don't Match
- Ensure Excel column headers exactly match your variable names
- No extra spaces in column headers
