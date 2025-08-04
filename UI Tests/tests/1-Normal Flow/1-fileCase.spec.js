import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
const globalVarsPath = path.join(__dirname, "../../global-variables.json");
let globalVariables = JSON.parse(fs.readFileSync(globalVarsPath, "utf8"));

// Calculate dateOfService as 16 days before today
const today = new Date();
const dateOfService = new Date(today);
dateOfService.setDate(today.getDate() - 16);
const formattedDateOfService = dateOfService.toISOString().split("T")[0]; // Format as YYYY-MM-DD

// Update globalVariables with the calculated date
globalVariables.dateOfService = formattedDateOfService;
fs.writeFileSync(globalVarsPath, JSON.stringify(globalVariables, null, 2));

test("Dristi Kerala login and file a case", async ({ page }) => {
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

  // Click on "File a Case"
  await page.getByRole("button", { name: "File Case" }).click();

  // Click on "Proceed" button
  await page.getByRole("button", { name: "Proceed" }).click();

  // Click on "Start Filing"
  await page.getByRole("button", { name: "Start Filing" }).click();

  // complainant details
  await page
    .locator("div")
    .filter({ hasText: /^Individual$/ })
    .getByRole("radio")
    .check();
  await page.locator('input[name="mobileNumber"]').click();
  await page
    .locator('input[name="mobileNumber"]')
    .fill(globalVariables.litigantUsername);
  await page.getByRole("button", { name: "Verify Mobile Number" }).click();
  await page.locator(".input-otp").first().fill("1");
  await page.locator("input:nth-child(2)").fill("2");
  await page.locator("input:nth-child(3)").fill("3");
  await page.locator("input:nth-child(4)").fill("4");
  await page.locator("input:nth-child(5)").fill("5");
  await page.locator("input:nth-child(6)").fill("6");
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await page.locator('input[name="complainantAge"]').click();
  await page
    .locator('input[name="complainantAge"]')
    .fill(globalVariables.complainantAge);

  await page.getByRole("button").filter({ hasText: "Continue" }).click();

  // accused details
  await page
    .locator("div")
    .filter({ hasText: /^Individual$/ })
    .locator('input[type="radio"]')
    .first()
    .click();
  await page.locator('input[name="respondentFirstName"]').click();
  await page
    .locator('input[name="respondentFirstName"]')
    .fill(globalVariables.respondentFirstName);

  //   await page.locator('input[name="respondentFirstName"]').click();
  await page
    .locator("div")
    .filter({ hasText: /^Pincode$/ })
    .getByRole("textbox")
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^Pincode$/ })
    .getByRole("textbox")
    .fill(globalVariables.respondentPincode);
  //   await page.locator('div').filter({ hasText: /^Pincode$/ }).getByRole('textbox').press('Tab');
  await page
    .locator("div")
    .filter({ hasText: /^State$/ })
    .getByRole("textbox")
    .fill(globalVariables.respondentState);
  //   await page.locator('div').filter({ hasText: /^State$/ }).getByRole('textbox').press('Tab');
  await page
    .locator("div")
    .filter({ hasText: /^District$/ })
    .getByRole("textbox")
    .fill(globalVariables.respondentDistrict);
  await page
    .locator("div")
    .filter({ hasText: /^City \/ town$/ })
    .getByRole("textbox")
    .fill(globalVariables.respondentCity);
  //   await page.locator('div').filter({ hasText: /^City \/ town$/ }).getByRole('textbox').press('Tab');
  await page
    .locator("div")
    .filter({ hasText: /^Address$/ })
    .getByRole("textbox")
    .fill(globalVariables.respondentAddress);

  await page.getByRole("button").filter({ hasText: "Continue" }).click();

  // cheque details

  await page.locator('input[name="chequeSignatoryName"]').click();
  await page
    .locator('input[name="chequeSignatoryName"]')
    .fill(globalVariables.chequeSignatoryName);
  // Assuming the file input exists (even if hidden)
  const fileInput = await page.$('input[type="file"]');
  // Path to the file you want to upload
  const filePath = path.resolve(__dirname, "./Test.png");

  // Upload the file
  await fileInput.setInputFiles(filePath);
  //   await page.getByText('Browse in my files').first().click();
  //   await page.locator('input[type="file"]').setInputFiles('/home/beehyv/Pictures/Screenshots/automate_image.png');
  await page.locator('input[name="name"]').click();
  await page.locator('input[name="name"]').fill("Name On Cheque");
  //   await page.locator('input[name="name"]').press('Tab');
  await page
    .locator('input[name="payeeBankName"]')
    .fill(globalVariables.payeeBankName);
  await page.locator('input[name="payeeBranchName"]').click();
  await page
    .locator('input[name="payeeBranchName"]')
    .fill(globalVariables.payeeBranchName);
  await page.locator('input[name="chequeNumber"]').click();
  await page
    .locator('input[name="chequeNumber"]')
    .fill(globalVariables.chequeNumber);
  await page
    .locator('input[name="issuanceDate"]')
    .fill(globalVariables.issuanceDate);
  await page.locator('input[name="payerBankName"]').click();
  await page
    .locator('input[name="payerBankName"]')
    .fill(globalVariables.payerBankName);
  await page.locator('input[name="payerBranchName"]').click();
  await page
    .locator('input[name="payerBranchName"]')
    .fill(globalVariables.payerBranchName);
  await page.locator('input[name="ifsc"]').click();
  await page.locator('input[name="ifsc"]').fill(globalVariables.ifsc);
  await page.locator("#validationCustom01").click();
  await page.locator("#validationCustom01").fill(globalVariables.chequeAmount);
  await page
    .locator("div")
    .filter({
      hasText:
        /^Police Station with Jurisdiction over the Cheque Deposit Bank\*$/,
    })
    .getByRole("textbox")
    .click();
  await page.getByText(globalVariables.policeStation).click();
  await page
    .locator('input[name="depositDate"]')
    .fill(globalVariables.depositDate);
  await page
    .locator("div")
    .filter({ hasText: /^\*Reason for the return of cheque$/ })
    .getByRole("textbox")
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^\*Reason for the return of cheque$/ })
    .getByRole("textbox")
    .fill(globalVariables.reasonForReturnOfCheque);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.locator('input[type="file"]').last().setInputFiles(filePath); // Change index as needed

  await page.getByRole("button").filter({ hasText: "Continue" }).click();

  // debt/ liability details

  await page.locator('input[name="liabilityNature"]').click();
  await page
    .locator('input[name="liabilityNature"]')
    .fill(globalVariables.liabilityNature);
  await page
    .locator("div")
    .filter({ hasText: /^Full Liability$/ })
    .getByRole("radio")
    .click();

  await page.getByRole("button").filter({ hasText: "Continue" }).click();

  // legal demand notice details

  await page
    .locator('input[name="dateOfDispatch"]')
    .fill(globalVariables.dateOfDispatch);
  await page.locator('input[type="file"]').first().setInputFiles(filePath);
  await page.locator('input[type="file"]').nth(2).setInputFiles(filePath);
  await page
    .locator('input[name="dateOfService"]')
    .fill(globalVariables.dateOfService);
  await page
    .locator("div")
    .filter({ hasText: /^No$/ })
    .getByRole("radio")
    .check();
  await page.getByRole("button").filter({ hasText: "Continue" }).click();
  await page.locator('input[type="file"]').last().setInputFiles(filePath);

  await page.getByRole("button").filter({ hasText: "Continue" }).click();

  //? delay condonaation application

  // await page.locator('input[type="file"]').first().setInputFiles(filePath);
  // test.setTimeout(120000);
  // await page.getByRole('button').filter({ hasText: 'Continue' }).click();

  // witness details

  //await page.getByRole('button').filter({ hasText: 'Continue' }).click();
  // Click Continue twice
  for (let i = 0; i < 2; i++) {
    const continueBtn = page
      .getByRole("button")
      .filter({ hasText: "Continue" });
    await expect(continueBtn).toBeVisible({ timeout: 10000 });
    await continueBtn.click();
  }

  // complaint

  await page.getByRole("textbox", { name: "rdw-editor" }).click();
  await page.getByRole("textbox", { name: "rdw-editor" }).fill("test");
  await page.locator('input[type="file"]').first().setInputFiles(filePath);
  await page.getByRole("textbox").nth(1).click();
  await page.getByRole("textbox").nth(1).fill("test");
  await page.getByRole("button").filter({ hasText: "Continue" }).click();

  // advocate details

  await page.getByRole("textbox").first().click();
  await page.getByRole("textbox").first().fill(globalVariables.noOfAdvocates);
  await page.locator('input[type="file"]').first().setInputFiles(filePath);
  await page.getByRole("button").filter({ hasText: "Continue" }).click();

  // review and sign

  await page.locator(".header-end > div > svg > path:nth-child(2)").click();
  await page.getByRole("button").filter({ hasText: "Confirm Details" }).click();
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
  
  
  await page.getByRole("button", { name: "Submit Signature" }).click();
  await page.getByRole("button").filter({ hasText: "Submit Case" }).click();
  const filingNumber = await page
    .locator("span.e-filing-table-value-style")
    .innerText();
  globalVariables.filingNumber = filingNumber;
  fs.writeFileSync(globalVarsPath, JSON.stringify(globalVariables, null, 2));
  await page.waitForTimeout(5000);
});
