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

test.describe.serial('Normal Full Case Flow - End to End', () => {
  let globals;

  test.beforeAll(() => {
    globals = loadGlobalVariables();
    console.log('DEBUG: globals after load:', JSON.stringify(globals, null, 2));
    console.log('DEBUG: baseURL =', globals.baseURL);
    const dateOfService = computeDateOfService(16);
    globals.dateOfService = dateOfService;
    saveGlobalVariables({ dateOfService });
  });

  test('01 - File a case successfully', async ({ page }) => {
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
    await fileCase.fillLegalDemandNotice();
    await fileCase.skipWitnessAndAdvance();
    await fileCase.fillComplaintAndDocs();
    await fileCase.fillAdvocateDetails();
    await fileCase.processdelivery();
    await fileCase.processdelivery1();

    const filingNumber = await fileCase.captureFilingNumber();
    saveGlobalVariables({ ...globals, filingNumber });
    console.log('Filing Number:', filingNumber);
    globals.filingNumber = filingNumber;
  });

  test('02 - Naya Mitra collects payment for filing', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const payment = new PaymentPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsNayaMitra();
    await payment.collectOfflinePayment(globals.filingNumber);
  });

  test('03 - FSO scrutinizes and forwards to judge', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const fso = new FSOPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsFSO();
    await fso.scrutinizeAndForward(globals.filingNumber, 'FSO comments');
  });

  test('04 - Judge registers case and issues order', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const judge = new JudgePage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsJudge();

    const { accessCode, cmpNumber } = await judge.registerCaseFlow(
      globals.filingNumber,
      'AUTOMATION ORDER GENERATED'
    );

    saveGlobalVariables({ ...globals, accessCode, cmpNumber });
    console.log('Access Code:', accessCode);
    console.log('CMP Number:', cmpNumber);
    globals.accessCode = accessCode;
    globals.cmpNumber = cmpNumber;
  });

  test('05 - Judge issues notice to accused', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const judgeOrders = new JudgeOrdersPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsJudge();

    await judgeOrders.issueNotice(
      globals.cmpNumber,
      'Section 223 Notice',
      `${globals.respondentFirstName} (Accused)`
    );
  });

  test('06 - Citizen selects notice address and payment method', async ({ page }) => {
    test.setTimeout(180000);
    
    const login = new LoginPage(page, globals);
    const noticePayment = new NoticePaymentPage(page, globals);

    await login.open();
    await login.loginWithMobileOtp(globals.citizenUsername);
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await noticePayment.completeNoticePaymentFlow(globals.cmpNumber);
  });

  test('07 - Naya Mitra collects payment for notice', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const payment = new PaymentPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsNayaMitra();

    await payment.navigateToCollectPayments();
    await payment.searchCaseByFilingNumber(globals.cmpNumber);
    
    await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });
    
    await payment.recordPaymentForCase();
    await payment.selectPaymentMode('Stamp');
    await payment.submitPayment();
  });

  test('08 - Court staff e-signs and sends notice', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const courtStaff = new CourtStaffPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsEmployee(globals.courtStaffUsername, globals.courtStaffPassword);
    await courtStaff.processESignAndSend(globals.cmpNumber);
  });

  test('09 - Advocate joins case on behalf of accused', async ({ page }) => {
    test.setTimeout(180000);
    
    const joinCase = new JoinCasePage(page, globals);

    await joinCase.open();
    await joinCase.joinCaseFlow(
      globals.accusedADV,
      globals.filingNumber,
      globals.accessCode,
      globals.respondentFirstName,
      globals.accusedLitigant,
      globals.noOfAdvocates
    );
  });

  test('10 - Naya Mitra collects payment for join case', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const payment = new PaymentPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsNayaMitra();

    await payment.navigateToCollectPayments();
    await payment.searchCaseByFilingNumber(globals.cmpNumber);
    await payment.recordPaymentForCase();
    await payment.selectPaymentMode('Stamp');
    await payment.submitPayment();
  });

  test('11 - Judge admits case and captures ST number', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const judgeOrders = new JudgeOrdersPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsJudge();

    const stNumber = await judgeOrders.admitCase(globals.cmpNumber);
    
    saveGlobalVariables({ ...globals, stNumber });
    console.log('ST Number:', stNumber);
    globals.stNumber = stNumber;
  });

  test('12 - Judge issues summons to accused', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const judgeOrders = new JudgeOrdersPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsJudge();

    await judgeOrders.issueSummon(
      globals.stNumber,
      `${globals.respondentFirstName} (Accused)`
    );
  });

  test('13 - Court staff e-signs and sends summons', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const courtStaff = new CourtStaffPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsEmployee(globals.courtStaffUsername, globals.courtStaffPassword);
    await courtStaff.processESignAndSend(globals.stNumber);
  });

  test('14 - Judge issues proclamation to accused', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const judgeOrders = new JudgeOrdersPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsJudge();

    await judgeOrders.issueProclamation(
      globals.stNumber,
      `${globals.respondentFirstName} (Accused)`
    );
  });

  test('15 - Naya Mitra collects payment for proclamation', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const payment = new PaymentPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsNayaMitra();

    await payment.navigateToCollectPayments();
    await payment.searchCaseByFilingNumber(globals.stNumber);
    
    await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });
    
    await payment.recordPaymentForCase();
    await payment.selectPaymentMode('Stamp');
    await payment.submitPayment();
  });

  test('16 - Judge e-signs and sends proclamation', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const judgeSign = new JudgeSignPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsJudge();
    await judgeSign.processESignAndSend(globals.stNumber);
  });

  test('17 - Judge issues attachment order', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const judgeOrders = new JudgeOrdersPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsJudge();

    await judgeOrders.issueAttachment(
      globals.stNumber,
      `${globals.respondentFirstName} (Accused)`
    );
  });

  test('18 - Naya Mitra collects payment for attachment', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const payment = new PaymentPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsNayaMitra();

    await payment.navigateToCollectPayments();
    await payment.searchCaseByFilingNumber(globals.stNumber);
    
    await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });
    
    await payment.recordPaymentForCase();
    await payment.selectPaymentMode('Stamp');
    await payment.submitPayment();
  });

  test('19 - Judge e-signs and sends attachment', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const judgeSign = new JudgeSignPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsJudge();
    await judgeSign.processESignAndSend(globals.stNumber);
  });

  test('20 - Judge issues warrant', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const judgeOrders = new JudgeOrdersPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsJudge();

    await judgeOrders.issueWarrant(
      globals.stNumber,
      `${globals.respondentFirstName} (Accused)`
    );
  });

  test('21 - Naya Mitra collects payment for warrant', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const payment = new PaymentPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsNayaMitra();

    await payment.navigateToCollectPayments();
    await payment.searchCaseByFilingNumber(globals.stNumber);
    
    await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });
    
    await payment.recordPaymentForCase();
    await payment.selectPaymentMode('Stamp');
    await payment.submitPayment();
  });

  test('22 - Judge e-signs and sends warrant', async ({ page }) => {
    test.setTimeout(180000);
    
    const employeeLogin = new EmployeeLoginPage(page, globals);
    const judgeSign = new JudgeSignPage(page, globals);

    await employeeLogin.open();
    await employeeLogin.loginAsJudge();
    await judgeSign.processESignAndSend(globals.stNumber);
  });
});