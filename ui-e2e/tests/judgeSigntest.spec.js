const { test } = require('@playwright/test');
const { EmployeeLoginPage } = require('../pages/common/EmployeeLoginPage');
const { JudgeSignPage } = require('../pages/employee/JudgeSignPage');
const { loadGlobalVariables } = require('../helpers/env');

test('Judge e-signs and sends order', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const employeeLogin = new EmployeeLoginPage(page, globals);
  const judgeSign = new JudgeSignPage(page, globals);

  // Login as Judge
  await employeeLogin.open();
  await employeeLogin.loginAsJudge();

  // Process e-sign and send
  // Use stNumber for orders issued after case admission (summons, proclamation, attachment, warrant)
  // Use cmpNumber for orders issued before case admission (notice)
  await judgeSign.processESignAndSend(globals.stNumber);
  
  console.log('Judge successfully e-signed and sent the order');
});