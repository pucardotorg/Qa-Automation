// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// ─── Resolve environment config file ──────────────────────────────────────────
//
// Always reads from data/global-variables.json.
// The CSV runner (run-all-flows.js) writes the correct environment's data there
// before each spec file runs, using the Test_Env column in test-data.csv to
// select which rows match the TEST_ENV variable.
//
const dataDir = path.join(__dirname, 'data');
const cfgFile = path.join(dataDir, 'global-variables.json');

if (!fs.existsSync(cfgFile)) {
  throw new Error(
    `[playwright.config] Config file not found: ${cfgFile}\n` +
    `  Run: TEST_ENV=qa node tests/flows/run-all-flows.js\n` +
    `  to load test data from test-data.csv into global-variables.json first.`
  );
}

const globals = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
const BASE_URL = globals.baseURL || 'http://localhost:3000/';
const env = (process.env.TEST_ENV || '').trim().toLowerCase();

console.log(`[playwright.config] Environment : ${env || 'default'}`);
console.log(`[playwright.config] Config file : ${cfgFile}`);
console.log(`[playwright.config] Base URL    : ${BASE_URL}`);

// ─── Playwright configuration ──────────────────────────────────────────────────

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  timeout: 1800000,
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? 'list' : 'html',

  use: {
    baseURL: BASE_URL,
    headless: process.env.HEADED !== '1',
    navigationTimeout: 120000, // 120 seconds for all page.goto() calls
    actionTimeout: 60000,      // 60 seconds for all actions (click, fill, etc.)
    launchOptions: {
      slowMo: process.env.HEADED === '1' ? 200 : 0,
      args: ['--start-maximized', '--disable-web-security'],
    },
    viewport: { width: 1920, height: 1080 },
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
