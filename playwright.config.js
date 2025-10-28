import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// ✅ Load environment variables before exporting config
const TEST_ENV = (process.env.TEST_ENV || 'qa').toLowerCase();
const envFilePath = path.resolve(__dirname, 'Case create', `.env.${TEST_ENV}`);
dotenv.config({ path: envFilePath, override: true });

export default defineConfig({
  testDir: './Case create/tests',

  timeout: 60000,

  fullyParallel: true,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    headless: true,
    launchOptions: {
      slowMo: 1000, // Slow down execution by 1000ms
    },
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Ensure env-specific global variables are prepared before tests
  globalSetup: './Case create/global-setup.js',

  // Optional: Start a local dev server before running tests
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
