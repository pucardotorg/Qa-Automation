const { test } = require('@playwright/test');
const { LoginPage } = require('../../pages/common/LoginPage');
const { FileCasePage } = require('../../pages/normal/FileCasePage');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { PaymentPage } = require('../../pages/employee/PaymentPage');
const { FSOPage } = require('../../pages/employee/FSOPage');
const { ReSubmitCasePage } = require('../../pages/normal/ReSubmitCasePage');
const { JudgePage } = require('../../pages/employee/JudgePage');
const { JudgeOrdersPage } = require('../../pages/employee/JudgeOrdersPage');
const { NoticePaymentPage } = require('../../pages/normal/NoticePaymentPage');
const { CourtStaffPage } = require('../../pages/employee/CourtStaffPage');
const { ProductionOfDocumentsPage } = require('../../pages/normal/ProductionOfDocumentsPage');
const { OthersApplicationPage } = require('../../pages/normal/OthersApplicationPage');
const { CondonationOfDelayPage } = require('../../pages/normal/CondonationOfDelayPage');
const { loadGlobalVariables, saveGlobalVariables } = require('../../helpers/env');

/**
 * FSO Resubmit Case Flow — End to End
 *
 * Scenario source:
 *   UI Tests/tests/6-ResubmitCaseFSO/01-fileCase.spec.js
 *   UI Tests/tests/6-ResubmitCaseFSO/2-paymentNm.spec.js
 *   UI Tests/tests/6-ResubmitCaseFSO/2.1-returnCaseFromFso.spec.js
 *   UI Tests/tests/6-ResubmitCaseFSO/2.2-reSubmitCaseFromAdv.spec.js
 *   UI Tests/tests/6-ResubmitCaseFSO/3-fso.spec.js
 *   UI Tests/tests/6-ResubmitCaseFSO/4-registerCase.spec.js
 *   UI Tests/tests/6-ResubmitCaseFSO/5-issueNotice.spec.js
 *   UI Tests/tests/6-ResubmitCaseFSO/6-NoticePayment.spec.js
 *   UI Tests/tests/6-ResubmitCaseFSO/7-CourtStaff.spec.js
 *   UI Tests/tests/6-ResubmitCaseFSO/8-initiateProductionDocApp.spec.js
 *   UI Tests/tests/6-ResubmitCaseFSO/8-productionDocAppPayment.spec.js
 *   UI Tests/tests/6-ResubmitCaseFSO/9-rejectProductionDocApp.spec.js
 *
 * Flow:
 *   01 — Citizen files a case
 *   02 — Naya Mitra collects payment for filing (Stamp)
 *   03 — FSO marks a defect and returns case to litigant for correction
 *   04 — Citizen re-submits the corrected case
 *   05 — FSO scrutinizes and forwards re-submitted case to Judge
 *   06 — Judge registers case and captures accessCode + cmpNumber
 *   07 — Judge issues notice to accused
 *   08 — Naya Mitra collects payment for notice (Stamp)
 *   09 — Court staff e-signs and sends the notice
 *   10 — Citizen initiates Production of Documents application
 *   11 — Naya Mitra collects payment for Production of Documents (Cash)
 *   12 — Judge rejects Production of Documents application and issues order
 *
 * Global variables required:
 *   citizenUsername, litigantUsername, complainantAge,
 *   respondentFirstName, respondentPincode, respondentState,
 *   respondentDistrict, respondentCity, respondentAddress,
 *   chequeSignatoryName, payeeBankName, payeeBranchName, chequeNumber,
 *   issuanceDate, payerBankName, payerBranchName, ifsc, chequeAmount,
 *   policeStation, depositDate, reasonForReturnOfCheque,
 *   liabilityNature, dateOfDispatch, dateOfService, noOfAdvocates,
 *   nayamitraUsername, nayamitraPassword,
 *   fsoUsername, fsoPassword,
 *   judgeUsername, judgePassword,
 *   courtStaffUsername, courtStaffPassword
 */

function computeDateOfService(daysBefore = 16) {
    const today = new Date();
    const d = new Date(today);
    d.setDate(today.getDate() - daysBefore);
    return d.toISOString().split('T')[0];
}

