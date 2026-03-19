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

  /**
   * Fills Complainant 1 + Complainant 2 (both Individual type).
   * Uses globals.litigantUsername for Comp1 and globals.litigantUsername2 for Comp2.
   */
  async fillTwoComplainantDetails() {
    // --- Complainant 1 ---
    await this.page.locator('div').filter({ hasText: /^Individual$/ }).getByRole('radio').check();
    await this.page.locator('input[name="mobileNumber"]').click();
    await this.page.locator('input[name="mobileNumber"]').fill(this.globals.litigantUsername);
    await this.page.getByRole('button', { name: 'Verify Mobile Number' }).click();
    await this.fillOtpSixOnes();
    await this.page.getByRole('button', { name: 'Verify', exact: true }).click();
    await this.page.locator('input[name="complainantAge"]').first().fill(this.globals.complainantAge || '30');

    // --- Add Complainant 2 ---
    await this.page.getByRole('button', { name: 'Add Complainant' }).click();
    await this.page.waitForTimeout(1500);

    // 1. Select Individual radio for Comp 2 FIRST (before mobile input appears)
    //    Use last() — the newly added complainant section is always the last one
    await this.page
      .locator('div')
      .filter({ hasText: /^Individual$/ })
      .getByRole('radio')
      .last()
      .check();

    // 2. Fill mobile number for Comp 2
    //    nth(0) is Comp 1's now-readonly field; nth(1) is Comp 2's fresh editable input
    const comp2Mobile = this.page.locator('input[name="mobileNumber"]').nth(1);
    await comp2Mobile.waitFor({ state: 'visible', timeout: 10000 });
    await comp2Mobile.click();
    await comp2Mobile.fill(this.globals.litigantUsername2);

    // 3. Click Verify Mobile Number — last() targets Comp 2's button
    await this.page.getByRole('button', { name: 'Verify Mobile Number' }).last().click();
    await this.fillOtpSixOnes();
    await this.page.getByRole('button', { name: 'Verify', exact: true }).last().click();
    await this.page.locator('input[name="complainantAge"]').nth(1).fill(this.globals.complainantAge || '30');

    await this.page.waitForTimeout(5000);

    // Click Continue — nth(1) targets the second Continue button (Comp 2's section)
    const continueBtn = this.page.getByRole('button').filter({ hasText: 'Continue' });
    await continueBtn.nth(1).click({ timeout: 8000 });
    await this.waitIdle();
  }

  /**
   * Fills Complainant 1 + Complainant 2 (both Individual type).
   * Uses globals.litigantUsername3 for Comp1 and globals.litigantUsername2 for Comp2.
   * This is the variant used in the 2-Complainant 2-Advocate scenario (3-TwoCompTwoAdv).
   */
  async fillTwoComplainantDetailsWithThird() {
    // --- Complainant 1 (uses litigantUsername3) ---
    await this.page.locator('div').filter({ hasText: /^Individual$/ }).getByRole('radio').check();
    await this.page.locator('input[name="mobileNumber"]').click();
    await this.page.locator('input[name="mobileNumber"]').fill(this.globals.litigantUsername3);
    await this.page.getByRole('button', { name: 'Verify Mobile Number' }).click();
    await this.fillOtpSixOnes();
    await this.page.getByRole('button', { name: 'Verify', exact: true }).click();
    await this.page.locator('input[name="complainantAge"]').first().fill(this.globals.complainantAge || '30');

    // --- Add Complainant 2 (uses litigantUsername2) ---
    await this.page.getByRole('button', { name: 'Add Complainant' }).click();
    await this.page.waitForTimeout(1500);

    // Select Individual radio for Comp 2 (last radio = newly added section)
    await this.page
      .locator('div')
      .filter({ hasText: /^Individual$/ })
      .getByRole('radio')
      .last()
      .check();

    // Fill mobile number for Comp 2 (nth(1) = Comp 2's editable input)
    const comp2Mobile = this.page.locator('input[name="mobileNumber"]').nth(1);
    await comp2Mobile.waitFor({ state: 'visible', timeout: 10000 });
    await comp2Mobile.click();
    await comp2Mobile.fill(this.globals.litigantUsername2);

    // Verify Mobile Number for Comp 2
    await this.page.getByRole('button', { name: 'Verify Mobile Number' }).last().click();
    await this.fillOtpSixOnes();
    await this.page.getByRole('button', { name: 'Verify', exact: true }).last().click();
    await this.page.locator('input[name="complainantAge"]').nth(1).fill(this.globals.complainantAge || '30');

    await this.page.waitForTimeout(5000);

    // Click Continue — nth(1) targets the second Continue button (Comp 2's section)
    const continueBtn = this.page.getByRole('button').filter({ hasText: 'Continue' });
    await continueBtn.nth(1).click({ timeout: 8000 });
    await this.waitIdle();
  }

  /**
   * Ensures we are on the Accused Details step (left nav), then waits for banner
   */
  async ensureOnAccusedStep() {
    const navItem = this.page.locator('nav, aside, .side, .sidebar').locator('text=Accused Details').first();
    if (await navItem.isVisible().catch(() => false)) {
      await navItem.click({ force: true });
    }
    await this.page.getByText('Accused Details', { exact: false }).first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Ensures we are on the Cheque Details step (left nav), then waits for a distinctive field
   */
  async ensureOnChequeStep() {
    const nav = this.page.locator('nav, aside, .side, .sidebar');
    const navItem = nav.locator('text=Cheque Details').first();
    if (await navItem.isVisible().catch(() => false)) {
      await navItem.click({ force: true });
    }
    // Wait for a key input on Cheque step to be visible
    const signatory = this.page.locator('input[name="chequeSignatoryName"]').first();
    await signatory.waitFor({ state: 'visible', timeout: 15000 }).catch(() => { });
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

  /**
   * Fills Accused Details when the accused is an Entity (e.g., One-person company).
   * Uses globals: respondentCompanyName, respondentFirstName, respondentPincode,
   *   respondentState, respondentDistrict, respondentCity, respondentAddress.
   */
  async fillAccusedAsEntityDetails() {
    await this.ensureOnAccusedStep();

    // Select Entity radio — use .check() which is the correct Playwright method for radio buttons
    await this.page
      .locator('div')
      .filter({ hasText: /^Entity$/ })
      .getByRole('radio')
      .first()
      .check();

    // Wait for the Entity form to render
    await this.page.waitForTimeout(2000);

    // Open "Type of Entity*" dropdown via the img chevron (matches reference spec exactly)
    await this.page
      .locator('div')
      .filter({ hasText: /^Type of Entity\*$/ })
      .getByRole('img')
      .click();
    await this.page.waitForTimeout(1000);

    // Pick 'One-person company' from the dropdown
    await this.page
      .locator('#jk-dropdown-unique div')
      .filter({ hasText: 'One-person company' })
      .click();
    await this.page.waitForTimeout(500);

    // Company name
    await this.page.locator('input[name="respondentCompanyName"]').click();
    await this.page.locator('input[name="respondentCompanyName"]').fill(this.globals.respondentCompanyName || '');

    // Respondent first name
    await this.page.locator('input[name="respondentFirstName"]').click();
    await this.page.locator('input[name="respondentFirstName"]').fill(this.globals.respondentFirstName || '');

    // Address fields
    await this.page.locator('div').filter({ hasText: /^Pincode$/ }).getByRole('textbox').fill(this.globals.respondentPincode || '');
    await this.page.locator('div').filter({ hasText: /^State$/ }).getByRole('textbox').fill(this.globals.respondentState || '');
    await this.page.locator('div').filter({ hasText: /^District$/ }).getByRole('textbox').fill(this.globals.respondentDistrict || '');
    await this.page.locator('div').filter({ hasText: /^City\/Town$/ }).getByRole('textbox').fill(this.globals.respondentCity || '');
    await this.page.locator('div').filter({ hasText: /^Address$/ }).getByRole('textbox').fill(this.globals.respondentAddress || '');

    await this.page.getByRole('button').filter({ hasText: 'Continue' }).click();
    await this.waitIdle();
  }

  async fillChequeDetails() {
    await this.waitIdle();
    // Make sure we are on the correct step and the form is rendered
    await this.ensureOnChequeStep();

    // Cheque signatory name
    const signatory = this.page.locator('input[name="chequeSignatoryName"]').first();
    if (await signatory.count()) {
      await signatory.scrollIntoViewIfNeeded().catch(() => { });
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
      await firstFileLocator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { });
      if (chequeImgPath) {
        await firstFileLocator.setInputFiles(chequeImgPath);
      } else {
        throw new Error('Cheque image not found. Place a file at ui-e2e/documents/cheque.png or set chequeImagePath in globals.');
      }
    }

    // Name on cheque
    await this.page.locator('input[name="name"]').fill(this.globals.nameOnCheque || 'Name On Cheque');

    // Bank details - Use more specific locators for IFSC text input fields
    console.log('Looking for IFSC fields...');
    
    // Payee IFSC field - find the input that's not a radio button
    const payeeIfscBox = this.page.locator('input[type="text"]').filter({ hasText: '' }).nth(2); // First text input after name field
    
    // Payer IFSC field - find the second text input that's not a radio button  
    const payerIfscBox = this.page.locator('input[type="text"]').filter({ hasText: '' }).nth(6); // Second text input
    
    const searchBtns = this.page.getByRole('button', { name: 'Search' });

    // Wait for page to be stable
    await this.page.waitForTimeout(2000);

    if (await payeeIfscBox.isVisible().catch(() => false)) {
      console.log('Found payee IFSC field, filling...');
      await payeeIfscBox.fill(this.globals.payeeIfsc || 'KLGB0040237');
      await searchBtns.first().click();
      await this.page.waitForTimeout(1000);
      console.log('Payee IFSC search completed');
    } else {
      console.log('Payee IFSC field not found');
    }

    await this.page.locator('input[name="chequeNumber"]').fill(this.globals.chequeNumber || '');
    await this.page.locator('input[name="issuanceDate"]').fill(this.globals.issuanceDate || '');

    if (await payerIfscBox.isVisible().catch(() => false)) {
      console.log('Found payer IFSC field, filling...');
      await payerIfscBox.fill(this.globals.payerIfsc || 'KLGB0040237');
      await searchBtns.nth(1).click();
      await this.page.waitForTimeout(1000);
      console.log('Payer IFSC search completed');
    } else {
      console.log('Payer IFSC field not found');
    }

    try {
      await this.page.getByText('KLGB0040237 (Kerala Gramin Bank, Kuningad, Kozhikode)').click({ timeout: 2000 });
      await this.page.waitForTimeout(1000);
    } catch (e) { }
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
      await lastFile.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { });
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
    const fallbackFile = resolveFromUiE2E('documents', 'Affidavit.pdf');
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
    const fallbackFile = resolveFromUiE2E('documents', 'Affidavit.pdf');
    await this.page.waitForTimeout(15000);
    //await this.page.pause();

    // Fill Synopsis (new field before Complaint Details)
    const synopsisText = this.globals.synopsisDetails || 'Synopsis';
    const synopsisQuill = this.page.locator('.ql-editor').first();
    const synopsisRdw = this.page.getByRole('textbox', { name: 'rdw-editor' }).first();
    
    if (await synopsisQuill.count()) {
      await synopsisQuill.click();
      await synopsisQuill.fill(synopsisText);
    } else if (await synopsisRdw.count()) {
      await synopsisRdw.click();
      await synopsisRdw.fill(synopsisText);
    }
    await this.page.waitForTimeout(1000);

    // Fill Complaint Details (second editor now)
    const complaintText = this.globals.complaintDetails || 'test';
    const quill = this.page.locator('.ql-editor').nth(1);
    const rdw = this.page.getByRole('textbox', { name: 'rdw-editor' }).nth(1);
    if (await quill.count()) {
      await quill.fill(complaintText);
    } else {
      await rdw.fill(complaintText);
    }

    if (fs.existsSync(fallbackFile)) {
      await this.page.locator('input[type="file"]').first().setInputFiles(fallbackFile);
    }

    // Fill Prayer Details (third editor now)
    const prayerText = this.globals.prayerDetails || 'test';
    const quill2 = this.page.locator('.ql-editor').nth(2);
    const rdw2 = this.page.getByRole('textbox', { name: 'rdw-editor' }).nth(2);
    if (await quill2.count()) {
      await quill2.fill(prayerText);
    } else {
      await rdw2.fill(prayerText);
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
    await this.page.waitForTimeout(3000);
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      console.log('[fillAdvocateDetails] Network idle timeout, continuing...');
    });

    // Compute Vakalatnama path
    const VakalatnamaPath = firstExisting([
      this.globals.VakalatnamaPath && path.isAbsolute(this.globals.VakalatnamaPath)
        ? this.globals.VakalatnamaPath
        : this.globals.VakalatnamaPath && resolveFromUiE2E(this.globals.VakalatnamaPath),
      resolveFromUiE2E('documents', 'Vakalatnama.png'),
    ]);
    if (!VakalatnamaPath) {
      throw new Error('Vakalatnama file not found. Place ui-e2e/documents/Vakalatnama.png or set VakalatnamaPath in globals.');
    }

    // --- Complainant 1 advocate section ---
    // Wait for the advocate section to be visible and find the textbox for number of advocates
    await this.page.waitForTimeout(2000);
    
    // Try multiple selectors to find the number of advocates input
    let advocatesBox = this.page.locator('input[type="text"]').filter({ hasText: '' }).first();
    
    // Wait for any textbox to appear
    await this.page.waitForSelector('input[type="text"], input[type="number"], [role="textbox"]', { 
      state: 'visible', 
      timeout: 15000 
    }).catch(() => {
      console.log('[fillAdvocateDetails] No textbox found, trying alternative selector...');
    });
    
    // Use the first visible textbox
    advocatesBox = this.page.getByRole('textbox').first();
    await advocatesBox.waitFor({ state: 'visible', timeout: 15000 }).catch(async () => {
      console.log('[fillAdvocateDetails] Textbox not visible, trying input[type="text"]...');
      advocatesBox = this.page.locator('input[type="text"]').first();
      await advocatesBox.waitFor({ state: 'visible', timeout: 10000 });
    });
    
    await advocatesBox.click();
    await advocatesBox.fill(this.globals.noOfAdvocates || '1');
    await this.page.waitForTimeout(2000);

    // Upload Vakalatnama for Complainant 1 (first file input)
    await this.page.locator('input[type="file"]').first().setInputFiles(VakalatnamaPath);
    await this.page.waitForTimeout(2000);

    // --- Complainant 2 advocate section (only if 2 complainants) ---
    const comp2Form = this.page
      .locator('form')
      .filter({ hasText: /Complainant 2/i });
    const hasComp2 = await comp2Form.count() > 0;

    if (hasComp2) {
      console.log('[fillAdvocateDetails] 2-complainant mode: filling Comp 2 advocate section');

      const comp2TextBox = comp2Form.getByRole('textbox').first();
      await comp2TextBox.waitFor({ state: 'visible', timeout: 10000 });
      await comp2TextBox.click();
      await comp2TextBox.fill(this.globals.noOfAdvocates || '1');

      // Click "Add Advocate" for Complainant 2 (nth(1) = second Add Advocate button)
      await this.page.getByRole('button', { name: 'Add Advocate' }).nth(1).click();
      await this.page.waitForTimeout(1000);

      // Open the BAR Registration dropdown for Comp 2's Advocate 1
      await this.page
        .locator('div')
        .filter({ hasText: /^Advocate 1 BAR Registration$/ })
        .getByRole('img')
        .nth(1)
        .click();

      // Search advocate by BAR ID inside Comp 2's form
      const barSearchInput = comp2Form.getByPlaceholder('Search BAR Registration Id');
      await barSearchInput.waitFor({ state: 'visible', timeout: 10000 });
      await barSearchInput.click();
      await barSearchInput.fill(this.globals.advocateBarId || '', { timeout: 15000 });

      // Select advocate from search results
      await this.page.getByText(this.globals.advocateName || '').first().click({ timeout: 15000 });
      await this.page.waitForTimeout(2000);

      // Upload Vakalatnama for Complainant 2 (last file input on page)
      await this.page.locator('input[type="file"]').last().setInputFiles(VakalatnamaPath);
      await this.page.waitForTimeout(1000);
    } else {
      console.log('[fillAdvocateDetails] Single-complainant mode: skipping Comp 2 advocate section');
    }

    // Click Continue
    const advocateContinueBtn = this.page.getByRole('button').filter({ hasText: 'Continue' });
    const btnCount = await advocateContinueBtn.count();
    if (btnCount > 1) {
      await advocateContinueBtn.nth(1).click();
    } else {
      await advocateContinueBtn.first().click();
    }
    await this.waitIdle();
  }

  async processdelivery() {
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

    // Handle the modal: "Tips for stronger case compliant" (if it appears)
    const skipContinueBtn = this.page.getByRole('button', { name: 'Skip & Continue' });
    try {
      await expect(skipContinueBtn).toBeVisible({ timeout: 5000 });
      await skipContinueBtn.click();
    } catch (error) {
      // Modal didn't appear - continue without it
      console.log('Skip & Continue modal not shown, proceeding to review screen');
    }

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
      resolveFromUiE2E('downloads'),
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

    const projectDownloadPath = path.join(resolveFromUiE2E('downloads'), await download.suggestedFilename());
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
