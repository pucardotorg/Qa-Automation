const fs = require('fs');
const path = require('path');
const { loadTestDataFromExcel, loadAndMoveToNextRow } = require('./excelHelper');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getEnvName() {
  return process.env.TEST_ENV || '';
}

function getDataDir() {
  return path.join(__dirname, '..', 'data');
}

function resolveGlobalsPath() {
  const env = getEnvName();
  const dataDir = getDataDir();
  return env
    ? path.join(dataDir, `global-variables${env}.json`)
    : path.join(dataDir, 'global-variables.json');
}

function loadGlobalVariables() {
  const env = getEnvName();
  const dataDir = getDataDir();

  // Check if Excel mode is enabled
  const useExcel = process.env.USE_EXCEL_DATA === 'true';
  const excelFile = process.env.EXCEL_FILE_PATH || path.join(dataDir, 'test-data.xlsx');
  const excelSheet = process.env.EXCEL_SHEET_NAME || null;

  console.log('DEBUG: useExcel =', useExcel);
  console.log('DEBUG: excelFile =', excelFile);
  console.log('DEBUG: file exists =', fs.existsSync(excelFile));
  console.log('DEBUG: absolute path =', path.resolve(excelFile));

  if (useExcel && fs.existsSync(excelFile)) {
    console.log(`Loading test data from Excel: ${excelFile}`);
    
    // Load from Excel and automatically move to next row
    const excelData = loadAndMoveToNextRow(excelFile, excelSheet);
    console.log('DEBUG: Excel data loaded:', JSON.stringify(excelData, null, 2));
    
    // Merge with JSON if it exists (Excel data takes precedence)
    const baseFile = path.join(dataDir, 'global-variables.json');
    let globals = {};
    if (fs.existsSync(baseFile)) {
      globals = loadJson(baseFile);
      console.log('DEBUG: JSON data loaded:', JSON.stringify(globals, null, 2));
    }

    if (env) {
      const envFile = path.join(dataDir, `global-variables${env}.json`);
      if (fs.existsSync(envFile)) {
        const overrides = loadJson(envFile);
        globals = { ...globals, ...overrides };
      }
    }

    // Excel data overrides JSON data
    const result = { ...globals, ...excelData };
    console.log('DEBUG: Final merged result:', JSON.stringify(result, null, 2));
    return result;
  }

  // Default JSON loading
  const baseFile = path.join(dataDir, 'global-variables.json');
  let globals = {};
  if (fs.existsSync(baseFile)) {
    globals = loadJson(baseFile);
  }

  if (env) {
    const envFile = path.join(dataDir, `global-variables${env}.json`);
    if (fs.existsSync(envFile)) {
      const overrides = loadJson(envFile);
      globals = { ...globals, ...overrides };
    }
  }

  return globals;
}

function saveGlobalVariables(updated) {
  // When using Excel data, don't write to JSON file
  // Just return the merged data for in-memory use
  const useExcel = process.env.USE_EXCEL_DATA === 'true';
  
  if (useExcel) {
    console.log('Excel mode: Skipping JSON file write, updating in-memory only');
    return updated;
  }
  
  // Normal JSON mode: write to file
  const filePath = resolveGlobalsPath();
  const current = fs.existsSync(filePath) ? loadJson(filePath) : {};
  const merged = { ...current, ...updated };
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
  return merged;
}

module.exports = {
  loadGlobalVariables,
  saveGlobalVariables,
  getEnvName,
};
