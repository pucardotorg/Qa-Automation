const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');
const { saveGlobalVariables } = require('../../helpers/env');

class RegisterCasePage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
  }

  async goToAllCases() {
    await this.page.getByRole('link', { name: 'All Cases' }).click();
    await this.waitIdle();
  }

  async searchByFilingNumberAndOpen() {
    const caseId = this.globals.filingNumber;
    await this.waitIdle();

    // Search input via robust locator fallback
    const caseNameField = this.page.locator('input[name="caseSearchText"], xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[3]/div/input');
    await expect(caseNameField.first()).toBeVisible({ timeout: 15000 });
    await caseNameField.first().fill(caseId);

    // Search click
    const searchButton = this.page.locator('button:has-text("Search"), xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[4]/button/header');
    await expect(searchButton.first()).toBeVisible({ timeout: 15000 });
    await searchButton.first().click();

    // Open first row/case
    const caseIdCell = this.page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[2]/div/span/table/tbody/tr[1]/td[1], tr >> nth=0');
    await expect(caseIdCell.first()).toBeVisible({ timeout: 15000 });
    const clickableLink = caseIdCell.locator('a,button');
    if ((await clickableLink.count()) > 0) {
      await clickableLink.first().click();
    } else {
      await caseIdCell.first().click();
    }
    await this.waitIdle();
  }

  async registerCaseScheduleAndGenerateOrder() {
    const registerCaseButton = this.page
      .getByRole('button', { name: /Register Case/i })
      .or(this.page.locator('button:has-text("Register Case")'));
    await expect(registerCaseButton).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(500);
    await registerCaseButton.click();

    await this.page.getByRole('button', { name: 'Schedule Hearing' }).click();
    await this.page.getByText('Select Custom Date').click();
    // Pick day 1 in the calendar as in original flow
    await this.page.getByRole('button', { name: '1', exact: true }).first().click();
    await this.page.getByRole('button', { name: 'Confirm' }).click();

    await this.page.getByRole('button').filter({ hasText: 'Generate Order' }).click();

    await this.waitIdle();

    // Fill order content
    const editor = this.page.getByRole('textbox', { name: 'rdw-editor' });
    await editor.first().click();
    await editor.first().fill('AUTOMATION ORDER GENERATED');

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

    await this.page.waitForTimeout(1000);
    await this.page
      .locator('div:nth-child(4) > .popup-module > .header-wrap > .header-end > div > svg')
      .click();
    await this.waitIdle();
  }

  async captureAccessAndCmpNumbers() {
    const accessCodeElement = this.page.locator('div.sub-details-text').filter({ hasText: 'Code:' });
    await expect(accessCodeElement.first()).toBeVisible({ timeout: 30000 });
    const accessCodeText = (await accessCodeElement.first().textContent()) || '';
    const accessCode = accessCodeText.match(/Code\s*:\s*(\d+)/)?.[1] || '';

    const cmpElement = this.page.locator('div.sub-details-text').filter({ hasText: 'CMP/' });
    await expect(cmpElement.first()).toBeVisible({ timeout: 30000 });
    const cmpNumber = (await cmpElement.first().textContent()) || '';

    // Persist for next tests
    saveGlobalVariables({ accessCode, cmpNumber });

    return { accessCode, cmpNumber };
  }
}

module.exports = { RegisterCasePage };
