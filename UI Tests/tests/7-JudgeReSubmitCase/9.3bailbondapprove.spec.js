import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
const globalVarsPath = path.join(__dirname, "../../global-variables.json");
let globalVariables = JSON.parse(fs.readFileSync(globalVarsPath, "utf8"));

test("Dristi Kerala login and selecting bail bond", async ({ page }) => {
  test.setTimeout(200000);
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

  console.log('Initiating Bail Bond...');
  await page.getByRole('button', { name: 'Make Filings' }).click();
  await page.getByText('Generate Bail Bond').click();
  await page.locator('input[name="litigantFatherName"]').click();
  await page.locator('input[name="litigantFatherName"]').fill('test father name');
  await page.locator('#validationCustom01').click();
  await page.locator('#validationCustom01').fill('5000');
  await page.locator('div').filter({ hasText: /^Bail Type\*$/ }).getByRole('img').click();
  await page.getByText('Bail Surety').click();
  await page.locator('input[name="name"]').first().click();
  await page.locator('input[name="name"]').first().fill('surety one');
  await page.locator('input[name="fatherName"]').first().click();
  await page.locator('input[name="fatherName"]').first().fill('father surety name');
  await page.locator('input[name="mobileNumber"]').first().click();
  await page.locator('input[name="mobileNumber"]').first().fill('9630000000');
  await page.locator('input[name="email"]').first().click();
  await page.locator('input[name="email"]').first().fill('enail@gmail.com');
  await page.locator('input[name="locality"]').first().click();
  await page.locator('input[name="locality"]').first().fill('Add One');
  await page.locator('input[name="city"]').first().click();
  await page.locator('input[name="city"]').first().fill('city');
  await page.locator('input[name="pincode"]').first().click();
  await page.locator('input[name="pincode"]').first().fill('985620');
  await page.locator('input[name="district"]').first().click();
  await page.locator('input[name="district"]').first().fill('ditrict');
  await page.locator('input[name="state"]').first().click();
  await page.locator('input[name="state"]').first().fill('state');
  const ProofIdentity = path.resolve(
    __dirname,
    "./Testimages/1. Cheque - 15_09_2024.png"
  );
  await page.locator('input[type="file"]').first().setInputFiles(ProofIdentity);
  const ProofSolvency = path.resolve(
    __dirname,
    "./Testimages/1. Cheque - 15_09_2024.png"
  );
  // Uploading Proof of solvency
    await page.locator('input[type="file"]').nth(2).setInputFiles(ProofSolvency);
  await page.locator('input[name="name"]').nth(1).click();
  await page.locator('input[name="name"]').nth(1).fill('surety name two');
  await page.locator('input[name="fatherName"]').nth(1).click();
  await page.locator('input[name="fatherName"]').nth(1).fill('father name two');
  await page.locator('input[name="mobileNumber"]').nth(1).click();
  await page.locator('input[name="mobileNumber"]').nth(1).fill('9640000000');
  await page.locator('input[name="email"]').nth(1).click();
  await page.locator('input[name="locality"]').nth(1).click();
  await page.locator('input[name="locality"]').nth(1).fill('Add Two');
  await page.locator('input[name="city"]').nth(1).click();
  await page.locator('input[name="city"]').nth(1).fill('city two');
  await page.locator('input[name="pincode"]').nth(1).click();
  await page.locator('input[name="pincode"]').nth(1).fill('985635');
  await page.locator('input[name="district"]').nth(1).click();
  await page.locator('input[name="district"]').nth(1).fill('district');
  await page.locator('input[name="state"]').nth(1).click();
  await page.locator('input[name="state"]').nth(1).fill('state');
 const ProofIdentity2 = path.resolve(
    __dirname,
    "./Testimages/1. Cheque - 15_09_2024.png"
  );
  await page.locator('input[type="file"]').nth(5).setInputFiles(ProofIdentity2);
  const ProofSolvency2 = path.resolve(
    __dirname,
    "./Testimages/1. Cheque - 15_09_2024.png"
  );
  // Uploading Proof of solvency
    await page.locator('input[type="file"]').nth(7).setInputFiles(ProofSolvency2);
  console.log('Submitting Bail Bond Application...');
  await page.getByRole('button').filter({ hasText: 'Review Bail Bond' }).click();
    console.log('Adding Signature...');
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Proceed To Sign' }).click();

    await page.getByRole("button", { name: "Upload Signed copy" }).click();
    
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
           await page
             .locator('input[type="file"]')
             .last()
             .setInputFiles(projectDownloadPath);
      await page.getByRole('button', { name: 'Submit' }).click();
      await page.getByRole('button', { name: 'Close' }).click();
  });