const { test } = require('@playwright/test');
const { EmployeeLoginPage } = require('../pages/common/EmployeeLoginPage');
const { FSOPage } = require('../pages/employee/FSOPage');
const { loadGlobalVariables } = require('../helpers/env');

test('FSO scrutinize and forward case to judge', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const employeeLogin = new EmployeeLoginPage(page, globals);
  const fso = new FSOPage(page, globals);

  // Login as FSO
  await employeeLogin.open();
  await employeeLogin.loginAsFSO();

  // Scrutinize and forward to judge
  await fso.scrutinizeAndForward(globals.filingNumber, 'FSO comments');
});
