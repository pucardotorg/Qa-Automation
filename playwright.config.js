import { defineConfig, devices } from '@playwright/test';


export default defineConfig({
  testDir: './UI Tests/tests',
 
  fullyParallel: true,
  
  forbidOnly: !!process.env.CI,
  
  retries: 1,

  workers: 1,

  timeout: 7 * 60 * 1000, // 7 minutes test timeout

  reporter: 'html',
  
  use: {
    
    headless : true,
    launchOptions: {
      slowMo: 1000,  // Slow down execution by 1000ms
      args: [
        '--start-maximized',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    },
    viewport: { width: 1920, height: 1080 },  // Set to common full HD resolution
    trace: 'on-first-retry',    
  },

  
 projects: [
    {
      name: 'chromium',
      use: { 
        viewport: null  // Use actual browser window size
      },
      workers: 1
 
    },
 
 


  

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
