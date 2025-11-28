const { test } = require('@playwright/test');
const { loadGlobalVariables } = require('../../helpers/env');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { SummonsPage } = require('../../pages/normal/SummonsPage');

test.describe('Normal Flow - Issue Summons (Judge)', () => {
  test('Judge issues summons for ST case', async ({ page }) => {
    test.setTimeout(180000);

    const globals = loadGlobalVariables();

    const empLogin = new EmployeeLoginPage(page, globals);
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const summons = new SummonsPage(page, globals);
    await summons.goToAllCases();
    await summons.openByStNumber();
    await summons.generateSummons();
  });
});
