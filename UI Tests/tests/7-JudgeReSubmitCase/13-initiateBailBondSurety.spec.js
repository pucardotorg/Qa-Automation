import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
const globalVarsPath = path.join(__dirname, "../../global-variables.json");
let globalVariables = JSON.parse(fs.readFileSync(globalVarsPath, "utf8"));

test("Dristi Kerala login and initiating bail bond surety", async ({ page }) => {
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
    await page.getByRole('cell', { name: globalVariables.cmpNumber }).click();
    await page.waitForTimeout(1000);

    // Initiating Bail Bond Surety
    console.log('Initiating Bail Bond Surety...');
    await page.getByRole('button', { name: 'Make Filings' }).click();
    await page.getByText('Generate Bail Bond').click();
    await page.locator('input[name="litigantFatherName"]').click();
    await page.locator('input[name="litigantFatherName"]').fill('Ajay Verma');
    await page.locator('#validationCustom01').click();
    await page.locator('#validationCustom01').fill('8500');
    await page.locator('div').filter({ hasText: /^Bail Type\*$/ }).getByRole('img').click();
    await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Bail Surety' }).click();
    await page.locator('input[name="name"]').first().click();
    await page.locator('input[name="name"]').first().fill('Akay Kumar');
    await page.locator('input[name="fatherName"]').first().click();
    await page.locator('input[name="fatherName"]').first().fill('Rakesh Kumar');
    await page.locator('input[name="mobileNumber"]').first().click();
    await page.locator('input[name="mobileNumber"]').first().fill('9632000000');
    await page.locator('input[name="locality"]').first().click();
    await page.locator('input[name="locality"]').first().fill('91 Springboard');
    await page.locator('input[name="city"]').first().click();
    await page.locator('input[name="city"]').first().fill('Augusta');
    await page.waitForTimeout(2000);
    // Scroll and wait for pincode field to be visible and interactable
    await page.locator('input[name="pincode"]').first().waitFor({ state: 'visible' });
    await page.locator('input[name="pincode"]').first().scrollIntoViewIfNeeded();
    // Triple-click to select all, then type using pressSequentially to trigger JS events
    await page.locator('input[name="pincode"]').first().click({ clickCount: 3 });
    await page.locator('input[name="pincode"]').first().pressSequentially('9856230', { delay: 100 });
    await page.waitForTimeout(1000);
    await page.locator('input[name="district"]').first().click();
    await page.locator('input[name="district"]').first().fill('Kollam');
    await page.locator('input[name="state"]').first().click();
    await page.locator('input[name="state"]').first().fill('Kerala');
    const fileInput1 = await page.$('input[type="file"]');
    // Path to the file you want to upload
    const chequeSignatoryName1 = path.resolve(
        __dirname,
        "./Testimages/1. Cheque - 15_09_2024.png"
    );
    // Upload the file
    await fileInput1.setInputFiles(chequeSignatoryName1);
    const fileInput = page.locator('input[type="file"]').nth(2);
    // Path to the file you want to upload
    const chequeSignatoryName = path.resolve(
        __dirname,
        "./Testimages/1. Cheque - 15_09_2024.png"
    );
    // Upload the file
    await fileInput.waitFor({ state: 'attached' });
    await fileInput.setInputFiles(chequeSignatoryName);
    await page.locator('div:nth-child(2) > div > button').click();
    await page.getByRole('button').filter({ hasText: 'Review Bail Bond' }).click();
    // 'Proceed To Sign' may be covered by overlay/animation after Review Bail Bond
    // Use scrollIntoView + JS click to bypass actionability issues
    await page.waitForTimeout(2000);
    const proceedToSignBtn = page.getByRole('button', { name: 'Sign' });
    await proceedToSignBtn.waitFor({ state: 'visible' });
    await expect(proceedToSignBtn).toBeEnabled();
    await proceedToSignBtn.scrollIntoViewIfNeeded();
    await proceedToSignBtn.evaluate(btn => btn.click());
    await page.getByRole('button', { name: 'Upload Signed copy' }).click();
    const [download] = await Promise.all([
        page.waitForEvent("download"), // wait for the download trigger
        page.click("text=click here"), // replace with your selector
    ]);
    const projectDownloadPath = path.join(
        __dirname,
        "downloads",
        await download.suggestedFilename()
    );

    // Save the file to the defined path
    await download.saveAs(projectDownloadPath);
    console.log(`File downloaded and saved to: ${projectDownloadPath}`);
    // Wait for the upload modal's file input to be ready, then upload the signed copy
    const signedCopyInput = page.locator('input[type="file"][name="file"][accept=".pdf"]');
    await signedCopyInput.waitFor({ state: 'attached' });
    await signedCopyInput.setInputFiles(projectDownloadPath);
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.close();
});