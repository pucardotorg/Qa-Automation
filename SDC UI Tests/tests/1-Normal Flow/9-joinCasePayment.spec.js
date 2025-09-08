import { test, expect } from '@playwright/test';
import globalVars from '../../global-variables.json';

test('JOIN CASE PAYMENT', async ({ browser }) => {
  // Create a new context with HTTPS errors ignored
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();
  
  // Navigate to the employee login page
  console.log('Navigating to Nm login page...');
  await page.goto(globalVars.baseURL + 'ui/employee/user/login');
  await page.waitForLoadState('networkidle');

  // Verify the page title
  const title = await page.title();
  console.log('Page title:', title);

  // Enter username
  console.log('Entering username...');
  const usernameInput = page.locator('input[name="username"]');
  await expect(usernameInput).toBeVisible({ timeout: 10000 });
  await usernameInput.fill(globalVars.nayamitraUsername);
  console.log('Entered username:', globalVars.nayamitraUsername);

  // Enter password
  console.log('Entering password...');
  const passwordInput = page.locator('input[name="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await passwordInput.fill(globalVars.nayamitraPassword);
  console.log('Entered password');

  // Click Continue button
  console.log('Looking for Continue button...');
  const continueButton = page.getByRole('button', { name: 'Continue' }).or(
    page.locator('button:has-text("Continue")')
  );
  await expect(continueButton).toBeVisible({ timeout: 10000 });
  await continueButton.click();
  console.log('Clicked Continue button');

  // 
  await page.getByRole('button').filter({ hasText: 'View Pending Payments' }).click();
  await page.locator('input[name="caseTitleFilingNumber"]').click();
  await page.locator('input[name="caseTitleFilingNumber"]').fill(globalVars.cmpNumber);
  await page.getByRole('button').filter({ hasText: 'Search' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: `${globalVars.cmpNumber}` }).click();
  await page.locator('div').filter({ hasText: /^Mode of Payment$/ }).locator('path').nth(1).click();
  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Stamp' }).click();
  await page.waitForTimeout(5000);
  await page.getByRole('button').click();
  await page.waitForTimeout(5000);
  
  // Close the context
  await context.close();
});