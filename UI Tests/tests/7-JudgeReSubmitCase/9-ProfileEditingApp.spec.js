import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
const globalVarsPath = path.join(__dirname, "../../global-variables.json");
let globalVariables = JSON.parse(fs.readFileSync(globalVarsPath, "utf8"));

test("Dristi Kerala login and initiating profile correction application", async ({ page }) => {
    test.setTimeout(180000);
    // Go to the login page
    await page.goto(`${globalVariables.baseURL}ui/citizen/select-language`);
    // sign in
    await page.getByRole("button").click();
    // Enter mobile number
    await page.getByRole("textbox").fill(globalVariables.citizenUsername);

    // Click on Sign In button
    await page.getByRole("button").click();
    // Enter OTP
    await page.locator(".input-otp").first().fill("1");
    await page.locator("input:nth-child(2)").fill("2");
    await page.locator("input:nth-child(3)").fill("3");
    await page.locator("input:nth-child(4)").fill("4");
    await page.locator("input:nth-child(5)").fill("5");
    await page.locator("input:nth-child(6)").fill("6");

    // Click on Verify button
    await page.getByRole("button", { name: "Verify" }).click();

    // Search for the case using filing number
    await page.waitForTimeout(1000);
    await page.getByRole('cell', { name: 'CMP/173/2026' }).click();
    await page.waitForTimeout(1000);

    // Initiating Profile Correction Application
    console.log('Initiating Profile Correction Application...');
    await page.getByRole('button', { name: 'Parties' }).click();
    await page.locator('td:nth-child(6)').first().click();
    await page.getByRole('row', { name: 'Rajesh Ch Complainant Joined' }).locator('div').nth(2).click();
    await page.getByText('Edit Details').click();
    await page.locator('input[name="complainantAge"]').click();
    await page.locator('input[name="complainantAge"]').fill('23');
    await page.locator('input[name="lastName"]').click();
    await page.locator('input[name="lastName"]').fill('');
    await page.locator('input[name="lastName"]').press('CapsLock');
    await page.locator('input[name="lastName"]').fill('V');
    await page.locator('input[name="lastName"]').press('CapsLock');
    await page.locator('input[name="lastName"]').fill('Verma');
    await page.locator('input[name="middleName"]').click();
    await page.locator('input[name="middleName"]').press('CapsLock');
    await page.locator('input[name="middleName"]').fill('C');
    await page.locator('input[name="middleName"]').press('CapsLock');
    await page.locator('input[name="middleName"]').fill('Ch');
    await page.locator('textarea').nth(1).click();
    await page.locator('textarea').nth(1).press('CapsLock');
    await page.locator('textarea').nth(1).fill('C');
    await page.locator('textarea').nth(1).press('CapsLock');
    await page.getByText('C', { exact: true }).fill('Changing the middle and last name, age');
    await page.getByRole('button').filter({ hasText: 'Submit' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    console.log('Adding Signature...');
    await page.getByRole('button', { name: 'Add Signature' }).click();
    //
    //await page.getByText('click here').click();
    //   await page.getByRole('button', { name: 'Upload document with Signature' }).click();
    //   await page.locator('div').filter({ hasText: /^Drag and drop your file or Browse in my files$/ }).click();
    //   await page.locator('body').setInputFiles('downloadedFile - 2025-11-27T183557.058.pdf');
    //const download = await downloadPromise;
    const [download] = await Promise.all([
        page.waitForEvent("download"), // wait for the download trigger
        page.click("text=click here"), // replace with your selector
    ]);
    const projectDownloadPath = path.join(
        __dirname,
        "downloads",
        await download.suggestedFilename()
    );

    // Save the file to the defined path2
    await download.saveAs(projectDownloadPath);
    console.log(`File downloaded and saved to: ${projectDownloadPath}`);
    await page.getByRole("button", { name: "Upload document with Signature" }).click();
    await page.waitForTimeout(6000);
    await page
        .locator('input[type="file"]')
        .nth(2)
        .setInputFiles(projectDownloadPath);
    await page.getByRole('button', { name: 'Submit Signature' }).click();
    await page.getByRole('button', { name: 'Proceed' }).click();
    await page.locator('.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg').click();
});