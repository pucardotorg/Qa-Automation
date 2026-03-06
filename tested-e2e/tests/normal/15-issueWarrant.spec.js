const { test } = require('@playwright/test');
const { loadGlobalVariables } = require('../../helpers/env');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { WarrantPage } = require('../../pages/normal/WarrantPage');

test.describe('Normal Flow - Issue Warrant (Judge)', () => {
  test('Judge issues warrant for ST case', async ({ page }) => {
    test.setTimeout(180000);

    const globals = loadGlobalVariables();

    const empLogin = new EmployeeLoginPage(page, globals);
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const warrant = new WarrantPage(page, globals);
    await warrant.goToAllCases();
    await warrant.openByStNumber();
    await warrant.generateWarrant();
  });
});
