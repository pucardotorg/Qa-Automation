class BasePage {
  constructor(page, globals) {
    this.page = page;
    this.globals = globals || {};
  }

  async goto(path = '') {
    const base = this.globals.baseURL || '';
    await this.page.goto(`${base}${path}`);
  }

  async waitIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  async clickContinue() {
    const btn = this.page.getByRole('button').filter({ hasText: 'Continue' });
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.click();
  }

  async upload(inputSelector, filePath) {
    await this.page.locator(inputSelector).setInputFiles(filePath);
  }

  async fillOtpSixOnes(prefixSelector = '') {
    const first = prefixSelector
      ? this.page.locator(`${prefixSelector} .input-otp`).first()
      : this.page.locator('.input-otp').first();
    await first.fill('1');
    await this.page.locator('input:nth-child(2)').fill('2');
    await this.page.locator('input:nth-child(3)').fill('3');
    await this.page.locator('input:nth-child(4)').fill('4');
    await this.page.locator('input:nth-child(5)').fill('5');
    await this.page.locator('input:nth-child(6)').fill('6');
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }
}

module.exports = { BasePage };
