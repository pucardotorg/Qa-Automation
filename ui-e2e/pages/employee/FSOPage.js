const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

class FSOPage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
    
    this.scrutiniseCasesLink = page.getByText('Scrutinise Cases');
    this.caseSearchInput = page.locator('input[name="caseSearchText"]');
    this.searchBtn = page.getByRole('button').filter({ hasText: 'Search' });
    this.forwardToJudgeBtn = page.getByRole('button', { name: /Forward to Judge/i }).or(
      page.locator('button:has-text("Forward to Judge")')
    );
    this.commentInput = page.locator('xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div[2]/div/div/div[4]/div/div[2]/div[1]/textarea');
    this.confirmBtn = page.getByRole('button', { name: /Confirm/i }).or(
      page.locator('button:has-text("Confirm")')
    );
  }

  async navigateToScrutiniseCases() {
    await this.scrutiniseCasesLink.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async searchCase(filingNumber) {
    await this.caseSearchInput.click();
    await this.caseSearchInput.fill(filingNumber);
    await this.searchBtn.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async openCase() {
    await this.page.getByText('vs').first().click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async forwardToJudge(comments = 'FSO comments') {
    await expect(this.forwardToJudgeBtn).toBeVisible({ timeout: 10000 });
    await this.forwardToJudgeBtn.click();
    
    await expect(this.commentInput).toBeVisible({ timeout: 10000 });
    await this.commentInput.fill(comments);
    await this.page.waitForTimeout(2000);
    
    await expect(this.confirmBtn).toBeVisible({ timeout: 10000 });
    await this.confirmBtn.click();
    await this.page.waitForTimeout(2000);
  }

  async scrutinizeAndForward(filingNumber, comments = 'FSO comments') {
    await this.navigateToScrutiniseCases();
    await this.searchCase(filingNumber);
    await this.openCase();
    await this.forwardToJudge(comments);
  }
}

module.exports = { FSOPage };
