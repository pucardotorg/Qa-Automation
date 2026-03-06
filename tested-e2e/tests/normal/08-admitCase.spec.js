const { test, expect } = require('@playwright/test');
const { loadGlobalVariables } = require('../../helpers/env');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { AdmitCasePage } = require('../../pages/normal/AdmitCasePage');

test.describe('Normal Flow - Admit Case (Judge)', () => {
  test('Judge issues order for taking cognizance and captures ST number', async ({ page }) => {
    test.setTimeout(180000);

    const globals = loadGlobalVariables();

    const empLogin = new EmployeeLoginPage(page, globals);
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const admit = new AdmitCasePage(page, globals);
    await admit.goToAllCases();
    await admit.openByCmpNumber();
    await admit.generateAdmitOrder();

    const stNumber = await admit.captureSTNumber();
    expect(stNumber).toBeTruthy();
  });
});
