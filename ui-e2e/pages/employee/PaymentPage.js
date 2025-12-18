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
    this.submitBtn = page.getByRole('button');
  }

  async navigateToCollectPayments() {
    await this.collectOfflinePaymentsLink.click();
    await this.waitIdle();
  }

  async searchCaseByFilingNumber(filingNumber) {
    await this.caseFilingNumberInput.click();
    await this.caseFilingNumberInput.fill(filingNumber);
    await this.searchBtn.click();
    await this.page.waitForTimeout(2000);
  }

  async recordPaymentForCase() {
    await this.recordPaymentLink.first().click();
    await this.waitIdle();
  }

  async selectPaymentMode(mode = 'Stamp') {
    await this.modeOfPaymentDropdown.click();
    if (mode === 'Stamp') {
      await this.stampOption.click();
    }
    await this.page.waitForTimeout(5000);
  }

  async submitPayment() {
    await this.submitBtn.click();
    await this.page.waitForTimeout(5000);
  }

  async collectOfflinePayment(filingNumber) {
    await this.navigateToCollectPayments();
    await this.searchCaseByFilingNumber(filingNumber);
    await this.recordPaymentForCase();
    await this.selectPaymentMode('Stamp');
    await this.submitPayment();
  }
}

module.exports = { PaymentPage };
