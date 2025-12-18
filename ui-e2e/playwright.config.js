// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 1800000,
  workers: 1,
  retries: 1,
  reporter: 'html',
  use: {
    headless: true,
    launchOptions: {
      slowMo: 500,
      args: ['--start-maximized', '--disable-web-security']
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
