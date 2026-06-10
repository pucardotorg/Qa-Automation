const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

class JudgePage extends BasePage {
  constructor(page, globals) {
    super(page, globals);

    this.allCasesLink = page.getByRole('link', { name: 'All Cases' });
    this.caseSearchInput = page.locator('input[name="caseSearchText"]');
    this.searchBtn = page.getByRole('button').filter({ hasText: 'Search' });
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
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    
    console.log('[JudgePage] Waiting for case search input...');
    await expect(this.caseSearchInput).toBeVisible({ timeout: 30000 });
    
    console.log('[JudgePage] Filling search input with:', filingNumber);
    await this.caseSearchInput.click();
    await this.caseSearchInput.fill(filingNumber);
    await this.page.waitForTimeout(500);
  
    console.log('[JudgePage] Clicking Search button...');
    await expect(this.searchBtn).toBeVisible({ timeout: 10000 });
    await this.searchBtn.click();
  
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('[JudgePage] Search completed');
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

    // Click "Select another date" to open calendar popup
    await this.selectCustomDateBtn.click();
    await this.page.waitForTimeout(2000);

    // Wait for the "Select Custom Date" modal to appear
    await this.page.waitForSelector('text=Select Custom Date', { state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);

    // Calculate a target date 10 working days from today
    const targetDate = this.calculateWorkingDaysFromNow(10);
    const today = new Date();
    console.log(`[JudgePage] Today: ${today.toDateString()}`);
    console.log(`[JudgePage] Target (10 working days): ${targetDate.toDateString()}`);

    // Navigate forward if target is in a future month
    const monthsToNavigate =
      (targetDate.getFullYear() - today.getFullYear()) * 12 +
      (targetDate.getMonth() - today.getMonth());

    for (let i = 0; i < monthsToNavigate; i++) {
      await this.page.locator('button').filter({ hasText: '›' }).or(
        this.page.locator('button:has(svg):last-of-type')
      ).last().click();
      await this.page.waitForTimeout(800);
    }

    const dayToSelect = targetDate.getDate();
    console.log(`[JudgePage] Looking for day: ${dayToSelect}`);

    // Use all non-passive, non-disabled day buttons (includes weekends — we already
    // calculated a weekday, and excluding .rdrDayWeekend was incorrectly filtering day 16)
    const allDayButtons = await this.page
      .locator('button.rdrDay:not(.rdrDayPassive):not(.rdrDayDisabled)')
      .all();
    console.log(`[JudgePage] Available day buttons: ${allDayButtons.length}`);

    let targetButton = null;
    for (const btn of allDayButtons) {
      const text = (await btn.textContent() || '').trim();
      // Button text can be "16", "16 3 Hearings", "  16  " etc.
      // The day number span is the first numeric token.
      const dayMatch = text.match(/\b(\d{1,2})\b/);
      if (dayMatch && parseInt(dayMatch[1]) === dayToSelect) {
        targetButton = btn;
        console.log(`[JudgePage] Found day ${dayToSelect} (text: "${text.replace(/\s+/g, ' ').trim()}")`);
        break;
      }
    }

    if (!targetButton) {
      // Fallback: first available button whose day number is >= today's day
      const todayDay = today.getDate();
      for (const btn of allDayButtons) {
        const text = (await btn.textContent() || '').trim();
        const m = text.match(/\b(\d{1,2})\b/);
        if (m && parseInt(m[1]) >= todayDay) {
          targetButton = btn;
          console.log(`[JudgePage] Fallback: selecting day ${m[1]}`);
          break;
        }
      }
    }

    if (!targetButton) {
      targetButton = allDayButtons[0];
      console.log('[JudgePage] Last-resort fallback: selecting first available day');
    }

    await targetButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await targetButton.click();
    console.log('[JudgePage] Clicked date button');
    await this.page.waitForTimeout(1500);

    // Confirm the selected date
    const confirmButton = this.page.getByRole('button', { name: 'Confirm' });
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('[JudgePage] Clicking Confirm button');
    await confirmButton.click();
    await this.page.waitForTimeout(2000);
  }

  async generateOrder(orderText = 'AUTOMATION ORDER GENERATED') {
    // Wait for the button to become enabled after hearing date confirmation
    await this.generateOrderBtn.waitFor({ state: 'visible', timeout: 30000 });
    await expect(this.generateOrderBtn).toBeEnabled({ timeout: 30000 });
    await this.generateOrderBtn.click();
    await this.page.waitForLoadState('networkidle');

    await this.orderEditor.click();
    await this.orderEditor.fill(orderText);
    await this.page.waitForTimeout(1000);
  }

  async signAndIssueOrder() {
    await this.previewPdfBtn.click();
    await this.addSignatureBtn.click();

    // Wait for the PDF preview to fully render before the "click here" link appears
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(3000);

    const clickHereLink = this.page.getByText('click here');
    await clickHereLink.waitFor({ state: 'visible', timeout: 60000 });
    await clickHereLink.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);

    // Set up both listeners BEFORE clicking so no event is missed
    const downloadP = this.page.waitForEvent('download', { timeout: 15000 })
      .then(d => ({ type: 'download', value: d })).catch(() => null);
    const popupP = this.page.waitForEvent('popup', { timeout: 15000 })
      .then(p => ({ type: 'popup', value: p })).catch(() => null);

    await clickHereLink.click();

    // Whichever fires first wins; if neither fires within 15s both resolve to null
    const result = await Promise.race([downloadP, popupP]);

    let pdfPath;
    if (result && result.type === 'download') {
      pdfPath = path.join(resolveFromUiE2E('downloads'), await result.value.suggestedFilename());
      fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
      await result.value.saveAs(pdfPath);
      console.log('[JudgePage] PDF downloaded directly:', path.basename(pdfPath));
    } else if (result && result.type === 'popup') {
      const popup = result.value;
      await popup.waitForLoadState('domcontentloaded').catch(() => {});
      const pdfUrl = popup.url();
      await popup.close();
      const response = await this.page.request.get(pdfUrl);
      pdfPath = path.join(resolveFromUiE2E('downloads'), 'signed-order.pdf');
      fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
      fs.writeFileSync(pdfPath, await response.body());
      console.log('[JudgePage] PDF fetched from new tab');
    } else {
      // click here did not trigger download or popup — reuse most recent PDF from downloads/
      const downloadsDir = resolveFromUiE2E('downloads');
      const pdfs = fs.existsSync(downloadsDir)
        ? fs.readdirSync(downloadsDir).filter(f => f.endsWith('.pdf')).sort()
        : [];
      if (pdfs.length === 0) {
        throw new Error('[JudgePage] No PDF available to upload and click here did not trigger a download');
      }
      pdfPath = path.join(downloadsDir, pdfs[pdfs.length - 1]);
      console.log('[JudgePage] Fallback: uploading existing PDF:', path.basename(pdfPath));
    }

    // Upload signed PDF
    await this.uploadOrderBtn.click();
    await this.page.waitForTimeout(2000);
    await this.page.locator('input[type="file"]').first().setInputFiles(pdfPath);

    await this.submitSignatureBtn.click();
    await this.issueOrderBtn.click();
    await this.page.waitForTimeout(2000);

    return pdfPath;
  }

