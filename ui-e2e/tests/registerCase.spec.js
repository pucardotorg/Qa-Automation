const { test } = require('@playwright/test');
const { EmployeeLoginPage } = require('../pages/common/EmployeeLoginPage');
const { JudgePage } = require('../pages/employee/JudgePage');
const { loadGlobalVariables, saveGlobalVariables } = require('../helpers/env');

test('Judge registers case and issues order', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const employeeLogin = new EmployeeLoginPage(page, globals);
  const judge = new JudgePage(page, globals);

  // Login as Judge
  await employeeLogin.open();
  await employeeLogin.loginAsJudge();

  // Register case and capture access code & CMP number
  const { accessCode, cmpNumber } = await judge.registerCaseFlow(
    globals.filingNumber,
    'AUTOMATION ORDER GENERATED'
  );

  // Save to global variables
  saveGlobalVariables({ accessCode, cmpNumber });
  console.log('Access Code:', accessCode);
  console.log('CMP Number:', cmpNumber);
});
