const { test } = require('@playwright/test');
const { EmployeeLoginPage } = require('../pages/common/EmployeeLoginPage');
const { PaymentPage } = require('../pages/employee/PaymentPage');
const { loadGlobalVariables } = require('../helpers/env');

test('Join Case Payment - Collect offline payment', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const employeeLogin = new EmployeeLoginPage(page, globals);
  const payment = new PaymentPage(page, globals);

  // Login as Naya Mitra
  console.log('Navigating to Nm login page...');
  await employeeLogin.open();
  
  console.log('Logging in as Naya Mitra...');
  await employeeLogin.loginAsNayaMitra();

  // Collect offline payment
  console.log('Collecting offline payment for case:', globals.cmpNumber);
  await payment.navigateToCollectPayments();
  await payment.searchCaseByFilingNumber(globals.cmpNumber);
  await payment.recordPaymentForCase();
  await payment.selectPaymentMode('Stamp');
  await payment.submitPayment();
  
  console.log('Payment collection completed successfully');
});
