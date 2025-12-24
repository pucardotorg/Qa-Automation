# Quick Start: Excel-Based Testing

## Step 1: Install Dependencies

```bash
cd /home/bhlp0121/Qa-Automation/ui-e2e
npm install
```

## Step 2: Convert Your JSON Data to Excel

Run this command to create an Excel file with 3 sample rows from your existing JSON:

```bash
cd helpers
node jsonToExcel.js template
```

This will create `ui-e2e/data/test-data.xlsx` with 3 rows of test data.

**Want more rows?** Specify the number:
```bash
node jsonToExcel.js template ../data/global-variablesdemo.json ../data/test-data.xlsx 5
```

## Step 3: Edit Your Excel File

1. Open `ui-e2e/data/test-data.xlsx` in Excel or LibreOffice
2. You'll see your test data with column headers in the first row
3. Modify the data in each row as needed
4. Add more rows by copying and pasting existing rows
5. Save the file

## Step 4: Run Tests with Excel Data

```bash
cd /home/bhlp0121/Qa-Automation/ui-e2e

# Run tests using Excel data
USE_EXCEL_DATA=true npm test

# Run specific test file
USE_EXCEL_DATA=true npx playwright test tests/flows/1-normalFullCaseFlow.spec.js

# Run in headed mode to see the browser
USE_EXCEL_DATA=true npm run test:headed
```

## Step 5: Run Tests Again (Next Row)

Each time you run the tests, it will automatically use the next row from your Excel file:

- **1st run**: Uses Row 1 data
- **2nd run**: Uses Row 2 data  
- **3rd run**: Uses Row 3 data
- And so on...

## Step 6: Reset to Start Over

To start from the first row again:

```bash
rm /home/bhlp0121/Qa-Automation/ui-e2e/data/.excel-state.json
```

## Example Workflow

```bash
# 1. Create Excel with 5 test data sets
cd /home/bhlp0121/Qa-Automation/ui-e2e/helpers
node jsonToExcel.js template ../data/global-variablesdemo.json ../data/test-data.xlsx 5

# 2. Edit test-data.xlsx with your test cases

# 3. Run test with first data set
cd ..
USE_EXCEL_DATA=true npm test

# 4. Run test with second data set (automatically)
USE_EXCEL_DATA=true npm test

# 5. Run test with third data set (automatically)
USE_EXCEL_DATA=true npm test

# And so on...
```

## Adding More Test Data Later

1. Open `test-data.xlsx`
2. Go to the last row with data
3. Copy that row
4. Paste it in the next empty row
5. Modify the values
6. Save the file
7. Run your tests - the new row will be picked up automatically!

## Switching Back to JSON

Simply run tests without the `USE_EXCEL_DATA` flag:

```bash
npm test
```

This will use your original JSON files instead.

## Tips

- **Keep your Excel file organized**: Use meaningful data in each row
- **Document your test cases**: Add a "TestCaseName" or "Description" column
- **Version control**: Commit your Excel file to git so team members can use it
- **Backup**: Keep a copy of your Excel file before making major changes
