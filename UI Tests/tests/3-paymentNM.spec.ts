import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://dristi-kerala-uat.pucar.org/ui/employee/user/login');
  await page.waitForTimeout(1000);
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill('michaelGeorgeNm');
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill('Beehyv@123');
  await page.waitForTimeout(1000);
  await page.getByRole('button').click();
  await page.waitForTimeout(1000);
  await page.getByRole('button').filter({ hasText: 'View Pending Payments' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'GURU TEST vs Test, CMP/2029/' }).first().click();
  await page.waitForTimeout(1000);
  await page.locator('div').filter({ hasText: /^Mode of Payment$/ }).getByRole('textbox').click();
  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Stamp' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button').click();
  await page.waitForTimeout(2000);
  await page.close();
});