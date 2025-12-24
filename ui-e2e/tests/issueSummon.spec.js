const { test } = require('@playwright/test');
const { EmployeeLoginPage } = require('../pages/common/EmployeeLoginPage');
const { JudgeOrdersPage } = require('../pages/employee/JudgeOrdersPage');
const { loadGlobalVariables } = require('../helpers/env');

test('Judge issues summons to accused', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const employeeLogin = new EmployeeLoginPage(page, globals);
  const judgeOrders = new JudgeOrdersPage(page, globals);

  // Login as Judge
  await employeeLogin.open();
  await employeeLogin.loginAsJudge();

  // Issue summon
  await judgeOrders.issueSummon(
    globals.stNumber,
    `${globals.respondentFirstName} (Accused)`
    );
  
});
