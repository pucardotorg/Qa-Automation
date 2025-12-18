const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

class CourtStaffPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
    
    this.signProcessLink = page.getByText('Sign Process');
    this.searchInput = page.locator('input[name="searchText"]');
    this.searchBtn = page.getByText('Search').first();
    this.eSignBtn = page.getByRole('button', { name: 'E-Sign' });
    this.uploadOrderBtn = page.getByRole('button', { name: 'Upload Order Document with' });
    this.submitSignatureBtn = page.getByRole('button', { name: 'Submit Signature' });
    this.confirmSignBtn = page.getByRole('button', { name: 'Confirm Sign' });
    this.markAsSentBtn = page.getByRole('button', { name: 'Mark as sent' });
    this.sentTabBtn = page.getByRole('button', { name: 'Sent', exact: true });
    this.updateStatusBtn = page.getByRole('button', { name: 'Update Status' });
  }

  async navigateToSignProcess() {
    await this.signProcessLink.click();
    await this.page.waitForTimeout(1000);
  }

  async searchCase(caseNumber) {
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    await this.searchInput.fill(caseNumber);
    await this.searchBtn.click({ timeout: 2000 });
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
  }

  async openCase() {
    await this.page.getByRole('button', { name: 'vs' }).first().click();
    await this.page.waitForTimeout(3000);
  }

  async eSignDocument() {
    await this.eSignBtn.click();
    await this.page.waitForTimeout(1000);
    
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
    await this.page.waitForTimeout(2000);
    
    return projectDownloadPath;
  }

  async confirmAndMarkAsSent() {
    await this.confirmSignBtn.click();
    await this.page.waitForTimeout(2000);
    await this.markAsSentBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async updateDeliveryStatus(caseNumber) {
    await this.sentTabBtn.click();
    await this.page.waitForTimeout(1000);
    
    await this.searchCase(caseNumber);
    await this.openCase();
    
    await this.page.waitForTimeout(2000);
    await this.page.locator('input.employee-select-wrap--elipses.undefined').nth(1).click();
    await this.page.locator('#jk-dropdown-unique div').first().click();
    await this.page.waitForTimeout(2000);
    await this.updateStatusBtn.click();
    await this.page.waitForTimeout(2000);
  }

  async processESignAndSend(caseNumber) {
    await this.navigateToSignProcess();
    await this.searchCase(caseNumber);
    await this.openCase();
    await this.eSignDocument();
    await this.confirmAndMarkAsSent();
    await this.updateDeliveryStatus(caseNumber);
  }
}

module.exports = { CourtStaffPage };
