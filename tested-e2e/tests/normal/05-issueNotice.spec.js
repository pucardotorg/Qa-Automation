const { test } = require('@playwright/test');
const { loadGlobalVariables } = require('../../helpers/env');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { NoticePage } = require('../../pages/normal/NoticePage');

test.describe('Normal Flow - Issue Notice (Judge)', () => {
  test('Judge issues notice order for CMP', async ({ page }) => {
    test.setTimeout(180000);

    const globals = loadGlobalVariables();

    const empLogin = new EmployeeLoginPage(page, globals);
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const notice = new NoticePage(page, globals);
    await notice.goToAllCases();
    await notice.openByCmpNumber();
    await notice.generateNoticeOrder();
  });
});
