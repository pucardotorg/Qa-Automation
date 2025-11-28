// e2e/pages/pendingtasks.page.js
class PendingTasksPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.caseTypeFilter = page.getByRole('textbox', { name: /case type/i }).first().or(page.getByPlaceholder('Case Type'));
    this.taskTypeFilter = page.getByRole('textbox', { name: /task type/i }).first().or(page.getByPlaceholder('Task Type'));
    this.sectionHeader = page.getByRole('heading', { name: /all pending tasks/i });
    this.taskItems = page.getByRole('checkbox');
  }

  async isVisible() {
    await this.sectionHeader.waitFor();
  }
}

module.exports = { PendingTasksPage };
