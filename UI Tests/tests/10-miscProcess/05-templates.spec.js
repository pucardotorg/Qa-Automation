import { test, expect } from '@playwright/test';
import globalVariables from '../../global-variables.json';
import fs from 'fs';
import path from 'path';
const globalVarsPath = path.join(__dirname, '../../global-variables.json');

test('Templates Test Police', async ({ page }) => {
    test.setTimeout(1800000);
    // Navigate to the employee login page
    console.log('Navigating to employee login page...');
    await page.goto(`${globalVariables.baseURL}ui/employee/user/login`);
    await page.waitForLoadState('networkidle');

    // Enter username
    console.log('Entering username...');
    const usernameInput = page.locator('input[name="username"]');
    //await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await usernameInput.fill(globalVariables.courtStaffUsername);
    console.log(`Entered username: ${globalVariables.courtStaffUsername}`);

    // Enter password
    console.log('Entering password...');
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill(globalVariables.courtStaffPassword);
    console.log('Entered password');

    // Click Continue button
    console.log('Looking for Continue button...');
    const continueButton = page.getByRole('button', { name: 'Continue' }).or(
        page.locator('button:has-text("Continue")')
    );
    await expect(continueButton).toBeVisible({ timeout: 10000 });
    await continueButton.click();
    console.log('Clicked Continue button');

    // Wait for home page to load
    console.log('Waiting for home page to load...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Additional wait to ensure page is fully loaded
    await page.getByText('Templates/Configuration').click();
    await page.getByRole('button').filter({ hasText: 'Add New Template' }).click();
    await page.locator('input[name="processTitle"]').click();
    await page.locator('input[name="processTitle"]').fill('Testing Automation');
    await page.locator('div').filter({ hasText: /^Select Addressee\*$/ }).getByRole('img').click();
    await page.getByText('Police', { exact: true }).click();
    await page.locator('.ql-editor').first().fill('order text');
    await page.getByRole('paragraph').filter({ hasText: /^$/ }).click();
    await page.locator('.ql-editor.ql-blank').fill('process text');
    await page.getByRole('button').filter({ hasText: 'Next' }).click();
    await page.getByRole('paragraph').filter({ hasText: /^$/ }).click();
    await page.locator('.ql-editor').fill('cover letter text');
    await page.getByRole('button').filter({ hasText: 'Save & Preview' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.close();

    // Log completion
    console.log('Templates Test Police completed from Court Staff user');
}); 