import { test, expect } from '@playwright/test';

test('Nm Login Test', async ({ page }) => {
  // Navigate to the employee login page
  console.log('Navigating to Nm login page...');
  await page.goto('https://dristi-kerala-uat.pucar.org/ui/employee/user/login');
  await page.waitForLoadState('networkidle');

  // Verify the page title
  const title = await page.title();
  console.log('Page title:', title);

  // Enter username
  console.log('Entering username...');
  const usernameInput = page.locator('input[name="username"]');
  await expect(usernameInput).toBeVisible({ timeout: 10000 });
  await usernameInput.fill('michaelGeorgeNm');
  console.log('Entered username: michaelGeorgeNm');

  // Enter password
  console.log('Entering password...');
  const passwordInput = page.locator('input[name="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await passwordInput.fill('Beehyv@123');
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
  await page.locator('input[name="caseTitleFilingNumber"]').fill('KL-002283-2025');
  await page.getByRole('button').filter({ hasText: 'Search' }).click();
  await page.getByRole('link', { name: 'Iknoor vs Accused One' }).click();
  await page.locator('div').filter({ hasText: /^Mode of Payment$/ }).locator('path').nth(1).click();
  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Stamp' }).click();
  await page.waitForTimeout(10000);
  await page.getByRole('button').click();
  await page.waitForTimeout(10000);
});