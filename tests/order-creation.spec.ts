import { test, expect } from '@playwright/test';

test('Order Creation Test', async ({ page }) => {
  // Navigate to the employee login page
  console.log('Navigating to employee login page...');
  await page.goto('https://dristi-kerala-uat.pucar.org/ui/employee/user/login');
  
  // Wait for page load
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Enter username
  console.log('Entering username...');
  const usernameInput = page.locator('#field-1').or(
    page.locator('input[type="text"]').first()
  );
  await expect(usernameInput).toBeVisible({ timeout: 15000 });
  await usernameInput.fill('gJudge');

  // Enter password
  console.log('Entering password...');
  const passwordInput = page.locator('#field-2').or(
    page.locator('input[type="password"]')
  );
  await expect(passwordInput).toBeVisible({ timeout: 15000 });
  await passwordInput.fill('Beehyv@123');

  // Click Continue button
  console.log('Looking for Continue button...');
  const continueButton = page.getByRole('button', { name: 'Continue' }).or(
    page.locator('button:has-text("Continue")')
  );
  await expect(continueButton).toBeVisible({ timeout: 15000 });
  await continueButton.click();

  // Wait for home page to load
  console.log('Waiting for page load...');
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(7000);
  
  // Scroll to a specific position
  console.log('Scrolling to case search section...');
  await page.evaluate(() => {
    window.scrollTo(0, 300);
  });
  await page.waitForTimeout(3000);

  // Find and fill the Case Name field using XPath
  console.log('Looking for Case Name field...');
  const caseNameField = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[3]/div/input');
  await expect(caseNameField).toBeVisible({ timeout: 20000 });
  console.log('Found Case Name field, entering case ID...');
  await caseNameField.fill('KL-001031-2025');
  await page.waitForTimeout(2000);

  // Click search button using XPath
  console.log('Clicking search button...');
  const searchButton = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[4]/button');
  await expect(searchButton).toBeVisible({ timeout: 15000 });
  await searchButton.click();
  await page.waitForTimeout(2000);
  
  // Wait for search results and click on case ID
  await page.waitForLoadState('networkidle');
  console.log('Looking for case ID in search results...');
  const caseIdLink = page.getByText('KL-001031-2025').first();
  await expect(caseIdLink).toBeVisible({ timeout: 15000 });
  await caseIdLink.click();

  // Wait for case details page to load
  console.log('Waiting for case details page to load...');
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);

  // Click on Take Action button
  console.log('Looking for Take Action button...');
  const takeActionButton = page.getByRole('button', { name: 'Take Action' }).or(
    page.locator('button:has-text("Take Action")')
  );
  await expect(takeActionButton).toBeVisible({ timeout: 15000 });
  await takeActionButton.click();
  
  // Wait for action page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Click on Generate Order/Home using XPath
  console.log('Looking for Generate Order/Home...');
  const generateOrderButton = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div[2]/div[1]/div[1]/div[3]/div[1]/div/div/div/div[1]/p');
  await expect(generateOrderButton).toBeVisible({ timeout: 20000 });
  await generateOrderButton.click();
  await page.waitForTimeout(3000);

  // Click on Add Order using XPath
  console.log('Looking for Add Order button...');
  const addOrderButton = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div/div[1]/div[1]');
  await expect(addOrderButton).toBeVisible({ timeout: 15000 });
  await addOrderButton.click();
  await page.waitForTimeout(3000);

  // Click on Order Type field using XPath
  console.log('Looking for Order Type field...');
  const orderTypeField = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div/div[2]/div[2]/form/div[1]/div[2]/div/div/div[1]/input');
  await expect(orderTypeField).toBeVisible({ timeout: 15000 });
  await orderTypeField.click();
  await page.waitForTimeout(2000);

  // Click on Others option
  console.log('Selecting Others option...');
  const othersOption = page.getByText('Others').first();
  await expect(othersOption).toBeVisible({ timeout: 15000 });
  await othersOption.click();
  await page.waitForTimeout(2000);

  // Enter Order Title using XPath
  console.log('Entering Order Title...');
  const orderTitleField = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div/div[2]/div[2]/form/div[1]/div[4]/div/div/div/input[1]');
  await expect(orderTitleField).toBeVisible({ timeout: 15000 });
  await orderTitleField.fill('Others');
  await page.waitForTimeout(2000);

  // Enter details in the text area with correct XPath
  console.log('Entering details in the text area...');
  const detailsField = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div/div[2]/div[2]/form/div[1]/div[6]/div/div/textarea');
  await expect(detailsField).toBeVisible({ timeout: 15000 });
  await detailsField.fill('Test order details for automation testing');
  await page.waitForTimeout(2000);

  // Click outside the text area (clicking on the form container)
  console.log('Clicking outside text area...');
  const formContainer = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div/div[2]/div[2]/form');
  await formContainer.click();
  await page.waitForTimeout(3000);

  // Click on Preview PDF button
  console.log('Looking for Preview PDF button...');
  const previewPDFButton = page.getByRole('button', { name: 'Preview PDF' }).or(
    page.locator('button:has-text("Preview PDF")')
  );
  await expect(previewPDFButton).toBeVisible({ timeout: 15000 });
  await previewPDFButton.click();
  await page.waitForTimeout(3000);

  // Click on Continue button
  console.log('Looking for Continue button...');
  const orderContinueButton = page.getByRole('button', { name: 'Continue' }).or(
    page.locator('button:has-text("Continue")')
  );
  await expect(orderContinueButton).toBeVisible({ timeout: 15000 });
  await orderContinueButton.click();
  await page.waitForTimeout(3000);

  // Verify Review Orders popup is opened
  console.log('Verifying Review Orders popup...');
  const reviewOrdersPopup = page.locator('xpath=//div[contains(@class, "popup") and contains(.,"Review Orders")]');
  await expect(reviewOrdersPopup).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(2000);

  // Click on Add Signature button using specific XPath
  console.log('Clicking Add Signature button...');
  const addSignatureButton = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div/div[4]/div/div[2]/div[2]/button[2]/h2');
  await expect(addSignatureButton).toBeVisible({ timeout: 15000 });
  await addSignatureButton.click();
  await page.waitForTimeout(3000);

  // Download the signature template
  console.log('Downloading signature template...');
  const downloadTemplateButton = page.getByRole('button', { name: 'Download Template' }).or(
    page.locator('button:has-text("Download Template")')
  );
  await expect(downloadTemplateButton).toBeVisible({ timeout: 15000 });
  const downloadPromise = page.waitForEvent('download');
  await downloadTemplateButton.click();
  const download = await downloadPromise;
  await page.waitForTimeout(2000);

  // Upload the signature template
  console.log('Uploading signature template...');
  const fileChooserPromise = page.waitForEvent('filechooser');
  const uploadButton = page.locator('input[type="file"]');
  await uploadButton.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(await download.path());
  await page.waitForTimeout(3000);

  // Click on Sign button
  console.log('Clicking Sign button...');
  const signButton = page.getByRole('button', { name: 'Sign' }).or(
    page.locator('button:has-text("Sign")')
  );
  await expect(signButton).toBeVisible({ timeout: 15000 });
  await signButton.click();
  await page.waitForTimeout(3000);
}); 