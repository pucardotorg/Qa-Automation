// e2e/pages/signing.page.js
class SigningPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.downloadBtn = page.getByRole('button', { name: /download/i }).first().or(page.getByText(/download/i));
    this.uploadInput = page.locator('input[type="file"]');
    this.continueBtn = page.getByRole('button', { name: /continue|submit|proceed/i }).first();
  }

  async downloadRequiredDocument() {
    // Best-effort download; if it opens new tab or triggers file save, we just click it.
    if (await this.downloadBtn.isVisible()) {
      await this.downloadBtn.click();
    }
  }

  async uploadSignedDocument(filePath) {
    await this.uploadInput.setInputFiles(filePath);
  }

  async proceed() {
    if (await this.continueBtn.isVisible()) {
      await this.continueBtn.click();
    }
  }
}

module.exports = { SigningPage };
