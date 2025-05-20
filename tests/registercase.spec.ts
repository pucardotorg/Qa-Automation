import { test, expect } from '@playwright/test';

test('Register Case Test', async ({ page }) => {
  // Navigate to the employee login page
  console.log('Navigating to employee login page...');
  await page.goto('https://dristi-kerala-uat.pucar.org/ui/employee/user/login');
  await page.waitForLoadState('networkidle');

  // Enter username
  console.log('Entering username...');
  const usernameInput = page.locator('input[name="username"]');
  await expect(usernameInput).toBeVisible({ timeout: 10000 });
  await usernameInput.fill('gJudge');
  console.log('Entered username: gJudge');

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

  // Wait for home page to load
  console.log('Waiting for home page to load...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000); // Additional wait to ensure page is fully loaded

  // Set the case ID to search for
  const caseId = 'KL-001146-2025';

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

  // Click on 'Register Case' button (update selector as needed)
  const registerCaseButton = page.getByRole('button', { name: /Register Case/i }).or(
    page.locator('button:has-text("Register Case")')
  );
  await expect(registerCaseButton).toBeVisible({ timeout: 10000 });
  await registerCaseButton.click();
  console.log('Clicked Register Case button');

  // Wait for the new window with CMRNO and CMP NO fields
  const cmrNoField = page.locator('input[placeholder*="CMRNO" i], input[label*="CMRNO" i]');
  const cmpNoField = page.locator('input[placeholder*="CMP NO" i], input[label*="CMP NO" i]');
  await expect(cmrNoField.first()).toBeVisible({ timeout: 10000 });
  await expect(cmpNoField.first()).toBeVisible({ timeout: 10000 });
  console.log('CMRNO and CMP NO fields are visible');

  // Log completion
  console.log('Register Case Test completed');
}); 