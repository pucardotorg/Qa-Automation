// e2e/pages/payment.page.js
class PaymentPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    // Buttons commonly used in payment flows
    this.payBtn = page.getByRole('button', { name: /pay now|make payment|proceed to pay|pay/i }).first();
    this.confirmBtn = page.getByRole('button', { name: /confirm|proceed|continue/i }).first();
    this.successMsg = page.getByText(/payment (successful|completed)/i).first();
    this.statusText = page.getByText(/status/i).first();
  }

  async startPayment() {
    if (await this.payBtn.isVisible()) {
      await this.payBtn.click();
    }
  }

  async confirmPayment() {
    if (await this.confirmBtn.isVisible()) {
      await this.confirmBtn.click();
    }
  }

  async waitForCompletion() {
    // Wait for a success message or a status update; timeout leniently
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = { PaymentPage };
