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

test.describe.serial('Miscellaneous Process', () => {
    let globals;

    test.beforeAll(() => {
        globals = loadGlobalVariables();
        const dateOfService = computeDateOfService(16);
        globals.dateOfService = dateOfService;
        saveGlobalVariables({ dateOfService });
    });

    test('01 - File a case successfully (1 Complainant + 1 Advocate)', async ({ page }) => {
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
        // 1 advocate for the single complainant
        await fileCase.fillAdvocateDetails();
        await fileCase.processdelivery();
        await fileCase.processdelivery1();

        const filingNumber = await fileCase.captureFilingNumber();
        saveGlobalVariables({ filingNumber });
        console.log('Filing Number:', filingNumber);
        globals.filingNumber = filingNumber;
    });


    test('02 - Naya Mitra collects payment for filing', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const payment = new PaymentPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsNayaMitra();
        await payment.collectOfflinePayment(globals.filingNumber);
    });

    test('03 - FSO scrutinizes and forwards to judge', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const fso = new FSOPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsFSO();
        await fso.scrutinizeAndForward(globals.filingNumber, globals.fsoComments);
    });

    test('04 - Judge registers case and issues order', async ({ page }) => {
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
    // 05 — Court staff creates a Miscellaneous Process template
    // Source: UI Tests/tests/10-miscProcess/05-templates.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('05 - Court staff creates Miscellaneous Process template', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const courtStaff = new CourtStaffPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsEmployee(globals.courtStaffUsername, globals.courtStaffPassword);

        await courtStaff.createMiscProcessTemplate(
            'Testing Automation',
            'Police',
            'order text',
            'process text',
            'cover letter text'
        );
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 06 — Judge issues a Miscellaneous Process order on the case
    // Source: UI Tests/tests/10-miscProcess/06-showCauseNoticeOrder.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('06 - Judge issues Miscellaneous Process order', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judgeOrders = new JudgeOrdersPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judgeOrders.issueMiscProcessOrder(globals.cmpNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 07 — Judge/Court staff signs the Miscellaneous Process and updates delivery status
    // Source: UI Tests/tests/10-miscProcess/07-courtStaff.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('07 - Court staff signs Miscellaneous Process and updates status', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const courtStaff = new CourtStaffPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await courtStaff.signMiscProcess(globals.cmpNumber);
    });
});