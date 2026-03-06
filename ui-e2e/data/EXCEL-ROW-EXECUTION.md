# Excel Row Execution Issue - Explained

## The Problem

When running tests with Excel data enabled, only **one row** is executed per test run, even though your Excel file has multiple rows.

### Why This Happens

The test file uses `test.beforeAll()` which **executes only once** before all tests in the suite:

```javascript
test.beforeAll(() => {
  globals = loadGlobalVariables();  // This runs ONCE
  // ...
});
```

When `loadGlobalVariables()` is called with Excel mode enabled, it:
1. Loads data from the current row (e.g., Row 1)
2. Automatically moves the pointer to the next row (Row 2)
3. Returns the data from Row 1

Since `beforeAll()` runs only once, all 22 test cases in the suite use the **same data from Row 1**. The pointer is now at Row 2, but that data won't be used until you run the entire suite again.

## Solutions

### Solution 1: Run Tests Multiple Times (Original Design)

Run the test suite separately for each row:

```bash
# First run - uses Row 1
npm run test:excel

# Second run - uses Row 2
npm run test:excel

# Third run - uses Row 3
npm run test:excel
```

**Pros:**
- No code changes needed
- Simple to understand

**Cons:**
- Manual process
- Need to run command multiple times

---

### Solution 2: Run All Rows Automatically (Recommended)

Use the new helper script that automatically runs tests for all Excel rows:

```bash
# Run all rows in one command
npm run test:excel:all

# Or run all rows and continue even if one fails
npm run test:excel:all:continue

# Run specific test file with all rows
node helpers/runAllExcelRows.js tests/flows/1-normalFullCaseFlow.spec.js
```

**How it works:**
1. Reads total number of rows from Excel
2. Resets row pointer to start
3. Runs the entire test suite for Row 1
4. Moves pointer to Row 2
5. Runs the entire test suite for Row 2
6. Continues until all rows are processed

**Pros:**
- Fully automated
- Processes all rows in one execution
- Clear progress reporting
- Option to continue on errors

**Cons:**
- Takes longer (runs entire suite per row)
- Sequential execution only

---

### Solution 3: Data-Driven Tests (Advanced)

Modify your test file to create separate test suites for each row:

```javascript
const { getAllTestDataFromExcel } = require('../../helpers/excelHelper');

const useExcel = process.env.USE_EXCEL_DATA === 'true';
const excelFile = path.join(__dirname, '../../data/test-data.xlsx');

if (useExcel) {
  const allTestData = getAllTestDataFromExcel(excelFile);
  
  allTestData.forEach((rowData, rowIndex) => {
    test.describe.serial(`Full Case Flow - Row ${rowIndex + 1}`, () => {
      let globals;
      
      test.beforeAll(() => {
        globals = { ...loadGlobalVariables(), ...rowData };
      });
      
      // All your test cases here...
    });
  });
}
```

**Pros:**
- All rows run in single execution
- Parallel execution possible (if tests are independent)
- Better test reporting per row

**Cons:**
- Requires modifying test files
- More complex code structure

---

## Recommended Approach

For your current setup, **Solution 2** is recommended:

```bash
# Apply the proposed changes to:
# - helpers/env.js (remove auto-increment)
# - helpers/runAllExcelRows.js (new file)
# - package.json (new scripts)

# Then run:
npm run test:excel:all
```

This will automatically run your test suite for both rows in your Excel file without any manual intervention.

## Verifying Your Excel Data

Before running tests, verify your Excel file has the correct data:

```bash
npm run excel:verify
```

## Resetting Row Pointer

If you need to start from the beginning:

```bash
npm run excel:reset
```

## Current Behavior Summary

| Command | Rows Executed | Behavior |
|---------|---------------|----------|
| `npm run test:excel` | 1 row | Runs once with current row, moves pointer |
| `npm run test:excel:all` | All rows | Runs suite for each row automatically |
| `npm run test:excel:all:continue` | All rows | Continues even if a row fails |
