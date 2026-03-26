const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

class JudgeOrdersPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);

    this.allCasesLink = page.getByRole('link', { name: 'All Cases' });
    this.takeActionBtn = page.getByRole('button', { name: 'Take Action' });
    this.generateOrderLink = page.getByText('Generate Order');
    this.orderTypeDropdown = page.locator('div').filter({ hasText: /^EditDelete$/ }).locator('div').nth(1);
    this.orderTypeDropdownFirst = page.locator('div').filter({ hasText: /^EditDelete$/ }).getByRole('img').first();
    this.confirmBtn = page.getByRole('button').filter({ hasText: 'Confirm' });
    this.previewPdfBtn = page.getByRole('button').filter({ hasText: 'Preview PDF' });
    this.addSignatureBtn = page.getByRole('button', { name: 'Add Signature' });
    this.uploadOrderBtn = page.getByRole('button', { name: 'Upload Order Document with' });
    this.submitSignatureBtn = page.getByRole('button', { name: 'Submit Signature' });
    this.issueOrderBtn = page.getByRole('button', { name: 'Issue Order' });
    this.closeBtn = page.getByRole('button', { name: 'Close' });
  }

  async navigateToCase(caseNumber) {
    await this.allCasesLink.click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('cell', { name: caseNumber }).first().click();
    await this.page.waitForTimeout(1000);
  }

  async openGenerateOrder() {
    await this.takeActionBtn.click();
    await this.page.waitForTimeout(1000);
    await this.generateOrderLink.click();
    await this.page.waitForTimeout(1000);
  }

  async selectOrderType(orderType, useFirstImg = false) {
    if (useFirstImg) {
      await this.orderTypeDropdownFirst.click();
    } else {
      await this.orderTypeDropdown.click();
    }
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: orderType }).click();
  }

  async selectNoticeType(noticeType) {
    await this.page.locator('div').filter({ hasText: /^Notice Type\*$/ }).getByRole('textbox').click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: noticeType }).click();
  }

  async selectParty(partyName) {
    await this.page.locator('div').filter({ hasText: /^Notice to the Party\*$/ }).locator('svg').click();
    await this.page.waitForTimeout(500);
    await this.page.getByText(partyName, { exact: false }).click();
  }

  async selectSummonParty(partyName) {
    await this.page.waitForTimeout(1000);

    // Try checkbox first (as seen in the page snapshot)
    const checkbox = this.page.getByRole('checkbox', { name: partyName });
    const checkboxCount = await checkbox.count();

    if (checkboxCount > 0) {
      console.log(`Found checkbox for: ${partyName}`);
      await checkbox.check();
      return;
    }

    // If no checkbox, try clicking dropdown and selecting text
    console.log(`No checkbox found, trying dropdown for: ${partyName}`);
    await this.page.locator('form path').nth(4).click();
    await this.page.waitForTimeout(1000);

    // Try to find and click the text
    const textOption = this.page.getByText(partyName, { exact: false });
    const textCount = await textOption.count();

    if (textCount > 0) {
      await textOption.first().click();
    } else {
      // Debug: show what's available
      const allText = await this.page.locator('body').textContent();
      console.log('Available text on page:', allText.substring(0, 500));
      throw new Error(`Could not find party: ${partyName}`);
    }
  }

  async selectProclamationParty(partyName, partyAddress = null, policeStation = 'ADHUR') {
    // Click on party dropdown
    await this.page.locator('div').filter({ hasText: /^Proclamation for Party\*\+ Add new witness$/ }).getByRole('img').click();
    await this.page.waitForTimeout(500);
    await this.page.getByText(partyName, { exact: false }).click();
    // Wait for address checkboxes to render after party selection
    await this.page.waitForTimeout(1000);

    // Check the address checkbox — force:true bypasses React re-render instability
    if (partyAddress) {
      const addressCheckbox = this.page.getByRole('checkbox', { name: partyAddress });
      const count = await addressCheckbox.count();
      if (count > 0) {
        await addressCheckbox.first().check({ force: true });
      } else {
        console.log(`Address checkbox not found for: ${partyAddress}, using first available`);
        await this.page.getByRole('checkbox').first().check({ force: true });
      }
    } else {
      await this.page.getByRole('checkbox').first().check({ force: true });
    }

    // Select police station — use form img nth(1) matching working spec
    // Do NOT use waitFor('#jk-dropdown-unique') — use a fixed wait then direct click
    await this.page.locator('form').getByRole('img').nth(1).click({ force: true });
    await this.page.waitForTimeout(1000);
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: policeStation }).first().click();
    await this.page.waitForTimeout(500);
  }

  async selectAttachmentParty(partyName, partyAddress, policeStation = 'ADHUR', daysForAnswering = 'test', districtName = 'test', villageName = 'test') {
    // Click on party dropdown
    await this.page.locator('div').filter({ hasText: /^Attachment for Party\*\+ Add new witness$/ }).getByRole('img').click();
    await this.page.waitForTimeout(500);
    await this.page.getByText(partyName, { exact: false }).click();
    // Wait for address checkboxes to render after party selection
    await this.page.waitForTimeout(1000);

    // Check the address checkbox — force:true bypasses React re-render instability
    if (partyAddress) {
      const addressCheckbox = this.page.getByRole('checkbox', { name: partyAddress });
      const count = await addressCheckbox.count();
      if (count > 0) {
        await addressCheckbox.first().check({ force: true });
      } else {
        console.log(`Address checkbox not found for: ${partyAddress}, using first available`);
        await this.page.getByRole('checkbox').first().check({ force: true });
      }
    } else {
      await this.page.getByRole('checkbox').first().check({ force: true });
    }

    // Select police station — matching working spec: fixed wait then direct click
    await this.page.locator('form').getByRole('img').nth(1).click({ force: true });
    await this.page.waitForTimeout(1000);
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: policeStation }).first().click();
    await this.page.waitForTimeout(500);

    // Fill Number of Days for Answering Charge
    await this.page.locator('div').filter({ hasText: /^\*Number of Days for Answering Charge$/ }).getByPlaceholder('Type here').click();
    await this.page.locator('div').filter({ hasText: /^\*Number of Days for Answering Charge$/ }).getByPlaceholder('Type here').fill(daysForAnswering);

    // Fill Name of Accused District
    await this.page.locator('div').filter({ hasText: /^\*Name of Accused District$/ }).getByPlaceholder('Type here').click();
    await this.page.locator('div').filter({ hasText: /^\*Name of Accused District$/ }).getByPlaceholder('Type here').fill(districtName);

    // Fill Name of Accused Village
    await this.page.locator('div').filter({ hasText: /^\*Name of Accused Village$/ }).getByPlaceholder('Type here').click();
    await this.page.locator('div').filter({ hasText: /^\*Name of Accused Village$/ }).getByPlaceholder('Type here').fill(villageName);
  }


  async selectWarrantParty(partyName, partyAddress, policeStation = 'ADHUR', warrantType = 'Witness', warrantSubType = 'Warrent of arrest of accused 138', bailableOption = 1) {
    // Click on party dropdown
    await this.page.locator('div').filter({ hasText: /^Warrant for Party\*\+ Add new witness$/ }).getByRole('img').click();
    await this.page.waitForTimeout(500);
    await this.page.getByText(partyName, { exact: false }).click();
    // Wait for address checkboxes to render after party selection
    await this.page.waitForTimeout(1000);

    // Check the address checkbox — force:true bypasses React re-render instability
    if (partyAddress) {
      const addressCheckbox = this.page.getByRole('checkbox', { name: partyAddress });
      const count = await addressCheckbox.count();
      if (count > 0) {
        await addressCheckbox.first().check({ force: true });
      } else {
        console.log(`Address checkbox not found for: ${partyAddress}, using first available`);
        await this.page.getByRole('checkbox').first().check({ force: true });
      }
    } else {
      await this.page.getByRole('checkbox').first().check({ force: true });
    }

    // Select police station — matching working spec: fixed wait then direct click
    await this.page.locator('form').getByRole('img').nth(1).click({ force: true });
    await this.page.waitForTimeout(1000);
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: policeStation }).first().click();
    await this.page.waitForTimeout(500);

    // Select Warrant Type
    await this.page.locator('div').filter({ hasText: /^Warrant Type\*$/ }).getByRole('img').click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: warrantType }).click();

    // Select Warrant Sub Type
    await this.page.locator('#warrantSubType svg').click();
    await this.page.getByText(warrantSubType).click();

    // Select Bailable/Non-Bailable option (0 for first radio, 1 for second radio)
    await this.page.locator('input.radio-btn').nth(bailableOption).click();
  }

  async signAndIssueOrder() {
    await this.confirmBtn.click();
    await this.page.waitForTimeout(2000);

    await this.previewPdfBtn.click();
    await this.addSignatureBtn.click();

    // Download PDF
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
    await this.closeBtn.click();
    await this.page.getByRole('heading', { name: 'Order successfully issued!' }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    return projectDownloadPath;
  }

  async issueNotice(caseNumber, noticeType, partyName) {
    await this.navigateToCase(caseNumber);
    await this.openGenerateOrder();
    await this.selectOrderType('Notice');
    await this.selectNoticeType(noticeType);
    await this.selectParty(partyName);
    await this.signAndIssueOrder();
  }

  async admitCase(caseNumber) {
    await this.navigateToCase(caseNumber);
    await this.openGenerateOrder();
    await this.selectOrderType('Order for Taking Cognizance', true);
    await this.signAndIssueOrder();

    // Capture ST Number — extract just the ST/xxx/xxxx pattern from raw element text
    const stElement = this.page.locator('div.sub-details-text').filter({ hasText: 'ST/' });
    await expect(stElement.first()).toBeVisible({ timeout: 15000 });
    const stRaw = (await stElement.first().textContent()) || '';
    const stNumber = stRaw.match(/(ST\/\S+)/)?.[1]?.trim() || stRaw.trim();
    console.log('[JudgeOrdersPage] Raw ST text:', stRaw);
    console.log('[JudgeOrdersPage] Extracted stNumber:', stNumber);
    return stNumber;
  }


  async issueSummon(caseNumber, partyName) {
    await this.navigateToCase(caseNumber);
    await this.openGenerateOrder();
    await this.selectOrderType('Summons', true);
    await this.selectSummonParty(partyName);
    await this.signAndIssueOrder();
  }

  async issueProclamation(caseNumber, partyName) {
    await this.navigateToCase(caseNumber);
    await this.openGenerateOrder();
    await this.selectOrderType('Proclamation', true);
    await this.selectProclamationParty(partyName, 'Add, city, district,');
    await this.signAndIssueOrder();
  }

  async issueAttachment(caseNumber, partyName) {
    await this.navigateToCase(caseNumber);
    await this.openGenerateOrder();
    await this.selectOrderType('Attachment', true);
    await this.selectAttachmentParty(partyName, 'Add, city, district,');
    await this.signAndIssueOrder();
  }

  async issueWarrant(caseNumber, partyName) {
    await this.navigateToCase(caseNumber);
    await this.openGenerateOrder();
    await this.selectOrderType('Warrant', true);
    await this.selectWarrantParty(partyName, 'Add, city, district,');
    await this.signAndIssueOrder();
  }

  /**
   * Rejects a Transfer Application from the Applications tab.
   * Fills rejection form, signs, and issues the rejection order.
   * Converted from: UI Tests/tests/3-TwoCompTwoAdv/8.2-rejectTransferJudge.spec.js
   * @param {string} caseNumber - CMP number to navigate to
   */
  async rejectTransferApplication(caseNumber) {
    await this.navigateToCase(caseNumber);

    // Open Applications tab and click Transfer
    await this.page.getByRole('button', { name: 'Applications' }).click();
    await this.page.getByRole('table').getByText('Transfer').click();

    // Click Reject and fill in the rejection form
    await this.page.getByRole('button', { name: 'Reject' }).click();
    await this.page.locator('input[name="transferSeekedTo"]').click();
    await this.page.locator('input[name="transferSeekedTo"]').fill('test');
    await this.page.getByRole('textbox', { name: 'Type here' }).click();
    await this.page.getByRole('textbox', { name: 'Type here' }).fill('test');
    await this.page.locator('input[name="caseTransferredTo"]').click();
    await this.page.locator('input[name="caseTransferredTo"]').fill('test');

    // Confirm rejection
    await this.page.getByRole('button').filter({ hasText: 'Confirm' }).click();
    await this.page.waitForTimeout(6000);

    // Fill order remarks in the rich-text editor
    await this.page.getByRole('paragraph').click();
    await this.page.locator('.ql-editor').fill('test');
    await this.page.waitForTimeout(1000);

    // Preview, sign, and issue the order
    await this.page.getByRole('button').filter({ hasText: 'Preview PDF' }).click();
    await this.page.getByRole('button', { name: 'Add Signature' }).click();

    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByText('click here').click(),
    ]);

    const projectDownloadPath = path.join(
      resolveFromUiE2E('downloads'),
      await download.suggestedFilename()
    );
    fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
    await download.saveAs(projectDownloadPath);
    console.log(`Rejection order downloaded: ${projectDownloadPath}`);

    await this.page.getByRole('button', { name: 'Upload Order Document with' }).click();
    await this.page.waitForTimeout(2000);
    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

    await this.submitSignatureBtn.click();
    await this.issueOrderBtn.click();
    await this.page.getByText('You have successfully issued').click();
    await this.closeBtn.click();
    await this.page.getByRole('heading', { name: 'Order successfully issued!' }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Judge rejects a Production of Documents application and issues the rejection order.
   * Converted from: UI Tests/tests/6-ResubmitCaseFSO/9-rejectProductionDocApp.spec.js
   * @param {string} caseNumber - CMP number to navigate to
   */
  async rejectProductionOfDocuments(caseNumber) {
    await this.navigateToCase(caseNumber);

    // Open Applications tab and click Production of Documents
    await this.page.getByRole('button', { name: 'Applications' }).click();
    await this.page.getByRole('table').getByText('Production of Documents').click();

    // Reject the application
    await this.page.getByRole('button', { name: 'Reject' }).click();
    await this.page.getByRole('button').filter({ hasText: 'Confirm' }).click();

    // Preview, sign, and issue the rejection order
    await this.page.getByRole('button').filter({ hasText: 'Preview PDF' }).click();
    await this.page.getByRole('button', { name: 'Add Signature' }).click();

    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByText('click here').click(),
    ]);

    const projectDownloadPath = path.join(
      resolveFromUiE2E('downloads'),
      await download.suggestedFilename()
    );
    fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
    await download.saveAs(projectDownloadPath);
    console.log(`Production rejection order downloaded: ${projectDownloadPath}`);

    await this.page.getByRole('button', { name: 'Upload Order Document with' }).click();
    await this.page.waitForTimeout(2000);
    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

    await this.submitSignatureBtn.click();
    await this.issueOrderBtn.click();

    // Dismiss success screen
    const successToast = this.page.getByText('You have successfully issued');
    const hasToast = await successToast.isVisible({ timeout: 5000 }).catch(() => false);
    if (hasToast) {
      await successToast.click();
      await this.closeBtn.click({ force: true }).catch(() => { });
      await this.page.getByRole('heading', { name: 'Order successfully issued!' }).click({ force: true }).catch(() => { });
    } else {
      await this.closeBtn.click({ force: true });
    }

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Generic helper: navigate to a case, open Applications tab, click an
   * application row by type name, then approve or reject it and issue the order.
   *
   * @param {string} caseNumber       - CMP number to navigate to
   * @param {string} applicationType  - Visible text of the application type in the table
   *                                    e.g. 'Production of Documents', 'Others', 'Condonation of delay'
   * @param {'Approve'|'Reject'} action - Button label to click after opening the application
   */
  async reviewApplication(caseNumber, applicationType, action) {
    await this.navigateToCase(caseNumber);

    // Open Applications tab
    await this.page.getByRole('button', { name: 'Applications' }).click();

    // Click the application row — prefer cell locator for precision
    await this.page.getByRole('cell', { name: applicationType }).first().click();

    // Approve or Reject
    await this.page.getByRole('button', { name: action }).click();
    await this.page.getByRole('button').filter({ hasText: 'Confirm' }).click();

    // Sign and issue the order (Preview → Signature → Download → Upload → Submit → Issue)
    await this.page.getByRole('button').filter({ hasText: 'Preview PDF' }).click();
    await this.page.getByRole('button', { name: 'Add Signature' }).click();

    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByText('click here').click(),
    ]);

    const projectDownloadPath = path.join(
      resolveFromUiE2E('downloads'),
      await download.suggestedFilename()
    );
    fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
    await download.saveAs(projectDownloadPath);
    console.log(`[JudgeOrdersPage] Order downloaded: ${projectDownloadPath}`);

    await this.page.getByRole('button', { name: 'Upload Order Document with' }).click();
    await this.page.waitForTimeout(2000);
    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

    await this.submitSignatureBtn.click();
    await this.issueOrderBtn.click();

    // Dismiss success screen (toast or heading or close button)
    const successToast = this.page.getByText('You have successfully issued');
    const hasToast = await successToast.isVisible({ timeout: 5000 }).catch(() => false);
    if (hasToast) {
      await successToast.click();
      await this.closeBtn.click({ force: true }).catch(() => { });
      await this.page.getByRole('heading', { name: 'Order successfully issued!' }).click({ force: true }).catch(() => { });
    } else {
      await this.closeBtn.click({ force: true });
    }

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  /** Judge approves a Production of Documents application. Source: 10-approveProductionDocApp.spec.js */
  async approveProductionOfDocuments(caseNumber) {
    await this.reviewApplication(caseNumber, 'Production of Documents', 'Approve');
  }

  /** Judge approves an Others application. Source: 13-approveOthersApp.spec.js */
  async approveOthersApplication(caseNumber) {
    await this.reviewApplication(caseNumber, 'Others', 'Approve');
  }

  /** Judge rejects a Condonation of Delay application. Source: 16-rejectCondOfDelayApp.spec.js */
  async rejectCondonationOfDelay(caseNumber) {
    await this.reviewApplication(caseNumber, 'Condonation of delay', 'Reject');
  }

  /** Judge approves a Condonation of Delay application. Source: 19-approveCondOfDelayApp.spec.js */
  async approveCondonationOfDelay(caseNumber) {
    await this.reviewApplication(caseNumber, 'Condonation of delay', 'Approve');
  }

  /**
   * Judge issues a Judgement Order (Guilty / Acquitted verdict).
   * Converted from: UI Tests/tests/8-WitnessEvidence/10-judgementOrder.spec.js
   *
   * @param {string} caseNumber        - ST number to navigate to (e.g. 'ST/12/2026')
   * @param {string} finding           - Finding/Holding dropdown value (default 'Acquitted')
   * @param {string} sentenceText      - Sentence / punishment text (default '2 months of jail.')
   * @param {string} judgementRemarks  - Rich-text editor remarks (default 'Judgement order')
   */
  async issueJudgementOrder(caseNumber, finding = 'Acquitted', sentenceText = '2 months of jail.', judgementRemarks = 'Judgement order') {
    console.log('[JudgeOrdersPage] Issuing Judgement Order...');

    await this.navigateToCase(caseNumber);
    await this.openGenerateOrder();

    // Select 'Judgement' order type
    await this.orderTypeDropdownFirst.click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: 'Judgement' }).click();
    await this.page.waitForTimeout(1000);

    // Check 'Guilty' radio button
    await this.page.locator('div').filter({ hasText: /^Guilty$/ }).getByRole('radio').check();

    // Select Finding/Holding value (e.g. 'Acquitted')
    await this.page.locator('div').filter({ hasText: /^Finding\/Holding\*$/ }).locator('path').nth(1).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: finding }).first().click();
    await this.page.waitForTimeout(1000);

    // Select Nature of Disposal (first option)
    await this.page.locator('div').filter({ hasText: /^Nature of Disposal\*$/ }).getByRole('img').click();
    await this.page.locator('#jk-dropdown-unique div').first().click();

    // Fill sentence/punishment text
    await this.page.getByRole('textbox', { name: 'Type here' }).fill(sentenceText);
    await this.page.waitForTimeout(1000);

    // Confirm the order form
    await this.confirmBtn.click();
    await this.page.waitForTimeout(1000);

    // Fill judgement remarks in the rich-text editor
    // Use the specific <p> inside .ql-editor to avoid strict mode violation
    // (multiple <p> elements exist on the page from other sections)
    await this.page.locator('.ql-editor p').first().click();
    await this.page.locator('.ql-editor').fill(judgementRemarks);
    await this.page.waitForTimeout(1000);

    // Preview → Sign → Download → Upload → Issue
    await this.previewPdfBtn.click();
    await this.addSignatureBtn.click();

    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByText('click here').click(),
    ]);

    const downloadPath = path.join(resolveFromUiE2E('downloads'), await download.suggestedFilename());
    fs.mkdirSync(path.dirname(downloadPath), { recursive: true });
    await download.saveAs(downloadPath);
    console.log(`[JudgeOrdersPage] Judgement order downloaded: ${downloadPath}`);

    await this.uploadOrderBtn.click();
    await this.page.waitForTimeout(2000);
    await this.page.locator('input[type="file"]').first().setInputFiles(downloadPath);

    await this.submitSignatureBtn.click();
    await this.issueOrderBtn.click();
    await this.page.getByRole('button', { name: 'Close' }).click();
    await this.page.getByRole('heading', { name: 'Order successfully issued!' }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    console.log('[JudgeOrdersPage] Judgement Order issued successfully.');
  }

  /**
   * Judge issues a "Moving Case to Long Pending" (LPR) order.
   * Navigates via All Cases → stNumber → Take Action → Generate Order →
   * selects "Moving Case to Long Pending" order type → signs and issues.
   * Captures and returns the LP number from the case detail page after issuing.
   *
   * Converted from: UI Tests/tests/9-LPROrders/09-issueLPROrder.spec.js
   *
   * @param {string} stNumber   - The ST case number to navigate to (e.g. 'ST/179/2026')
   * @param {string} remarks    - Remarks to fill in the "Type here" textbox (default 'testing')
   * @returns {Promise<string>} - The captured LP number (e.g. 'LP/6/2026')
   */
  async issueLPROrder(stNumber, remarks = 'testing') {
    console.log('[JudgeOrdersPage] Issuing LPR (Moving Case to Long Pending) order...');

    await this.navigateToCase(stNumber);
    await this.openGenerateOrder();

    // Select "Moving Case to Long Pending" order type via the first dropdown img
    await this.orderTypeDropdownFirst.click();
    await this.page.getByText('Moving Case to Long Pending').click();
    await this.page.waitForTimeout(1000);

    // Fill the remarks textbox
    await this.page.getByRole('textbox', { name: 'Type here' }).click();
    await this.page.getByRole('textbox', { name: 'Type here' }).fill(remarks);

    // Sign and issue the order (Confirm → Preview → Add Signature → Download → Upload → Issue)
    await this.signAndIssueOrder();

    // Capture the LP number from the case summary
    const lpElement = this.page.locator('div.sub-details-text').filter({ hasText: 'LP/' });
    await expect(lpElement.first()).toBeVisible({ timeout: 15000 });
    const lpRaw = (await lpElement.first().textContent()) || '';
    const lpNumber = lpRaw.match(/(LP\/\S+)/)?.[1]?.trim() || lpRaw.trim();
    console.log('[JudgeOrdersPage] Captured LP Number:', lpNumber);
    return lpNumber;
  }

  /**
   * Judge issues a "Moving Case out of Long Pending" order.
   * Navigates via All Cases → lpNumber → Take Action → Generate Order →
   * selects "Moving Case out of Long" order type → signs and issues.
   *
   * Converted from: UI Tests/tests/9-LPROrders/10-movingOutFromLPR.spec.js
   *
   * @param {string} lpNumber - The LP case number to navigate to (e.g. 'LP/6/2026')
   * @param {string} remarks  - Remarks to fill in the "Type here" textbox (default 'testing')
   */
  async moveOutOfLPR(lpNumber, remarks = 'testing') {
    console.log('[JudgeOrdersPage] Issuing "Moving Case out of Long Pending" order...');

    await this.navigateToCase(lpNumber);
    await this.openGenerateOrder();

    // Select "Moving Case out of Long Pending" order type via the second path in the dropdown
    await this.page.locator('div').filter({ hasText: /^EditDelete$/ }).locator('path').nth(1).click();
    await this.page.getByText('Moving Case out of Long').click();
    await this.page.waitForTimeout(1000);

    // Fill the remarks textbox
    await this.page.getByRole('textbox', { name: 'Type here' }).click();
    await this.page.getByRole('textbox', { name: 'Type here' }).fill(remarks);

    // Sign and issue the order
    await this.signAndIssueOrder();

    console.log('[JudgeOrdersPage] Moving out of LPR order issued successfully.');
  }

  /**
   * Judge issues a Miscellaneous Process order using a saved template.
   * Navigates via All Cases → caseNumber → Take Action → Generate Order →
   * selects "Miscellaneous Process" type → picks template → police station →
   * party → address → signs and issues.
   * Converted from: UI Tests/tests/10-miscProcess/06-showCauseNoticeOrder.spec.js
   *
   * @param {string} caseNumber    - CMP number to navigate to
   * @param {string} templateName  - Template name to select (default 'Testing Automation')
   * @param {string} policeStation - Police station to select (default 'ADHUR')
   * @param {string} partyName     - Party name to select from the second dropdown (default 'Rajesh Ch')
   * @param {string} addressLabel  - Checkbox label for the party address (default 'sh, sh, sh, sh, sh,')
   */
  async issueMiscProcessOrder(
    caseNumber,
    templateName = 'Testing Automation',
    policeStation = 'ADHUR',
    partyName = 'Rajesh Ch',
    addressLabel = 'sh, sh, sh, sh, sh,'
  ) {
    console.log('[JudgeOrdersPage] Issuing Miscellaneous Process order...');

    await this.navigateToCase(caseNumber);
    await this.openGenerateOrder();

    // Select "Miscellaneous Process" order type
    await this.orderTypeDropdownFirst.click();
    await this.page.getByText('Miscellaneous Process').click();
    await this.page.waitForTimeout(1000);

    // Select the process template
    await this.page.locator('div').filter({ hasText: /^Select Miscellaneous Process Template\*$/ }).getByRole('img').click();
    await this.page.getByText(templateName).first().click();

    // Select Police Station
    await this.page.locator('.select.false > .cp').click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: policeStation }).click();

    // Select Party
    await this.page.locator('div:nth-child(2) > .select > .cp').click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: partyName }).click();

    // Select Address checkbox
    await this.page.locator('div').filter({ hasText: /^Address$/ }).locator('svg').click();
    await this.page.getByRole('checkbox', { name: addressLabel }).check();

    // Sign and issue the order
    await this.signAndIssueOrder();

    console.log('[JudgeOrdersPage] Miscellaneous Process order issued successfully.');
  }
}

module.exports = { JudgeOrdersPage };




