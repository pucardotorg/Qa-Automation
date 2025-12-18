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
    await expect(this.usernameInput).toBeVisible({ timeout: 10000 });
    await this.usernameInput.fill(username);
    
    await expect(this.passwordInput).toBeVisible({ timeout: 10000 });
    await this.passwordInput.fill(password);
    
    await expect(this.continueBtn).toBeVisible({ timeout: 10000 });
    await this.continueBtn.click();
    
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
