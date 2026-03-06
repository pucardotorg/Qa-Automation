const path = require('path');
const fs = require('fs');
const { BasePage } = require('../common/BasePage');

class ProclamationPage extends BasePage {
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

  async generateProclamation() {
    await this.page.getByRole('button', { name: 'Take Action' }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByText('Generate Order').click();
    await this.page.waitForTimeout(500);

    await this.page.locator('div').filter({ hasText: /^EditDelete$/ }).getByRole('img').first().click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: 'Proclamation' }).click();

    // Proclamation for Party -> Accused
    await this.page.locator('div').filter({ hasText: /^Proclamation for Party\*\+ Add new witness$/ }).getByRole('img').click();
    await this.page.locator('#jk-dropdown-unique div').click();
    const accusedName = `${this.globals.respondentFirstName} (Accused)`;
    await this.page.getByText(accusedName).click();

    // Delivery / address checkbox
    await this.page.getByRole('checkbox', { name: 'Add, city, district,' }).check();

    // Police station
    await this.page.locator('form').getByRole('img').nth(3).click();
    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: this.globals.policeStation }).click();

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

module.exports = { ProclamationPage };
