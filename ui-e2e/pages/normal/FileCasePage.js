const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');
const { tryClick } = require('../common/uiactions');

// Helpers available to all methods
const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);
const firstExisting = (candidates) => candidates.find(p => p && fs.existsSync(p)) || null;

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

    const cont1 = this.page.locator('button:has-text("Continue")').first();
    await expect(cont1).toBeVisible({ timeout: 15000 });
    await expect(cont1).toBeEnabled({ timeout: 15000 });
    await cont1.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(150);
    await cont1.click();
    await this.waitIdle();
  }

  // Ensures we are on the Accused Details step (left nav), then waits for banner
async ensureOnAccusedStep() 
    {
    const navItem = this.page.locator('nav, aside, .side, .sidebar').locator('text=Accused Details').first();
    if (await navItem.isVisible().catch(() => false)) {
      await navItem.click({ force: true });
    }
    await this.page.getByText('Accused Details', { exact: false }).first().waitFor({ state: 'visible', timeout: 10000 });
    }

  // Ensures we are on the Cheque Details step (left nav), then waits for a distinctive field
  async ensureOnChequeStep() {
    const nav = this.page.locator('nav, aside, .side, .sidebar');
    const navItem = nav.locator('text=Cheque Details').first();
    if (await navItem.isVisible().catch(() => false)) {
      await navItem.click({ force: true });
    }
    // Wait for a key input on Cheque step to be visible
    const signatory = this.page.locator('input[name="chequeSignatoryName"]').first();
    await signatory.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }

async fillAccusedDetails() {
    // Make sure we are on the correct step
    await this.ensureOnAccusedStep();
  
    // Robust card locator: accept h1 or h2, or a section with Accused 1 + Accused Type
    const accusedCard = this.page.locator([
      'section:has([role="heading"]:has-text("Accused 1"))',
      'div:has([role="heading"]:has-text("Accused 1"))',
      'section:has(h1:has-text("Accused 1"))',
      'section:has(h2:has-text("Accused 1"))',
      // fallback: any container that has both labels
      'section:has-text("Accused 1"):has-text("Accused Type")',
      'div:has-text("Accused 1"):has-text("Accused Type")'
    ].join(', ')).first();
  
    await accusedCard.scrollIntoViewIfNeeded();
    // Give the UI a moment if it’s lazy-rendered
    await this.page.waitForTimeout(250);
  
    if (await accusedCard.count() === 0) {
      throw new Error('Accused 1 card not found. Verify the step is Accused Details and the card is visible.');
    }
    await accusedCard.waitFor({ state: 'visible', timeout: 10000 });
    
    // Select Accused Type = Individual (same resilient pattern as your working spec)
    await accusedCard
      .locator('div')
      .filter({ hasText: /^Individual$/ })
      .locator('input[type="radio"]')
      .first()
      .click({ force: true });
  
    // First name
    const firstNameInput = this.page.locator('input[name="respondentFirstName"]').first();
    await firstNameInput.waitFor({ state: 'visible', timeout: 10000 });
    await firstNameInput.fill(this.globals.respondentFirstName || 'Automation Accused');
  
    // Address block (same pattern as your working spec)
    await accusedCard.locator('div').filter({ hasText: /^Pincode$/ }).getByRole('textbox').first().fill(this.globals.respondentPincode || '');
    await accusedCard.locator('div').filter({ hasText: /^State$/ }).getByRole('textbox').first().fill(this.globals.respondentState || '');
    await accusedCard.locator('div').filter({ hasText: /^District$/ }).getByRole('textbox').first().fill(this.globals.respondentDistrict || '');
    await accusedCard.locator('div').filter({ hasText: /^City\/Town$/ }).getByRole('textbox').first().fill(this.globals.respondentCity || '');
    await accusedCard.locator('div').filter({ hasText: /^Address$/ }).getByRole('textbox').first().fill(this.globals.respondentAddress || '');
  
    // Advance using the global Continue (more reliable on this screen)
    const continueBtn = this.page.getByRole('button').filter({ hasText: 'Continue' }).first();
    await continueBtn.scrollIntoViewIfNeeded();
    await continueBtn.click();
  
    await this.waitIdle();
}

