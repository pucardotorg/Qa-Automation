const { test } = require('@playwright/test');
const { EmployeeLoginPage } = require('../pages/common/EmployeeLoginPage');
const { PaymentPage } = require('../pages/employee/PaymentPage');
const { loadGlobalVariables } = require('../helpers/env');

test('Proclamation Payment - Collect offline payment', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const employeeLogin = new EmployeeLoginPage(page, globals);
  const payment = new PaymentPage(page, globals);

  // Login as Naya Mitra
  console.log('Navigating to Nm login page...');
  await employeeLogin.open();
  
  console.log('Logging in as Naya Mitra...');
  await employeeLogin.loginAsNayaMitra();

  // Collect offline payment for proclamation
  console.log('Collecting offline payment for case:', globals.stNumber);
  await payment.navigateToCollectPayments();
  await payment.searchCaseByFilingNumber(globals.stNumber);
  
  // Wait for Record Payment link to be visible
  await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });
  
  await payment.recordPaymentForCase();
  await payment.selectPaymentMode('Stamp');
  await payment.submitPayment();
  
  console.log('Proclamation payment collection completed successfully');
});
