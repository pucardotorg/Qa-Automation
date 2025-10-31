import { test, expect } from '@playwright/test';
import globalVariables from '../../global-variables.json';
import fs from 'fs';
import path from 'path';
const globalVarsPath = path.join(__dirname,  '../../global-variables.json');

test('Register Case Test', async ({ page }) => {
  test.setTimeout(1800000);
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
  
  // Click on 'Register Case' button (update selector as needed)
  const registerCaseButton = page.getByRole('button', { name: /Register Case/i }).or(
    page.locator('button:has-text("Register Case")')
  );
  await expect(registerCaseButton).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2000);

  await registerCaseButton.click();
  await page.waitForTimeout(2000);

  console.log('Clicked Register Case button');
  
  await page.getByRole('button', { name: 'Schedule Hearing' }).click();
  await page.getByText('Select Custom Date').click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('button', { name: '1', exact: true }).first().click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.getByRole('button').filter({ hasText: 'Generate Order' }).click();

  await page.waitForLoadState("networkidle");

  await page.getByRole('textbox', { name: 'rdw-editor' }).click();
  await page.getByRole('textbox', { name: 'rdw-editor' }).fill('AUTOMATION ORDER GENERATED');
 
  await page.waitForTimeout(1000);

  await page.getByRole('button').filter({ hasText: 'Preview PDF' }).click();
  await page.getByRole('button', { name: 'Add Signature' }).click();

  
  const downloadPromise = page.waitForEvent('download');
  await page.getByText('click here').click();
  const [ download ] = await Promise.all([
        page.waitForEvent('download'), // wait for the download trigger
        page.click('text=click here'), // replace with your selector
      ]);
  const projectDownloadPath = path.join(__dirname, 'downloads', await download.suggestedFilename()); 
  // Save the file to the defined path2
  await download.saveAs(projectDownloadPath);
  console.log(`File downloaded and saved to: ${projectDownloadPath}`);    
  await page.getByRole('button', { name: 'Upload Order Document with' }).click();
  await page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);
  
  await page.getByRole('button', { name: 'Submit Signature' }).click();
  await page.getByRole('button', { name: 'Issue Order' }).click();

  await page.waitForTimeout(2000);
 await page
   .locator(
     "div:nth-child(4) > .popup-module > .header-wrap > .header-end > div > svg"
   )
   .click();
  await page.waitForLoadState("networkidle");
  const accessCodeElement = await page.locator('div.sub-details-text').filter({ hasText: 'Code: ' });
  const accessCodeText = await accessCodeElement.textContent();
  const accessCode = accessCodeText.match(/Code\s*:\s*(\d+)/)?.[1] || '';
  console.log('Access Code:', accessCode);
  const accessCodeElement2 = await page.locator('div.sub-details-text').filter({ hasText: 'CMP/' });
  const cmpNumber = await accessCodeElement2.textContent();
  console.log('CMP Number:', cmpNumber);
  globalVariables.accessCode = accessCode;
  globalVariables.cmpNumber = cmpNumber;
  fs.writeFileSync(globalVarsPath, JSON.stringify(globalVariables, null, 2));
  
  // Wait for the new window with CMRNO and CMP NO fields
//   const cmrNoField = page.locator('input[placeholder*="CMRNO" i], input[label*="CMRNO" i]');
//   const cmpNoField = page.locator('input[placeholder*="CMP NO" i], input[label*="CMP NO" i]');
//   await expect(cmrNoField.first()).toBeVisible({ timeout: 10000 });
//   await expect(cmpNoField.first()).toBeVisible({ timeout: 10000 });
//   console.log('CMRNO and CMP NO fields are visible');

//   // Log completion
  console.log('Register Case Test completed');
}); 