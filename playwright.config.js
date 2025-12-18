 import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables for Case Create suite (safe even if UI Tests run)
const TEST_ENV = (process.env.TEST_ENV || 'qa').toLowerCase();
const envFilePath = path.resolve(__dirname, 'Case create', `.env.${TEST_ENV}`);
dotenv.config({ path: envFilePath, override: true });

export default defineConfig({
  fullyParallel: true,
  // Keep generous timeout from UI Tests to accommodate long flows
  timeout: 18000000,
  // Keep a single worker by default to reduce flakiness; override via CLI if needed
  workers: 1,
  // Keep a single retry similar to UI Tests
  retries: 1,
  reporter: 'html',

  use: {
    headless: true,
    launchOptions: {
      slowMo: 1000,
      args: [
        '--start-maximized',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    },
    viewport: { width: 1920, height: 1080 },
    trace: 'on-first-retry',
  },

  // Run suites as separate projects so you can execute one or more:
  // - npx playwright test -p case-create
  // - npx playwright test -p ui-tests
  // - npx playwright test -p tested-e2e
  projects: [
    {
      name: 'case-create',
      testDir: './Case create/tests',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui-tests',
      testDir: './UI Tests/tests',
      use: {
        viewport: { width: 1920, height: 1080 },
      },
      workers: 1,
    },
    {
      name: 'tested-e2e',
      testDir: './tested-e2e/tests',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
      workers: 1,
    },
  ],

  // Ensure env-specific global variables are prepared before tests (all suites)
  globalSetup: './combined-global-setup.js',

  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
