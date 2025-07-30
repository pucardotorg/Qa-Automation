import { test, expect } from '@playwright/test';
import globalVars from '../../global-variables.json';

test('Fso Login Test', async ({ page }) => {
  // Navigate to the employee login page
  console.log('Navigating to Fso login page...');
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

  // search case
  await page.locator('input[name="caseSearchText"]').click();
  await page.locator('input[name="caseSearchText"]').fill(globalVars.filingNumber);
  await page.getByRole('button').filter({ hasText: 'Search' }).click();
  // name of the case
  await page.getByRole('cell', { name: `${globalVars.filingNumber}` }).click();
  await page.locator('div:nth-child(3) > .field > .accordion-wrapper > .accordion-item > .accordion-content > div > .item-body > div:nth-child(7) > .text > .flag > svg').click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('DEFECT1');
  await page.getByRole('button', { name: 'Mark Defect' }).click();
  await page.getByRole('button', { name: 'Send Back for Correction' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
});