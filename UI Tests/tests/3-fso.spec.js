import { test, expect } from '@playwright/test';
import globalVars from '../global-variables.json';

test('FSO Login Test', async ({ page }) => {
  // Navigate to the employee login page
  console.log('Navigating to FSO login page...');
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

  // Log completion
  console.log('Searching for case...');
  
  // Set the case ID to search for
  const caseId = globalVars.filingNumber;

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Find and fill the Case Name or ID field using updated XPath
  const caseNameField = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[4]/div/input');
  await expect(caseNameField).toBeVisible({ timeout: 10000 });
  console.log('Found Case Name or ID field, entering case ID...');
  await caseNameField.type(caseId);
  await caseNameField.press('Enter');

  // Click the search button after entering the case ID
  const searchButton = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[5]/button/header');
  await expect(searchButton).toBeVisible({ timeout: 10000 });
  await searchButton.click();
  
  // Wait for the record to be displayed after search
  const resultRow = page.locator('tr'); // Adjust selector if needed for your result row
  await expect(resultRow.first()).toBeVisible({ timeout: 10000 });
  
  // Click on the case ID after search using the provided XPath
  const caseIdCell = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[2]/div/span/table/tbody/tr[1]/td[1]');
  await expect(caseIdCell).toBeVisible({ timeout: 10000 });
  // Try to click a child <a> or <button> if present, otherwise click the cell
  const clickableLink = caseIdCell.locator('a,button');
  if (await clickableLink.count() > 0) {
    await clickableLink.first().click();
    console.log('Clicked child link/button in case ID cell');
  } else {
    await caseIdCell.click();
    console.log('Clicked case ID cell directly');
  }
  // Wait for the page to load after clicking the case ID
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Add some wait before proceeding

  // Click the 'Forward to Judge' button to trigger the popup
  const forwardButton = page.getByRole('button', { name: /Forward to Judge/i }).or(
    page.locator('button:has-text("Forward to Judge")')
  );
  await expect(forwardButton).toBeVisible({ timeout: 10000 });
  await forwardButton.click();
  console.log('Clicked Forward to Judge button');

  // Now handle the popup for FSO comments
  const commentInput = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div[2]/div/div/div[4]/div/div[2]/div[1]/textarea');
  await expect(commentInput).toBeVisible({ timeout: 10000 });
  await commentInput.fill('FSO comments');
  console.log('Entered FSO comments');
  await page.waitForTimeout(2000);
  // Click the 'Confirm' button in the popup
  const confirmButton = page.getByRole('button', { name: /Confirm/i }).or(
    page.locator('button:has-text("Confirm")')
  );
  await page.waitForTimeout(2000);

  await expect(confirmButton).toBeVisible({ timeout: 10000 });
  await confirmButton.click();
  console.log('Clicked Confirm button in popup');
  await page.waitForTimeout(2000);

  // Log completion
  console.log('Test completed');
}); 