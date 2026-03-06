const fs = require('fs');
const path = require('path');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getEnvName() {
  // Prefer TEST_ENV environment variable (qa/uat/dev), default to none
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

  // Default file
  const baseFile = path.join(dataDir, 'global-variables.json');
  let globals = {};
  if (fs.existsSync(baseFile)) {
    globals = loadJson(baseFile);
  }

  // Optional env-specific override e.g., global-variablesqa.json
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
