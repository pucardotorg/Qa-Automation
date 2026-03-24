const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

class JudgeSignPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);

    this.signProcessLink = page.getByText('Sign Process');
    this.searchInput = page.locator('input[name="searchText"]');
    this.searchBtn = page.getByText('Search').first();
    this.eSignBtn = page.getByRole('button', { name: 'E-Sign' });
    this.proceedToSignBtn = page.getByRole('button', { name: 'Proceed To Sign' });
    this.proceedToSendBtn = page.getByRole('button', { name: 'Send', exact: true });
    this.uploadOrderBtn = page.getByRole('button', { name: 'Upload Order Document with' });
    this.submitSignatureBtn = page.getByRole('button', { name: 'Submit Signature' });
    this.markAsSentBtn = page.getByRole('button', { name: 'Mark as sent' });
    this.sendBtn = page.getByRole('button', { name: 'Close' });
  }

  async navigateToSignProcess() {
    await this.signProcessLink.click();
    await this.page.waitForTimeout(1000);

    // Explicitly click "Pending Sign" tab as per new UI changes
    const pendingSignTab = this.page.getByRole('button', { name: 'Pending Sign', exact: true });
    if (await pendingSignTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pendingSignTab.click();
      await this.page.waitForTimeout(1000);
    }
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
      expect(this.eSignBtn).toBeVisible({ timeout: 30000 }).catch(() => { }),
      expect(this.proceedToSignBtn).toBeVisible({ timeout: 30000 }).catch(() => { })
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

    const projectDownloadPath = path.join(resolveFromUiE2E('downloads'), await download.suggestedFilename());
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
    // After "Send", success popup appears. It may have "Mark as sent" or "Close".
    await Promise.race([
      this.markAsSentBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => { }),
      this.sendBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => { })
    ]);

    if (await this.markAsSentBtn.isVisible()) {
      await this.markAsSentBtn.click();
    } else if (await this.sendBtn.isVisible()) {
      await this.sendBtn.click();
    }
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
