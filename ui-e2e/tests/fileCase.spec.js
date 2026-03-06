const { test } = require('@playwright/test');
const { loadGlobalVariables, saveGlobalVariables } = require('../helpers/env');
const { LoginPage } = require('../pages/common/LoginPage');
const { FileCasePage } = require('../pages/normal/FileCasePage');

function computeDateOfService(daysBefore = 16) {
  const today = new Date();
  const d = new Date(today);
  d.setDate(today.getDate() - daysBefore);
  return d.toISOString().split('T')[0];
}

 test('File a case successfully (POM orchestration)', async ({ page }) => {
  let globals = loadGlobalVariables();
  const dateOfService = computeDateOfService(16);
  globals = saveGlobalVariables({ dateOfService });

  const login = new LoginPage(page, globals);
  const fileCase = new FileCasePage(page, globals);

  await login.open();
  await login.loginWithMobileOtp(globals.citizenUsername);

  await fileCase.startFiling();
  await fileCase.fillComplainantDetails();
  await fileCase.fillAccusedDetails();
  await fileCase.fillChequeDetails();
  await fileCase.fillDebtLiability();
  await fileCase.fillLegalDemandNotice();
  await fileCase.skipWitnessAndAdvance();
  await fileCase.fillComplaintAndDocs();
  await fileCase.fillAdvocateDetails();
  await fileCase.processdelivery();
  await fileCase.processdelivery1();
  

  const filingNumber = await fileCase.captureFilingNumber();
  saveGlobalVariables({ filingNumber });
});
