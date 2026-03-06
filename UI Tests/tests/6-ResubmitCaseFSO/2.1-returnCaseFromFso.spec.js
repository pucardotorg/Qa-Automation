import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
const globalVarsPath = path.join(__dirname, '../../global-variables.json');
let globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

test('Fso Login Test', async ({ page }) => {
  test.setTimeout(180000);
  // Navigate to the employee login page
   console.log('Navigating to FSO login page...');
    test.setTimeout(180000);
  await page.goto(globalVars.baseURL + 'ui/employee/user/login');
  await page.waitForLoadState('networkidle');

  // Verify the page title
  const title = await page.title();
  console.log('Page title:', title);

  // Enter username
  console.log('Entering username...');
  const usernameInput = page.locator('input[name="username"]');
  await expect(usernameInput).toBeVisible({ timeout: 10000 });
  await usernameInput.fill(globalVars.fsoUsername);
  console.log('Entered username:', globalVars.fsoUsername);

  // Enter password
  console.log('Entering password...');
  const passwordInput = page.locator('input[name="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await passwordInput.fill(globalVars.fsoPassword);
  console.log('Entered password');

  // Click Continue button
  console.log('Looking for Continue button...');
  const continueButton = page.getByRole('button', { name: 'Continue' }).or(
    page.locator('button:has-text("Continue")')
  );
  await expect(continueButton).toBeVisible({ timeout: 10000 });
  await continueButton.click();
  console.log('Clicked Continue button');

  // Wait for home page to load
  console.log('Waiting for home page to load...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000); // Additional wait to ensure page is fully loaded

  // Verify successful login by checking URL or some element on home page
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);

  await page.getByText('Scrutinise Cases').click();

  // Log completion
  console.log('Searching for case...');
  
  // Set the case ID to search for
  const caseId = globalVars.filingNumber;

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Find and fill the Case Name or ID field using updated XPath
  await page.locator('input[name="caseSearchText"]').click();
  await page.locator('input[name="caseSearchText"]').fill(globalVars.filingNumber);
  await page.getByRole('button').filter({ hasText: 'Search' }).click();
  await page.waitForTimeout(2000);



  await page.getByText(`vs`).first().click();

  // Wait for the page to load after clicking the case ID
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(18000); 
  // Add some wait before proceeding
  await page.locator('div:nth-child(3) > .field > .accordion-wrapper > .accordion-item > .accordion-content > div > .item-body > div:nth-child(7) > .text > .flag > svg').click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('DEFECT1');
  console.log("identified the fso field");
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Mark Defect' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Send Back for Correction' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(2000);
});