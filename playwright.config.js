import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  timeout: 7 * 60 * 1000, // 7 minutes test timeout
  reporter: 'html',
  
  use: {
    headless: false,
    launchOptions: {
      slowMo: 1000,
      args: [
        '--start-maximized',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--ignore-certificate-errors-spki-list',
        '--allow-running-insecure-content'
      ]
    },
    viewport: { width: 1850, height: 980 },
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        viewport: null,
        ignoreHTTPSErrors: true,
        launchOptions: {
          args: [
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-web-security',
            '--allow-running-insecure-content'
          ]
        }
      },
      workers: 1
    },
  ],
});
