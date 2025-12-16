import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
const globalVarsPath = path.join(__dirname, "../../global-variables.json");
let globalVariables = JSON.parse(fs.readFileSync(globalVarsPath, "utf8"));

test("Dristi Kerala login and selecting notice address and payment method", async ({ page }) => {
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

  console.log('Initiating Withdrawal Application...');
  await page.getByRole('button', { name: 'Make Filings' }).click();
  await page.getByText('Raise Application').click();
  await page.locator('div').filter({ hasText: /^Application Type\*$/ }).getByRole('img').click();
  await page.getByText('Withdrawal').click();
  await page.locator('div').filter({ hasText: /^Reason for Withdrawal\*$/ }).getByRole('img').click();
  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Other' }).click();
  await page.getByRole('textbox', { name: 'Type here' }).click();
  await page.getByRole('textbox', { name: 'Type here' }).fill('Withdrawal Application Automation testing');
  await page.getByRole('button').filter({ hasText: 'Generate Application' }).click();
  console.log('Adding Signature...');
  await page.getByRole('button', { name: 'Add Signature' }).click();
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
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles(projectDownloadPath);
    await page.getByRole('button', { name: 'Submit Signature' }).click();
    await page.getByRole('button', { name: 'Proceed' }).click();
    await page.locator('.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg').click();
});