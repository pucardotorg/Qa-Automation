const { test } = require('@playwright/test');
const { EmployeeLoginPage } = require('../pages/common/EmployeeLoginPage');
const { JudgeOrdersPage } = require('../pages/employee/JudgeOrdersPage');
const { loadGlobalVariables } = require('../helpers/env');

test('Judge issues warrant', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const employeeLogin = new EmployeeLoginPage(page, globals);
  const judgeOrders = new JudgeOrdersPage(page, globals);

  // Login as Judge
  await employeeLogin.open();
  await employeeLogin.loginAsJudge();

  // Issue warrant
  await judgeOrders.issueWarrant(
    globals.stNumber,
    `${globals.respondentFirstName} (Accused)`
  );
});
