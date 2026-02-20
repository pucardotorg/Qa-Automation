import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
const globalVarsPath = path.join(__dirname, "../../global-variables.json");
let globalVariables = JSON.parse(fs.readFileSync(globalVarsPath, "utf8"));

test("Dristi Kerala login and selecting bail bond application", async ({ page }) => {
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

  console.log('Initiating Bail Application...');
  await page.getByRole('button', { name: 'Make Filings' }).click();
  await page.getByText('Raise Application').click();
  await page.locator('div').filter({ hasText: /^Application Type\*$/ }).getByRole('img').click();
  await page.getByText('Bail').click();
  
  await page.locator('input[name="litigantFatherName"]').click();
  await page.locator('input[name="litigantFatherName"]').fill('test father name');
  await page.getByRole('paragraph').filter({ hasText: /^$/ }).first().click();
  await page.locator('.ql-editor').first().fill('test grounds and reasons ');
  await page.getByRole('paragraph').filter({ hasText: /^$/ }).click();
  await page.locator('.ql-editor.ql-blank').fill('test prayer');

  await page.locator('div > button').nth(2).click();
  
  await page.locator('input[name="name"]').click();
  await page.locator('input[name="name"]').fill('test surety name');
  await page.locator('input[name="fatherName"]').click();
  await page.locator('input[name="fatherName"]').fill('test father name');
  await page.locator('input[name="mobileNumber"]').click();
  await page.locator('input[name="mobileNumber"]').fill('9630000000');
  await page.locator('input[name="locality"]').click();
  await page.locator('input[name="locality"]').fill('Tst Address');
  await page.locator('input[name="city"]').click();
  await page.locator('input[name="city"]').fill('test city');
  await page.locator('input[name="pincode"]').click();
  await page.locator('input[name="pincode"]').fill('963230');
  await page.locator('input[name="district"]').click();
  await page.locator('input[name="district"]').fill('test district');
  await page.locator('input[name="state"]').click();
  await page.locator('input[name="state"]').fill('state');
  const ProofIdentity = path.resolve(
    __dirname,
    "./Testimages/1. Cheque - 15_09_2024.png"
  );
  // Use the actual file input element — '.browse-text' is not an <input>
  await page.locator('input[type="file"]').first().setInputFiles(ProofIdentity);
  const ProofSolvency = path.resolve(
    __dirname,
    "./Testimages/1. Cheque - 15_09_2024.png"
  );
  // Uploading Proof of solvency
    await page.locator('input[type="file"]').nth(2).setInputFiles(ProofSolvency);
   // await page.getByText('Browse in my files').nth(1).setInputFiles(ProofSolvency);
  await page.getByRole('button').filter({ hasText: 'Generate Application' }).click();
    console.log('Adding Signature...');
    await page.getByRole('button', { name: 'Add Signature' }).click();
    const [download] = await Promise.all([
        page.waitForEvent("download"), // wait for the download trigger
        page.click("text=click here"), // replace with your selector
      ]);
      await page.waitForTimeout(1000);
      const projectDownloadPath = path.join(
        __dirname,
        "downloads",
        await download.suggestedFilename()
      );
    await page.waitForTimeout(1000);
      // Save the file to the defined path2
      await download.saveAs(projectDownloadPath);
      console.log(`File downloaded and saved to: ${projectDownloadPath}`);

      await page.getByRole("button", { name: "Upload document with Signature" }).click();
      
      await page.waitForTimeout(1000);

      await page
        .locator('input[type="file"]')
        .nth(5)
        .setInputFiles(projectDownloadPath);

      await page.getByRole('button', { name: 'Submit Signature' }).click();
      await page.getByRole('button', { name: 'Proceed' }).click();
      await page.locator('.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg').click();
  });