import { test, expect } from '@playwright/test';
import globalVariables from '../../global-variables.json';

test('Register Case Test', async ({ page }) => {
  // Navigate to the employee login page
  console.log('Navigating to employee login page...');
  await page.goto(`${globalVariables.baseURL}ui/employee/user/login`);
  await page.waitForLoadState('networkidle');

  // Enter username
  console.log('Entering username...');
  const usernameInput = page.locator('input[name="username"]');
  //await expect(usernameInput).toBeVisible({ timeout: 10000 });
  await usernameInput.fill(globalVariables.judgeUsername);
  console.log(`Entered username: ${globalVariables.judgeUsername}`);

  // Enter password
  console.log('Entering password...');
  const passwordInput = page.locator('input[name="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await passwordInput.fill(globalVariables.judgePassword);
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
  // click on "All Cases" button
  await page.getByRole('link', { name: 'All Cases' }).click();
  // Set the case ID to search for
  const caseId = globalVariables.filingNumber;

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Find and fill the Case Name or ID field using updated XPath
  const caseNameField = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[3]/div/input');
  await expect(caseNameField).toBeVisible({ timeout: 10000 });
  console.log('Found Case Name or ID field, entering case ID...');
  await caseNameField.type(caseId);
  await caseNameField.press('Enter');

  // Click the search button after entering the case ID
  const searchButton = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[4]/button/header');
  await expect(searchButton).toBeVisible({ timeout: 10000 });
  await searchButton.click();

  // Wait for the record to be displayed after search
  const resultRow = page.locator('tr');
  await expect(resultRow.first()).toBeVisible({ timeout: 10000 });

  // Click on the case ID after search using the provided XPath
  const caseIdCell = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[2]/div/span/table/tbody/tr[1]/td[1]');
  await expect(caseIdCell).toBeVisible({ timeout: 10000 });
  const clickableLink = caseIdCell.locator('a,button');
  if (await clickableLink.count() > 0) {
    await clickableLink.first().click();
    console.log('Clicked child link/button in case ID cell');
  } else {
    await caseIdCell.click();
    console.log('Clicked case ID cell directly');
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click on send back for correction
  await page.getByText('Send back for correction', { exact: true }).click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('TEST');
  await page.getByRole('button').filter({ hasText: 'Send' }).click();
  await page.waitForTimeout(5000);
  await page.waitForLoadState('networkidle');
}); 