// e2e/tests/pending-tasks.spec.js
const { test, expect } = require('@playwright/test');
const { loginCitizen } = require('../../e2e/helpers/auth');
const { PendingTasksPage } = require('../../e2e/pages/pendingtasks.page');

test.describe('@pending Pending tasks workflow', () => {
  test('User sees All Pending tasks section and task items', async ({ page }) => {
    await loginCitizen(page);

    const pending = new PendingTasksPage(page);
    await pending.isVisible();

    await expect(pending.taskItems.first()).toBeVisible();
  });
});
