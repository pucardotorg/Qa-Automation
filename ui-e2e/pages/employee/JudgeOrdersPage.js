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
}

module.exports = { JudgeOrdersPage };
