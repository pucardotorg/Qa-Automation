const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

class FSOPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
  }

  async openEmployeeLogin() {
    await this.goto('ui/employee/user/login');
    await this.waitIdle();
  }

  async loginFSO() {
    const usernameInput = this.page.locator('input[name="username"]');
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await usernameInput.fill(this.globals.fsoUsername);

    const passwordInput = this.page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill(this.globals.fsoPassword);

    const continueButton = this.page
      .getByRole('button', { name: 'Continue' })
      .or(this.page.locator('button:has-text("Continue")'));
    await expect(continueButton).toBeVisible({ timeout: 10000 });
    await continueButton.click();

    await this.waitIdle();
    await this.page.waitForTimeout(2000);
  }

  async openScrutiniseCases() {
    await this.page.getByText('Scrutinise Cases').click();
    await this.waitIdle();
  }

  async searchFilingAndOpen() {
    const filing = this.globals.filingNumber;
    const search = this.page.locator('input[name="caseSearchText"]');
    await search.click();
    await search.fill(filing);
    await this.page.getByRole('button').filter({ hasText: 'Search' }).click();
    await this.page.getByText('vs').first().click();
    await this.waitIdle();
  }

  async forwardToJudgeWithComment(comment = 'FSO comments') {
    const forwardButton = this.page
      .getByRole('button', { name: /Forward to Judge/i })
      .or(this.page.locator('button:has-text("Forward to Judge")'));
    await expect(forwardButton).toBeVisible({ timeout: 10000 });
    await forwardButton.click();

    const commentInput = this.page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div[2]/div/div/div[4]/div/div[2]/div[1]/textarea');
    await expect(commentInput).toBeVisible({ timeout: 10000 });
    await commentInput.fill(comment);
    await this.page.waitForTimeout(500);

    const confirmButton = this.page
      .getByRole('button', { name: /Confirm/i })
      .or(this.page.locator('button:has-text("Confirm")'));
    await expect(confirmButton).toBeVisible({ timeout: 10000 });
    await confirmButton.click();

    await this.page.waitForTimeout(1000);
  }
}

module.exports = { FSOPage };
