// e2e/tests/joincase.spec.js
const { test, expect } = require('@playwright/test');
const { loginCitizen } = require('../../e2e/helpers/auth');
const { HomePage } = require('../../e2e/pages/home.page');
const { JoinCasePage } = require('../../e2e/pages/joincase.page');

test.describe('@join Join Case workflow', () => {
  test('User can open Join Case and see join form', async ({ page }) => {
    await loginCitizen(page);

    const home = new HomePage(page);
    await home.openJoinCase();

    const join = new JoinCasePage(page);
    await join.isVisible();

    await expect(join.joinBtn).toBeVisible();
  });
});
