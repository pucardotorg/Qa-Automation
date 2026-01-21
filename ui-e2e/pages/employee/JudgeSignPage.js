const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

class JudgeSignPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
    
    this.signProcessLink = page.getByText('Sign Process');
    this.searchInput = page.locator('input[name="searchText"]');
    this.searchBtn = page.getByText('Search').first();
    this.eSignBtn = page.getByRole('button', { name: 'E-Sign' });
    this.proceedToSignBtn = page.getByRole('button', { name: 'Proceed To Sign' });
    this.proceedToSendBtn = page.getByRole('button', { name: 'Proceed to Send' });
    this.uploadOrderBtn = page.getByRole('button', { name: 'Upload Order Document with' });
    this.submitSignatureBtn = page.getByRole('button', { name: 'Submit Signature' });
    this.markAsSentBtn = page.getByRole('button', { name: 'Mark as sent' });
    this.sendBtn = page.getByRole('button', { name: 'Close' });
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
    // Wait for E-Sign button or Proceed To Sign button to be visible
    await Promise.race([
      expect(this.eSignBtn).toBeVisible({ timeout: 30000 }).catch(() => {}),
      expect(this.proceedToSignBtn).toBeVisible({ timeout: 30000 }).catch(() => {})
    ]);
    
    // Check which button is available and click it (Review Document popup)
    if (await this.proceedToSignBtn.isVisible()) {
      console.log('Clicking Proceed To Sign button');
      await this.proceedToSignBtn.click();
    } else if (await this.eSignBtn.isVisible()) {
      console.log('Clicking E-Sign button');
      await this.eSignBtn.click();
    }
    
    await this.page.waitForTimeout(2000);
    
    // Download PDF directly (skip E-Sign button, just download)
    console.log('Waiting for download');
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 30000 }),
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
    
    // Click "Proceed to Send" button after uploading
    await expect(this.proceedToSendBtn).toBeVisible({ timeout: 10000 });
    await this.proceedToSendBtn.click();
    await this.page.waitForTimeout(2000);
    
    return projectDownloadPath;
  }

  async confirmAndSend() {
    // After "Proceed to Send", success popup appears with "Mark as Sent" button
    await expect(this.markAsSentBtn).toBeVisible({ timeout: 10000 });
    await this.markAsSentBtn.click();
    await this.page.waitForTimeout(2000);
  }

  async processESignAndSend(caseNumber) {
    await this.navigateToSignProcess();
    await this.searchCase(caseNumber);
    await this.openCase();
    await this.eSignDocument();
    await this.confirmAndSend();
  }
}

module.exports = { JudgeSignPage };
