import { test, expect } from '@playwright/test';
import fs from "fs";
import path from 'path';  
import globalVars from '../../global-variables.json';
const globalVarsPath = path.join(__dirname, "../../global-variables.json");
let globalVariables = JSON.parse(fs.readFileSync(globalVarsPath, "utf8"));

test('Issue Admit Case', async ({ page }) => {
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

  await page.locator('div').filter({ hasText: /^EditDelete$/ }).getByRole('img').first().click();

  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Order for Taking Cognizance' }).click();
  test.setTimeout(180000);
  await page.getByRole('button').filter({ hasText: 'Confirm' }).click();
  await page.waitForTimeout(2000);
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
    //await page.getByText('You have successfully issued').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('heading', { name: 'Order successfully issued!' }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
      const accessCodeElement2 = await page.locator('div.sub-details-text').filter({ hasText: 'ST/' });
  const stNumber = await accessCodeElement2.textContent();
  console.log('ST Number:', stNumber);
  globalVariables.stNumber = stNumber;
  fs.writeFileSync(globalVarsPath, JSON.stringify(globalVariables, null, 2));
  console.log('ST Number saved to global variables:', globalVariables.stNumber);
  await page.close();
});