const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

class CourtStaffPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
  }

  async openSignProcess() {
    await this.page.getByText('Sign Process').click();
    await this.waitIdle();
  }

  async searchByCmpNumber(cmpNumber) {
    const searchInput = this.page.locator('input[name="searchText"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill(cmpNumber);
    await this.page.getByText('Search').first().click({ timeout: 2000 });
    await this.waitIdle();
    await this.page.waitForTimeout(1000);
  }

  async openFirstVs() {
    await this.page.getByRole('button', { name: 'vs' }).first().click();
    await this.page.waitForTimeout(1000);
  }

  async eSignDownloadUpload() {
    await this.page.getByRole('button', { name: 'E-Sign' }).click();
    await this.page.waitForTimeout(500);

    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.click('text=click here'),
    ]);
    const projectDownloadPath = path.join(process.cwd(), 'tested-e2e', 'downloads', await download.suggestedFilename());
    fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
    await download.saveAs(projectDownloadPath);

    await this.page.getByRole('button', { name: 'Upload Order Document with' }).click();
    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

    await this.page.getByRole('button', { name: 'Submit Signature' }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: 'Confirm Sign' }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: 'Mark as sent' }).click();
  }

  async verifyInSentAndUpdateStatus(cmpNumber) {
    await this.page.getByRole('button', { name: 'Sent', exact: true }).click();
    await this.page.waitForTimeout(500);
    const searchInput = this.page.locator('input[name="searchText"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill(cmpNumber);
    await this.page.getByText('Search').first().click({ timeout: 2000 });
    await this.waitIdle();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('button', { name: 'vs' }).first().click();

    await this.page.waitForTimeout(500);
    await this.page.locator('input.employee-select-wrap--elipses.undefined').nth(1).click();
    await this.page.locator('#jk-dropdown-unique div').first().click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: 'Update Status' }).click();
    await this.page.waitForTimeout(1000);
  }
}

module.exports = { CourtStaffPage };
