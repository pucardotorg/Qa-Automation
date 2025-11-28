// e2e/pages/submission.page.js
class SubmissionPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    // Core fields
    this.applicationTypeInput = page.getByRole('textbox').nth(1); // second textbox under Application Type
    this.generateBtn = page.getByRole('button', { name: /generate application/i });

    // Rich text editors and prayer input
    this.reasonEditor = page.getByRole('textbox', { name: /rdw-editor/i }).first();
    this.prayerInput = page.getByRole('textbox', { name: /type here/i }).first();

    // Supporting document widgets
    this.docTypeInput = page.getByRole('textbox').filter({ hasText: '' }).nth(2);
    this.docTitleInput = page.getByRole('textbox').nth(3);
    this.uploadLabel = page.getByText(/upload$/i).first();

    // Review and sign
    this.reviewAddSignatureBtn = page.getByRole('button', { name: /add signature/i });
    this.uploadSignedDocBtn = page.getByRole('button', { name: /upload document with signature/i });
    this.submitSignatureBtn = page.getByRole('button', { name: /submit signature/i });
    this.proceedAfterSignBtn = page.getByRole('button', { name: /proceed/i });
    this.signedLabel = page.getByText(/signed/i).first();

    // Payment
    this.paymentSkipBtn = page.getByRole('button', { name: /skip/i });
    this.paymentMakeBtn = page.getByRole('button', { name: /make payment/i });

    // Success
    this.successBanner = page.getByText(/you have successfully made a submission/i);
    this.submissionId = page.getByText(/submission id/i).locator('xpath=..').locator('p').last();
    this.downloadSubmissionBtn = page.getByRole('button', { name: /download submission/i });
    this.makePaymentBtn = page.getByRole('button', { name: /make payment/i });
  }

  async selectApplicationType(optionText) {
    await this.applicationTypeInput.click();
    await this.page.getByText(optionText, { exact: false }).click();
  }

  async fillReason(text) {
    await this.reasonEditor.fill(text);
  }

  async fillPrayer(text) {
    await this.prayerInput.fill(text);
  }

  async setDocType(labelText) {
    await this.docTypeInput.click();
    await this.page.getByText(labelText, { exact: false }).click();
  }

  async setDocTitle(title) {
    await this.docTitleInput.fill(title);
  }

  async uploadSupportingDoc(filePath) {
    await this.uploadLabel.click();
    // file chooser handled by test using page.on('filechooser') normally; in our runner, we can use setInputFiles on visible input
    const fileInputs = this.page.locator('input[type="file"]');
    const count = await fileInputs.count();
    if (count) {
      await fileInputs.last().setInputFiles(filePath);
    }
  }

  async generateApplication() {
    await this.generateBtn.click();
  }

  async addSignatureByUpload(filePath) {
    await this.reviewAddSignatureBtn.click();
    await this.uploadSignedDocBtn.click();
    const input = this.page.locator('input[type="file"]');
    await input.first().setInputFiles(filePath);
    await this.submitSignatureBtn.click();
  }

  async proceedAfterSignature() {
    await this.proceedAfterSignBtn.click();
  }

  async skipPayment() {
    if (await this.paymentSkipBtn.isVisible().catch(() => false)) {
      await this.paymentSkipBtn.click();
    }
  }

  async expectSuccess() {
    await this.successBanner.waitFor();
  }

  async expectSigned() {
    await this.signedLabel.waitFor();
  }

  async expectSuccessPanel() {
    await this.expectSuccess();
    await this.downloadSubmissionBtn.waitFor();
    await this.makePaymentBtn.waitFor();
  }

  async getSubmissionId() {
    await this.successBanner.waitFor();
    return (await this.submissionId.textContent()).trim();
  }
}

module.exports = { SubmissionPage };
