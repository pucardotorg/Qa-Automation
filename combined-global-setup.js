// Combined global setup to merge env variables for both suites
// Runs Case create/global-setup.js and UI Tests/ui-global-setup-fn.js

const path = require('path');

module.exports = async function combinedGlobalSetup(config) {
  const cwd = __dirname;
  const caseSetupPath = path.join(cwd, 'Case create', 'global-setup.js');
  const uiSetupPath = path.join(cwd, 'UI Tests', 'ui-global-setup-fn.js');

  // Resolve TEST_ENV/UI_ENV consistently
  const envRaw = (process.env.UI_ENV || process.env.TEST_ENV || 'qa').toString();
  process.env.TEST_ENV = envRaw.toLowerCase();

  console.log(`[combined-global-setup] Starting with TEST_ENV=${process.env.TEST_ENV}`);

  // Run Case Create merge
  try {
    const caseSetup = require(caseSetupPath);
    if (typeof caseSetup === 'function') {
      await caseSetup(config);
      console.log('[combined-global-setup] Completed Case create/global-setup.js');
    } else {
      console.warn('[combined-global-setup] Case setup did not export a function');
    }
  } catch (e) {
    console.error('[combined-global-setup] Error running Case create/global-setup.js:', e);
  }

  // Run UI Tests merge
  try {
    const uiSetup = require(uiSetupPath);
    if (typeof uiSetup === 'function') {
      await uiSetup(config);
      console.log('[combined-global-setup] Completed UI Tests/ui-global-setup-fn.js');
    } else {
      console.warn('[combined-global-setup] UI setup did not export a function');
    }
  } catch (e) {
    console.error('[combined-global-setup] Error running UI Tests/ui-global-setup-fn.js:', e);
  }
};
