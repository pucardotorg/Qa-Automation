import { test, expect } from '@playwright/test';

test('Citizen Case Filing Test', async ({ page }) => {
  // Navigate to the citizen login page
  console.log('Navigating to citizen login page...');
  await page.goto('https://dristi-kerala-dev.pucar.org/ui/citizen/dristi/home/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Enter mobile number and sign in
  console.log('Entering mobile number...');
  const mobileInput = page.locator('input[name="mobileNumber"]');
  await expect(mobileInput).toBeVisible({ timeout: 15000 });
  await mobileInput.fill('9955999992');
  
  // Click Sign In button
  console.log('Clicking Sign In button...');
  const signInButton = page.getByRole('button').filter({ hasText: 'Sign In' });
  await expect(signInButton).toBeVisible({ timeout: 15000 });
  await signInButton.click();
  await page.waitForTimeout(2000);

  // Enter OTP
  console.log('Entering OTP...');
  const otpInputs = await page.locator('input.input-otp').all();
  const otp = '123456';
  for (let i = 0; i < 6; i++) {
    await otpInputs[i].fill(otp[i]);
  }
  await page.waitForTimeout(1000);

  // Click Verify button
  console.log('Clicking Verify button...');
  const verifyButton = page.getByRole('button').filter({ hasText: 'Verify' });
  await expect(verifyButton).toBeVisible({ timeout: 15000 });
  await verifyButton.click();
  await page.waitForTimeout(3000);

  // Wait for successful login
  console.log('Waiting for successful login...');
  await page.waitForSelector('span.search-component-table tbody tr', { timeout: 30000 });
  console.log('Login successful.');

  // Click File Case button
  console.log('Clicking File Case button...');
  const fileCaseButton = page.getByRole('button').filter({ hasText: 'File Case' });
  await expect(fileCaseButton).toBeVisible({ timeout: 15000 });
  await fileCaseButton.click();
  await page.waitForTimeout(2000);

  // Click Proceed button
  console.log('Clicking Proceed button...');
  const proceedButton = page.getByRole('button').filter({ hasText: 'Proceed' });
  await expect(proceedButton).toBeVisible({ timeout: 15000 });
  await proceedButton.click();
  await page.waitForTimeout(2000);

  // Click Start Filing button
  console.log('Clicking Start Filing button...');
  const startFilingButton = page.getByRole('button').filter({ hasText: 'Start Filing' });
  await expect(startFilingButton).toBeVisible({ timeout: 15000 });
  await startFilingButton.click();
  await page.waitForTimeout(2000);

  // Select Individual radio button
  console.log('Selecting Individual option...');
  const individualRadio = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div/div[2]/form/div[1]/div[2]/div/div/div/div/div/div/div[1]/span/input');
  await expect(individualRadio).toBeVisible({ timeout: 15000 });
  await individualRadio.click();
  await page.waitForTimeout(2000);

  // Fill complainant details with new mobile number
  console.log('Filling complainant details with new mobile number...');
  const complainantMobileInput = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div/div[2]/form/div[1]/div[4]/div/div/div[2]/div/div/input');
  await complainantMobileInput.fill('7755445511');
  
  // Click Verify Mobile Number button
  const verifyMobileButton = page.getByRole('button').filter({ hasText: 'Verify Mobile Number' });
  await expect(verifyMobileButton).toBeVisible({ timeout: 15000 });
  await verifyMobileButton.click();
  await page.waitForTimeout(2000);

  // Enter OTP for mobile verification (each digit in its own box)
  const mobileOtpInputs = await page.locator('input.input-otp').all();
  const mobileOtp = '123456';
  for (let i = 0; i < 6; i++) {
    await mobileOtpInputs[i].fill(mobileOtp[i]);
  }
  await page.waitForTimeout(1000);

  // Click second Verify button
  const secondVerifyButton = page.getByRole('button').filter({ hasText: 'Verify' }).nth(1);
  await expect(secondVerifyButton).toBeVisible({ timeout: 15000 });
  await secondVerifyButton.click();
  await page.waitForTimeout(2000);

  // Fill age
  await page.locator('input[name="complainantAge"]').fill('22');

  // Select Power of Attorney Details with No option using XPath
  console.log('Selecting Power of Attorney Details as No...');
  const poaNoRadio = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div/div[2]/form/div[1]/div[12]/div/div/div[2]/span/input');
  await expect(poaNoRadio).toBeVisible({ timeout: 15000 });
  await poaNoRadio.click();
  await page.waitForTimeout(2000);

  // Click Continue
  const continueButton = page.getByRole('button').filter({ hasText: 'Continue' });
  await expect(continueButton).toBeVisible({ timeout: 15000 });
  await continueButton.click();
  await page.waitForTimeout(2000);

  // Select Individual for accused using CSS selector
  console.log('Selecting Individual for accused...');
  const accusedIndividualRadio = page.locator('.card > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > input:nth-child(1)');
  await expect(accusedIndividualRadio).toBeVisible({ timeout: 15000 });
  await accusedIndividualRadio.click();
  await page.waitForTimeout(2000);

  // Fill accused details
  console.log('Filling accused details...');
  const accusedFields = {
    'respondentFirstName': 'Accused',
    'Pincode': '685005',
    'State': 'kerala',
    'District': 'kannur',
    'City / town': 'kannur',
    'Address': 'kannur'
  };

  for (const [label, value] of Object.entries(accusedFields)) {
    if (label === 'respondentFirstName') {
      await page.locator('input[name="respondentFirstName"]').fill(value);
    } else if (label === 'Address') {
      const addressInput = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div/div[2]/form/div[1]/div[11]/div/div/div/div[2]/div[6]/div/div/input');
      await expect(addressInput).toBeVisible({ timeout: 15000 });
      await addressInput.fill(value);
    } else {
      const input = page.locator(`//h2[contains(text(), '${label}')]/following-sibling::div//input`);
      await expect(input).toBeVisible({ timeout: 15000 });
      await input.fill(value);
    }
    await page.waitForTimeout(1000);
  }

  // Click Continue
  const accusedContinueButton = page.getByRole('button').filter({ hasText: 'Continue' });
  await expect(accusedContinueButton).toBeVisible({ timeout: 15000 });
  await accusedContinueButton.click();
  await page.waitForTimeout(2000);

  // Enter cheque value before uploading Dishonored Cheque
    // Handle file uploads
  console.log('Handling file uploads...');
  const filePath = '/home/bhlp0121/Downloads/Test documents p/client shared/1. Cheque - 15_09_2024.png';  // Updated file path

  // Upload the file using the first file input for Dishonored Cheque
  const dishonoredChequeInput = page.locator('input[type="file"]').first();
  await expect(dishonoredChequeInput).toBeVisible({ timeout: 15000 });
  await dishonoredChequeInput.setInputFiles(filePath);
  await page.waitForTimeout(2000);

  // Upload Cheque Return Memo using the second file input
 

  // Select Police Station using the provided XPath
  console.log('Selecting Police Station...');
  const policeStationInput = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div/div[2]/form/div[1]/div[24]/div/div/div/input');
  await expect(policeStationInput).toBeVisible({ timeout: 15000 });
  await policeStationInput.click();
  await policeStationInput.fill('VIYYOOR');
  await page.waitForTimeout(1000);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);

  // Upload the file (assuming the next upload step is for the required document)
  const fileUploadInput = page.locator('input[type="file"]').nth(2)
  await expect(fileUploadInput).toBeVisible({ timeout: 15000 });
  await fileUploadInput.setInputFiles(filePath);
  await page.waitForTimeout(2000);

  // Fill cheque details
  console.log('Filling cheque details...');
  const chequeFields = {
    'Name of Signatory of Dishonoured Cheque': 'First Cheque',
    'Payee Name on Cheque': 'asdfgh',
    'Payee Bank Name': 'SBI',
    'Payee Bank Branch Name': 'ertyu',
    'Cheque Number': '123456',
    'Date of Cheque': '2025-01-01',
    'Payer Bank Name': 'sdfg',
    'Payer Bank Branch Name': 'zxdcfvgbhj',
    'IFSC Code': 'TGFV0456786',
    'Cheque Amount': '541541',
    'Date of Return of Cheque as per Cheque Return Memo': '2025-01-15',
  };

  for (const [label, value] of Object.entries(chequeFields)) {
    let input;
    if (label.includes('Date')) {
      // Try input[type="date"] first, then fallback to input
      input = page.locator(`//h2[contains(text(), "${label}")]/following-sibling::div//input[@type="date"]`);
      if (!(await input.count())) {
        input = page.locator(`//h2[contains(text(), "${label}")]/following-sibling::div//input`);
      }
      console.log(`Filling date field "${label}" with value "${value}"`);
      await expect(input).toBeVisible({ timeout: 15000 });
      await input.fill(value);
      await page.waitForTimeout(1000); // Wait 1 second after filling date field
      console.log(`Filled date field "${label}"`);
    } else {
      input = page.locator(`//h2[contains(text(), "${label}")]/following-sibling::div//input`);
    }
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill(value);
    await page.waitForTimeout(1000);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const chequeReturnMemoInput = page.locator('input[type="file"]').last()
  await expect(chequeReturnMemoInput).toBeVisible({ timeout: 15000 });
  await chequeReturnMemoInput.setInputFiles(filePath);
  await page.waitForTimeout(2000);
  // Scroll to the bottom of the page before filling reason for return
  //ait page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const reasonTextarea = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div/div[2]/form/div[1]/div[30]/div/div/textarea');
  //ait expect(reasonTextarea).toBeVisible({ timeout: 2000});
  //ait reasonTextarea.click();
  await reasonTextarea.fill('reason for change');
  // Click out of the field (click the body)
  await page.locator('body').click();
  // Click Continue
  console.log('Clicking Continue Button..');
  const chequeDetailsContinueButton = page.getByRole('button').filter({ hasText: 'Continue' });
  await expect(chequeDetailsContinueButton).toBeVisible({ timeout: 15000 });
  await chequeDetailsContinueButton.click();
  await page.waitForTimeout(10000);
  // Select Full Liability
  console.log('Selecting Full Liability...');
  const fullLiabilityRadio = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div/div[2]/form/div[1]/div[4]/div/div/div[1]/span/input');
  await expect(fullLiabilityRadio).toBeVisible({ timeout: 15000 });
  await fullLiabilityRadio.click();
  await page.waitForTimeout(2000);

  // Fill debt/liability details
  console.log('Filling debt/liability details...');
  const natureInput = page.locator('//h2[contains(text(), "Nature of debt / liability for which cheque(s) was/were received")]/following-sibling::div//input');
  await expect(natureInput).toBeVisible({ timeout: 15000 });
  await natureInput.fill('Sales');
  
  // Click Continue
  const liabilityContinueButton = page.getByRole('button').filter({ hasText: 'Continue' });
  await expect(liabilityContinueButton).toBeVisible({ timeout: 15000 });
  await liabilityContinueButton.click();
  await page.waitForTimeout(2000);

  // Upload Legal Demand Notice and related documents
  console.log('Uploading Legal Demand Notice and related documents...');
  
  // Upload Legal Demand Notice
  const legalDemandNoticeInput = page.locator('input[type="file"]').first();
  await legalDemandNoticeInput.setInputFiles(filePath);
  await page.waitForTimeout(2000);
  const proofOfDispatchInput1 = page.locator('input[type="file"]').nth(2);
  await proofOfDispatchInput1.setInputFiles(filePath);
  await page.waitForTimeout(2000);
  const proofOfDispatchInput2 = page.locator('input[type="file"]').last();
  await proofOfDispatchInput2.setInputFiles(filePath);
  await page.waitForTimeout(2000);
  // Select No for first question
  console.log('Selecting No for first question...');
  const firstNoRadio = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div/div[2]/form/div[1]/div[12]/div/div/div[2]/span/input');
  await expect(firstNoRadio).toBeVisible({ timeout: 15000 });
  await firstNoRadio.click({ force: true });
  await page.waitForTimeout(2000);

  // Upload Proof of dispatch
  console.log('Uploading Proof of dispatch...');
  const proofOfDispatchInput = page.locator('input[type="file"]').nth(1);
  await expect(proofOfDispatchInput).toBeVisible({ timeout: 15000 });
  await proofOfDispatchInput.setInputFiles(filePath);
  await page.waitForTimeout(2000);

  // Select No for second question
 // const secondNoRadio = page.locator('label').filter({ hasText: 'No' }).locator('span').nth(2);
 // await secondNoRadio.click();
 // await page.waitForTimeout(1000);

  // Fill dispatch dates
  const dispatchDates = {
    'Date of Dispatch of Legal': '2025-02-03',
    'Date of Service or Deemed Service': '2025-02-17'
  };

  for (const [label, value] of Object.entries(dispatchDates)) {
    const input = page.locator(`//h2[contains(text(), "${label}")]/following-sibling::div//input`);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill(value);
    await page.waitForTimeout(1000);
  }

  // Upload Delay Condonation Application
  const continueBtn1 = page.getByRole('button').filter({ hasText: 'Continue' });
    await expect(continueBtn1).toBeVisible({ timeout: 15000 });
    await continueBtn1.click();
    await page.waitForTimeout(2000);
    console.log('Uploading Delay Condonation Application...');
  const delayCondonationInput = page.locator('input[type="file"]').first();
  await expect(delayCondonationInput).toBeVisible({ timeout: 15000 });
  await delayCondonationInput.setInputFiles(filePath);
  await page.waitForTimeout(2000);
  
  
  // Click Continue twice
  for (let i = 0; i < 2; i++) {
    const continueBtn = page.getByRole('button').filter({ hasText: 'Continue' });
    await expect(continueBtn).toBeVisible({ timeout: 15000 });
    await continueBtn.click();
    await page.waitForTimeout(2000);
  }

  // Upload Affidavit
  const affidavitInput = page.locator('input[type="file"]').first();
  await affidavitInput.setInputFiles(filePath);
  await page.waitForTimeout(2000);

  // Fill complaint and prayer
  const complaintTextarea = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div/div[2]/form/div[1]/div[6]/div/div/textarea');
  await expect(complaintTextarea).toBeVisible({ timeout: 15000 });
  await complaintTextarea.fill('Complaint');

  const prayerTextarea = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div/div[2]/form/div[1]/div[10]/div/div/textarea');
  await expect(prayerTextarea).toBeVisible({ timeout: 15000 });
  await prayerTextarea.fill('Details of the complaint');

  // Click Continue
  const complaintContinueButton = page.getByRole('button').filter({ hasText: 'Continue' });
  await expect(complaintContinueButton).toBeVisible({ timeout: 15000 });
  await complaintContinueButton.click();
  await page.waitForTimeout(2000);

  // Add Advocate
  // console.log('Adding Advocate details...');
  // const addAdvocateButton = page.getByRole('heading', { name: 'Add Advocate' });
  // await expect(addAdvocateButton).toBeVisible({ timeout: 15000 });
  // await addAdvocateButton.click();
  // await page.waitForTimeout(2000);

  // // Search and select advocate
  // const barSearchInput = page.locator('input[placeholder="Search BAR Registration Id"]').nth(1);
  // await expect(barSearchInput).toBeVisible({ timeout: 15000 });
  // await barSearchInput.fill('IN/1001');
  // await page.waitForTimeout(1000);

  // const advocateResult = page.locator('input[placeholder="Search BAR Registration Id"]').nth(1).locator('following::li');
  // await expect(advocateResult).toBeVisible({ timeout: 15000 });
  // await advocateResult.click();
  // await page.waitForTimeout(2000);

  // Upload Vakalatnama
  const vakalatnameInput = page.locator('input[type="file"]').first();
  await vakalatnameInput.setInputFiles(filePath);
  await page.waitForTimeout(2000);

  // Click Continue
  const advocateContinueButton = page.getByRole('button').filter({ hasText: 'Continue' });
  await expect(advocateContinueButton).toBeVisible({ timeout: 15000 });
  await advocateContinueButton.click();
  await page.waitForTimeout(2000);

  // Click Skip & Continue
  console.log('Clicking Skip & Continue...');
  const skipButton = page.getByRole('heading', { name: 'Skip & Continue' });
  await expect(skipButton).toBeVisible({ timeout: 15000 });
  await skipButton.click();
  await page.waitForTimeout(2000);

  // Click Confirm Details
  const confirmButton = page.getByRole('button').filter({ hasText: 'Confirm Details' });
  await expect(confirmButton).toBeVisible({ timeout: 15000 });
  await confirmButton.click();
  await page.waitForTimeout(2000);

  // Check the checkbox
  const checkbox = page.locator('input[type="checkbox"]');
  await expect(checkbox).toBeVisible({ timeout: 15000 });
  await checkbox.check();
  await page.waitForTimeout(1000);

  // Click Upload Signed copy
  const uploadSignedButton = page.getByRole('heading', { name: 'Upload Signed copy' });
  await expect(uploadSignedButton).toBeVisible({ timeout: 15000 });
  await uploadSignedButton.click();
  await page.waitForTimeout(2000);

  // Click Upload Signed PDF
  const uploadPDFButton = page.getByText('Upload Signed PDF');
  await expect(uploadPDFButton).toBeVisible({ timeout: 15000 });
  await uploadPDFButton.click();
  await page.waitForTimeout(2000);

  // Upload signed PDF
  const signedPDFInput = page.locator('input[type="file"]').first();
  await expect(signedPDFInput).toBeVisible({ timeout: 15000 });
  await signedPDFInput.setInputFiles(filePath);
  await page.waitForTimeout(2000);

  // Click Submit Signature
  const submitSignatureButton = page.getByRole('heading', { name: 'Submit Signature' });
  await expect(submitSignatureButton).toBeVisible({ timeout: 15000 });
  await submitSignatureButton.click();
  await page.waitForTimeout(2000);

  // Click Submit Case
  const submitCaseButton = page.getByText('Submit Case');
  await expect(submitCaseButton).toBeVisible({ timeout: 15000 });
  await submitCaseButton.click();
  await page.waitForTimeout(2000);

  // Click Go to Home
  const goToHomeButton = page.getByRole('heading', { name: 'Go to Home' });
  await expect(goToHomeButton).toBeVisible({ timeout: 15000 });
  await goToHomeButton.click();
  await page.waitForTimeout(2000);

  // Payment Section
  console.log('Starting payment process...');
  
  // Click Make Payment button
  const makePaymentButton = page.getByRole('button').filter({ hasText: 'Make Payment' });
  await expect(makePaymentButton).toBeVisible({ timeout: 15000 });
  await makePaymentButton.click();
  await page.waitForTimeout(2000);

  // Click Pay Online button
  const payOnlineButton = page.getByRole('button').filter({ hasText: 'Pay Online' });
  await expect(payOnlineButton).toBeVisible({ timeout: 15000 });
  await payOnlineButton.click();
  await page.waitForTimeout(2000);

  // Store the original window handle
  const originalPage = page;
  
  // Wait for the new page/popup
  const newPage = await page.context().waitForEvent('page');
  await newPage.waitForLoadState();
  
  // Switch to the new page and perform payment actions
  console.log('Switching to payment gateway...');
  
  // Click Payment Gateway 2
  const paymentGateway2 = newPage.locator('div', { hasText: 'Payment Gateway 2' }).first();
  await expect(paymentGateway2).toBeVisible({ timeout: 60000 });
  await paymentGateway2.click();
  
  // Click UPI Payment
  const upiPayment = newPage.locator('div', { hasText: 'UPI Payment' }).first();
  await expect(upiPayment).toBeVisible({ timeout: 60000 });
  await upiPayment.click();
  
  // Click Proceed for Payment
  const paymentProceedButton = newPage.locator('input[value="Proceed for Payment"]');
  await expect(paymentProceedButton).toBeVisible({ timeout: 60000 });
  await paymentProceedButton.click();
  
  // Click Ok button
  const okButton = newPage.getByRole('button', { name: 'Ok' });
  await expect(okButton).toBeVisible({ timeout: 100000 });
  await okButton.click();
  
  // Click UPI option
  const upiOption = newPage.locator('div', { hasText: 'UPI' }).first();
  await expect(upiOption).toBeVisible({ timeout: 60000 });
  await upiOption.click();
  
  // Enter UPI ID
  const upiInput = newPage.locator('input[placeholder="Enter your UPI virtual id"]');
  await expect(upiInput).toBeVisible({ timeout: 60000 });
  await upiInput.click();
  await upiInput.fill('test@tests');
  
  // Click first Continue button
  const continueButton1 = newPage.locator('span', { hasText: 'Continue' });
  await expect(continueButton1).toBeVisible({ timeout: 60000 });
  await continueButton1.click();
  
  // Click second Continue button
  const continueButton2 = newPage.locator('a', { hasText: 'Continue' });
  await expect(continueButton2).toBeVisible({ timeout: 60000 });
  await continueButton2.click();
  
  // Wait for transaction message
  const transactionMessage = newPage.locator('p', { hasText: 'Your transaction was not Successful.' });
  await expect(transactionMessage).toBeVisible({ timeout: 50000 });
  
  // Close the payment page
  await newPage.close();
  
  // Switch back to original page
  await originalPage.bringToFront();
  
  console.log('Payment process completed.');
}); 