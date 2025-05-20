import { test, expect } from '@playwright/test';
import path from 'path';

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
  const caseId = 'KL-001193-2025';

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

  // Click on 'Schedule Hearing' button using the provided XPath
  const scheduleHearingButton = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div[2]/div[4]/div/button/header');
  await expect(scheduleHearingButton).toBeVisible({ timeout: 10000 });
  await scheduleHearingButton.click();
  console.log('Clicked Schedule Hearing button');

  // Select a date from the displayed list using the provided XPath
  const dateElement = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div[2]/div[4]/div/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div[3]');
  await expect(dateElement).toBeVisible({ timeout: 10000 });
  await dateElement.click();
  console.log('Selected date from the list');

  // Click on 'Generate Order' button using the provided XPath
  const generateOrderButton = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div[2]/div[4]/div/div[2]/div[1]/div/div[2]/div[1]/div[3]/button[2]/header');
  await expect(generateOrderButton).toBeVisible({ timeout: 10000 });
  await generateOrderButton.click();
  console.log('Clicked Generate Order button');

  // Wait for the page to load after clicking 'Generate Order'
  await page.waitForLoadState('networkidle');

  // Click on 'Names of parties' list field using the provided XPath
  const partiesListField = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[2]/div[2]/form/div[1]/div[6]/div/div/div/div/div[1]/input');
  await expect(partiesListField).toBeVisible({ timeout: 10000 });
  await partiesListField.click();
  console.log('Clicked on Names of parties list field');

  // Select the checkbox for the first user using the provided XPath
  const firstUserCheckbox = page.locator('xpath=//*[@id="jk-dropdown-unique"]/div[1]/input');
  await expect(firstUserCheckbox).toBeVisible({ timeout: 10000 });
  await firstUserCheckbox.click();
  console.log('Selected first user checkbox');

  // Select the checkbox for the second user using the provided XPath
  const secondUserCheckbox = page.locator('xpath=//*[@id="jk-dropdown-unique"]/div[2]/input');
  await expect(secondUserCheckbox).toBeVisible({ timeout: 10000 });
  await secondUserCheckbox.click();
  console.log('Selected second user checkbox');

  // Wait for the UI to be ready after selecting parties
  await page.waitForTimeout(2000); // Adjust the timeout as necessary

  // Click on 'Preview PDF' button using the provided XPath
  const previewPdfButton = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[2]/div[2]/form/div[2]/button[1]');
  await expect(previewPdfButton).toBeVisible({ timeout: 10000 });
  await previewPdfButton.click();
  console.log('Clicked Preview PDF button');

  // Click on 'Add Signature' button using the provided XPath
  const addSignatureButton = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[4]/div/div[2]/div[2]/button[2]/h2');
  await expect(addSignatureButton).toBeVisible({ timeout: 10000 });
  await addSignatureButton.click();
  console.log('Clicked Add Signature button');

  // Wait for the popup window to appear
  const signaturePopup = page.locator('selector-for-signature-popup'); // Update with the actual selector for the popup

  // Add a wait before checking for visibility
  await page.waitForTimeout(2000); // Adjust the timeout as necessary

  try {
    await expect(signaturePopup).toBeVisible({ timeout: 10000 });
    console.log('Signature popup is visible');

    // Check if the "Add Signature" text is displayed
    const addSignatureText = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[4]/div/div[1]/div[1]/h1');
    await expect(addSignatureText).toBeVisible({ timeout: 10000 });
    console.log('Add Signature text is displayed');

  } catch (error) {
    console.error('Error during popup visibility check:', error);
    // Handle the error as needed, e.g., take a screenshot or log additional information
  }

  // Click on 'Upload Order Document with Signature' button
  const uploadSignedButton = page.locator("//h2[text()='Upload Order Document with Signature']");
  await expect(uploadSignedButton).toBeVisible({ timeout: 10000 });
  await uploadSignedButton.click();
  // Upload the file
  const filePath = path.join(__dirname, 'uploads', '2.png'); // Adjust the path as necessary
  const fileInput = page.locator('input[type="file"]'); // Update with the actual selector for the file input
  await fileInput.setInputFiles(filePath);
  console.log('Uploaded file: ' + filePath);
  // Click on 'Submit Signature' button
  const submitSignButton = page.locator("//h2[text()='Submit Signature']/parent::button");
  await expect(submitSignButton).toBeVisible({ timeout: 10000 });
  await submitSignButton.click();
  console.log('Clicked Submit Signature button');
  // Click on 'Proceed' button
  const proceedButton = page.locator("//h2[text()='Issue Order']/parent::button");
  await expect(proceedButton).toBeVisible({ timeout: 10000 });
  await proceedButton.click();
  console.log('Clicked Proceed button');
  // Log completion
  console.log('Register Case Test completed');
}); 