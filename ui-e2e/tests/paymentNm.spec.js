const { test } = require('@playwright/test');
const { EmployeeLoginPage } = require('../pages/common/EmployeeLoginPage');
const { PaymentPage } = require('../pages/employee/PaymentPage');
const { loadGlobalVariables } = require('../helpers/env');

test('Collect offline payment for case', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const employeeLogin = new EmployeeLoginPage(page, globals);
  const payment = new PaymentPage(page, globals);

  // Login as Naya Mitra
  await employeeLogin.open();
  await employeeLogin.loginAsNayaMitra();

  // Collect offline payment
  await payment.collectOfflinePayment(globals.filingNumber);
});
