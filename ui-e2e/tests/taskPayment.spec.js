const { test } = require('@playwright/test');
const { EmployeeLoginPage } = require('../pages/common/EmployeeLoginPage');
const { PaymentPage } = require('../pages/employee/PaymentPage');
const { loadGlobalVariables } = require('../helpers/env');

test('Task Payment - Collect offline payment for notice/summon/warrant/proclamation/attachment', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const employeeLogin = new EmployeeLoginPage(page, globals);
  const payment = new PaymentPage(page, globals);

  // Determine which filing number to use based on whether it contains 'ST'
  const filingNumber = globals.filingNumber && globals.filingNumber.includes('ST') 
    ? globals.stNumber 
    : globals.cmpNumber;

  // Login as Naya Mitra
  console.log('Navigating to Nm login page...');
  await employeeLogin.open();
  
  console.log('Logging in as Naya Mitra...');
  await employeeLogin.loginAsNayaMitra();

  // Collect offline payment for task
  console.log('Collecting offline payment for case:', filingNumber);
  await payment.navigateToCollectPayments();
  await payment.searchCaseByFilingNumber(filingNumber);
  
  // Wait for Record Payment link to be visible
  await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });
  
  await payment.recordPaymentForCase();
  await payment.selectPaymentMode('Stamp');
  await payment.submitPayment();
  
  console.log('Task payment collection completed successfully');
});
