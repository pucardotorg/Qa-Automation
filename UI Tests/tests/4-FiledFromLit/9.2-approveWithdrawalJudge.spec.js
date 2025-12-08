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
  
  await page.getByRole('button', { name: 'Applications' }).click();
  await page.getByRole('table').getByText('Withdrawal').click();
  console.log(" Approving Withdrawal Application...");
  await page.getByRole('button', { name: 'Approve' }).click();
  await page.locator('div').filter({ hasText: /^Nature of Disposal\*$/ }).getByRole('img').click();
  await page.getByText('Uncontested').click();
  await page.getByRole('button').filter({ hasText: 'Confirm' }).click();
  await page.getByRole('paragraph').click();
  await page.waitForTimeout(1000);

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