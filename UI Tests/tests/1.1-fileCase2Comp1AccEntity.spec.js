import { test, expect } from '@playwright/test';
const path = require('path');
test('Dristi Kerala login and file a case', async ({ page }) => {
  // Go to the login page
  await page.goto('https://dristi-kerala-uat.pucar.org/ui/citizen/select-language');
  // sign in 
  await page.getByRole('button').click();
  // Enter mobile number
 await page.getByRole('textbox').fill('9955999992');

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
  await page.locator('div').filter({ hasText: /^Individual$/ }).getByRole('radio').check();
  await page.locator('input[name="mobileNumber"]').click();
  await page.locator('input[name="mobileNumber"]').fill('9955999999');
  await page.getByRole('button', { name: 'Verify Mobile Number' }).click();
  await page.locator('.input-otp').first().fill('1');
  await page.locator('input:nth-child(2)').fill('2');
  await page.locator('input:nth-child(3)').fill('3');
  await page.locator('input:nth-child(4)').fill('4');
  await page.locator('input:nth-child(5)').fill('5');
  await page.locator('input:nth-child(6)').fill('6');
  await page.getByRole('button', { name: 'Verify', exact: true }).click();
  await page.locator('input[name="complainantAge"]').click();
  await page.locator('input[name="complainantAge"]').fill('45');

  // comp 2
   await page.getByRole('button', { name: 'Add Complainant' }).click();
  await page.locator('form').filter({ hasText: 'Complainant TypeIndividualEntityContinueSave as Draft' }).getByRole('radio').first().check();
  await page.locator('form').filter({ hasText: 'Complainant TypeIndividualEntityComplainant\'s Mobile Number+91Verify Mobile' }).locator('input[name="mobileNumber"]').click();
  await page.locator('form').filter({ hasText: 'Complainant TypeIndividualEntityComplainant\'s Mobile Number+91Verify Mobile' }).locator('input[name="mobileNumber"]').fill('9955599999');
  await page.getByRole('button', { name: 'Verify Mobile Number' }).click();
  await page.locator('.input-otp').first().fill('1');
  await page.locator('input:nth-child(2)').fill('2');
  await page.locator('input:nth-child(3)').fill('3');
  await page.locator('input:nth-child(4)').fill('4');
  await page.locator('input:nth-child(5)').fill('5');
  await page.locator('input:nth-child(6)').fill('6');
  await page.getByRole('button', { name: 'Verify', exact: true }).click();
  await page.locator('input[name="complainantAge"]').nth(1).click();
  await page.locator('input[name="complainantAge"]').nth(1).fill('45');
  await page.getByRole('button').filter({ hasText: 'Continue' }).nth(1).click();
 
  // accused details (as entity)
   await page.locator('div').filter({ hasText: /^Entity$/ }).getByRole('radio').first().check();
  await page.locator('div').filter({ hasText: /^Type of Entity\*$/ }).getByRole('img').click();
  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'One-person company' }).click();
  await page.locator('input[name="respondentCompanyName"]').click();
  await page.locator('input[name="respondentCompanyName"]').fill('automation');
  await page.locator('input[name="respondentFirstName"]').click();
  await page.locator('input[name="respondentFirstName"]').fill('Automation');
  await page.locator('div').filter({ hasText: /^Pincode$/ }).getByRole('textbox').fill('544444');
  await page.locator('div').filter({ hasText: /^State$/ }).getByRole('textbox').fill('f');
  await page.locator('div').filter({ hasText: /^District$/ }).getByRole('textbox').fill('f');
  await page.locator('div').filter({ hasText: /^City \/ town$/ }).getByRole('textbox').fill('f');
  await page.locator('div').filter({ hasText: /^Address$/ }).getByRole('textbox').fill('Hh');
  await page.getByRole('button').filter({ hasText: 'Continue' }).click();

   // cheque details
  
    await page.locator('input[name="chequeSignatoryName"]').click();
    await page.locator('input[name="chequeSignatoryName"]').fill('Test');
    // Assuming the file input exists (even if hidden)
    const fileInput = await page.$('input[type="file"]');
  
    // Path to the file you want to upload
    const filePath = path.resolve(__dirname, 'C:\\Users\\Iknoor\\Pictures\\Screenshots\\automation_image.png');
  
    // Upload the file
    await fileInput.setInputFiles(filePath);
  //   await page.getByText('Browse in my files').first().click();
  //   await page.locator('input[type="file"]').setInputFiles('/home/beehyv/Pictures/Screenshots/automate_image.png');
    await page.locator('input[name="name"]').click();
    await page.locator('input[name="name"]').fill('Name On Cheque');
  //   await page.locator('input[name="name"]').press('Tab');
    await page.locator('input[name="payeeBankName"]').fill('Bank Name');
    await page.locator('input[name="payeeBranchName"]').click();
    await page.locator('input[name="payeeBranchName"]').fill('Branch Name');
    await page.locator('input[name="chequeNumber"]').click();
    await page.locator('input[name="chequeNumber"]').fill('0000000');
    await page.locator('input[name="issuanceDate"]').fill('2024-06-01');
    await page.locator('input[name="payerBankName"]').click();
    await page.locator('input[name="payerBankName"]').fill('Test');
    await page.locator('input[name="payerBranchName"]').click();
    await page.locator('input[name="payerBranchName"]').fill('Test');
    await page.locator('input[name="ifsc"]').click();
    await page.locator('input[name="ifsc"]').fill('IIII0IIIIII');
    await page.locator('#validationCustom01').click();
    await page.locator('#validationCustom01').fill('999');
    await page.locator('div').filter({ hasText: /^Police Station with Jurisdiction over the Cheque Deposit Bank\*$/ }).getByRole('textbox').click();
    await page.getByText('MEDICAL COLLEGE PS').click();
    await page.locator('input[name="depositDate"]').fill('2024-06-15');
    await page.locator('div').filter({ hasText: /^\*Reason for the return of cheque$/ }).getByRole('textbox').click();
    await page.locator('div').filter({ hasText: /^\*Reason for the return of cheque$/ }).getByRole('textbox').fill('reason');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.locator('input[type="file"]').last().setInputFiles(filePath); // Change index as needed
   await page.getByRole('button').filter({ hasText: 'Continue' }).click();
  
    // debt/ liability details
  
    await page.locator('input[name="liabilityNature"]').click();
    await page.locator('input[name="liabilityNature"]').fill('Test');
    await page.locator('div').filter({ hasText: /^Full Liability$/ }).getByRole('radio').click();
    await page.getByRole('button').filter({ hasText: 'Continue' }).click();
  
    // legal demand notice details
  
    await page.locator('input[name="dateOfDispatch"]').fill('2024-06-29');
    await page.locator('input[type="file"]').first().setInputFiles(filePath); 
    await page.locator('input[type="file"]').nth(2).setInputFiles(filePath); 
    await page.locator('input[name="dateOfService"]').fill('2024-06-29');
    await page.locator('div').filter({ hasText: /^No$/ }).getByRole('radio').check();
    await page.getByRole('button').filter({ hasText: 'Continue' }).click();
    await page.locator('input[type="file"]').last().setInputFiles(filePath); 
    await page.getByRole('button').filter({ hasText: 'Continue' }).click();
  
    // delay condonaation application
  
    await page.locator('input[type="file"]').first().setInputFiles(filePath); 
    test.setTimeout(120000);
