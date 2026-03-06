const { test, expect } = require('@playwright/test');
const { loadGlobalVariables } = require('../../helpers/env');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { RegisterCasePage } = require('../../pages/normal/RegisterCasePage');

test.describe('Normal Flow - Register Case (Judge)', () => {
  test('Judge registers case, generates and uploads order, captures codes', async ({ page }) => {
    test.setTimeout(180000);

    const globals = loadGlobalVariables();

    const empLogin = new EmployeeLoginPage(page, globals);
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const register = new RegisterCasePage(page, globals);
    await register.goToAllCases();
    await register.searchByFilingNumberAndOpen();
    await register.registerCaseScheduleAndGenerateOrder();

    const { accessCode, cmpNumber } = await register.captureAccessAndCmpNumbers();
    expect(accessCode).toBeTruthy();
    expect(cmpNumber).toBeTruthy();
  });
});
