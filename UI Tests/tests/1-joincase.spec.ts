import { test, expect } from '@playwright/test';
import path from 'path';



test('test', async ({ page }) => {

  await page.goto('https://dristi-kerala-uat.pucar.org/ui/citizen/select-language');
  await page.getByRole('button').click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('8800000014');
  await page.waitForTimeout(1000);
  await page.getByRole('button').click();
  await page.locator('.input-otp').first().fill('1');
  await page.locator('input:nth-child(2)').fill('2');
  await page.locator('input:nth-child(3)').fill('3');
  await page.locator('input:nth-child(4)').fill('4');
  await page.locator('input:nth-child(5)').fill('5');
  await page.locator('input:nth-child(6)').fill('6');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Join Case' }).click();
  await page.locator('input[name="caseNumber"]').click();
  await page.waitForTimeout(1000);
  await page.locator('input[name="caseNumber"]').fill('KL-002131-2025');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Search' }).click();
  await page.waitForTimeout(1000);
  await page.locator('.cp').first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Proceed' }).click();
  await page.waitForTimeout(1000);
  await page.locator('input[name="validationCode"]').click();
  await page.locator('input[name="validationCode"]').click();
  await page.waitForTimeout(1000);
  await page.locator('input[name="validationCode"]').fill('737695');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Join Case' }).nth(1).click();
  await page.waitForTimeout(2000);

 await page.locator('div').filter({ hasText: /^Accused$/ }).getByRole('radio').check();
  await page.locator('div').filter({ hasText: /^No$/ }).getByRole('radio').check();
  await page.locator('div').filter({ hasText: /^Which litigant\(s\) are you representing\?$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^Accused One Automation Case$/ }).getByRole('checkbox').check();
  await page.locator('.select-user-join-case').click();
  await page.getByRole('button', { name: 'Proceed' }).click();
  await page.locator('input[name="mobileNumber"]').click();
  await page.locator('input[name="mobileNumber"]').fill('7777777777');
  await page.locator('input[name="mobileNumber"]').press('Tab');
  await page.getByRole('button', { name: 'Verify Mobile Number' }).press('Enter');
  await page.getByRole('button', { name: 'Verify Mobile Number' }).click();
  await page.locator('.input-otp').first().fill('1');
  await page.locator('input:nth-child(2)').fill('2');
  await page.locator('input:nth-child(3)').fill('3');
  await page.locator('input:nth-child(4)').fill('4');
  await page.locator('input:nth-child(5)').fill('5');
  await page.locator('input:nth-child(6)').fill('6');
  await page.getByRole('button', { name: 'Verify', exact: true }).click();
  await page.locator('input[name="noOfAdvocates"]').click();
  await page.locator('input[name="noOfAdvocates"]').fill('1');
  await page.waitForTimeout(1000);
  await page.locator('input[type="file"]').setInputFiles("./Test.png");
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Proceed' }).click();
  await page.waitForTimeout(1000);
  
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Pay Online' }).click();
  await page.waitForTimeout(1000);
  const page1 = await page1Promise;
  await page1.getByRole('link', { name: 'Payment Gateway 2 (UPI,Credit' }).click();

  await page1.locator('#link2').click();

  await page1.getByRole('button', { name: 'Proceed for Payment' }).click();
  await page1.getByRole('button', { name: 'Ok' }).click();
  await page1.locator('.mob-pay-ls-a').click({ timeout: 10000 });
  await page1.getByRole('button', { name: 'Back Home' }).click();

  await page1.getByRole('button', { name: 'Back Home' }).click();
});

