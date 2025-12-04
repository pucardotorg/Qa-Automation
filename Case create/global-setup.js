const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function globalSetup() {
  const env = (process.env.TEST_ENV || 'qa').toLowerCase();
  const baseFile = path.join(__dirname, 'global-variables.json');
  const overrideFile = path.join(__dirname, `global-variables.overrides.${env}.json`);

  console.log(`[global-setup] TEST_ENV=${env}`);

  // Load existing base variables if present
  let base = {};
  try {
    if (fs.existsSync(baseFile)) {
      base = JSON.parse(fs.readFileSync(baseFile, 'utf8')) || {};
    }
  } catch (e) {
    console.warn('[global-setup] Could not read base global-variables.json, starting empty');
    base = {};
  }

  // Load overrides if present and merge (shallow)
  try {
    if (fs.existsSync(overrideFile)) {
      const overrides = JSON.parse(fs.readFileSync(overrideFile, 'utf8')) || {};
      base = { ...base, ...overrides };
      console.log(`[global-setup] Applied overrides from ${path.basename(overrideFile)}`);

      // Ensure baseURL from override wins deterministically
      if (overrides.baseURL) {
        base.baseURL = overrides.baseURL;
      }

      // Normalize filestore: prefer explicit 'filestore' in overrides; otherwise map env-specific to common key
      if (overrides.filestore && typeof overrides.filestore === 'object') {
        base.filestore = overrides.filestore;
      } else if (env === 'uat' && overrides.UATfilestore) {
        base.filestore = overrides.UATfilestore;
      } else if (env === 'qa' && overrides.QAfilestore) {
        base.filestore = overrides.QAfilestore;
      }else if (env === 'dev' && overrides.DEVfilestore) {
        base.filestore = overrides.DEVfilestore;
      }
    } else {
      console.log('[global-setup] No override file found for env, continuing with base variables');
    }
  } catch (e) {
    console.error('[global-setup] Error reading override file:', e);
  }

  // If not set by overrides, fall back to env-specific keys present in base
  if (!base.filestore) {
    if (env === 'uat' && base.UATfilestore) {
      base.filestore = base.UATfilestore;
    } else if (env === 'qa' && base.QAfilestore) {
      base.filestore = base.QAfilestore;
    }else if (env === 'dev' && base.DEVfilestore) {
      base.filestore = base.DEVfilestore;
    }
  }

  // Log resolved baseURL for visibility
  console.log(`[global-setup] baseURL after merge: ${base.baseURL}`);

  // Persist merged variables back so tests reading JSON directly see env-specific values
  try {
    fs.writeFileSync(baseFile, JSON.stringify(base, null, 2));
    console.log(`[global-setup] Wrote merged variables to ${path.basename(baseFile)}`);
  } catch (e) {
    console.error('[global-setup] Error writing merged variables:', e);
  }
}

module.exports = globalSetup;