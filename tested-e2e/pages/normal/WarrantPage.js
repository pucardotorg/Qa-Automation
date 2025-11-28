const path = require('path');
const fs = require('fs');
const { BasePage } = require('../common/BasePage');

class WarrantPage extends BasePage {
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

  async generateWarrant() {
    await this.page.getByRole('button', { name: 'Take Action' }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByText('Generate Order').click();
    await this.page.waitForTimeout(500);

    await this.page.locator('div').filter({ hasText: /^EditDelete$/ }).getByRole('img').first().click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: 'Warrant' }).click();

    // Party selection
    await this.page.locator('div').filter({ hasText: /^Warrant for Party\*\+ Add new witness$/ }).getByRole('img').click();
    await this.page.getByText(`${this.globals.respondentFirstName} (Accused)`).click();

    // Address checkbox
    await this.page.getByRole('checkbox', { name: 'Add, city, district,' }).check();

    // Warrant type and subtype
    await this.page.locator('div').filter({ hasText: /^Warrant Type\*$/ }).getByRole('img').click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: 'Witness' }).click();
    await this.page.locator('#warrantSubType svg').click();
    await this.page.getByRole('option', { name: 'Other' }).click();
    await this.page.getByRole('textbox', { name: 'Type here' }).fill('test');

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

    const closeBtn = this.page.getByRole('button', { name: 'Close' });
    if (await closeBtn.count()) {
      await closeBtn.click();
    }
    await this.waitIdle();
  }
}

module.exports = { WarrantPage };
