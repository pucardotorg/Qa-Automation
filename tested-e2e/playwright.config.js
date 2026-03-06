const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

// Allow headed mode via env: HEADED=1
const headed = process.env.HEADED === '1' || process.env.HEADED === 'true';

module.exports = defineConfig({
  testDir: path.resolve(__dirname, './tests'),
  timeout: 1800000,
  retries: 1,
  workers: 1,
  reporter: [['html', { outputFolder: path.resolve(__dirname, './reports/html') }]],
  outputDir: path.resolve(__dirname, './test-results'),

  use: {
    headless: !headed,
    viewport: { width: 1920, height: 1080 },
    trace: 'on-first-retry',
    launchOptions: {
      slowMo: headed ? 300 : 100,
      args: [
        '--start-maximized',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
