const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
    this.signInBtn = this.page.getByRole('button');
    this.mobileInput = this.page.getByRole('textbox');
    this.verifyBtn = this.page.getByRole('button', { name: 'Verify' });
  }

  async open() {
    await this.goto('ui/citizen/select-language');
    await this.signInBtn.first().waitFor({ state: 'visible', timeout: 20000 });
  }

  async loginWithMobileOtp(mobileNumber) {
    await this.signInBtn.click();
    await this.mobileInput.fill(mobileNumber);
    await this.signInBtn.click();
    await this.fillOtpSixOnes();
    await this.verifyBtn.click();
    // Wait for the citizen home page / cases list to fully load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }
}

module.exports = { LoginPage };
