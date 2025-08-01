import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const globalVarsPath = path.join(__dirname,  '../../global-variables.json');
let globalVariables = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

test('Join Case Test', async ({ page }) => {

  await page.goto(`${globalVariables.baseURL}ui/citizen/select-language`);
  await page.getByRole('button').click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill(globalVariables.accusedADV);
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
  await page.locator('input[name="caseNumber"]').fill(globalVariables.filingNumber);
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
  await page.locator('input[name="validationCode"]').fill(globalVariables.accessCode);
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Join Case' }).nth(1).click();
  await page.waitForTimeout(2000);

 await page.locator('div').filter({ hasText: /^Accused$/ }).getByRole('radio').check();
  await page.locator('div').filter({ hasText: /^No$/ }).getByRole('radio').check();
  await page.locator('div').filter({ hasText: /^Which litigant\(s\) are you representing\?$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: new RegExp(`^${globalVariables.respondentFirstName}`) }).getByRole('checkbox').check();
  await page.locator('.select-user-join-case').click();
  await page.getByRole('button', { name: 'Proceed' }).click();
  await page.locator('input[name="mobileNumber"]').click();
  await page.locator('input[name="mobileNumber"]').fill(globalVariables.accusedLitigant);  
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
  await page.locator('input[name="noOfAdvocates"]').fill(globalVariables.noOfAdvocates);
  await page.waitForTimeout(1000);
  await page.locator('input[type="file"]').setInputFiles("./Test.png");
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Proceed' }).click();
  await page.waitForTimeout(5000);
  
});

