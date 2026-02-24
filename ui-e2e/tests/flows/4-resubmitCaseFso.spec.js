const { test } = require('@playwright/test');
const { LoginPage } = require('../../pages/common/LoginPage');
const { FileCasePage } = require('../../pages/normal/FileCasePage');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { PaymentPage } = require('../../pages/employee/PaymentPage');
const { FSOPage } = require('../../pages/employee/FSOPage');
const { ReSubmitCasePage } = require('../../pages/normal/ReSubmitCasePage');
const { JudgePage } = require('../../pages/employee/JudgePage');
const { JudgeOrdersPage } = require('../../pages/employee/JudgeOrdersPage');
const { CourtStaffPage } = require('../../pages/employee/CourtStaffPage');
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
        test.setTimeout(300000);

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
        saveGlobalVariables({ ...globals, filingNumber });
        console.log('Filing Number:', filingNumber);
        globals.filingNumber = filingNumber;
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 02 — Naya Mitra collects payment for the filed case
    // Source: UI Tests/tests/6-ResubmitCaseFSO/2-paymentNm.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('02 - Naya Mitra collects payment for filing', async ({ page }) => {
        test.setTimeout(180000);

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
        test.setTimeout(180000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const fso = new FSOPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsFSO();

        await fso.returnCaseToLitigant(globals.filingNumber, 'DEFECT1');
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 04 — Citizen re-submits the corrected case
    // Source: UI Tests/tests/6-ResubmitCaseFSO/2.2-reSubmitCaseFromAdv.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('04 - Citizen re-submits the corrected case', async ({ page }) => {
        test.setTimeout(180000);

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
        test.setTimeout(180000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const fso = new FSOPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsFSO();

        await fso.scrutinizeAndForward(globals.filingNumber, 'FSO comments');
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 06 — Judge registers the case and captures accessCode + cmpNumber
    // Source: UI Tests/tests/6-ResubmitCaseFSO/4-registerCase.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('06 - Judge registers case and captures accessCode & cmpNumber', async ({ page }) => {
        test.setTimeout(300000);

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

    // ─────────────────────────────────────────────────────────────────────────────
    // 07 — Judge issues notice to accused
    // Source: UI Tests/tests/6-ResubmitCaseFSO/5-issueNotice.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('07 - Judge issues notice to accused', async ({ page }) => {
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

    // ─────────────────────────────────────────────────────────────────────────────
    // 08 — Naya Mitra collects payment for notice
    // Source: UI Tests/tests/6-ResubmitCaseFSO/6-NoticePayment.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('08 - Naya Mitra collects payment for notice', async ({ page }) => {
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

    // ─────────────────────────────────────────────────────────────────────────────
    // 09 — Court staff e-signs and sends the notice
    // Source: UI Tests/tests/6-ResubmitCaseFSO/7-CourtStaff.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('09 - Court staff e-signs and sends notice', async ({ page }) => {
        test.setTimeout(180000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const courtStaff = new CourtStaffPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsEmployee(globals.courtStaffUsername, globals.courtStaffPassword);
        await courtStaff.processESignAndSend(globals.cmpNumber);
    });
});
