import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// ✅ Load environment variables before exporting config
dotenv.config({ override: false });

export default defineConfig({
  testDir: './Case create/tests',

  timeout: 60000,

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

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

  // Optional: Start a local dev server before running tests
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
