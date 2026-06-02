/**
 * env.js — Global variable loader
 *
 * All tests read from and write to data/global-variables.json.
 * The CSV runner (run-all-flows.js) populates that file from test-data.csv
 * before each spec runs, selecting the correct environment rows via TEST_ENV.
 *
 * TEST_ENV is used by run-all-flows.js to pick which CSV rows to run —
 * it does NOT change which JSON file is loaded here.
 */

const fs = require('fs');
const path = require('path');

// ─── Internal helpers ──────────────────────────────────────────────────────────

function getDataDir() {
  return path.join(__dirname, '..', 'data');
}

/**
 * Returns the raw environment name from TEST_ENV (e.g. "qa", "demo", "").
 */
function getEnvName() {
  return (process.env.TEST_ENV || '').trim().toLowerCase();
}

/**
 * Returns the canonical globals file path.
 * Always global-variables.json — the CSV runner writes there before each flow.
 */
function resolveGlobalsPath() {
  return path.join(getDataDir(), 'global-variables.json');
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `[env.js] Config file not found: ${filePath}\n` +
      `  Set TEST_ENV to a valid environment name or create the file.\n` +
      `  Available envs: qa, demo (or leave TEST_ENV empty for default).`
    );
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Loads global variables from the environment-specific JSON file.
 * Logs which file is being used so runs are easy to trace.
 *
 * @returns {Object} Merged globals object
 */
function loadGlobalVariables() {
  const filePath = resolveGlobalsPath();
  const env = getEnvName() || 'default';

  console.log(`[env] Environment : ${env}`);
  console.log(`[env] Config file : ${filePath}`);

  const globals = readJson(filePath);

  console.log(`[env] Loaded ${Object.keys(globals).length} variables`);
  return globals;
}

/**
 * Persists updated variables back to the active environment's JSON file.
 * Only the keys present in `updated` are merged/overwritten; all other
 * existing keys are preserved.
 *
 * @param {Object} updated - Key/value pairs to save
 * @returns {Object} The merged globals after saving
 */
function saveGlobalVariables(updated) {
  const filePath = resolveGlobalsPath();
  const current = fs.existsSync(filePath) ? readJson(filePath) : {};
  const merged = { ...current, ...updated };
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
  return merged;
}

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  loadGlobalVariables,
  saveGlobalVariables,
  getEnvName,
  resolveGlobalsPath,
};
