import { test, expect } from '@playwright/test';
import globalVars from '../../global-variables.json';

test('Issue Notice Test', async ({ browser }) => {
  test.setTimeout(180000); // Set timeout to 3 minutes
  // Create a new context with HTTPS errors ignored
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();
  
  await page.goto(`${globalVars.baseURL}ui/employee/user/login`);
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill(globalVars.judgeUsername);
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill(globalVars.judgePassword);
  await page.waitForTimeout(1000);
  await page.getByRole('button').click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'All Cases' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  // Wait for the cell to be visible with increased timeout
  const cmpCell = page.getByRole('cell', { name: globalVars.cmpNumber });
  await expect(cmpCell).toBeVisible({ timeout: 30000 });
  await cmpCell.click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Take Action' }).click();
  await page.waitForTimeout(1000);
  await page.getByText('Generate Order').click();
  await page.waitForTimeout(1000);
  await page.getByText('+ Add Order').click();
  await page.waitForTimeout(1000);
  await page.getByRole('textbox').click();
  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Order for Issue Notice' }).click();
  await page.waitForTimeout(1000);
  await page.locator('div').filter({ hasText: /^Notice Type\*$/ }).getByRole('textbox').click();
  await page.waitForTimeout(1000);
  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Section 223 Notice' }).click();
  await page.waitForTimeout(1000);
  await page.locator('div').filter({ hasText: /^Notice to the Party\*$/ }).getByRole('img').click();
  await page.waitForTimeout(1000);
  await page.getByText('Automation Accused (Accused)').click()
  await page.waitForTimeout(1000);
  //await page.locator('#jk-dropdown-unique div').click();
  await page.waitForTimeout(1000);
  await page.locator('[id="Registered\\ Post-0"]').check();
  await page.waitForTimeout(1000);
  await page.getByRole('button').filter({ hasText: 'Preview PDF' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Add Signature' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Upload Order Document with' }).click();
  await page.waitForTimeout(1000);
  await page.locator('input[type="file"]').setInputFiles("./Test.png");
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Submit Signature' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Issue Order' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Close' }).click();
  await page.waitForTimeout(2000);
  
  // Close the context
  await context.close();
});