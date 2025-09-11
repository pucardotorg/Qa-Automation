import { test, expect } from '@playwright/test';
import globalVars from '../../global-variables.json';

test('Notice Payment Test', async ({ browser }) => {
  test.setTimeout(180000); // Set timeout to 3 minutes
  // Create a new context with HTTPS errors ignored
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();
  
  await page.goto(`${globalVars.baseURL}ui/employee/user/login`);
  await page.waitForTimeout(1000);
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill(globalVars.nayamitraUsername);
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill(globalVars.nayamitraPassword);
  await page.waitForTimeout(1000);
  await page.getByRole('button').click();
  await page.waitForTimeout(1000);
  await page.getByRole('button').filter({ hasText: 'View Pending Payments' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: globalVars.cmpNumber }).first().click();
  await page.waitForTimeout(1000);
  await page.locator('div').filter({ hasText: /^Mode of Payment$/ }).getByRole('textbox').click();
  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Stamp' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button').click();
  await page.waitForTimeout(2000);
  await page.close();
});