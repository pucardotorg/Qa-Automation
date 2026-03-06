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

  /**
   * FSO marks a defect on the case and sends it back to the litigant for correction.
   * Converted from: UI Tests/tests/6-ResubmitCaseFSO/2.1-returnCaseFromFso.spec.js
   * @param {string} filingNumber  - Filing number to search for
   * @param {string} defectComment - Comment to add to the defect field (default: 'DEFECT1')
   */
  async returnCaseToLitigant(filingNumber, defectComment = 'DEFECT1') {
    await this.navigateToScrutiniseCases();
    await this.searchCase(filingNumber);

    // Open the case from search results
    await this.page.getByText('vs').first().click();
    await this.page.waitForLoadState('networkidle');
    // Allow extra time for the accordion sections to fully render
    await this.page.waitForTimeout(18000);

    // Click the flag icon on the 7th accordion item (defect marker)
    await this.page
      .locator(
        'div:nth-child(3) > .field > .accordion-wrapper > .accordion-item > .accordion-content > div > .item-body > div:nth-child(7) > .text > .flag > svg'
      )
      .click();

    // Fill the defect comment
    await this.page.getByRole('textbox').click();
    await this.page.getByRole('textbox').fill(defectComment);
    console.log(`[FSOPage] Marking defect: "${defectComment}"`);
    await this.page.waitForTimeout(3000);

    // Mark Defect
    await this.page.getByRole('button', { name: 'Mark Defect' }).click();
    await this.page.waitForTimeout(3000);

    // Send Back for Correction
    await this.page.getByRole('button', { name: 'Send Back for Correction' }).click();
    await this.page.waitForTimeout(3000);

    // Confirm the action
    await this.page.getByRole('button', { name: 'Confirm' }).click();
    await this.page.waitForTimeout(2000);
    console.log('[FSOPage] Case sent back for correction.');
  }
}

module.exports = { FSOPage };
