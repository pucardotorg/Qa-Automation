const { test } = require('@playwright/test');
const { loadGlobalVariables } = require('../../helpers/env');
const { PaymentPage } = require('../../pages/common/PaymentPage');

test.describe('Normal Flow - NayaMitra Payment', () => {
  test('Record offline payment for filing number', async ({ page }) => {
    test.setTimeout(180000);

    const globals = loadGlobalVariables();

    const payment = new PaymentPage(page, globals);
    await payment.openEmployeeLogin();
    await payment.loginEmployee(globals.nayamitraUsername, globals.nayamitraPassword);

    await payment.collectOfflinePayment(globals.filingNumber);
  });
});
