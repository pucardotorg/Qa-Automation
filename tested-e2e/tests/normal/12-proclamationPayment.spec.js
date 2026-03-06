const { test } = require('@playwright/test');
const { loadGlobalVariables } = require('../../helpers/env');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { PaymentPage } = require('../../pages/common/PaymentPage');

test.describe('Normal Flow - Proclamation Payment (NayaMitra)', () => {
  test('Record offline payment for ST case', async ({ page }) => {
    test.setTimeout(180000);

    const globals = loadGlobalVariables();

    const empLogin = new EmployeeLoginPage(page, globals);
    await empLogin.openLogin();
    await empLogin.login(globals.nayamitraUsername, globals.nayamitraPassword);

    const payment = new PaymentPage(page, globals);
    await payment.collectOfflinePayment(globals.stNumber);
  });
});