  async captureAccessCodeAndCmpNumber() {
    // Wait for the "Order Successfully Issued" popup / page to appear
    await this.page.waitForTimeout(2000);

    // ── Capture Access Code and CMP Number ───────────────────────────────────
    // These may appear inside the success popup OR on the case overview page.
    // Search broadly across the whole page so popup vs. main-page doesn't matter.
    // Broad selectors tried in order:
    const codeSelectors = [
      'div.sub-details-text',       // original — works on some envs
      '[class*="sub-details"]',     // variant class names
      '[class*="details-text"]',
      '.label-value-pair',
      '[class*="case-detail"]',
      'div[class*="detail"]',
    ];

    // Helper: search all selectors for text containing a pattern
    const findTextBySelectors = async (pattern) => {
      for (const sel of codeSelectors) {
        try {
          const els = this.page.locator(sel).filter({ hasText: pattern });
          const count = await els.count();
          if (count > 0) {
            return (await els.first().textContent()) || '';
          }
        } catch { /* next */ }
      }
      return '';
    };

    // Wait up to 30s for either the access code or CMP to appear anywhere on page
    let accessCodeText = '';
    let cmpRaw = '';
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      accessCodeText = await findTextBySelectors('Code:');
      cmpRaw = await findTextBySelectors('CMP/');
      if (accessCodeText || cmpRaw) break;
      await this.page.waitForTimeout(1500);
    }

