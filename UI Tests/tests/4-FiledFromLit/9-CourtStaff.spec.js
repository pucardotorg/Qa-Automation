import { test, expect } from '@playwright/test';
import globalVars from '../../global-variables.json';
import path from 'path';
test('Court Staff Test', async ({ page }) => {
  await page.goto(`${globalVars.baseURL}ui/employee/user/login`);
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill(globalVars.courtStaffUsername);
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill(globalVars.courtStaffPassword);
  await page.waitForTimeout(1000);
  await page.getByRole('button').click();
  await page.waitForTimeout(1000);
  await page.getByText ('Sign Process').click();
  await page.waitForTimeout(1000);
  await page.getByRole('cell', { name: globalVars.cmpNumber }).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'E-Sign' }).click();
  await page.waitForTimeout(1000);
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
  await page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

  await page.getByRole('button', { name: 'Submit Signature' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Confirm Sign' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Mark as sent' }).click();

  await page.getByRole('button', { name: 'Sent', exact: true }).click();
  await page.getByRole('cell', { name: globalVars.cmpNumber }).first().click();
  await page.waitForTimeout(2000);
  await page.locator('input.employee-select-wrap--elipses.undefined').nth(1).click();
  await page.locator('#jk-dropdown-unique div').first().click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Update Status' }).click();
  await page.waitForTimeout(2000);




  await page.close();
});