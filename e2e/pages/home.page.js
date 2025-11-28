// e2e/pages/home.page.js
class HomePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    // Quick actions
    this.viewHearingsBtn = page.getByRole('button', { name: /view hearings/i });
    this.joinCaseBtn = page.getByRole('button', { name: /join case/i });
    this.fileCaseBtn = page.getByRole('button', { name: /file case/i });

    // Tabs under Your Cases
    this.tabOngoing = page.getByRole('button', { name: /ongoing/i });
    this.tabPendingSub = page.getByRole('button', { name: /pending submission/i });
    this.tabDisposed = page.getByRole('button', { name: /disposed/i });
    this.tabLongPending = page.getByRole('button', { name: /long pending register/i });

    // Search filters
    this.caseTypeInput = page.getByRole('textbox', { exact: false }).nth(0);
    this.stageHeading = page.getByRole('heading', { name: /stage/i }).first();
    this.stageInput = this.stageHeading.locator('xpath=..').locator('input');
    this.caseNameNumberInput = page.getByRole('textbox', { exact: false }).nth(2);
    this.clearSearch = page.getByText(/clear search/i);
    this.searchBtn = page.getByRole('button', { name: /search/i }).first();

    // Table
    this.table = page.getByRole('table');
    this.firstRow = this.table.locator('tbody tr').first();
    // Case Number is the 3rd column (index 2) per header order observed
    this.firstRowCaseIdLink = this.firstRow.locator('td').nth(2).locator('a, [role="link"]').first();
  }

  async goto() {
    await this.page.goto('/ui/citizen/home/home-pending-task');
    await this.page.waitForLoadState('networkidle');
  }

  async openViewHearings() {
    await this.viewHearingsBtn.click();
  }

  async openJoinCase() {
    await this.joinCaseBtn.click();
  }

  async openFileCase() {
    await this.fileCaseBtn.click();
  }

  async openLatestCase() {
    // Backward-compatible: default to clicking a link in first row
    await this.firstRow.locator('a, [role="link"]').first().click();
  }

  async openLatestCaseById() {
    // Explicitly click the Case ID (Case Number column)
    await this.firstRowCaseIdLink.click();
  }

  async filterByStage(stageText) {
    await this.stageInput.fill('');
    await this.stageInput.fill(stageText);
  }

  async searchCases() {
    await this.searchBtn.click();
    await this.table.waitFor();
  }

  async openCognizanceLatestCase() {
    await this.filterByStage('Cognizance');
    await this.searchCases();
    await this.openLatestCaseById();
  }
}

module.exports = { HomePage };
