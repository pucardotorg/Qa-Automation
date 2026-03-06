const { test } = require('@playwright/test');
const { EmployeeLoginPage } = require('../pages/common/EmployeeLoginPage');
const { CourtStaffPage } = require('../pages/employee/CourtStaffPage');
const { loadGlobalVariables } = require('../helpers/env');

test('Court staff e-signs and sends notice', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const employeeLogin = new EmployeeLoginPage(page, globals);
  const courtStaff = new CourtStaffPage(page, globals);

  // Login as Court Staff
  await employeeLogin.open();
  await employeeLogin.loginAsEmployee(globals.courtStaffUsername, globals.courtStaffPassword);

  // Process e-sign and send
  await courtStaff.processESignAndSend(globals.cmpNumber);
});
