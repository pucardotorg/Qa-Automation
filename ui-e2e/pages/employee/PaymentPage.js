const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

class PaymentPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);

    this.collectOfflinePaymentsLink = page.getByText('Collect Offline Payments');
    this.caseFilingNumberInput = page.locator('input[name="caseTitleFilingNumber"]');
    this.searchBtn = page.getByRole('button').filter({ hasText: 'Search' });
    this.recordPaymentLink = page.getByRole('link', { name: 'Record Payment' });
    this.modeOfPaymentDropdown = page.locator('div').filter({ hasText: /^Mode of Payment$/ }).locator('path').nth(1);
    this.stampOption = page.locator('#jk-dropdown-unique div').filter({ hasText: 'Stamp' });
    this.cashOption = page.locator('#jk-dropdown-unique div').filter({ hasText: 'Cash' });
    // Use ID selector to target the specific submit button, not all buttons
    this.submitBtn = page.locator('#dristi-pending-payment-inbox-pending-payment-details-generate-receipt');
  }

  async navigateToCollectPayments() {
    await this.collectOfflinePaymentsLink.click();
    await this.waitIdle();
  }

  async searchCaseByFilingNumber(filingNumber) {
    await this.caseFilingNumberInput.click();
    await this.caseFilingNumberInput.clear().catch(() => {});
    await this.caseFilingNumberInput.fill(filingNumber);
    await this.searchBtn.click();
    await this.page.waitForTimeout(2000);// Wait for results to fully load before checking
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(2000);
  }

  async recordPaymentForCase() {
    await this.recordPaymentLink.first().waitFor({ state: 'visible', timeout: 30000 });
    await this.recordPaymentLink.first().click();
    await this.waitIdle();
  }

  async selectPaymentMode(mode = 'Cash') {
    await this.modeOfPaymentDropdown.click();
    if (mode === 'Stamp') {
      await this.stampOption.click();
    } else if (mode === 'Cash') {
      await this.cashOption.click();
    }
    await this.page.waitForTimeout(5000);
  }

  async submitPayment() {
    await this.submitBtn.click();
    await this.page.waitForTimeout(5000);
  }

  async collectOfflinePayment(filingNumber) {
    await this.navigateToCollectPayments();

    // Payment demands may take time to appear after case actions (join, notice, etc.)
    // Retry the search up to 10 times with 15s gaps before giving up
    let found = false;
    for (let attempt = 1; attempt <= 10; attempt++) {
      await this.searchCaseByFilingNumber(filingNumber);
      found = await this.recordPaymentLink.first().isVisible({ timeout: 8000 }).catch(() => false);
      if (found) break;
      console.log(`[PaymentPage] Record Payment not visible yet (attempt ${attempt}/10), retrying in 15s...`);
      await this.page.waitForTimeout(15000);
    }

    await this.recordPaymentForCase();
    await this.selectPaymentMode('Cash');
    await this.submitPayment();
  }
}

module.exports = { PaymentPage };
