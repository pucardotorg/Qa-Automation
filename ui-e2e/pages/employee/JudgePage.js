const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

class JudgePage extends BasePage {
  constructor(page, globals) {
    super(page, globals);

    this.allCasesLink = page.getByRole('link', { name: 'All Cases' });
    this.caseSearchInput = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[3]/div/input');
    this.searchBtn = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[4]/button/header');
    this.registerCaseBtn = page.getByRole('button', { name: /Register Case/i }).or(
      page.locator('button:has-text("Register Case")')
    );
    this.scheduleHearingBtn = page.getByRole('button', { name: 'Schedule Hearing' });
    this.selectCustomDateBtn = page.getByText('Select Custom Date');
    this.confirmBtn = page.getByRole('button', { name: 'Confirm' });
    this.generateOrderBtn = page.getByRole('button').filter({ hasText: 'Generate Order' });
    this.orderEditor = page.locator('.ql-editor');
    this.previewPdfBtn = page.getByRole('button').filter({ hasText: 'Preview PDF' });
    this.addSignatureBtn = page.getByRole('button', { name: 'Add Signature' });
    this.uploadOrderBtn = page.getByRole('button', { name: 'Upload Order Document with' });
    this.submitSignatureBtn = page.getByRole('button', { name: 'Submit Signature' });
    this.issueOrderBtn = page.getByRole('button', { name: 'Issue Order' });
    this.closePopupBtn = page.locator('div:nth-child(4) > .popup-module > .header-wrap > .header-end > div > svg');
  }

  async navigateToAllCases() {
    await this.allCasesLink.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async searchCase(filingNumber) {
    await expect(this.caseSearchInput).toBeVisible({ timeout: 10000 });
    await this.caseSearchInput.type(filingNumber);
    await this.caseSearchInput.press('Enter');

    await expect(this.searchBtn).toBeVisible({ timeout: 10000 });
    await this.searchBtn.click();

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async openCase() {
    const caseIdCell = this.page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[2]/div/span/table/tbody/tr[1]/td[1]');
    await expect(caseIdCell).toBeVisible({ timeout: 10000 });

    const clickableLink = caseIdCell.locator('a,button');
    if (await clickableLink.count() > 0) {
      await clickableLink.first().click();
    } else {
      await caseIdCell.click();
    }

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async registerCase() {
    await expect(this.registerCaseBtn).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(2000);
    await this.registerCaseBtn.click();
    await this.page.waitForTimeout(2000);
  }

  calculateWorkingDaysFromNow(workingDays = 10) {
    let date = new Date();
    let addedDays = 0;

    while (addedDays < workingDays) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = date.getDay();
      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++;
      }
    }

    return date;
  }

  async scheduleHearing() {
    await this.scheduleHearingBtn.click();
    await this.page.waitForTimeout(1000);

    await this.selectCustomDateBtn.click();
    await this.page.waitForTimeout(1000);

    // Wait for the calendar popup to be visible
    await this.page.waitForSelector('text=Select Custom Date', { state: 'visible', timeout: 10000 });

    // Calculate target date (10 working days from now)
    const targetDate = this.calculateWorkingDaysFromNow(10);
    const currentDate = new Date();

    // Navigate to the correct month if needed
    const monthsToNavigate = (targetDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (targetDate.getMonth() - currentDate.getMonth());

    for (let i = 0; i < monthsToNavigate; i++) {
      const nextMonthBtn = this.page.getByRole('button').filter({ hasText: /^$/ }).last();
      await nextMonthBtn.click();
      await this.page.waitForTimeout(500);
    }

    // Select the target day
    const dayToSelect = targetDate.getDate().toString();
    // Use getByRole to find button with the day number, which works even if it has "Hearings" text
    const dateButton = this.page.getByRole('button', { name: new RegExp(`^${dayToSelect}`) });
    await dateButton.waitFor({ state: 'visible', timeout: 10000 });
    await dateButton.click();

    await this.confirmBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async generateOrder(orderText = 'AUTOMATION ORDER GENERATED') {
    await this.generateOrderBtn.click();
    await this.page.waitForLoadState('networkidle');

    await this.orderEditor.click();
    await this.orderEditor.fill(orderText);
    await this.page.waitForTimeout(1000);
  }

  async signAndIssueOrder() {
    await this.previewPdfBtn.click();
    await this.addSignatureBtn.click();

    // Download the PDF
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByText('click here').click(),
    ]);

    const projectDownloadPath = path.join(resolveFromUiE2E('downloads'), await download.suggestedFilename());
    fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
    await download.saveAs(projectDownloadPath);

    // Upload signed PDF
    await this.uploadOrderBtn.click();
    await this.page.waitForTimeout(2000);
    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

    await this.submitSignatureBtn.click();
    await this.issueOrderBtn.click();
    await this.page.waitForTimeout(2000);

    return projectDownloadPath;
  }

  async captureAccessCodeAndCmpNumber() {
    // ── Close the "Order Successfully Issued" popup ──────────────────────────
    // Try multiple selectors robustly — the popup DOM varies across environments.
    const popupCloseSelectors = [
      'div:nth-child(4) > .popup-module > .header-wrap > .header-end > div > svg',
      '.popup-module .header-end svg',
      '.popup-module button[aria-label="Close"]',
    ];
    let popupClosed = false;
    for (const sel of popupCloseSelectors) {
      try {
        const el = this.page.locator(sel).first();
        if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
          await el.click();
          popupClosed = true;
          break;
        }
      } catch { /* try next */ }
    }
    if (!popupClosed) {
      // Fallback: press Escape to dismiss any modal
      await this.page.keyboard.press('Escape');
    }
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);

