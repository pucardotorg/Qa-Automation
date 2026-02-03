const { test } = require('@playwright/test');
const { LoginPage } = require('../../pages/common/LoginPage');
const { FileCasePage } = require('../../pages/normal/FileCasePage');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { PaymentPage } = require('../../pages/employee/PaymentPage');
const { FSOPage } = require('../../pages/employee/FSOPage');
const { JudgePage } = require('../../pages/employee/JudgePage');
const { JudgeOrdersPage } = require('../../pages/employee/JudgeOrdersPage');
const { CourtStaffPage } = require('../../pages/employee/CourtStaffPage');
const { JoinCasePage } = require('../../pages/normal/JoinCasePage');
const { NoticePaymentPage } = require('../../pages/normal/NoticePaymentPage');
const { loadGlobalVariables, saveGlobalVariables } = require('../../helpers/env');
const { JudgeSignPage } = require('../../pages/employee/JudgeSignPage');

function computeDateOfService(daysBefore = 16) {
  const today = new Date();
  const d = new Date(today);
  d.setDate(today.getDate() - daysBefore);
  return d.toISOString().split('T')[0];
}

test.describe.serial('Normal Full Case Flow with 2 Advocates - End to End', () => {
  let globals;

  test.beforeAll(() => {
    globals = loadGlobalVariables();
    console.log('DEBUG: globals after load:', JSON.stringify(globals, null, 2));
    console.log('DEBUG: baseURL =', globals.baseURL);
    const dateOfService = computeDateOfService(16);
    globals.dateOfService = dateOfService;
    saveGlobalVariables({ dateOfService });
  });

  test('01 - File a case with 2 advocates successfully', async ({ page }) => {
    test.setTimeout(300000);
    
    const login = new LoginPage(page, globals);
    const fileCase = new FileCasePage(page, globals);

    await login.open();
    await login.loginWithMobileOtp(globals.citizenUsername);
    
    await fileCase.startFiling();
    await fileCase.fillComplainantDetails();
    await fileCase.fillAccusedDetails();
    await fileCase.fillChequeDetails();
    await fileCase.fillDebtLiability();
    
    // For 2 advocates, we'll need to modify the legal demand notice to include both
    await fileCase.fillLegalDemandNotice({
      advocate1Name: "Advocate One",
      advocate1Enrollment: "KA/1234/2020",
      advocate2Name: "Advocate Two",
      advocate2Enrollment: "KA/5678/2021"
    });
    
    await fileCase.skipWitnessAndAdvance();
    await fileCase.fillComplaintAndDocs();
    
    // Save the case number for future reference
    globals.caseNumber = await fileCase.getCaseNumber();
    saveGlobalVariables({ caseNumber: globals.caseNumber });
    
    console.log(`Case filed successfully with number: ${globals.caseNumber}`);
  });

  // Add additional test cases for the rest of the flow as needed
  // These would be similar to the original file but may need adjustments for 2 advocates
  
  // Example of a modified test case for payment that might need to handle 2 advocates
  test('02 - Make payment for case with 2 advocates', async ({ page }) => {
    test.setTimeout(180000);
    
    const login = new LoginPage(page, globals);
    const payment = new PaymentPage(page, globals);

    await login.open();
    await login.loginWithMobileOtp(globals.citizenUsername);
    
    // Navigate to payments and handle any advocate-specific payment flow
    await payment.navigateToPayments();
    await payment.selectCaseForPayment(globals.caseNumber);
    
    // Handle payment for both advocates if needed
    await payment.recordPaymentForCase();
    await payment.selectPaymentMode('Online');
    await payment.submitPayment();
    
    // Verify payment success for both advocates
    await payment.verifyPaymentSuccess();
  });
  
  // Add more test cases as needed for the rest of the flow
});
