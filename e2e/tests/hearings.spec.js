// e2e/tests/hearings.spec.js
const { test, expect } = require('@playwright/test');
const { loginCitizen } = require('../../e2e/helpers/auth');
const { HomePage } = require('../../e2e/pages/home.page');
const { HearingsPage } = require('../../e2e/pages/hearings.page');

test.describe('@hearings Hearings workflow', () => {
  test('User can open Hearings and view the table', async ({ page }) => {
    await loginCitizen(page);

    const home = new HomePage(page);
    await home.openViewHearings();

    const hearings = new HearingsPage(page);
    await hearings.isVisible();

    await expect(hearings.table).toBeVisible();
  });
});