    // ── Close any open success popup ─────────────────────────────────────────
    const popupCloseSelectors = [
      'div:nth-child(4) > .popup-module > .header-wrap > .header-end > div > svg',
      '.popup-module .header-end svg',
      '.popup-module button[aria-label="Close"]',
    ];
    for (const sel of popupCloseSelectors) {
      try {
        const el = this.page.locator(sel).first();
        if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
          await el.click();
          break;
        }
      } catch { /* try next */ }
    }
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);

    // If not found in popup, try main page one more time
    if (!accessCodeText) accessCodeText = await findTextBySelectors('Code:');
    if (!cmpRaw) cmpRaw = await findTextBySelectors('CMP/');

    const accessCode = accessCodeText.match(/Code\s*:\s*(\w+)/)?.[1]?.trim() || '';
    const cmpNumber = cmpRaw.match(/(CMP\/\S+)/)?.[1]?.trim() || cmpRaw.trim();

    console.log('[JudgePage] Raw access code text:', accessCodeText);
    console.log('[JudgePage] Raw CMP text:', cmpRaw);
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
    await this.page.waitForTimeout(10000);
    await this.page.getByText('Review Advocate Replace').first().click();
    await this.page.waitForTimeout(60000);
    await this.page.getByRole('button', { name: 'Approve' }).click();
    await this.page.waitForTimeout(40000);

    await this.previewPdfBtn.click();
    await this.page.waitForTimeout(20000);
    await this.addSignatureBtn.click();

    const projectDownloadPath = await this.clickAndSavePdf();

    await this.uploadOrderBtn.click();
    await this.page.waitForTimeout(20000);
    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

    await this.submitSignatureBtn.click();
    await this.issueOrderBtn.click();
    await this.page.waitForTimeout(30000);

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
    const projectDownloadPath = await this.clickAndSavePdf();

    // Upload the signed PDF and submit
    await this.uploadOrderBtn.click();
    await this.page.waitForTimeout(20000);
    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

    await this.submitSignatureBtn.click();
    await this.issueOrderBtn.click();

    // Handle success confirmation
    await this.page.getByText('You have successfully issued').click();
    await this.page.getByRole('button', { name: 'Close' }).click();
    await this.page.getByRole('heading', { name: 'Order successfully issued!' }).click();

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(20000);
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
    reason = 'reason testing',
    documentTitle = 'Test Document Submission'
  ) {
    console.log('[JudgePage] Submitting document as Judge...');
  
    await this.allCasesLink.click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('cell', { name: cmpNumber }).click();
    await this.page.waitForTimeout(1000);
  
    // Open Take Action → Submit Documents
    await this.page.getByRole('button', { name: 'Take Action' }).click();
    await this.page.getByText('Submit Documents').click();
    await this.page.waitForTimeout(1000);
  
    // Select document type from dropdown
    await this.page.locator('div').filter({ hasText: /^Document Type\*$/ }).getByRole('img').click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: documentType }).click();
    await this.page.waitForTimeout(500);
  
    // Fill Document Title - use a more specific selector
    const documentTitleInput = this.page.locator('input[type="text"]').nth(1); // Second text input after document type
    await documentTitleInput.waitFor({ state: 'visible', timeout: 5000 });
    await documentTitleInput.click();
    await documentTitleInput.fill(documentTitle);
    await this.page.waitForTimeout(500);
  
    // Upload the document file
    const fileInput = await this.page.$('input[type="file"]');
    await fileInput.setInputFiles(documentFilePath);
    await this.page.waitForTimeout(1000);
  
    // Fill reason
    await this.page.locator('.ql-editor').click();
    await this.page.locator('.ql-editor').fill(reason);
    await this.page.waitForTimeout(2000);
  
    // Review and submit
const reviewBtn = this.page.getByRole('button').filter({ hasText: 'Review Submission' });
await reviewBtn.waitFor({ state: 'visible', timeout: 5000 });
await expect(reviewBtn).toBeEnabled({ timeout: 5000 });
await reviewBtn.click();
await this.page.waitForTimeout(2000);

