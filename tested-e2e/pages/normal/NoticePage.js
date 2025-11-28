const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

class NoticePage extends BasePage {
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
    // Click on the row/cell matching CMP number
    await this.page.getByRole('cell', { name: cmp }).click();
    await this.page.waitForTimeout(1000);
  }

  async generateNoticeOrder() {
    await this.page.getByRole('button', { name: 'Take Action' }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByText('Generate Order').click();
    await this.page.waitForTimeout(500);

    // Select document type -> Notice
    await this.page.locator('div').filter({ hasText: /^EditDelete$/ }).locator('div').nth(1).click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: 'Notice' }).click();

    // Select Notice Type
    await this.page.locator('div').filter({ hasText: /^Notice Type\*$/ }).getByRole('textbox').click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: 'Section 223 Notice' }).click();

    // Notice to the Party
    await this.page.locator('div').filter({ hasText: /^Notice to the Party\*$/ }).getByRole('textbox').click();
    const accusedName = `${this.globals.respondentFirstName} (Accused)`;
    await this.page.getByText(accusedName).click();

    // Delivery method: e-Post (use explicit id to avoid strict mode violations)
    const ePostCheckbox = this.page.locator('#e-Post-0');
    if (await ePostCheckbox.count()) {
      await ePostCheckbox.check();
    }

    await this.page.getByRole('button').filter({ hasText: 'Confirm' }).click();
    await this.page.waitForTimeout(1000);

    // Fill order content
    await this.page.getByRole('textbox', { name: 'rdw-editor' }).fill('AUTOMATION ORDER GENERATED');

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

    // Confirm success modal and close
    await this.page.getByText('You have successfully issued').waitFor({ timeout: 30000 });
    await this.page.getByRole('button', { name: 'Close' }).click();
    await this.waitIdle();
  }
}

module.exports = { NoticePage };
