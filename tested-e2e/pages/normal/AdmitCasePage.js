const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');
const { saveGlobalVariables } = require('../../helpers/env');

class AdmitCasePage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
  }

  async goToAllCases() {
    await this.page.getByRole('link', { name: 'All Cases' }).click();
    await this.waitIdle();
  }

  async openByCmpNumber() {
    const cmp = this.globals.cmpNumber;
    await this.waitIdle();
    await this.page.getByRole('cell', { name: cmp }).click();
    await this.page.waitForTimeout(500);
  }

  async generateAdmitOrder() {
    await this.page.getByRole('button', { name: 'Take Action' }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByText('Generate Order').click();
    await this.page.waitForTimeout(500);

    await this.page.locator('div').filter({ hasText: /^EditDelete$/ }).getByRole('img').first().click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: 'Order for Taking Cognizance' }).click();
    await this.page.getByRole('button').filter({ hasText: 'Confirm' }).click();

    await this.page.getByRole('button').filter({ hasText: 'Preview PDF' }).click();
    await this.page.getByRole('button', { name: 'Add Signature' }).click();

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
    await this.page.getByRole('button', { name: 'Issue Order' }).click();

    // Close success modal if present
    const closeBtn = this.page.getByRole('button', { name: 'Close' });
    if (await closeBtn.count()) {
      await closeBtn.click();
    }
    await this.waitIdle();
  }

  async captureSTNumber() {
    const stEl = await this.page.locator('div.sub-details-text').filter({ hasText: 'ST/' });
    const stNumber = (await stEl.textContent()) || '';
    saveGlobalVariables({ stNumber });
    return stNumber;
  }
}

module.exports = { AdmitCasePage };