const signBtn = this.page.getByRole('button', { name: 'Submit', exact: true }).last();
await signBtn.waitFor({ state: 'visible', timeout: 10000 });
await expect(signBtn).toBeEnabled();
await signBtn.scrollIntoViewIfNeeded();
await signBtn.click();
  
    // Wait for the success modal and close it
    const closeBtn = this.page.getByRole('button', { name: 'Close', exact: true });
    await closeBtn.waitFor({ state: 'visible', timeout: 15000 });
    await closeBtn.click();
  
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('[JudgePage] Document submitted successfully.');
  }
  /**
   * Citizen initiates a Bail Bond Surety filing from the case view.
   * Navigates via citizen login → cmpNumber cell → Make Filings → Generate Bail Bond.
   *
   * Converted from: UI Tests/tests/7-JudgeReSubmitCase/13-initiateBailBondSurety.spec.js
   *
   * @param {string} cmpNumber      - The registered case CMP number (e.g. 'CMP/175/2026')
   * @param {string} chequeFilePath - Absolute path to the cheque/surety image to upload
   */
  async initiateBailBondSurety(cmpNumber, chequeFilePath) {
    console.log('[JudgePage] Initiating Bail Bond Surety...');

    await this.page.waitForTimeout(1000);
    await this.page.getByRole('cell', { name: cmpNumber }).click();
    await this.page.waitForTimeout(1000);

    // Open Make Filings → Generate Bail Bond
    await this.page.getByRole('button', { name: 'Make Filings' }).click();
    await this.page.getByText('Generate Bail Bond').click();

    // Fill litigant details
    await this.page.locator('input[name="litigantFatherName"]').click();
    await this.page.locator('input[name="litigantFatherName"]').fill('Ajay Verma');
    await this.page.locator('#validationCustom01').click();
    await this.page.locator('#validationCustom01').fill('8500');

    // Select Bail Type → Bail Surety
    await this.page.locator('div').filter({ hasText: /^Bail Type\*$/ }).getByRole('img').click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: 'Bail Surety' }).click();

    // Fill surety details
    await this.page.locator('input[name="name"]').first().click();
    await this.page.locator('input[name="name"]').first().fill('Akay Kumar');
    await this.page.locator('input[name="fatherName"]').first().click();
    await this.page.locator('input[name="fatherName"]').first().fill('Rakesh Kumar');
    await this.page.locator('input[name="mobileNumber"]').first().click();
    await this.page.locator('input[name="mobileNumber"]').first().fill('9632000000');
    await this.page.locator('input[name="locality"]').first().click();
    await this.page.locator('input[name="locality"]').first().fill('91 Springboard');
    await this.page.locator('input[name="city"]').first().click();
    await this.page.locator('input[name="city"]').first().fill('Augusta');

    // Pincode — use pressSequentially to trigger React onChange events
    await this.page.waitForTimeout(2000);
    await this.page.locator('input[name="pincode"]').first().waitFor({ state: 'visible' });
    await this.page.locator('input[name="pincode"]').first().scrollIntoViewIfNeeded();
    await this.page.locator('input[name="pincode"]').first().click({ clickCount: 3 });
    await this.page.locator('input[name="pincode"]').first().pressSequentially('9856230', { delay: 100 });
    await this.page.waitForTimeout(1000);

    await this.page.locator('input[name="district"]').first().click();
    await this.page.locator('input[name="district"]').first().fill('Kollam');
    await this.page.locator('input[name="state"]').first().click();
    await this.page.locator('input[name="state"]').first().fill('Kerala');

    // Upload surety documents (cheque image used for both uploads)
    const fileInput1 = await this.page.$('input[type="file"]');
    await fileInput1.setInputFiles(chequeFilePath);

    const fileInput2 = this.page.locator('input[type="file"]').nth(2);
    await fileInput2.waitFor({ state: 'attached' });
    await fileInput2.setInputFiles(chequeFilePath);

    // Delete auto-generated "Surety 2" block so form validation passes
    const deleteSurety2Btn = this.page.getByText('Surety 2', { exact: true }).locator('..').getByRole('button').first();
    if (await deleteSurety2Btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await deleteSurety2Btn.click();
    }

    // Review → Sign (button may be covered by animation, use JS click)
    await this.page.getByRole('button').filter({ hasText: 'Review Bail Bond' }).click();
    await this.page.waitForTimeout(2000);
    const signBtn = this.page.getByRole('button', { name: 'Proceed To Sign' });
    await signBtn.waitFor({ state: 'visible' });
    await expect(signBtn).toBeEnabled();
    await signBtn.scrollIntoViewIfNeeded();
    await signBtn.evaluate(btn => btn.click());

    // Upload Signed copy → download → re-upload
    await this.page.getByRole('button', { name: 'Upload Signed copy' }).click();
    const downloadedFilePath = await this.clickAndSavePdf();

    // Upload the signed copy
    const signedCopyInput = this.page.locator('input[type="file"][name="file"][accept=".pdf"]');
    await signedCopyInput.waitFor({ state: 'attached' });
    await signedCopyInput.setInputFiles(downloadedFilePath);

    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.getByRole('button', { name: 'Close' }).click();

    await this.page.waitForLoadState('networkidle');
    console.log('[JudgePage] Bail Bond Surety initiated successfully.');
  }

  /**
   * Judge approves a pending Bail Bond Surety from the Documents tab.
   * Navigates via All Cases → cmpNumber → Documents → Bail Bonds → Surety →
   * Proceed To Sign → download → upload signed copy → Submit Signature → Submit.
   *
   * Converted from: UI Tests/tests/7-JudgeReSubmitCase/14-approveBailBondSurety.spec.js
   *
   * @param {string} cmpNumber - The registered case CMP number (e.g. 'CMP/175/2026')
   */
  async approveBailBondSurety(cmpNumber) {
    console.log('[JudgePage] Approving Bail Bond Surety...');

    await this.allCasesLink.click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('cell', { name: cmpNumber }).click();
    await this.page.waitForTimeout(1000);

    // Navigate to Documents → Bail Bonds → Surety
    await this.page.getByRole('button', { name: 'Documents' }).click();
    await this.page.getByRole('button', { name: 'Bail Bonds' }).click();
    await this.page.getByText('Surety').click();

    // Sign the bail bond — button may render after animation
    const proceedToSignBtn = this.page.getByRole('button', { name: 'Proceed To Sign' });
    await proceedToSignBtn.waitFor({ state: 'visible' });
    await expect(proceedToSignBtn).toBeEnabled();
    await proceedToSignBtn.evaluate(btn => btn.click());

    // Download the bail bond document
    const downloadPath = await this.clickAndSavePdf();

    // Upload the signed copy and submit
    await this.page.getByRole('button', { name: 'Upload Order Document with' }).click();
    await this.page.waitForTimeout(2000);
    await this.page.locator('input[type="file"]').first().setInputFiles(downloadPath);

    await this.page.getByRole('button', { name: 'Submit Signature' }).click();
    await this.page.getByRole('button', { name: 'Submit' }).click();

    // Confirm success
    await this.page.getByText('You have successfully signed the Bail Bond').click();
    await this.page.getByRole('button', { name: 'Close' }).click();

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    console.log('[JudgePage] Bail Bond Surety approved successfully.');
  }
  /**
   * Judge registers a case using the kebab menu → Generate Order → hearing date flow.
   * Different from registerCaseFlow which uses the Register Case button + Schedule Hearing.
   * Converted from: UI Tests/tests/8-WitnessEvidence/4-registerCase.spec.js
   *
   * @param {string} filingNumber - The filing number to search and open
   * @param {string} orderText    - Not used in this variant (hearing date is set instead)
   */
  async registerCaseWithHearingDate(filingNumber) {
    console.log('[JudgePage] Registering case with hearing date flow...');
    
    await this.navigateToAllCases();
    await this.searchCase(filingNumber);
    await this.openCase();
    
    // Click Register Case button - this directly registers the case
    await expect(this.registerCaseBtn).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(2000);
    await this.registerCaseBtn.click();
    await this.page.waitForTimeout(3000);
    
    // Capture CMP number and CNR from the registration success popup
    const cmpElement = this.page.getByText(/CMP\/\d+\/\d+/);
    await cmpElement.waitFor({ state: 'visible', timeout: 10000 });
    const cmpNumber = (await cmpElement.textContent())?.trim() || '';
    
    const cnrElement = this.page.getByText(/KLKM\d+/);
    const accessCode = (await cnrElement.textContent())?.trim() || '';
    
    console.log('[JudgePage] Captured from registration popup → CMP:', cmpNumber, ' CNR:', accessCode);
    
    // Click "Schedule Hearing" button on the success popup
    const scheduleHearingBtn = this.page.getByRole('button', { name: 'Schedule Hearing' });
    await scheduleHearingBtn.waitFor({ state: 'visible', timeout: 10000 });
    await scheduleHearingBtn.click();
    await this.page.waitForTimeout(2000);
    
    // Now the Schedule Hearing popup appears - select custom date
    await this.selectCustomDateBtn.waitFor({ state: 'visible', timeout: 10000 });
    await this.selectCustomDateBtn.click();
    await this.page.waitForTimeout(2000);
    
    await this.page.waitForSelector('text=Select Custom Date', { state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    
    const today = new Date();
    const todayDay = today.getDate();
    console.log(`[JudgePage] Looking for today's date: ${todayDay}`);
    
    const todayButton = this.page.getByRole('button', { name: new RegExp(`^${todayDay}\\b`) })
      .filter({ has: this.page.locator(':not(.rdrDayPassive)') })
      .last();
    
    await todayButton.waitFor({ state: 'visible', timeout: 5000 });
    await todayButton.click();
    console.log('[JudgePage] Clicked today\'s date');
    await this.page.waitForTimeout(1500);
    
    const confirmButton = this.page.getByRole('button', { name: 'Confirm' });
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmButton.click();
    await this.page.waitForTimeout(2000);
    
    // Click "Generate Order" to create the hearing order
const generateOrderBtn = this.page.getByRole('button').filter({ hasText: 'Generate Order' });
await generateOrderBtn.waitFor({ state: 'visible', timeout: 10000 });
await generateOrderBtn.click();
await this.page.waitForLoadState('networkidle');
await this.page.waitForTimeout(2000);

// Fill in the order text
await this.orderEditor.waitFor({ state: 'visible', timeout: 10000 });
await this.orderEditor.click();
await this.orderEditor.fill('AUTOMATION ORDER - HEARING SCHEDULED');
await this.page.waitForTimeout(1000);

// Sign and issue the hearing order
await this.signAndIssueOrder();
    
    // Close the order success popup
    try {
      const closeBtn = this.page.getByRole('button', { name: 'Close' });
      await closeBtn.click({ timeout: 5000 });
    } catch {
      await this.page.keyboard.press('Escape');
    }
    await this.page.waitForTimeout(2000);
    
    console.log('[JudgePage] Register case with hearing date completed.');
    return { accessCode, cmpNumber };
  }
  async scheduleHearingWithToday() {
    await this.scheduleHearingBtn.click();
    await this.page.waitForTimeout(1000);
  
    // Click "Select another date" to open calendar popup
    await this.selectCustomDateBtn.click();
    await this.page.waitForTimeout(2000);
  
    // Wait for the "Select Custom Date" modal to appear
    await this.page.waitForSelector('text=Select Custom Date', { state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
  
    // Click today's date in the calendar
    const today = new Date();
    const todayDay = today.getDate();
    console.log(`[JudgePage] Looking for today's date: ${todayDay}`);
  
    // Find today's button - use getByRole to find the exact button with today's date
    // The button text is like "27 6 Hearings" or just "27"
    const todayButton = this.page.getByRole('button', { name: new RegExp(`^${todayDay}\\b`) })
      .filter({ has: this.page.locator(':not(.rdrDayPassive)') })
      .last(); // Use last() to get current month's date, not previous month's
  
    await todayButton.waitFor({ state: 'visible', timeout: 5000 });
    await todayButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await todayButton.click();
    console.log('[JudgePage] Clicked today\'s date');
    await this.page.waitForTimeout(1500);
  
    // Click the Confirm button in the calendar popup
    const confirmButton = this.page.getByRole('button', { name: 'Confirm' });
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmButton.click();
    await this.page.waitForTimeout(2000);
    console.log('[JudgePage] Hearing scheduled for today');
  }

  async startHearing(filingNumber) {
    console.log('[JudgePage] Starting hearing...');

    // Use the dashboard search (different from All Cases search)
    console.log('[JudgePage] Searching for case...');
    const searchBox = this.page.getByRole('textbox', { name: 'Search Case Name or Number' });
    await searchBox.waitFor({ state: 'visible', timeout: 10000 });
    await searchBox.click();
    await this.page.waitForTimeout(1000);
    await searchBox.fill(filingNumber);
    await this.page.waitForTimeout(1000);

    const searchBtn = this.page.getByRole('button', { name: 'Search', exact: true });
    await searchBtn.waitFor({ state: 'visible', timeout: 10000 });
    await searchBtn.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // Click the kebab/action icon in the 7th column
    console.log('[JudgePage] Opening kebab menu...');
    const kebabIcon = this.page.locator('td:nth-child(7) > div > div > div > svg > path').first();
    await kebabIcon.waitFor({ state: 'visible', timeout: 10000 });
    await kebabIcon.click();
    await this.page.waitForTimeout(3000);

    console.log('[JudgePage] Clicking Start Hearing...');
    const startHearingBtn = this.page.getByText('Start Hearing');
    await startHearingBtn.waitFor({ state: 'visible', timeout: 10000 });
    await startHearingBtn.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
    console.log('[JudgePage] Hearing started.');
  }

  /**
   * Judge takes a witness deposition: selects witness, fills deposition, submits & e-signs.
   * Converted from: UI Tests/tests/8-WitnessEvidence/6-witnessDeposition.spec.js (first half)
   *
   * @param {string} filingNumber  - Filing number to navigate to via All Cases
   * @param {string} depositionText - Text to fill in the deposition editor
   */
  async takeWitnessDeposition(filingNumber, depositionText = 'Checking witness deposition') {
    console.log('[JudgePage] Taking witness deposition...');

    await this.navigateToAllCases();
    await this.searchCase(filingNumber);
    await this.openCase();

    // Open kebab → Take Witness Deposition
    await this.page.getByRole('img').nth(5).click();
    await this.page.getByText('Take Witness Deposition').click();
    await this.page.waitForTimeout(2000);

    // Select witness and witness marked-as option from dropdowns
    await this.page.locator('.select > .cp').first().click();
    await this.page.locator('.cp.profile-dropdown--item').first().click();

    await this.page.locator('div:nth-child(2) > .select-wrap > .select > .cp').click();
    await this.page.locator('.cp.profile-dropdown--item').first().click();

    // Fill deposition text and submit
    await this.page.locator('.ql-editor').click();
    await this.page.locator('.ql-editor').fill(depositionText);
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.waitForLoadState('networkidle');

    // E-Sign
    await this.page.getByRole('button', { name: 'Submit & E-Sign' }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // Proceed To Sign → Upload Signed copy → download → upload
    await this.page.getByRole('button', { name: 'Proceed To Sign' }).click();
    await this.page.getByRole('button', { name: 'Upload Signed copy' }).click();

    const downloadPath = await this.clickAndSavePdf();

    await this.page.waitForTimeout(2000);
    await this.page.locator('input[type="file"]').first().setInputFiles(downloadPath);
    await this.page.getByRole('button', { name: 'Submit' }).nth(1).click();
    await this.page.waitForTimeout(2000);
    await this.page.getByRole('button', { name: 'Close' }).click();
    await this.page.waitForTimeout(2000);

    // Click the back/home button (empty filter button)
    await this.page.getByRole('button').filter({ hasText: /^$/ }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    console.log('[JudgePage] Witness deposition submitted.');
    return downloadPath;
  }

  /**
   * Judge signs the witness deposition from the "Sign Witness Deposition" home section.
   * Converted from: UI Tests/tests/8-WitnessEvidence/6-witnessDeposition.spec.js (second half)
   *
   * @param {string} filingNumber - Filing number to search in the sign deposition view
   */
  async signWitnessDeposition(filingNumber) {
    console.log('[JudgePage] Signing witness deposition...');

    // Step 1: Try to navigate to home using in-app navigation (Home link/logo).
    // The 'Sign Witness Deposition' pending-task widget only loads correctly when
    // navigated to from within the session, not always via a direct goto().
    console.log('[JudgePage] Navigating to home for Sign Witness Deposition...');

    // Try several selectors for the Home navigation element
    const homeSelectors = [
      () => this.page.getByRole('link', { name: 'Home' }),
      () => this.page.locator('a[href*="/home"]').first(),
      () => this.page.locator('header').getByRole('img').first(),
    ];

    let navigatedViaLink = false;
    for (const selector of homeSelectors) {
      const el = selector();
      const isVisible = await el.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        await el.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);
        navigatedViaLink = true;
        console.log('[JudgePage] Navigated home via in-app link.');
        break;
      }
    }

    // Step 2: Fall back to goto() + reload to force task list refresh
    if (!navigatedViaLink) {
      console.log('[JudgePage] Home link not found, using goto() fallback...');
      await this.page.goto(`${this.globals.baseURL}ui/employee/dristi/home`);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(3000);
      // Reload once to trigger async task widgets (Sign Witness Deposition etc.)
      await this.page.reload();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(3000);
    }

    // Step 3: Wait for 'Sign Witness Deposition' widget — scroll if below fold
    console.log('[JudgePage] Looking for Sign Witness Deposition widget...');
    const signDepositionWidget = this.page.getByText('Sign Witness Deposition');
    await signDepositionWidget.waitFor({ state: 'visible', timeout: 30000 });
    await signDepositionWidget.scrollIntoViewIfNeeded();
    await signDepositionWidget.click();

    await this.page.getByRole('textbox').click();
    await this.page.getByRole('textbox').fill(filingNumber);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // Search button (by xpath matching the source spec)
    const searchBtn = this.page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div/div[2]/div[1]/div[2]/div[1]/div[1]/div/div/form/div/div/div[2]/button/header');
    await expect(searchBtn).toBeVisible({ timeout: 10000 });
    await searchBtn.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // Click the deposition result row
    const resultRow = this.page.locator('tr');
    await expect(resultRow.first()).toBeVisible({ timeout: 10000 });

    const caseIdCell = this.page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div/div[2]/div[1]/div[2]/div[1]/div[2]/div/span/table/tbody/tr[1]/td[2]');
    await expect(caseIdCell).toBeVisible({ timeout: 20000 });
    const clickableLink = caseIdCell.locator('a,button');
    if (await clickableLink.count() > 0) {
      await clickableLink.first().click();
    } else {
      await caseIdCell.click();
    }
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    console.log('[JudgePage] Waiting for Proceed To Sign button...');
    const proceedToSignBtn = this.page.getByRole('button', { name: 'Proceed To Sign' });
    await proceedToSignBtn.waitFor({ state: 'visible', timeout: 30000 });
    await proceedToSignBtn.click();
    await this.page.waitForTimeout(2000);

    console.log('[JudgePage] Downloading deposition document...');
    const downloadPath = await this.clickAndSavePdf();

    console.log('[JudgePage] Uploading signed document...');
    const uploadBtn = this.page.getByRole('button', { name: 'Upload Order Document with Signature' });
    await uploadBtn.waitFor({ state: 'visible', timeout: 10000 });
    await uploadBtn.click();
    await this.page.waitForTimeout(2000);

    await this.page.locator('input[type="file"]').first().setInputFiles(downloadPath);
    await this.page.waitForTimeout(2000);

    console.log('[JudgePage] Submitting signature...');
    await this.submitSignatureBtn.waitFor({ state: 'visible', timeout: 10000 });
    await this.submitSignatureBtn.click();
    await this.page.waitForTimeout(3000);

    console.log('[JudgePage] Clicking Submit...');
    const submitBtn = this.page.getByRole('button', { name: 'Submit' });
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
    await submitBtn.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    console.log('[JudgePage] Closing confirmation...');
    const closeBtn = this.page.getByRole('button', { name: 'Close' });
    await closeBtn.waitFor({ state: 'visible', timeout: 10000 });
    await closeBtn.click();
    await this.page.waitForTimeout(1000);

    console.log('[JudgePage] Witness deposition signed successfully.');
  }

  /**
   * Judge ends the hearing from the case list dashboard.
   * Converted from: UI Tests/tests/8-WitnessEvidence/7-endHearing.spec.js
   *
   * @param {string} filingNumber - Filing number to search on dashboard
   */
  async endHearing(filingNumber) {
    console.log('[JudgePage] Ending hearing...');

    await this.page.getByRole('textbox', { name: 'Search Case Name or Number' }).click();
    await this.page.waitForTimeout(2000);
    await this.page.getByRole('textbox', { name: 'Search Case Name or Number' }).fill(filingNumber);
    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();
    await this.page.waitForLoadState('networkidle');

    // Click kebab action icon
    await this.page.locator('td:nth-child(7) > div > div > div > svg > path').click();
    await this.page.waitForTimeout(5000);

    await this.page.getByText('End Hearing').click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // Confirm the End Hearing popup
    const endHearingHeading = this.page.locator('h2:has-text("End Hearing")');
    await expect(endHearingHeading).toBeVisible({ timeout: 10000 });
    await endHearingHeading.click();

    await this.page.waitForTimeout(5000);
    console.log('[JudgePage] Hearing ended.');
  }

  /**
   * Judge marks a document as evidence from the Documents tab.
   * Converted from: UI Tests/tests/8-WitnessEvidence/8-evidence.spec.js
   *
   * @param {string} filingNumber   - Filing number to navigate to via All Cases
   * @param {string} exhibitNumber  - Exhibit number to fill in the popup (default '1')
   */
  async markAsEvidence(filingNumber, exhibitNumber = '1') {
    console.log('[JudgePage] Marking document as evidence...');

    await this.navigateToAllCases();
    await this.searchCase(filingNumber);
    await this.openCase();

    // Open Documents tab
    await this.page.getByRole('button', { name: 'Documents' }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // Click three-dot menu on the second document row
    await this.page.locator('tr:nth-child(2) > td:nth-child(8) > div > div > svg').click();
    await this.page.waitForTimeout(1000);
    await this.page.getByText('Mark as Evidence').click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // Fill in the evidence marking popup
    await this.page.locator('.select.false > .cp > path:nth-child(2)').click();
    await this.page.locator('.cp.profile-dropdown--item').click();
    await this.page.locator('.label-field-pair > div > .text-input > .citizen-card-input').click();
    await this.page.locator('.label-field-pair > div > .text-input > .citizen-card-input').fill(exhibitNumber);
    await this.page.waitForTimeout(2000);

    await this.page.getByRole('button', { name: 'Proceed' }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    await this.page.getByRole('button', { name: 'Send for Sign' }).click();
    await this.page.waitForTimeout(6000);

    console.log('[JudgePage] Document marked as evidence and sent for sign.');
  }
}

module.exports = { JudgePage };