//     await page.getByRole('button').filter({ hasText: 'Continue' }).click();
  
//     // witness details
//    await page.getByRole('button').filter({ hasText: 'Continue' }).click();
 // Click Continue twice
  for (let i = 0; i < 2; i++) {
    const continueBtn = page.getByRole('button').filter({ hasText: 'Continue' });
    await expect(continueBtn).toBeVisible({ timeout: 15000 });
    await continueBtn.click();
    await page.waitForTimeout(2000);
  }
    // complaint 
   
    await page.getByRole('textbox', { name: 'rdw-editor' }).click();
    await page.getByRole('textbox', { name: 'rdw-editor' }).fill('test');
    await page.locator('input[type="file"]').first().setInputFiles(filePath); 
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('textbox').nth(1).fill('test');
    await page.getByRole('button').filter({ hasText: 'Continue' }).click();
    
    // advocate details
  
    await page.getByRole('textbox').first().click();
    await page.getByRole('textbox').first().fill('1');
    await page.locator('input[type="file"]').first().setInputFiles(filePath);
   
     await page.locator('form').filter({ hasText: 'Complainant 2IknoorIs this' }).getByRole('textbox').click();
  await page.locator('form').filter({ hasText: 'Complainant 2IknoorIs this' }).getByRole('textbox').fill('1');
  await page.getByRole('button', { name: 'Add Advocate' }).nth(1).click();
  await page.locator('div').filter({ hasText: /^Advocate 1 BAR Registration$/ }).getByRole('img').nth(1).click();
  await page.locator('form').filter({ hasText: 'Complainant 2IknoorIs this' }).getByPlaceholder('Search BAR Registration Id').click();
  await page.waitForTimeout(10000);
  await page.locator('form').filter({ hasText: 'Complainant 2IknoorIs this' }).getByPlaceholder('Search BAR Registration Id').fill('iknoor/001');
  await page.waitForTimeout(10000);
  await page.getByText('IKNOOR/001Advocate iknoor').click();
  await page.locator('form').filter({ hasText: 'Complainant 2IknoorIs this' }).locator('text').click();
  await page.locator('input[type="file"]').last().setInputFiles(filePath);
 await page.getByRole('button').filter({ hasText: 'Continue' }).nth(1).click();

   // review and sign

  await page.locator('.header-end > div > svg > path:nth-child(2)').click();
   await page.getByRole('button').filter({ hasText: 'Confirm Details' }).click();
   await page.getByRole('checkbox').check();
   await page.getByRole('button', { name: 'Upload Signed copy' }).click();
  await page.getByRole('button', { name: 'Upload Signed PDF' }).click();
  await page.locator('input[type="file"]').first().setInputFiles(filePath);
  await page.getByRole('button', { name: 'Submit Signature' }).click();
  await page.waitForTimeout(10000);
  await page.getByRole('button').filter({ hasText: 'Submit Case' }).click();
 await page.waitForTimeout(10000);
});
