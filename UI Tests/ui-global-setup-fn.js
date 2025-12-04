const fs = require('fs');
const path = require('path');

async function uiGlobalSetupFn() {
  const envRaw = (process.env.UI_ENV || process.env.TEST_ENV || 'qa').toString();
  const env = envRaw.trim().toLowerCase();

  const uiDir = __dirname; // UI Tests directory
  const baseFile = path.join(uiDir, 'global-variables.json');
  // e.g., DEV -> global-variablesdev.json; QA -> global-variablesqa.json; UAT -> global-variablesuat.json
  const overrideCandidate = path.join(uiDir, `global-variables${env}.json`);

  console.log(`[ui-global-setup-fn] UI_ENV/TEST_ENV resolved to: ${envRaw}`);
  console.log(`[ui-global-setup-fn] Base file: ${path.basename(baseFile)}`);

  // Load base
  let base = {};
  try {
    if (fs.existsSync(baseFile)) {
      base = JSON.parse(fs.readFileSync(baseFile, 'utf8')) || {};
    } else {
      console.warn('[ui-global-setup-fn] Base file not found; starting from empty object');
    }
  } catch (e) {
    console.error('[ui-global-setup-fn] Error reading base file:', e);
    base = {};
  }

  // Load override if present
  let overrides = {};
  if (fs.existsSync(overrideCandidate)) {
    try {
      overrides = JSON.parse(fs.readFileSync(overrideCandidate, 'utf8')) || {};
      console.log(`[ui-global-setup-fn] Applied overrides from ${path.basename(overrideCandidate)}`);
    } catch (e) {
      console.error('[ui-global-setup-fn] Error reading override file:', e);
      overrides = {};
    }
  } else {
    console.log('[ui-global-setup-fn] No env-specific override file found; skipping overrides');
  }

  // Shallow merge (override wins)
  const merged = { ...base, ...overrides };

  // Persist merged back to base file so tests that read global-variables.json see env-specific values
  try {
    fs.writeFileSync(baseFile, JSON.stringify(merged, null, 2));
    console.log(`[ui-global-setup-fn] Wrote merged variables to ${path.basename(baseFile)}`);
  } catch (e) {
    console.error('[ui-global-setup-fn] Error writing merged variables:', e);
  }
}

module.exports = uiGlobalSetupFn;
