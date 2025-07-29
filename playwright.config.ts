import { defineConfig, devices } from '@playwright/test';


export default defineConfig({
  testDir: './UI Tests/tests',
 
  fullyParallel: true,
  
  forbidOnly: !!process.env.CI,
  
  retries: 1,

  workers: 1,

  reporter: 'html',
  
  use: {
    
    headless : false,
    launchOptions: {
      slowMo: 1000,  // Slow down execution by 1000ms
    },
    trace: 'on-first-retry',    
  },

  
 projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
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
