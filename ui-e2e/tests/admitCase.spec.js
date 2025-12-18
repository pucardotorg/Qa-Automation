const { test } = require('@playwright/test');
const { EmployeeLoginPage } = require('../pages/common/EmployeeLoginPage');
const { JudgeOrdersPage } = require('../pages/employee/JudgeOrdersPage');
const { loadGlobalVariables, saveGlobalVariables } = require('../helpers/env');

test('Judge admits case and captures ST number', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const employeeLogin = new EmployeeLoginPage(page, globals);
  const judgeOrders = new JudgeOrdersPage(page, globals);

  // Login as Judge
  await employeeLogin.open();
  await employeeLogin.loginAsJudge();

  // Admit case and capture ST number
  const stNumber = await judgeOrders.admitCase(globals.cmpNumber);
  
  // Save ST number
  saveGlobalVariables({ stNumber });
  console.log('ST Number:', stNumber);
});