test.describe.serial('FSO Resubmit Case Flow - End to End', () => {
    let globals;

    test.beforeAll(() => {
        globals = loadGlobalVariables();
        const dateOfService = computeDateOfService(16);
        globals.dateOfService = dateOfService;
        saveGlobalVariables({ dateOfService });
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 01 — Citizen files a case (single complainant using litigantUsername)
    // Source: UI Tests/tests/6-ResubmitCaseFSO/01-fileCase.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('01 - Citizen files a case', async ({ page }) => {
        test.setTimeout(600000);

        const login = new LoginPage(page, globals);
        const fileCase = new FileCasePage(page, globals);

        await login.open();
        await login.loginWithMobileOtp(globals.citizenUsername);

        await fileCase.startFiling();

        // Single complainant using litigantUsername
        await fileCase.fillComplainantDetails();

        await fileCase.fillAccusedDetails();
        await fileCase.fillChequeDetails();
        await fileCase.fillDebtLiability();
        await fileCase.fillLegalDemandNotice();
        await fileCase.skipWitnessAndAdvance();
        await fileCase.fillComplaintAndDocs();
        await fileCase.fillAdvocateDetails();

        // Process delivery and review / sign / submit
        await fileCase.processdelivery();
        await fileCase.processdelivery1();

        const filingNumber = await fileCase.captureFilingNumber();
        saveGlobalVariables({ filingNumber });
        console.log('Filing Number:', filingNumber);
        globals.filingNumber = filingNumber;
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 02 — Naya Mitra collects payment for the filed case
    // Source: UI Tests/tests/6-ResubmitCaseFSO/2-paymentNm.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('02 - Naya Mitra collects payment for filing', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const payment = new PaymentPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsNayaMitra();

        await payment.navigateToCollectPayments();
        await payment.searchCaseByFilingNumber(globals.filingNumber);

        await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });

        await payment.recordPaymentForCase();
        await payment.selectPaymentMode('Cash');
        await payment.submitPayment();
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 03 — FSO marks a defect and sends case back for correction
    // Source: UI Tests/tests/6-ResubmitCaseFSO/2.1-returnCaseFromFso.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('03 - FSO returns case to litigant for correction', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const fso = new FSOPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsFSO();

        await fso.returnCaseToLitigant(globals.filingNumber, globals.fsoDefectCode);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 04 — Citizen re-submits the corrected case
    // Source: UI Tests/tests/6-ResubmitCaseFSO/2.2-reSubmitCaseFromAdv.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('04 - Citizen re-submits the corrected case', async ({ page }) => {
        test.setTimeout(600000);

        const login = new LoginPage(page, globals);
        const reSubmit = new ReSubmitCasePage(page, globals);

        await login.open();
        await login.loginWithMobileOtp(globals.citizenUsername);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await reSubmit.resubmitCase(globals.filingNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 05 — FSO scrutinizes the re-submitted case and forwards to Judge
    // Source: UI Tests/tests/6-ResubmitCaseFSO/3-fso.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('05 - FSO scrutinizes and forwards re-submitted case to Judge', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const fso = new FSOPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsFSO();

        await fso.scrutinizeAndForward(globals.filingNumber, globals.fsoComments);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 06 — Judge registers the case and captures accessCode + cmpNumber
    // Source: UI Tests/tests/6-ResubmitCaseFSO/4-registerCase.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('06 - Judge registers case and captures accessCode & cmpNumber', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        const { accessCode, cmpNumber } = await judge.registerCaseFlow(
            globals.filingNumber,
            globals.orderText
        );

        saveGlobalVariables({ accessCode, cmpNumber });
        console.log('Access Code:', accessCode);
        console.log('CMP Number:', cmpNumber);
        globals.accessCode = accessCode;
        globals.cmpNumber = cmpNumber;
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 07 — Judge issues notice to accused
    // Source: UI Tests/tests/6-ResubmitCaseFSO/5-issueNotice.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('07 - Judge issues notice to accused', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judgeOrders = new JudgeOrdersPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judgeOrders.issueNotice(
            globals.cmpNumber,
            globals.noticeType,
            `${globals.respondentFirstName} (Accused)`
        );
    });

    test('08 - Citizen selects notice address and payment method', async ({ page }) => {
        test.setTimeout(600000);

        const login = new LoginPage(page, globals);
        const noticePayment = new NoticePaymentPage(page, globals);

        await login.open();
        await login.loginWithMobileOtp(globals.citizenUsername);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await noticePayment.completeNoticePaymentFlow(globals.cmpNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 09 — Naya Mitra collects payment for notice
    // Source: UI Tests/tests/6-ResubmitCaseFSO/6-NoticePayment.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('09 - Naya Mitra collects payment for notice', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const payment = new PaymentPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsNayaMitra();

        await payment.navigateToCollectPayments();
        await payment.searchCaseByFilingNumber(globals.cmpNumber);

        await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });

        await payment.recordPaymentForCase();
        await payment.selectPaymentMode('Cash');
        await payment.submitPayment();
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 10 — Court staff e-signs and sends the notice
    // Source: UI Tests/tests/6-ResubmitCaseFSO/7-CourtStaff.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('10 - Court staff e-signs and sends notice', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const courtStaff = new CourtStaffPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsEmployee(globals.courtStaffUsername, globals.courtStaffPassword);
        await courtStaff.processESignAndSend(globals.cmpNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 11 — Citizen initiates Production of Documents application
    // Source: UI Tests/tests/6-ResubmitCaseFSO/8-initiateProductionDocApp.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('11 - Citizen initiates Production of Documents application', async ({ page }) => {
        test.setTimeout(600000);

        const login = new LoginPage(page, globals);
        const productionDocs = new ProductionOfDocumentsPage(page, globals);

        await login.open();
        await login.loginWithMobileOtp(globals.citizenUsername);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await productionDocs.initiateProductionOfDocuments(globals.cmpNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 12 — Naya Mitra collects payment for Production of Documents application
    // Source: UI Tests/tests/6-ResubmitCaseFSO/8-productionDocAppPayment.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('12 - Naya Mitra collects payment for Production of Documents', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const payment = new PaymentPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsNayaMitra();

        await payment.navigateToCollectPayments();
        await payment.searchCaseByFilingNumber(globals.cmpNumber);

        await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });

        await payment.recordPaymentForCase();
        await payment.selectPaymentMode('Cash');
        await payment.submitPayment();
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 13 — Judge rejects Production of Documents application and issues order
    // Source: UI Tests/tests/6-ResubmitCaseFSO/9-rejectProductionDocApp.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('13 - Judge rejects Production of Documents application and issues order', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judgeOrders = new JudgeOrdersPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judgeOrders.rejectProductionOfDocuments(globals.cmpNumber);
    });

    test('14 - Citizen initiates Production of Documents application', async ({ page }) => {
        test.setTimeout(600000);

        const login = new LoginPage(page, globals);
        const productionDocs = new ProductionOfDocumentsPage(page, globals);

        await login.open();
        await login.loginWithMobileOtp(globals.citizenUsername);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await productionDocs.initiateProductionOfDocuments(globals.cmpNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 15 — Naya Mitra collects payment for Production of Documents application
    // Source: UI Tests/tests/6-ResubmitCaseFSO/8-productionDocAppPayment.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('15 - Naya Mitra collects payment for Production of Documents', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const payment = new PaymentPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsNayaMitra();

        await payment.navigateToCollectPayments();
        await payment.searchCaseByFilingNumber(globals.cmpNumber);

        await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });

        await payment.recordPaymentForCase();
        await payment.selectPaymentMode('Cash');
        await payment.submitPayment();
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 16 — Judge approves Production of Documents application
    // Source: UI Tests/tests/6-ResubmitCaseFSO/10-approveProductionDocApp.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('16 - Judge approves Production of Documents application', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judgeOrders = new JudgeOrdersPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judgeOrders.approveProductionOfDocuments(globals.cmpNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 17 — Citizen initiates Others application
    // Source: UI Tests/tests/6-ResubmitCaseFSO/11-initiateOthersApp.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('17 - Citizen initiates Others application', async ({ page }) => {
        test.setTimeout(600000);

        const login = new LoginPage(page, globals);
        const othersApp = new OthersApplicationPage(page, globals);

        await login.open();
        await login.loginWithMobileOtp(globals.citizenUsername);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await othersApp.initiateOthersApplication(globals.cmpNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 18 — Naya Mitra collects payment for Others application
    // Source: UI Tests/tests/6-ResubmitCaseFSO/12-othersAppPayment.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('18 - Naya Mitra collects payment for Others application', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const payment = new PaymentPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsNayaMitra();

        await payment.navigateToCollectPayments();
        await payment.searchCaseByFilingNumber(globals.cmpNumber);

        await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });

        await payment.recordPaymentForCase();
        await payment.selectPaymentMode('Cash');
        await payment.submitPayment();
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 19 — Judge approves Others application
    // Source: UI Tests/tests/6-ResubmitCaseFSO/13-approveOthersApp.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('19 - Judge approves Others application', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judgeOrders = new JudgeOrdersPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judgeOrders.approveOthersApplication(globals.cmpNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 20 — Citizen initiates Condonation of Delay application (1st round)
    // Source: UI Tests/tests/6-ResubmitCaseFSO/14-initiateCondOfDelayApp.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('20 - Citizen initiates Condonation of Delay application (1st round)', async ({ page }) => {
        test.setTimeout(600000);

        const login = new LoginPage(page, globals);
        const condDelay = new CondonationOfDelayPage(page, globals);

        await login.open();
        await login.loginWithMobileOtp(globals.citizenUsername);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await condDelay.initiateCondonationOfDelay(globals.cmpNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 21 — Naya Mitra collects payment for Condonation of Delay (1st round)
    // Source: UI Tests/tests/6-ResubmitCaseFSO/15-condOfDelayAppPayment.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('21 - Naya Mitra collects payment for Condonation of Delay (1st round)', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const payment = new PaymentPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsNayaMitra();

        await payment.navigateToCollectPayments();
        await payment.searchCaseByFilingNumber(globals.cmpNumber);

        await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });

        await payment.recordPaymentForCase();
        await payment.selectPaymentMode('Cash');
        await payment.submitPayment();
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 22 — Judge rejects Condonation of Delay application
    // Source: UI Tests/tests/6-ResubmitCaseFSO/16-rejectCondOfDelayApp.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('22 - Judge rejects Condonation of Delay application', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judgeOrders = new JudgeOrdersPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judgeOrders.rejectCondonationOfDelay(globals.cmpNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 23 — Citizen initiates Condonation of Delay application (2nd round)
    // Source: UI Tests/tests/6-ResubmitCaseFSO/17-initiateCondOfDelayApp.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('23 - Citizen initiates Condonation of Delay application (2nd round)', async ({ page }) => {
        test.setTimeout(600000);

        const login = new LoginPage(page, globals);
        const condDelay = new CondonationOfDelayPage(page, globals);

        await login.open();
        await login.loginWithMobileOtp(globals.citizenUsername);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await condDelay.initiateCondonationOfDelay(globals.cmpNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 24 — Naya Mitra collects payment for Condonation of Delay (2nd round)
    // Source: UI Tests/tests/6-ResubmitCaseFSO/18-condOfDelayAppPayment.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('24 - Naya Mitra collects payment for Condonation of Delay (2nd round)', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const payment = new PaymentPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsNayaMitra();

        await payment.navigateToCollectPayments();
        await payment.searchCaseByFilingNumber(globals.cmpNumber);

        await page.waitForSelector('a:has-text("Record Payment")', { state: 'visible', timeout: 30000 });

        await payment.recordPaymentForCase();
        await payment.selectPaymentMode('Cash');
        await payment.submitPayment();
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 25 — Judge approves Condonation of Delay application
    // Source: UI Tests/tests/6-ResubmitCaseFSO/19-approveCondOfDelayApp.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('25 - Judge approves Condonation of Delay application', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judgeOrders = new JudgeOrdersPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judgeOrders.approveCondonationOfDelay(globals.cmpNumber);
    });
});
