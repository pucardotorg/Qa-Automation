const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

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
    await this.page.getByRole('cell', { name: caseNumber }).click();
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
    await this.page.getByText(partyName).click();
  }

  async selectSummonParty(partyName) {
    await this.page.locator('form path').nth(4).click();
    await this.page.getByText(partyName).click();
  }

  async selectProclamationParty(partyName, partyAddress, policeStation = 'MEDICAL COLLEGE PS') {
    // Click on party dropdown
    await this.page.locator('div').filter({ hasText: /^Proclamation for Party\*\+ Add new witness$/ }).getByRole('img').click();
    await this.page.getByText(partyName).click();
    
    // Check the address checkbox
    await this.page.getByRole('checkbox', { name: partyAddress }).check();
    
    // Select police station
    await this.page.locator('form').getByRole('img').nth(3).click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: policeStation }).click();
  }

  async selectAttachmentParty(partyName, partyAddress, policeStation = 'MEDICAL COLLEGE PS', daysForAnswering = 'test', districtName = 'test', villageName = 'test') {
    // Click on party dropdown
    await this.page.locator('div').filter({ hasText: /^Attachment for Party\*\+ Add new witness$/ }).getByRole('img').click();
    await this.page.getByText(partyName).click();
    
    // Check the address checkbox
    await this.page.getByRole('checkbox', { name: partyAddress }).check();
    
    // Select police station
    await this.page.locator('.select-wrap.police-station-dropdown > .select > .cp > path:nth-child(2)').click();
    await this.page.getByText(policeStation).click();
    
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

  async selectWarrantParty(partyName, partyAddress, warrantType = 'Witness', warrantSubType = '138', bailableOption = 1) {
    // Click on party dropdown
    await this.page.locator('div').filter({ hasText: /^Warrant for Party\*\+ Add new witness$/ }).getByRole('img').click();
    await this.page.getByText(partyName).click();
    
    // Check the address checkbox
    await this.page.getByRole('checkbox', { name: partyAddress }).check();
    
    // Select Warrant Type
    await this.page.locator('div').filter({ hasText: /^Warrant Type\*$/ }).getByRole('img').click();
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
    
    const projectDownloadPath = path.join(process.cwd(), 'ui-e2e', 'downloads', await download.suggestedFilename());
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
    
    // Capture ST Number
    const stElement = this.page.locator('div.sub-details-text').filter({ hasText: 'ST/' });
    const stNumber = await stElement.textContent();
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
}

module.exports = { JudgeOrdersPage };
