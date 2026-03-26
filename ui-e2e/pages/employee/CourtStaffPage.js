const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

class CourtStaffPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);

    this.signProcessLink = page.getByText('Sign Process');
    this.searchInput = page.locator('input[name="searchText"]');
    this.searchBtn = page.getByText('Search').first();
    this.eSignBtn = page.getByRole('button', { name: 'E-Sign' });
    this.proceedToSignBtn = page.getByRole('button', { name: 'Proceed To Sign' });
    this.sendForSignBtn = page.getByRole('button', { name: 'Send for Sign' });
    this.proceedToSendBtn = page.getByRole('button', { name: 'Proceed to Send' });
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

  async confirmAndMarkAsSent() {
    // After "Proceed to Send", success popup appears with "Mark as Sent" button
    await expect(this.markAsSentBtn).toBeVisible({ timeout: 10000 });
    await this.markAsSentBtn.click();
    await this.page.waitForTimeout(2000);
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
    // Ensure page is fully settled before the next test starts
    await this.page.waitForLoadState('networkidle').catch(() => { });
  }

  async processESignAndSend(caseNumber) {
    await this.navigateToSignProcess();
    await this.searchCase(caseNumber);
    await this.openCase();
    await this.eSignDocument();
    await this.confirmAndMarkAsSent();
    await this.updateDeliveryStatus(caseNumber);
  }

  /**
   * Court staff creates a Miscellaneous Process template under Templates/Configuration.
   * Converted from: UI Tests/tests/10-miscProcess/05-templates.spec.js
   *
   * @param {string} templateName   - Title of the new template (default 'Testing Automation')
   * @param {string} addressee      - Addressee option to select (default 'Police')
   * @param {string} orderText      - Rich-text content for the order editor (default 'order text')
   * @param {string} processText    - Rich-text content for the process editor (default 'process text')
   * @param {string} coverLetterText - Cover letter content (default 'cover letter text')
   */
  async createMiscProcessTemplate(
    templateName = 'Testing Automation',
    addressee = 'Police',
    orderText = 'order text',
    processText = 'process text',
    coverLetterText = 'cover letter text'
  ) {
    console.log('[CourtStaffPage] Creating Miscellaneous Process template...');

    await this.page.getByText('Templates/Configuration').click();
    await this.page.getByRole('button').filter({ hasText: 'Add New Template' }).click();

    await this.page.locator('input[name="processTitle"]').click();
    await this.page.locator('input[name="processTitle"]').fill(templateName);

    // Select Addressee
    await this.page.locator('div').filter({ hasText: /^Select Addressee\*$/ }).getByRole('img').click();
    await this.page.getByText(addressee, { exact: true }).click();

    // Fill order text and process text editors
    await this.page.locator('.ql-editor').first().fill(orderText);
    await this.page.getByRole('paragraph').filter({ hasText: /^$/ }).click();
    await this.page.locator('.ql-editor.ql-blank').fill(processText);

    // Advance to cover letter step
    await this.page.getByRole('button').filter({ hasText: 'Next' }).click();
    await this.page.getByRole('paragraph').filter({ hasText: /^$/ }).click();
    await this.page.locator('.ql-editor').fill(coverLetterText);

    // Save and preview, then final save
    await this.page.getByRole('button').filter({ hasText: 'Save & Preview' }).click();
    await this.page.getByRole('button', { name: 'Save' }).click();

    await this.page.waitForLoadState('networkidle');
    console.log('[CourtStaffPage] Miscellaneous Process template created successfully.');
  }

  /**
   * Court staff (or judge) signs a Miscellaneous Process via the Pending Sign queue,
   * then updates the delivery status from the Sent tab.
   * Converted from: UI Tests/tests/10-miscProcess/07-courtStaff.spec.js
   *
   * @param {string} caseNumber - CMP number to search for in the sign queue
   */
  async signMiscProcess(caseNumber) {
    console.log('[CourtStaffPage] Signing Miscellaneous Process...');

    // Navigate to Sign Process → Pending Sign tab
    await this.signProcessLink.click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('button', { name: 'Pending Sign' }).click();
    await this.page.waitForTimeout(1000);

    // Search for the case
    await this.searchCase(caseNumber);

    // Open the case
    await this.openCase();

    // Proceed To Sign → download
    await this.proceedToSignBtn.click();
    await this.page.waitForTimeout(1000);

    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByText('click here').click(),
    ]);

    const projectDownloadPath = path.join(resolveFromUiE2E('downloads'), await download.suggestedFilename());
    fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
    await download.saveAs(projectDownloadPath);
    console.log(`[CourtStaffPage] Misc process doc downloaded: ${projectDownloadPath}`);

    // Upload signed doc
    await this.uploadOrderBtn.click();
    await this.page.waitForTimeout(2000);
    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

    await this.submitSignatureBtn.click();
    await this.page.waitForTimeout(2000);

    // Proceed to Send → Mark as sent
    await this.proceedToSendBtn.click();
    await this.page.waitForTimeout(2000);
    await this.markAsSentBtn.click();

    // Update delivery status from Sent tab
    await this.updateDeliveryStatus(caseNumber);

    console.log('[CourtStaffPage] Miscellaneous Process signed and sent successfully.');
  }
}

module.exports = { CourtStaffPage };

