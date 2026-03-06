const { test, expect } = require('@playwright/test');
const path = require('path');
const { loadGlobalVariables, saveGlobalVariables } = require('../../helpers/env');
const { LoginPage } = require('../../pages/common/LoginPage');
const { FileCasePage } = require('../../pages/normal/FileCasePage');

function computeDateOfService(daysBefore = 16) {
  const today = new Date();
  const d = new Date(today);
  d.setDate(today.getDate() - daysBefore);
  return d.toISOString().split('T')[0];
}

test.describe('Normal Flow - File Case', () => {
  test('Citizen can login and file a case', async ({ page }) => {
    test.setTimeout(180000);

    // Load and patch globals for this run
    let globals = loadGlobalVariables();
    globals.dateOfService = computeDateOfService(16);
    saveGlobalVariables({ dateOfService: globals.dateOfService });

    const loginPage = new LoginPage(page, globals);
    await loginPage.open();
    await loginPage.loginWithMobileOtp(globals.citizenUsername);

    const fileCase = new FileCasePage(page, globals);
    await fileCase.startFiling();
    await fileCase.fillComplainantDetails();
    await fileCase.fillAccusedDetails();
    await fileCase.fillChequeDetails();
    await fileCase.fillDebtLiability();
    await fileCase.fillLegalDemandNotice();
    await fileCase.skipWitnessAndAdvance();
    await fileCase.fillComplaintAndDocs();
    await fileCase.fillAdvocateDetails();
    await fileCase.reviewSignAndSubmit();

    const filingNumber = await fileCase.captureFilingNumber();
    expect(filingNumber).toBeTruthy();

    // Persist for downstream tests
    saveGlobalVariables({ filingNumber });

    // Brief wait to ensure stability
    await page.waitForTimeout(2000);
  });
});
