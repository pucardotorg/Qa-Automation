import { test, expect } from '@playwright/test';
const path = require('path');
const fs = require('fs');

// Import global variables
const globalVariables = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../global-variables.json'), 'utf8')
);

// Calculate dateOfService as 16 days before today
const today = new Date();
const dateOfService = new Date(today);
dateOfService.setDate(today.getDate() - 16);
const formattedDateOfService = dateOfService.toISOString().split('T')[0]; // Format as YYYY-MM-DD

// Update globalVariables with the calculated date
globalVariables.dateOfService = formattedDateOfService;
const globalVarsPath = path.join(__dirname, '../../global-variables.json');
fs.writeFileSync(globalVarsPath, JSON.stringify(globalVariables, null, 2));



test('Dristi Kerala login and file a case', async ({ page }) => {
  test.setTimeout(180000); // Set timeout to 2 minutes
  // Go to the login page
  await page.goto(`${globalVariables.baseURL}ui/citizen/select-language`);
  // sign in 
  await page.getByRole('button').click();
  // Enter mobile number
  await page.getByRole('textbox').fill(globalVariables.litigantUsername2);

  // Click on Sign In button
  await page.getByRole('button').click();
  // Enter OTP
 await page.locator('.input-otp').first().fill('1');
  await page.locator('input:nth-child(2)').fill('2');
  await page.locator('input:nth-child(3)').fill('3');
  await page.locator('input:nth-child(4)').fill('4');
  await page.locator('input:nth-child(5)').fill('5');
  await page.locator('input:nth-child(6)').fill('6');

  // Click on Verify button
  await page.getByRole('button', { name: 'Verify' }).click();

  // Click on "File a Case"
  await page.getByRole('button', { name: 'File Case' }).click();

  // Click on "Proceed" button
  await page.getByRole('button', { name: 'Proceed' }).click();

  // Click on "Start Filing"
  await page.getByRole('button', { name: 'Start Filing' }).click();
  
  // complainant details
  // comp 1
  await page.locator('input[name="complainantAge"]').fill(globalVariables.complainantAge);
  await page.getByRole('button').filter({ hasText: 'Continue' }).click();

  await page.waitForTimeout(2000);
 
  // accused details
  await page.locator('div').filter({ hasText: /^Individual$/ }).locator('input[type="radio"]').first().click();
  await page.locator('input[name="respondentFirstName"]').click();
  await page.locator('input[name="respondentFirstName"]').fill(globalVariables.respondentFirstName);
//   await page.locator('input[name="respondentFirstName"]').click();
  await page.locator('div').filter({ hasText: /^Pincode$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^Pincode$/ }).getByRole('textbox').fill(globalVariables.respondentPincode);
//   await page.locator('div').filter({ hasText: /^Pincode$/ }).getByRole('textbox').press('Tab');
  await page.locator('div').filter({ hasText: /^State$/ }).getByRole('textbox').fill(globalVariables.respondentState);
//   await page.locator('div').filter({ hasText: /^State$/ }).getByRole('textbox').press('Tab');
  await page.locator('div').filter({ hasText: /^District$/ }).getByRole('textbox').fill(globalVariables.respondentDistrict);
  await page.locator('div').filter({ hasText: /^City\/Town$/ }).getByRole('textbox').fill(globalVariables.respondentCity);
//   await page.locator('div').filter({ hasText: /^City \/ town$/ }).getByRole('textbox').press('Tab');
  await page.locator('div').filter({ hasText: /^Address$/ }).getByRole('textbox').fill(globalVariables.respondentAddress);
  await page.getByRole('button').filter({ hasText: 'Continue' }).click();

  await page.waitForTimeout(2000);

   // cheque details
  
    await page.locator('input[name="chequeSignatoryName"]').click();
    await page.locator('input[name="chequeSignatoryName"]').fill(globalVariables.chequeSignatoryName);
    // Assuming the file input exists (even if hidden)
    const fileInput = await page.$('input[type="file"]');
  
    // Path to the file you want to upload
    const chequeSignatoryName = path.resolve(
      __dirname,
      "./Testimages/1. Cheque - 15_09_2024.png"
    ); // Updated file path
  
    // Upload the file
    await fileInput.setInputFiles(chequeSignatoryName);
  //   await page.getByText('Browse in my files').first().click();
  //   await page.locator('input[type="file"]').setInputFiles('/home/beehyv/Pictures/Screenshots/automate_image.png');
    await page.locator('input[name="name"]').click();
    await page.locator('input[name="name"]').fill(globalVariables.chequeSignatoryName);
  //   await page.locator('input[name="name"]').press('Tab');
    await page.locator('input[name="payeeBankName"]').fill(globalVariables.payeeBankName);
    await page.locator('input[name="payeeBranchName"]').click();
    await page.locator('input[name="payeeBranchName"]').fill(globalVariables.payeeBranchName);
    await page.locator('input[name="chequeNumber"]').click();
    await page.locator('input[name="chequeNumber"]').fill(globalVariables.chequeNumber);
    await page.locator('input[name="issuanceDate"]').fill(globalVariables.issuanceDate);
    await page.locator('input[name="payerBankName"]').click();
    await page.locator('input[name="payerBankName"]').fill(globalVariables.payerBankName);
    await page.locator('input[name="payerBranchName"]').click();
    await page.locator('input[name="payerBranchName"]').fill(globalVariables.payerBranchName);
    await page.locator('input[name="ifsc"]').click();
    await page.locator('input[name="ifsc"]').fill(globalVariables.ifsc);
    await page.locator('#validationCustom01').click();
    await page.locator('#validationCustom01').fill(globalVariables.chequeAmount);
    await page.locator('div').filter({ hasText: /^Police Station with Jurisdiction over the Cheque Deposit Bank\*$/ }).getByRole('textbox').click();
    await page.getByText(globalVariables.policeStation).click();
    await page.locator('input[name="depositDate"]').fill(globalVariables.depositDate);
    await page.locator('div').filter({ hasText: /^\*Reason for the return of cheque$/ }).getByRole('textbox').click();
    await page.locator('div').filter({ hasText: /^\*Reason for the return of cheque$/ }).getByRole('textbox').fill(globalVariables.reasonForReturnOfCheque);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const reasonForReturnOfCheque = path.resolve(
      __dirname,
      "./Testimages/1. Cheque - 15_09_2024.png"
    );
    await page
      .locator('input[type="file"]')
      .last()
      .setInputFiles(reasonForReturnOfCheque); // Change index as needed
    await page.getByRole('button').filter({ hasText: 'Continue' }).click();
  
  await page.waitForTimeout(2000);

    // debt/ liability details
  
    await page.locator('input[name="liabilityNature"]').click();
    await page.locator('input[name="liabilityNature"]').fill(globalVariables.liabilityNature);
    await page.locator('div').filter({ hasText: /^Full Liability$/ }).getByRole('radio').click();
    await page.getByRole('button').filter({ hasText: 'Continue' }).click();

    await page.waitForTimeout(2000);
  
    // legal demand notice details
  
    await page.locator('input[name="dateOfDispatch"]').fill(globalVariables.dateOfDispatch);
    const dateOfDispatch = path.resolve(
      __dirname,
      "./Testimages/2.chequereturnmemeo.png"
    );
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles(dateOfDispatch);
    const Legalnotice = path.resolve(__dirname, "./Testimages/5.LegalNotice.pdf");
    await page.locator('input[type="file"]').nth(2).setInputFiles(Legalnotice); 
    await page.locator('input[name="dateOfService"]').fill(globalVariables.dateOfServiceDCA);
    await page.locator('div').filter({ hasText: /^No$/ }).getByRole('radio').check();
    await page.getByRole('button').filter({ hasText: 'Continue' }).click();
    await page.locator('input[type="file"]').last().setInputFiles(dateOfDispatch); 
    await page.getByRole('button').filter({ hasText: 'Continue' }).click();

    await page.waitForTimeout(2000);
    // delay condonaation application
    const DCA = path.resolve(__dirname, "./Testimages/5.LegalNotice.pdf");
    await page.locator('input[type="file"]').first().setInputFiles(DCA);

    test.setTimeout(190000);
    // 
    await page.getByRole('button').filter({ hasText: 'Continue' }).click();

    // witness details
   await page.getByRole('button').filter({ hasText: 'Continue' }).click();
    
  // // continue twice
  // await page.waitForLoadState("networkidle");
  //  for (let i = 0; i < 2; i++) {
  //    await page.waitForTimeout(3000);
  //    await page.waitForLoadState("networkidle");
  //    const continueBtn = page
  //      .getByRole("button")
  //      .filter({ hasText: "Continue" });
  //    await expect(continueBtn).toBeVisible({ timeout: 10000 });
  //    await continueBtn.click();
  //  }
 
   // complaint
 
   await page.waitForTimeout(6000);
   await page.locator('.ql-editor').first().click();
   await page.locator('.ql-editor').first().fill("test");
   const Affidavit = path.resolve(__dirname, "./Testimages/Affidavit.pdf");
   await page.locator('input[type="file"]').first().setInputFiles(Affidavit);
   await page.locator('.ql-editor').nth(1).click();
   await page.locator('.ql-editor').nth(1).fill("test");
   await page.waitForTimeout(3000);
   await page.getByRole("button").filter({ hasText: "Continue" }).click();
   await page.waitForLoadState("networkidle");
 
    // advocate details
  await page.getByRole('textbox').first().click();
  await page.getByRole('textbox').first().fill(globalVariables.noOfAdvocates);
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Add Advocate' }).click();
  await page.getByRole('textbox', { name: 'Search BAR Registration Id' }).click();
  await page
    .getByRole("textbox", { name: "Search BAR Registration Id" })
    .fill("ADV/88270000");
  await page.getByText("ADV/88270000").first().click();
  await page.waitForTimeout(3000);
  const vakalatnama = path.resolve(__dirname, "./Testimages/Vakalatnama.png");
  await page.locator('input[type="file"]').first().setInputFiles(vakalatnama);
  await page.getByRole('button').filter({ hasText: 'Continue' }).click();

  await page.waitForTimeout(5000);

  // process delivery - courier services
  await page.waitForTimeout(3000);
  // await page.getByText('Select Courier Services').first().click();
  // await page.getByRole('checkbox', { name: 'Registered Post (INR 1) • 10-' }).check();

  // save as draft


  await page.getByRole('button', { name: 'Save as Draft' }).click();
  await page.getByText('I', { exact: true }).click();
  await page.getByText('Logout').click();
  await page.getByRole('button', { name: 'Yes' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button').click();
  await page.getByRole('textbox').click();
  await page.getByRole("textbox").fill(globalVariables.citizenUsername);
  await page.getByRole('button').click();
  await page.locator('.input-otp').first().fill('1');
  await page.locator('input:nth-child(2)').fill('2');
  await page.locator('input:nth-child(3)').fill('3');
  await page.locator('input:nth-child(4)').fill('4');
  await page.locator('input:nth-child(5)').fill('5');
  await page.locator('input:nth-child(6)').fill('6');
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.waitForTimeout(10000);

  await page.getByRole('cell', { name: 'Iknoor Lit vs Automation Accused' }).first().click();
  
  await page.locator('.header-end > div > svg > path:nth-child(2)').click();
  
  await page.getByRole('button').filter({ hasText: 'Confirm Details' }).click();
   
  // review and sign
  await page.waitForTimeout(2000);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Upload Signed copy' }).click();

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



  // await page.getByRole('button', { name: 'Upload Signed PDF' }).click();
  // await page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);
  await page.getByRole('button', { name: 'Submit Signature' }).click();
  await page.getByRole('button').filter({ hasText: 'Submit Case' }).click();
    const filingNumber = await page
      .locator("span.e-filing-table-value-style")
      .innerText();
    globalVariables.filingNumber = filingNumber;
    fs.writeFileSync(
      globalVarsPath,
      JSON.stringify(globalVariables, null, 2)
    );
 await page.waitForTimeout(5000);
});