    // ── Capture Access Code ───────────────────────────────────────────────────
    // Raw text examples: "Access Code: 679168"  or  "Code: ABC123"
    // Use \w+ (word chars) to handle both pure-digit and alphanumeric codes.
    const accessCodeElement = this.page.locator('div.sub-details-text').filter({ hasText: 'Code:' });
    await expect(accessCodeElement.first()).toBeVisible({ timeout: 30000 });
    const accessCodeText = (await accessCodeElement.first().textContent()) || '';
    console.log('[JudgePage] Raw access code text:', accessCodeText);
    const accessCode = accessCodeText.match(/Code\s*:\s*(\w+)/)?.[1]?.trim() || '';

    // ── Capture CMP Number ────────────────────────────────────────────────────
    // Raw text example: "CMP/129/2026" or "Case No: CMP/129/2026 (something)"
    // Extract just the CMP/xxx/xxxx pattern to avoid trailing UI noise.
    const cmpElement = this.page.locator('div.sub-details-text').filter({ hasText: 'CMP/' });
    await expect(cmpElement.first()).toBeVisible({ timeout: 30000 });
    const cmpRaw = (await cmpElement.first().textContent()) || '';
    console.log('[JudgePage] Raw CMP text:', cmpRaw);
    const cmpNumber = cmpRaw.match(/(CMP\/\S+)/)?.[1]?.trim() || cmpRaw.trim();

