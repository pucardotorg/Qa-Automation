const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

class NoticePaymentPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
    
    this.takeStepsNoticeLink = page.getByText('Take Steps - Notice');
    this.nextBtn = page.getByRole('button', { name: 'Next' });
    this.closeBtn = page.locator('.header-end > div > svg');
  }

  async navigateToCase(cmpNumber) {
    // Wait for page to load after login
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    
    // Find and click the case
    const caseCell = this.page.getByRole('cell', { name: cmpNumber });
    await expect(caseCell).toBeVisible({ timeout: 10000 });
    await caseCell.click();
    await this.page.waitForTimeout(1000);
  }

  async selectNoticePayment() {
    await expect(this.takeStepsNoticeLink).toBeVisible({ timeout: 10000 });
    await this.takeStepsNoticeLink.click();
    await this.page.waitForTimeout(10000);
  }

  async selectAddressAndPaymentMethod() {
    await expect(this.nextBtn).toBeVisible({ timeout: 10000 });
    await this.nextBtn.click();
    await this.page.waitForTimeout(1000);
    await this.closeBtn.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async completeNoticePaymentFlow(cmpNumber) {
    await this.navigateToCase(cmpNumber);
    await this.selectNoticePayment();
    await this.selectAddressAndPaymentMethod();
  }
}

module.exports = { NoticePaymentPage };
