import { test, expect } from "@playwright/test";
const path = require("path");
const fs = require("fs");

const globalVarsPath = path.join(__dirname, '../../global-variables.json');
const globalVariables = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

test("Dristi Kerala login and resubmit a case", async ({ page }) => {
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
  // case search
  // Assuming the file input exists (even if hidden)
  const fileInput = await page.$('input[type="file"]');

  // Path to the file you want to upload
  const filePath = path.resolve(__dirname, "./Test.png");
  //await fileInput.setInputFiles(filePath);
  await page.locator('input[name="caseSearchText"]').click();
  await page
    .locator('input[name="caseSearchText"]')
    .fill(globalVariables.filingNumber);
  await page.getByRole("button").filter({ hasText: "Search" }).click();
  await page.getByRole("cell", { name: globalVariables.filingNumber }).click();
  await page.locator('input[name="payerBankName"]').click();
  await page.locator('input[name="payerBankName"]').fill("Resubmit");
  await page.getByRole("button").filter({ hasText: "Next" }).click();
  await page.locator(".header-end > div > svg").click();
  await page.getByRole("button").filter({ hasText: "Next" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Upload Signed copy" }).click();

   const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download PDF' }).click();
      //const download = await downloadPromise;
      const [ download ] = await Promise.all([
        page.waitForEvent('download'), // wait for the download trigger
        page.click('text=Download PDF'), // replace with your selector
      ]);
      const projectDownloadPath = path.join(__dirname, 'downloads', await download.suggestedFilename());
    
      // Save the file to the defined path2
      await download.saveAs(projectDownloadPath);
      console.log(`File downloaded and saved to: ${projectDownloadPath}`);
      await page.getByRole("button", { name: "Upload Signed PDF" }).click();
      await page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);


  // await page.getByRole("button", { name: "Upload Signed PDF" }).click();
  // await page.locator('input[type="file"]').first().setInputFiles(filePath);
  await page.getByRole("button", { name: "Submit Signature" }).click();
  await page.waitForTimeout(10000);
  await page.getByRole("button").filter({ hasText: "Submit Case" }).click();
  await page.waitForTimeout(5000);
});
