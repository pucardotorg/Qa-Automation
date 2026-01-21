const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

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
    
    const projectDownloadPath = path.join(process.cwd(), 'ui-e2e', 'downloads', await download.suggestedFilename());
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
    await this.closePopupBtn.click();
    await this.page.waitForLoadState('networkidle');
    
    const accessCodeElement = this.page.locator('div.sub-details-text').filter({ hasText: 'Code:' });
    await expect(accessCodeElement.first()).toBeVisible({ timeout: 30000 });
    const accessCodeText = (await accessCodeElement.first().textContent()) || '';
    const accessCode = accessCodeText.match(/Code\s*:\s*(\d+)/)?.[1] || '';
    
    const cmpElement = this.page.locator('div.sub-details-text').filter({ hasText: 'CMP/' });
    await expect(cmpElement.first()).toBeVisible({ timeout: 30000 });
    const cmpNumber = (await cmpElement.first().textContent()) || '';
    
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
}

module.exports = { JudgePage };
