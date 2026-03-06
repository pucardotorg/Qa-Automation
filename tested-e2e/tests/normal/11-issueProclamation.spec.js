const { test } = require('@playwright/test');
const { loadGlobalVariables } = require('../../helpers/env');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { ProclamationPage } = require('../../pages/normal/ProclamationPage');

test.describe('Normal Flow - Issue Proclamation (Judge)', () => {
  test('Judge issues proclamation for ST case', async ({ page }) => {
    test.setTimeout(180000);

    const globals = loadGlobalVariables();

    const empLogin = new EmployeeLoginPage(page, globals);
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const proclamation = new ProclamationPage(page, globals);
    await proclamation.goToAllCases();
    await proclamation.openByStNumber();
    await proclamation.generateProclamation();
  });
});
