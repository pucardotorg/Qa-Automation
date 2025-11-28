const { test } = require('@playwright/test');
const { loadGlobalVariables } = require('../../helpers/env');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { FSOPage } = require('../../pages/normal/FSOPage');

test.describe('Normal Flow - FSO scrutinise and forward', () => {
  test('FSO logs in, opens case and forwards to judge', async ({ page }) => {
    test.setTimeout(180000);

    const globals = loadGlobalVariables();

    const empLogin = new EmployeeLoginPage(page, globals);
    await empLogin.openLogin();
    await empLogin.login(globals.fsoUsername, globals.fsoPassword);

    const fso = new FSOPage(page, globals);
    await fso.openScrutiniseCases();
    await fso.searchFilingAndOpen();
    await fso.forwardToJudgeWithComment('FSO comments');
  });
});
