// e2e/pages/case.page.js
class CasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.makeFilingBtn = page.getByRole('button', { name: /make filing/i });
    this.statusLabel = page.getByText(/status\s*:/i).first().or(page.getByRole('heading', { name: /status/i }));
  }

  async startMakeFiling() {
    await this.makeFilingBtn.click();
  }

  async getStatusText() {
    const txt = await this.statusLabel.textContent();
    return (txt || '').trim();
  }
}

module.exports = { CasePage };