    console.log('[JudgePage] Captured → accessCode:', accessCode, ' cmpNumber:', cmpNumber);
    return { accessCode, cmpNumber };
  }

  async registerCaseFlow(filingNumber, orderText = 'AUTOMATION ORDER GENERATED') {
    await this.navigateToAllCases();
    await this.searchCase(filingNumber);
    await this.openCase();
    await this.registerCase();
    await this.scheduleHearing();
    await this.generateOrder(orderText);
    await this.signAndIssueOrder();
    const { accessCode, cmpNumber } = await this.captureAccessCodeAndCmpNumber();
    return { accessCode, cmpNumber };
  }
  /**
   * 7.4 / 7.7 — Judge reviews and approves an advocate replacement request.
   * Navigates via All Cases → cmpNumber cell → Review Advocate Replace.
   */
  async reviewAdvReplacement(cmpNumber) {
    await this.allCasesLink.click();
    await this.page.getByRole('cell', { name: cmpNumber }).click();
    await this.page.waitForTimeout(1000);
    await this.page.getByText('Review Advocate Replace').first().click();
    await this.page.waitForTimeout(6000);
    await this.page.getByRole('button', { name: 'Approve' }).click();
    await this.page.waitForTimeout(4000);

    await this.previewPdfBtn.click();
    await this.page.waitForTimeout(2000);
    await this.addSignatureBtn.click();

    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByText('click here').click(),
    ]);

    const projectDownloadPath = path.join(resolveFromUiE2E('downloads'), await download.suggestedFilename());
    fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
    await download.saveAs(projectDownloadPath);
    console.log(`File downloaded: ${projectDownloadPath}`);

    await this.uploadOrderBtn.click();
    await this.page.waitForTimeout(2000);
    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

    await this.submitSignatureBtn.click();
    await this.issueOrderBtn.click();
    await this.page.waitForTimeout(3000);

    // The success screen has two variants depending on context:
    // Variant A: success toast "You have successfully issued" → close → heading
    // Variant B: simple "Close" button (role: button)
    const successToast = this.page.getByText('You have successfully issued');
    const hasToast = await successToast.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasToast) {
      // Variant A — toast + close sequence
      console.log('[reviewAdvReplacement] Success variant A: toast dismissal');
      await successToast.click();
      await this.page.getByRole('button', { name: 'Close' }).click({ force: true }).catch(() => { });
      await this.page.getByRole('heading', { name: 'Order successfully issued!' }).click({ force: true }).catch(() => { });
    } else {
      // Variant B — direct Close button
      console.log('[reviewAdvReplacement] Success variant B: direct Close button');
      await this.page.getByRole('button', { name: 'Close' }).click({ force: true });
    }

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Judge sends a case back to the litigant/advocate for correction.
   * Converted from: UI Tests/tests/7-JudgeReSubmitCase/4-returnCaseFromJudge.spec.js
   *
   * @param {string} filingNumber - Filing number to search for
   * @param {string} comment      - Correction comment (default 'TEST')
   */
  async returnCaseToLitigant(filingNumber, comment = 'TEST') {
    await this.navigateToAllCases();
    await this.searchCase(filingNumber);
    await this.openCase();

    // Click "Send back for correction"
    await this.page.getByText('Send back for correction', { exact: true }).click();

    // Fill comment and confirm
    await this.page.getByRole('textbox').click();
    await this.page.getByRole('textbox').fill(comment);
    await this.page.getByRole('button').filter({ hasText: 'Send' }).click();

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('[JudgePage] Case sent back for correction.');
  }

  /**
   * Judge approves a pending Profile Correction Application.
   * Navigates via All Cases → cmpNumber cell → Applications tab →
   * Profile Correction Application → Review → Approve → sign & issue order.
   *
   * Converted from: UI Tests/tests/7-JudgeReSubmitCase/11-approveProfileEditingApp.spec.js
   *
   * @param {string} cmpNumber - The case CMP number (e.g. 'CMP/173/2026')
   */
  async approveProfileCorrectionApplication(cmpNumber) {
    console.log('[JudgePage] Approving Profile Correction Application...');

    await this.allCasesLink.click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('cell', { name: cmpNumber }).click();
    await this.page.waitForTimeout(1000);

    // Open Applications tab and click the Profile Correction Application row
    await this.page.getByRole('button', { name: 'Applications' }).click();
    await this.page.getByRole('table').getByText('Profile Correction Application').click();
    await this.page.getByRole('button', { name: 'Review Profile Changes' }).click();
    await this.page.getByRole('button').filter({ hasText: 'Approve' }).click();

    // Preview PDF → add signature
    await this.previewPdfBtn.click();
    await this.addSignatureBtn.click();

    // Download the pre-filled order PDF
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByText('click here').click(),
    ]);

    const projectDownloadPath = path.join(resolveFromUiE2E('downloads'), await download.suggestedFilename());
    fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
    await download.saveAs(projectDownloadPath);
    console.log(`[JudgePage] Profile correction order downloaded: ${projectDownloadPath}`);

    // Upload the signed PDF and submit
    await this.uploadOrderBtn.click();
    await this.page.waitForTimeout(2000);
    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

    await this.submitSignatureBtn.click();
    await this.issueOrderBtn.click();

    // Handle success confirmation
    await this.page.getByText('You have successfully issued').click();
    await this.page.getByRole('button', { name: 'Close' }).click();
    await this.page.getByRole('heading', { name: 'Order successfully issued!' }).click();

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('[JudgePage] Profile Correction Application approved successfully.');
  }

  /**
   * Judge submits a document (e.g. an Affidavit) from the case view.
   * Navigates via All Cases → cmpNumber → Take Action → Submit Documents.
   *
   * Converted from: UI Tests/tests/7-JudgeReSubmitCase/12-submitDocumentJudge.spec.js
   *
   * @param {string} cmpNumber        - The case CMP number (e.g. 'CMP/173/2026')
   * @param {string} documentType     - Document type dropdown label (default 'Affidavits')
   * @param {string} documentFilePath - Absolute path to the file to upload
   * @param {string} reason           - Reason text for the submission (default 'reason testing')
   */
  async submitDocumentAsJudge(
    cmpNumber,
    documentType = 'Affidavits',
    documentFilePath,
    reason = 'reason testing'
  ) {
    console.log('[JudgePage] Submitting document as Judge...');

    await this.allCasesLink.click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('cell', { name: cmpNumber }).click();
    await this.page.waitForTimeout(1000);

    // Open Take Action → Submit Documents
    await this.page.getByRole('button', { name: 'Take Action' }).click();
    await this.page.getByText('Submit Documents').click();

    // Select document type from dropdown
    await this.page.locator('div').filter({ hasText: /^Document Type\*$/ }).getByRole('img').click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: documentType }).click();

    // Upload the document file
    const fileInput = await this.page.$('input[type="file"]');
    await fileInput.setInputFiles(documentFilePath);

    // Fill reason
    await this.page.locator('.ql-editor').click();
    await this.page.locator('.ql-editor').fill(reason);
    await this.page.waitForTimeout(3000);

    // Review and sign
    await this.page.getByRole('button').filter({ hasText: 'Review Submission' }).click();
    await this.page.getByRole('button', { name: 'Sign' }).click();

    // Upload signed document
    await this.uploadOrderBtn.click();
    const fileInput1 = await this.page.$('input[type="file"]');
    await fileInput1.setInputFiles(documentFilePath);

    await this.submitSignatureBtn.click();
    await this.page.getByRole('button', { name: 'Finish' }).click();
    await this.page.getByRole('button', { name: 'Close' }).click();

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('[JudgePage] Document submitted successfully.');
  }
}

module.exports = { JudgePage };
