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
    // Ensure the initial screen is interactive
    await this.signInBtn.first().waitFor({ state: 'visible', timeout: 20000 });
  }

  async loginWithMobileOtp(mobileNumber) {
    await this.signInBtn.click();
    await this.mobileInput.fill(mobileNumber);
    await this.signInBtn.click();
    await this.fillOtpSixOnes();
    await this.verifyBtn.click();
  }
}

module.exports = { LoginPage };
