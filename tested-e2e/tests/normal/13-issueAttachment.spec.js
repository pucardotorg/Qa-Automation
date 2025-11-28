const { test } = require('@playwright/test');
const { loadGlobalVariables } = require('../../helpers/env');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { AttachmentPage } = require('../../pages/normal/AttachmentPage');

test.describe('Normal Flow - Issue Attachment (Judge)', () => {
  test('Judge issues attachment for ST case', async ({ page }) => {
    test.setTimeout(180000);

    const globals = loadGlobalVariables();

    const empLogin = new EmployeeLoginPage(page, globals);
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const attachment = new AttachmentPage(page, globals);
    await attachment.goToAllCases();
    await attachment.openByStNumber();
    await attachment.generateAttachment();
  });
});
