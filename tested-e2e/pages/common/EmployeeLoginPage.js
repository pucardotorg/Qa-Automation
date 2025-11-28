const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class EmployeeLoginPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
  }

  async openLogin() {
    await this.goto('ui/employee/user/login');
    await this.waitIdle();
  }

  async login(username, password) {
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

    await this.waitIdle();
  }
}

module.exports = { EmployeeLoginPage };
