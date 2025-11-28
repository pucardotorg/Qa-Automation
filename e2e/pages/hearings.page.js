// e2e/pages/hearings.page.js
class HearingsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.header = page.getByRole('heading', { name: /hearings/i });
    this.table = page.getByRole('table');
    this.rows = this.table.locator('tbody tr');
    this.backBreadcrumb = page.getByRole('link', { name: /home/i });
  }

  async isVisible() {
    // If no heading exists, at least wait for table as fallback
    await this.table.first().waitFor();
  }
}

module.exports = { HearingsPage };
