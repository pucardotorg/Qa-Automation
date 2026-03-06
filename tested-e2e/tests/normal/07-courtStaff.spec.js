const { test } = require('@playwright/test');
const { loadGlobalVariables } = require('../../helpers/env');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { CourtStaffPage } = require('../../pages/normal/CourtStaffPage');

test.describe('Normal Flow - Court Staff Sign and Dispatch', () => {
  test('Court staff e-signs, marks as sent, and updates status', async ({ page }) => {
    test.setTimeout(180000);

    const globals = loadGlobalVariables();

    const empLogin = new EmployeeLoginPage(page, globals);
    await empLogin.openLogin();
    await empLogin.login(globals.courtStaffUsername, globals.courtStaffPassword);

    const staff = new CourtStaffPage(page, globals);
    await staff.openSignProcess();
    await staff.searchByCmpNumber(globals.cmpNumber);
    await staff.openFirstVs();
    await staff.eSignDownloadUpload();
    await staff.verifyInSentAndUpdateStatus(globals.cmpNumber);
  });
});
