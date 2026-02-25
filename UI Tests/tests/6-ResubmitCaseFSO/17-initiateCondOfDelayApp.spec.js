import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
const globalVarsPath = path.join(__dirname, "../../global-variables.json");
let globalVariables = JSON.parse(fs.readFileSync(globalVarsPath, "utf8"));

test("Dristi Kerala login and initiating cond of delay application", async ({ page }) => {
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
    await page.getByRole('cell', { name: 'CMP/156/2026' }).click();
    await page.waitForTimeout(1000);

    // Initiating Cond of Delay Application
    console.log('Initiating Cond of Delay Application...');
    await page.getByRole('button', { name: 'Make Filings' }).click();
    await page.locator('div').filter({ hasText: /^Raise Application$/ }).click();
    await page.locator('path').nth(4).click();
    await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Condonation of delay' }).click();
    await page.locator('.ql-editor').first().fill('delay testing');
    await page.getByRole('textbox', { name: 'Type here' }).fill('prayer testing');
    await page.locator('form').getByRole('img').filter({ hasText: /^$/ }).nth(3).click();
    await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Others' }).click();
    await page.locator('.citizen-card-input').first().click();
    await page.locator('.citizen-card-input').first().fill('document title testing');
    const fileInput = await page.$('input[type="file"]');
    // Path to the file you want to upload
    const chequeSignatoryName = path.resolve(__dirname, "./Testimages/1. Cheque - 15_09_2024.png"); // Updated file path // Updated file path
    // Upload the file
    await fileInput.setInputFiles(chequeSignatoryName);
    await page.waitForTimeout(10000);
    await page.getByRole('button').filter({ hasText: 'Generate Application' }).click();
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
    await page.pause();
    await page
        .locator('input[type="file"]')
        .setInputFiles(projectDownloadPath);
    await page.getByRole('button', { name: 'Submit Signature' }).click();
    await page.getByRole('button', { name: 'Proceed' }).click();
    await page.locator('.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg').click();
});