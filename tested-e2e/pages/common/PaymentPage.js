const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class PaymentPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
  }

  async openEmployeeLogin() {
    await this.goto('ui/employee/user/login');
    await this.waitIdle();
  }

  async loginEmployee(username, password) {
    const usernameInput = this.page.locator('input[name="username"]');
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await usernameInput.fill(username);

    const passwordInput = this.page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill(password);

    const continueButton = this.page
      .getByRole('button', { name: 'Continue' })
      .or(this.page.locator('button:has-text("Continue")'));
    await expect(continueButton).toBeVisible({ timeout: 10000 });
    await continueButton.click();
  }

  async collectOfflinePayment(filingNumber) {
    await this.page.getByText('Collect Offline Payments').click();

    const filingInput = this.page.locator('input[name="caseTitleFilingNumber"]');
    await filingInput.click();
    await filingInput.fill(filingNumber);

    await this.page.getByRole('button').filter({ hasText: 'Search' }).click();
    await this.page.waitForTimeout(2000);

    await this.page.getByRole('link', { name: 'Record Payment' }).first().click();

    // Mode of Payment dropdown -> Stamp
    await this.page
      .locator('div')
      .filter({ hasText: /^Mode of Payment$/ })
      .locator('path')
      .nth(1)
      .click();

    await this.page.locator('#jk-dropdown-unique div').filter({ hasText: 'Stamp' }).click();

    await this.page.waitForTimeout(1000);
    await this.page.getByRole('button').click();
    await this.page.waitForTimeout(2000);
  }
}

module.exports = { PaymentPage };
