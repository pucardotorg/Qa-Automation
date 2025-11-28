// e2e/pages/joincase.page.js
class JoinCasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    // Generic inputs; adjust selectors once stable labels are known
    this.codeInput = page.getByRole('textbox').first();
    this.joinBtn = page.getByRole('button', { name: /join/i });
    this.cancelBtn = page.getByRole('button', { name: /cancel/i });
  }

  async isVisible() {
    await this.joinBtn.waitFor();
  }
}

module.exports = { JoinCasePage };
