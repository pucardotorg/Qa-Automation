const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

class SummonsPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
  }

  async goToAllCases() {
    await this.page.getByRole('link', { name: 'All Cases' }).click();
    await this.waitIdle();
  }

  async openByStNumber() {
    const st = this.globals.stNumber;
    await this.waitIdle();
    await this.page.getByRole('cell', { name: st }).click({ timeout: 5000 });
    await this.page.waitForTimeout(500);
  }

  async generateSummons() {
    await this.page.getByRole('button', { name: 'Take Action' }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByText('Generate Order').click();
    await this.page.waitForTimeout(500);

    // Choose order type: Summons
    await this.page.locator('div').filter({ hasText: /^EditDelete$/ }).getByRole('img').first().click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: 'Summons' }).click();

    // Select party (accused)
    await this.page.locator('form path').nth(4).click();
    const accusedName = `${this.globals.respondentFirstName} (Accused)`;
    await this.page.getByText(accusedName).click();

    // Select service method (use the 3rd checkbox as in original flow)
    const serviceCheckbox = this.page.getByRole('checkbox', { name: /Add, city, district,/ }).nth(2);
    if (await serviceCheckbox.count()) {
      await serviceCheckbox.check();
    }

    // Select Police Station
    await this.page.locator('form').filter({ hasText: 'Order Type*Date for Hearing*' }).getByRole('img').nth(3).click();
    await this.page.getByText(this.globals.policeStation).click();

    await this.page.getByRole('button').filter({ hasText: 'Confirm' }).click();

    // Preview, sign, download
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
}

module.exports = { SummonsPage };