async fillChequeDetails() {
  await this.waitIdle();
  // Make sure we are on the correct step and the form is rendered
  await this.ensureOnChequeStep();

  // Cheque signatory name
  const signatory = this.page.locator('input[name="chequeSignatoryName"]').first();
  if (await signatory.count()) {
    await signatory.scrollIntoViewIfNeeded().catch(() => {});
    await expect(signatory).toBeVisible({ timeout: 10000 });
    await signatory.click();
    await signatory.fill(this.globals.chequeSignatoryName || '');
  }

  // Upload cheque image (first file input)
  const chequeImgPath = firstExisting([
    this.globals.chequeImagePath && path.isAbsolute(this.globals.chequeImagePath)
      ? this.globals.chequeImagePath
      : this.globals.chequeImagePath && resolveFromUiE2E(this.globals.chequeImagePath),
    resolveFromUiE2E('documents', 'cheque.png'),
  ]);
  const firstFileLocator = this.page.locator('input[type="file"]').first();
  if (await firstFileLocator.count()) {
    await firstFileLocator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    if (chequeImgPath) {
      await firstFileLocator.setInputFiles(chequeImgPath);
    } else {
      throw new Error('Cheque image not found. Place a file at ui-e2e/documents/cheque.png or set chequeImagePath in globals.');
    }
  }

  // Name on cheque
  await this.page.locator('input[name="name"]').fill('Name On Cheque');

  // Bank details
  await this.page.locator('input[name="payeeBankName"]').fill(this.globals.payeeBankName || '');
  await this.page.locator('input[name="payeeBranchName"]').fill(this.globals.payeeBranchName || '');
  await this.page.locator('input[name="chequeNumber"]').fill(this.globals.chequeNumber || '');
  await this.page.locator('input[name="issuanceDate"]').fill(this.globals.issuanceDate || '');
  await this.page.locator('input[name="payerBankName"]').fill(this.globals.payerBankName || '');
  await this.page.locator('input[name="payerBranchName"]').fill(this.globals.payerBranchName || '');
  await this.page.locator('input[name="ifsc"]').fill(this.globals.ifsc || '');
  await this.page.locator('#validationCustom01').fill(this.globals.chequeAmount || '');

  // Police station (dropdown-like textbox)
  const psBox = this.page
    .locator('div')
    .filter({ hasText: /^Police Station with Jurisdiction over the Cheque Deposit Bank\*$/ })
    .getByRole('textbox')
    .first();
  if (await psBox.count()) {
    await psBox.click();
    if (this.globals.policeStation) {
      await this.page.getByText(this.globals.policeStation, { exact: true }).click();
    }
  }

  // Dates and reason
  await this.page.locator('input[name="depositDate"]').fill(this.globals.depositDate || '');

  const reasonBox = this.page
    .locator('div')
    .filter({ hasText: /^\*Reason for the return of cheque$/ })
    .getByRole('textbox')
    .first();
  if (await reasonBox.count()) {
    await reasonBox.click();
    await reasonBox.fill(this.globals.reasonForReturnOfCheque || '');
  }

  // Upload memo / reason doc (last file input)
  const reasonFilePath = firstExisting([
    this.globals.reasonFilePath && path.isAbsolute(this.globals.reasonFilePath)
      ? this.globals.reasonFilePath
      : this.globals.reasonFilePath && resolveFromUiE2E(this.globals.reasonFilePath),
    resolveFromUiE2E('documents', 'return-memo.png'),
  ]);
  const lastFile = this.page.locator('input[type="file"]').last();
  if (await lastFile.count()) {
    await lastFile.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    if (reasonFilePath) {
      await lastFile.setInputFiles(reasonFilePath);
    } else {
      throw new Error('Return memo file not found. Place a file at ui-e2e/documents/return-memo.png or set reasonFilePath in globals.');
    }
  }

  // Continue
  const continueBtn = this.page.getByRole('button').filter({ hasText: 'Continue' }).first();
  await continueBtn.click();
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
    await this.page.locator('input[name="dateOfService"]').fill(this.globals.dateOfService);
    await this.page.locator('div').filter({ hasText: /^No$/ }).getByRole('radio').check();
  
  // Upload Legal Demand Notice
  const legalDemandPath = firstExisting([
    this.globals.legaldemandPath && path.isAbsolute(this.globals.legaldemandPath)
      ? this.globals.legaldemandPath
      : this.globals.legaldemandPath && resolveFromUiE2E(this.globals.legaldemandPath),
    resolveFromUiE2E('documents', 'legaldemand.pdf'),
  ]);

  // Upload Postal Receipts
  const postalReceiptsPath = firstExisting([
    this.globals.postalreceiptsPath && path.isAbsolute(this.globals.postalreceiptsPath)
      ? this.globals.postalreceiptsPath
      : this.globals.postalreceiptsPath && resolveFromUiE2E(this.globals.postalreceiptsPath),
    resolveFromUiE2E('documents', 'postalreceipts.png'),
  ]);

  // Target inputs: first() for Legal Demand Notice, nth(2) for Postal Receipts (as per prior behavior)
  const legalInput = this.page.locator('input[type="file"]').first();
  if (await legalInput.count()) {
    if (legalDemandPath) {
      await legalInput.setInputFiles(legalDemandPath);
    } else if (fs.existsSync(fallbackFile)) {
      await legalInput.setInputFiles(fallbackFile);
    } else {
      throw new Error('Legal Demand file not found. Place ui-e2e/documents/legaldemand.pdf or set legaldemandPath in globals.');
    }
  }

  const postalInput = this.page.locator('input[type="file"]').nth(2);
  if (await postalInput.count()) {
    if (postalReceiptsPath) {
      await postalInput.setInputFiles(postalReceiptsPath);
    } else if (fs.existsSync(fallbackFile)) {
      await postalInput.setInputFiles(fallbackFile);
    } else {
      throw new Error('Postal Receipts file not found. Place ui-e2e/documents/postalreceipts.png or set postalreceiptsPath in globals.');
    }
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
    await this.page.waitForTimeout(15000);
    //await this.page.pause();
    // Some deployments use Quill, others RDW; support both
    const quill = this.page.locator('.ql-editor').first();
    const rdw = this.page.getByRole('textbox', { name: 'rdw-editor' }).first();
    if (await quill.count()) {
      await quill.fill('test');
    } else {
      await rdw.fill('test');
    }

    if (fs.existsSync(fallbackFile)) {
      await this.page.locator('input[type="file"]').first().setInputFiles(fallbackFile);
    }

    const quill2 = this.page.locator('.ql-editor').nth(1);
    const rdw2 = this.page.getByRole('textbox', { name: 'rdw-editor' }).nth(1);
    if (await quill2.count()) {
      await quill2.fill('test');
    } else {
      await rdw2.fill('test');
    }
    await this.page.waitForTimeout(1000);
     // Upload Affidavit
    const AffidavitPath = firstExisting([
    this.globals.AffidavitPath && path.isAbsolute(this.globals.AffidavitPath)
      ? this.globals.AffidavitPath
      : this.globals.AffidavitPath && resolveFromUiE2E(this.globals.AffidavitPath),
    resolveFromUiE2E('documents', 'Affidavit.pdf'),
  ]);

  // Prefer an input associated with label "Affidavit", else fallback to the second file input or last
  let affidavitInput = this.page.getByLabel(/Affidavit/i).first();
  if (!(await affidavitInput.count())) {
    const secondInput = this.page.locator('input[type="file"]').nth(1);
    affidavitInput = (await secondInput.count()) ? secondInput : this.page.locator('input[type="file"]').last();
  }

  if (await affidavitInput.count()) {
    if (AffidavitPath) {
      await affidavitInput.setInputFiles(AffidavitPath);
    } else if (fs.existsSync(fallbackFile)) {
      await affidavitInput.setInputFiles(fallbackFile);
    } else {
      throw new Error('Affidavit file not found. Place ui-e2e/documents/Affidavit.pdf or set AffidavitPath in globals.');
    }
  }
  await this.clickContinue();
  await this.waitIdle();
}

async fillAdvocateDetails() {
    const fallbackFile = path.join(process.cwd(), 'UI Tests', 'Test.png');
    // Ensure the advocates textbox is ready
    const advocatesBox = this.page.getByRole('textbox').first();
    await expect(advocatesBox).toBeVisible({ timeout: 15000 });
    await advocatesBox.fill(this.globals.noOfAdvocates || '1');

    // If you still want to upload a generic file first, keep this fallback upload
    if (fs.existsSync(fallbackFile)) {
      const firstInput = this.page.locator('input[type="file"]').first();
      if (await firstInput.count()) {
        await firstInput.setInputFiles(fallbackFile);
      }
    }

    // Compute Vakalatnama path (global key optional; otherwise fallback to repo file)
    const VakalatnamaPath = firstExisting([
      this.globals.VakalatnamaPath && path.isAbsolute(this.globals.VakalatnamaPath)
        ? this.globals.VakalatnamaPath
        : this.globals.VakalatnamaPath && resolveFromUiE2E(this.globals.VakalatnamaPath),
      resolveFromUiE2E('documents', 'Vakalatnama.png'),
    ]);

    // Upload Vakalatnama to a sensible target
    // Prefer an input associated with a visible label "Vakalatnama" (some UIs vary the spelling)
    let vakalatInput = this.page.getByLabel(/Vakala[tn]nama/i).first();
    if (!(await vakalatInput.count())) {
      // Fallback: try to find a container mentioning Vakalatnama then its input
      const container = this.page.locator(':text("Vakalatnama")').first();
      if (await container.count()) {
        vakalatInput = container.locator('input[type="file"]').first();
      }
    }
    if (!(await vakalatInput.count())) {
      // Final fallback: use the second file input or the last one on the page
      const second = this.page.locator('input[type="file"]').nth(1);
      vakalatInput = (await second.count()) ? second : this.page.locator('input[type="file"]').last();
    }

    if (await vakalatInput.count()) {
      await vakalatInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      if (VakalatnamaPath) {
        await vakalatInput.setInputFiles(VakalatnamaPath);
      } else if (fs.existsSync(fallbackFile)) {
        await vakalatInput.setInputFiles(fallbackFile);
      } else {
        throw new Error('Vakalatnama file not found. Place ui-e2e/documents/Vakalatnama.png or set VakalatnamaPath in globals.');
      }
    }

    await this.page.waitForTimeout(1000);
    await this.clickContinue();
    await this.waitIdle();
  }
async processdelivery(){
   // process delivery - courier services
   await this.page.waitForTimeout(15000);
   await this.page.getByRole('button').filter({ hasText: 'Continue' }).click();
   await this.page.waitForLoadState("networkidle");
}
async processdelivery1() {
    // Process delivery step
    await this.waitIdle();
    //await this.page.pause();
    const continueBtn = this.page.getByRole('button').filter({ hasText: 'Continue' });
    await expect(continueBtn).toBeVisible({ timeout: 15000 });
    await continueBtn.click();

    // Handle the modal: "Tips for stronger case compliant"
    const skipContinueBtn = this.page.getByRole('button', { name: 'Skip & Continue' });
    await expect(skipContinueBtn).toBeVisible({ timeout: 15000 });
    await skipContinueBtn.click();

    // Wait for modal to close and review screen to load
    await this.page.waitForLoadState('networkidle');

    // Click Continue on review screen
    const reviewContinueBtn = this.page.getByRole('button').filter({ hasText: 'Confirm Details ' });
    await reviewContinueBtn.waitFor({ state: 'visible', timeout: 15000 });
    await reviewContinueBtn.click();

    // Check consent checkbox
    await this.page.getByRole('checkbox').check();

    // Upload Signed copy
    const uploadSignedBtn = this.page.getByRole('button', { name: /Upload Signed copy/i });
    await expect(uploadSignedBtn).toBeVisible({ timeout: 15000 });
    await uploadSignedBtn.click();

    // Download PDF
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('button', { name: /Download PDF/i }).click(),
    ]);

    const projectDownloadPath = path.join(
      process.cwd(),
      'ui-e2e',
      'downloads',
      await download.suggestedFilename()
    );

    fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
    await download.saveAs(projectDownloadPath);

    // Upload the signed PDF
    const uploadPdfBtn = this.page.getByRole('button', { name: /Upload Signed PDF/i });
    await expect(uploadPdfBtn).toBeVisible({ timeout: 15000 });
    await uploadPdfBtn.click();

    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

    // Submit Signature
    await this.page.getByRole('button', { name: /Submit Signature/i }).click();

    // Submit Case
    await this.page.getByRole('button').filter({ hasText: 'Submit Case' }).click();

    await this.waitIdle();
  }

  async reviewSignAndSubmit() {
    await this.page.waitForTimeout(2000);
    await this.page.locator('.header-end > div > svg > path:nth-child(2)').click();
     
    // Handle the modal popup: click 'Skip & Continue'
    //await this.page.pause();
    const skipBtn = this.page.getByRole('button', { name: 'Skip & Continue' });
    await expect(skipBtn).toBeVisible({ timeout: 15000 });
    await skipBtn.click();

    // Wait for the review screen to load and click Continue
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    const continueBtn = this.page.getByRole('button').filter({ hasText: 'Confirm Details' });
    await expect(continueBtn).toBeVisible({ timeout: 15000 });
    await continueBtn.click();

    // Now proceed with the review and submit flow
    const confirmBtn = this.page.getByRole('button', { name: /Confirm Details/i });
    await expect(confirmBtn).toBeVisible({ timeout: 15000 });
    await confirmBtn.click();

    await this.page.getByRole('checkbox').check();
    await this.page.getByRole('button', { name: 'Upload Signed copy' }).click();

    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('button', { name: 'Download PDF' }).click(),
    ]);

    const projectDownloadPath = path.join(process.cwd(), 'ui-e2e', 'downloads', await download.suggestedFilename());
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
