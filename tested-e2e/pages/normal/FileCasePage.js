const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

class FileCasePage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
  }

  async startFiling() {
    await this.page.getByRole('button', { name: 'File Case' }).click();
    await this.page.getByRole('button', { name: 'Proceed' }).click();
    await this.page.getByRole('button', { name: 'Start Filing' }).click();
  }

  async fillComplainantDetails() {
    await this.page.locator('div').filter({ hasText: /^Individual$/ }).getByRole('radio').check();
    await this.page.locator('input[name="mobileNumber"]').click();
    await this.page.locator('input[name="mobileNumber"]').fill(this.globals.litigantUsername);
    await this.page.getByRole('button', { name: 'Verify Mobile Number' }).click();
    await this.fillOtpSixOnes();
    await this.page.getByRole('button', { name: 'Verify', exact: true }).click();
    await this.page.locator('input[name="complainantAge"]').fill(this.globals.complainantAge);

    // Robust Continue on Complainant step
    const cont1 = this.page.locator('button:has-text("Continue")').first();
    await expect(cont1).toBeVisible({ timeout: 15000 });
    await expect(cont1).toBeEnabled({ timeout: 15000 });
    await cont1.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(150);
    await cont1.click();
    await this.waitIdle();
  }

  async fillAccusedDetails() {
    // 1) Select "Individual" using the same robust pattern as complainant
    await this.page
      .locator('div')
      .filter({ hasText: /^Individual$/ })
      .getByRole('radio')
      .first()
      .check({ force: true });
  
    // 2) Scope to Accused container (loosened to match multiple banners)
    const accused = this.page
      .locator('form, section, div')
      .filter({ hasText: /Accused Details|Accused Name|Accused’s Location/i })
      .first();
  
    // Ensure the section is on screen before interacting
    await expect(accused).toBeVisible({ timeout: 15000 });
  
    // 3) Fill fields (container-scoped to avoid page-wide collisions)
    const firstName = accused.locator('input[name="respondentFirstName"]').first();
    await firstName.waitFor({ state: 'visible', timeout: 15000 });
    await firstName.click();
    await firstName.fill(this.globals.respondentFirstName);
  
    await accused.locator('div', { hasText: 'Pincode' }).getByRole('textbox').first()
      .fill(this.globals.respondentPincode);
    await accused.locator('div', { hasText: 'State' }).getByRole('textbox').first()
      .fill(this.globals.respondentState);
    await accused.locator('div', { hasText: 'District' }).getByRole('textbox').first()
      .fill(this.globals.respondentDistrict);
    await accused.locator('div', { hasText: 'City/Town' }).getByRole('textbox').first()
      .fill(this.globals.respondentCity);
    await accused.locator('div', { hasText: 'Address' }).getByRole('textbox').first()
      .fill(this.globals.respondentAddress);
  
    // 4) Upload affidavit from pages/normal/Testimages
    const affidavitPath = path.resolve(__dirname, 'Testimages', 'Affidavit.pdf');
  
    // Prefer a visible input in this section
    const fileInput = accused.locator('input[type="file"]:visible').first();
    await fileInput.waitFor({ state: 'attached', timeout: 10000 });
    await fileInput.setInputFiles(affidavitPath);
  
    // Optional: verify file label appears
    await this.page.getByRole('heading', { name: /Affidavit\.pdf/i }).first()
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});
  
    // 5) Scroll and click a tolerant Continue button
    await this.page.keyboard.press('End');
    await this.page.waitForTimeout(200);
  
    const continueBtn = this.page.locator('button:has-text("Continue")').first();
    await expect(continueBtn).toBeVisible({ timeout: 15000 });
    await expect(continueBtn).toBeEnabled({ timeout: 15000 });
    await continueBtn.scrollIntoViewIfNeeded();
    await continueBtn.click();
  
    await this.waitIdle();
  }

  async fillChequeDetails() {
    const fallbackFile = path.join(process.cwd(), 'UI Tests', 'Test.png');
    await this.page.locator('input[name="chequeSignatoryName"]').fill(this.globals.chequeSignatoryName || 'Name On Cheque');
    const fileInput = await this.page.$('input[type="file"]');
    if (fileInput && fs.existsSync(fallbackFile)) {
      await fileInput.setInputFiles(fallbackFile);
    }
    await this.page.locator('input[name="name"]').fill('Name On Cheque');
    await this.page.locator('input[name="payeeBankName"]').fill(this.globals.payeeBankName);
    await this.page.locator('input[name="payeeBranchName"]').fill(this.globals.payeeBranchName);
    await this.page.locator('input[name="chequeNumber"]').fill(this.globals.chequeNumber);
    await this.page.locator('input[name="issuanceDate"]').fill(this.globals.issuanceDate);
    await this.page.locator('input[name="payerBankName"]').fill(this.globals.payerBankName);
    await this.page.locator('input[name="payerBranchName"]').fill(this.globals.payerBranchName);
    await this.page.locator('input[name="ifsc"]').fill(this.globals.ifsc);
    await this.page.locator('#validationCustom01').fill(this.globals.chequeAmount);
    await this.page.locator('div', { hasText: 'Police Station with Jurisdiction over the Cheque Deposit Bank*' }).getByRole('textbox').click();
    await this.page.getByText(this.globals.policeStation).click();
    await this.page.locator('input[name="depositDate"]').fill(this.globals.depositDate);
    await this.page.locator('div', { hasText: '*Reason for the return of cheque' }).getByRole('textbox').fill(this.globals.reasonForReturnOfCheque);
    await this.scrollToBottom();
    if (fs.existsSync(fallbackFile)) {
      await this.page.locator('input[type="file"]').last().setInputFiles(fallbackFile);
    }
    await this.clickContinue();
    await this.waitIdle();
  }

  async fillDebtLiability() {
    await this.page.locator('input[name="liabilityNature"]').fill(this.globals.liabilityNature);
    await this.page.locator('div').filter({ hasText: /^Full Liability$/ }).getByRole('radio').click();
    await this.clickContinue();
    await this.waitIdle();
  }

  async fillLegalDemandNotice() {
    const fallbackFile = path.join(process.cwd(), 'UI Tests', 'Test.png');
    await this.page.locator('input[name="dateOfDispatch"]').fill(this.globals.dateOfDispatch);
    if (fs.existsSync(fallbackFile)) {
      await this.page.locator('input[type="file"]').first().setInputFiles(fallbackFile);
      await this.page.locator('input[type="file"]').nth(2).setInputFiles(fallbackFile);
    }
    await this.page.locator('input[name="dateOfService"]').fill(this.globals.dateOfService);
    await this.page.locator('div').filter({ hasText: /^No$/ }).getByRole('radio').check();
    await this.clickContinue();
    await this.waitIdle();
    if (fs.existsSync(fallbackFile)) {
      await this.page.locator('input[type="file"]').last().setInputFiles(fallbackFile);
    }
    await this.clickContinue();
  }

  async skipWitnessAndAdvance() {
    await this.waitIdle();
    for (let i = 0; i < 2; i++) {
      await this.page.waitForTimeout(3000);
      await this.waitIdle();
      const continueBtn = this.page.getByRole('button').filter({ hasText: 'Continue' });
      await expect(continueBtn).toBeVisible({ timeout: 10000 });
      await continueBtn.click();
    }
  }

  async fillComplaintAndDocs() {
    const fallbackFile = path.join(process.cwd(), 'UI Tests', 'Test.png');
    await this.waitIdle();
    await this.page.getByRole('textbox', { name: 'rdw-editor' }).first().fill('test');
    if (fs.existsSync(fallbackFile)) {
      await this.page.locator('input[type="file"]').first().setInputFiles(fallbackFile);
    }
    await this.page.getByRole('textbox', { name: 'rdw-editor' }).nth(1).fill('test');
    await this.page.waitForTimeout(1000);
    await this.clickContinue();
    await this.waitIdle();
  }

  async fillAdvocateDetails() {
    const fallbackFile = path.join(process.cwd(), 'UI Tests', 'Test.png');
    await this.page.getByRole('textbox').first().fill(this.globals.noOfAdvocates || '1');
    if (fs.existsSync(fallbackFile)) {
      await this.page.locator('input[type="file"]').first().setInputFiles(fallbackFile);
    }
    await this.page.waitForTimeout(1000);
    await this.clickContinue();
    await this.waitIdle();
  }

  async reviewSignAndSubmit() {
    await this.page.waitForTimeout(1000);
    await this.page.locator('.header-end > div > svg > path:nth-child(2)').click();
    await this.page.getByRole('button', { name: 'Confirm Details' }).click();
    await this.page.getByRole('checkbox').check();
    await this.page.getByRole('button', { name: 'Upload Signed copy' }).click();

    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('button', { name: 'Download PDF' }).click(),
    ]);

    const projectDownloadPath = path.join(process.cwd(), 'tested-e2e', 'downloads', await download.suggestedFilename());
    fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
    await download.saveAs(projectDownloadPath);

    await this.page.getByRole('button', { name: 'Upload Signed PDF' }).click();
    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);
    await this.page.getByRole('button', { name: 'Submit Signature' }).click();
    await this.page.getByRole('button').filter({ hasText: 'Submit Case' }).click();
    await this.waitIdle();
  }

  async captureFilingNumber() {
    const filingNumber = await this.page.locator('span.e-filing-table-value-style').innerText();
    return filingNumber;
  }
}

module.exports = { FileCasePage };
