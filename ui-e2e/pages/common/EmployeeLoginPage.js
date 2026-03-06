const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class EmployeeLoginPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);

    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.continueBtn = page.getByRole('button', { name: 'Continue' }).or(
      page.locator('button:has-text("Continue")')
    );
  }

  async open() {
    await this.goto('ui/employee/user/login');
    await this.page.waitForLoadState('networkidle');
  }

  async loginAsEmployee(username, password) {
    await expect(this.usernameInput).toBeVisible({ timeout: 15000 });
    await this.usernameInput.fill(username);

    await expect(this.passwordInput).toBeVisible({ timeout: 15000 });
    await this.passwordInput.fill(password);

    // Wait for Continue to be visible and enabled.
    // Use force:true to bypass Playwright's stability check — the button is
    // continually re-rendered by React between tests, so waitForStable never
    // resolves. force:true dispatches the click immediately without waiting.
    await expect(this.continueBtn).toBeVisible({ timeout: 15000 });
    await expect(this.continueBtn).toBeEnabled({ timeout: 15000 });
    await this.continueBtn.click({ force: true });

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async loginAsFSO() {
    await this.loginAsEmployee(this.globals.fsoUsername, this.globals.fsoPassword);
  }

  async loginAsJudge() {
    await this.loginAsEmployee(this.globals.judgeUsername, this.globals.judgePassword);
  }

  async loginAsNayaMitra() {
    await this.loginAsEmployee(this.globals.nayamitraUsername, this.globals.nayamitraPassword);
  }
}

module.exports = { EmployeeLoginPage };
