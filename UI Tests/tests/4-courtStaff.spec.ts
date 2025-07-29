import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://dristi-kerala-uat.pucar.org/ui/employee/user/login');
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill('michaelGeorgeCourt');
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill('Beehyv@123');
  await page.waitForTimeout(1000);
  await page.getByRole('button').click();
  await page.waitForTimeout(1000);
  await page.locator('.review-card-action-arrow > span > svg > path').click();
  await page.waitForTimeout(1000);
  await page.getByRole('cell', { name: 'GURU TEST vs Test, CMP/2029/' }).first().click();
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
  await page.waitForTimeout(2000);
  await page.close();
});