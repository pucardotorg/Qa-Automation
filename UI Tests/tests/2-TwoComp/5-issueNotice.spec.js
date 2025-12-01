import { test, expect } from '@playwright/test';
import path from 'path';  
import globalVars from '../../global-variables.json';

test('Issue Notice Test', async ({ page }) => {
  test.setTimeout(180000);
  await page.goto(globalVars.baseURL + 'ui/employee/user/login');
  await page.waitForLoadState('networkidle');
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill(globalVars.judgeUsername);
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill(globalVars.judgePassword);
  await page.waitForTimeout(1000);
  await page.getByRole('button').click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'All Cases' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('cell', { name: globalVars.cmpNumber }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Take Action' }).click();
  await page.waitForTimeout(1000);
  await page.getByText('Generate Order').click();
  await page.waitForTimeout(1000);


  await page.locator('div').filter({ hasText: /^EditDelete$/ }).locator('div').nth(1).click();
  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Notice' }).click();
  await page.locator('div').filter({ hasText: /^Notice Type\*$/ }).getByRole('textbox').click();
  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Section 223 Notice' }).click();
  await page.locator('div').filter({ hasText: /^Notice to the Party\*$/ }).locator('svg').click();
  await page.getByText(globalVars.respondentFirstName + " (Accused)").click();
  // Disambiguate checkbox selection: target e-Post explicitly to avoid strict mode violation
  //await page.locator('#e-Post-0').check();
  await page.getByRole('button').filter({ hasText: 'Confirm' }).click();
  
  await page.waitForTimeout(2000);


  // await page.locator('.ql-editor').click();
  // await page.locator('.ql-editor').fill('AUTOMATION ORDER GENERATED');
 
  // await page.waitForTimeout(1000);

  await page.getByRole('button').filter({ hasText: 'Preview PDF' }).click();
  await page.getByRole('button', { name: 'Add Signature' }).click();

  
  const download1Promise = page.waitForEvent('download');
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
  await page.waitForTimeout(2000);  
  await page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

  await page.getByRole('button', { name: 'Submit Signature' }).click();
  await page.getByRole('button', { name: 'Issue Order' }).click();
  await page.getByText('You have successfully issued').click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('heading', { name: 'Order successfully issued!' }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  await page.close();
});