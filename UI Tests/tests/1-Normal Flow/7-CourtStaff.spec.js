import { test, expect } from '@playwright/test';
import globalVars from '../../global-variables.json';

test('Court Staff Test', async ({ browser }) => {
  test.setTimeout(180000); // Set timeout to 3 minutes
  // Create a new context with HTTPS errors ignored
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();
  
  await page.goto(`${globalVars.baseURL}ui/employee/user/login`);
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill(globalVars.courtStaffUsername);
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill(globalVars.courtStaffPassword);
  await page.waitForTimeout(1000);
  await page.getByRole('button').click();
  await page.waitForTimeout(1000);
  await page.locator('.review-card-action-arrow > span > svg > path').click();
  await page.waitForTimeout(1000);
  await page.getByRole('cell', { name: globalVars.cmpNumber }).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'E-Sign' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Upload Order Document with' }).click();
  await page.waitForTimeout(1000);
  await page.locator('input[type="file"]').setInputFiles("./Test.png");
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Submit Signature' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Proceed to Send' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Mark as sent' }).click();

  await page.getByRole('button', { name: 'Sent', exact: true }).click();
  await page.getByRole('cell', { name: globalVars.cmpNumber }).first().click();
  await page.locator('input.employee-select-wrap--elipses.undefined').click();
  await page.locator('#jk-dropdown-unique div').first().click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Update Status' }).click();
  await page.waitForTimeout(2000);




  // Close the context
  await context.close();
});