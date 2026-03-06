import { test, expect } from '@playwright/test';
import path from 'path';
import globalVars from '../../global-variables.json';

test('Submit Document From Judge', async ({ page }) => {
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
    await page.getByText('Submit Documents').click();
    await page.locator('div').filter({ hasText: /^Document Type\*$/ }).getByRole('img').click();
    await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Affidavits' }).click();
    const fileInput = await page.$('input[type="file"]');
    // Path to the file you want to upload
    const chequeSignatoryName = path.resolve(
        __dirname,
        "./Testimages/1. Cheque - 15_09_2024.png"
    );
    // Upload the file
    await fileInput.setInputFiles(chequeSignatoryName);
    await page.locator('.ql-editor').click();
    await page.locator('.ql-editor').fill('reason testing');
    await page.waitForTimeout(3000);
    await page.getByRole('button').filter({ hasText: 'Review Submission' }).click();
    await page.getByRole('button', { name: 'Sign' }).click();
    await page.getByRole('button', { name: 'Upload Order Document with' }).click();
    const fileInput1 = await page.$('input[type="file"]');
    // Path to the file you want to upload
    const chequeSignatoryName1 = path.resolve(
        __dirname,
        "./Testimages/1. Cheque - 15_09_2024.png"
    );
    // Upload the file
    await fileInput1.setInputFiles(chequeSignatoryName1);
    await page.getByRole('button', { name: 'Submit Signature' }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await page.close();
});