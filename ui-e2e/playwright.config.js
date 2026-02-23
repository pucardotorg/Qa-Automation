// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// ─── Resolve environment config file ──────────────────────────────────────────
//
//  TEST_ENV=qa    → data/global-variablesqa.json   (QA environment)
//  TEST_ENV=demo  → data/global-variablesdemo.json  (Demo environment)
//  (no TEST_ENV)  → data/global-variables.json      (default / local)
//
const env = (process.env.TEST_ENV || '').trim().toLowerCase();
const dataDir = path.join(__dirname, 'data');
const cfgFile = env
  ? path.join(dataDir, `global-variables${env}.json`)
  : path.join(dataDir, 'global-variables.json');

if (!fs.existsSync(cfgFile)) {
  throw new Error(
    `[playwright.config] Config file not found: ${cfgFile}\n` +
    `  Set TEST_ENV to a valid environment name (qa | demo) or leave it empty.`
  );
}

const globals = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
const BASE_URL = globals.baseURL || 'http://localhost:3000/';

console.log(`[playwright.config] Environment : ${env || 'default'}`);
console.log(`[playwright.config] Config file : ${cfgFile}`);
console.log(`[playwright.config] Base URL    : ${BASE_URL}`);

// ─── Playwright configuration ──────────────────────────────────────────────────

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  timeout: 1800000,
  workers: 1,
  retries: 1,
  reporter: 'html',

  use: {
    baseURL: BASE_URL,
    headless: true,
    launchOptions: {
      slowMo: 500,
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
