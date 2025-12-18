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
    this.uploadOrderBtn = page.getByRole('button', { name: 'Upload Order Document with' });
    this.submitSignatureBtn = page.getByRole('button', { name: 'Submit Signature' });
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

  async confirmAndSend() {
    // Wait longer for the page to process the signature
    await this.page.waitForTimeout(3000);
    await this.page.waitForLoadState('networkidle');
    
    // Try to find confirm button with multiple strategies
    let confirmBtn = this.page.getByRole('button', { name: /Confirm Sign|Confirm/i });
    
    // If not found, try looking for any button containing 'confirm' (case insensitive)
    const isVisible = await confirmBtn.isVisible().catch(() => false);
    if (!isVisible) {
      confirmBtn = this.page.locator('button:has-text("Send")').first();
    }
    
    await expect(confirmBtn).toBeVisible({ timeout: 15000 });
    await confirmBtn.click();
    
    await this.page.waitForTimeout(10000);
    await this.page.waitForLoadState('networkidle');
    
    // For Judge, use 'Close' button
    await expect(this.sendBtn).toBeVisible({ timeout: 15000 });
    await this.sendBtn.click();
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
