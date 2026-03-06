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
const { SettlementApplicationPage } = require('../../pages/normal/SettlementApplicationPage');
const { TransferApplicationPage } = require('../../pages/normal/TransferApplicationPage');
const { ProductionOfDocumentsPage } = require('../../pages/normal/ProductionOfDocumentsPage');
const { OthersApplicationPage } = require('../../pages/normal/OthersApplicationPage');
const { CondonationOfDelayPage } = require('../../pages/normal/CondonationOfDelayPage');
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
        const dateOfService = computeDateOfService(16);
        globals.dateOfService = dateOfService;
        saveGlobalVariables({ dateOfService });
    });

    test('17 - Citizen initiates Others application', async ({ page }) => {
        test.setTimeout(180000);

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
        test.setTimeout(180000);

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
        test.setTimeout(180000);

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
        test.setTimeout(180000);

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
        test.setTimeout(180000);

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
        test.setTimeout(180000);

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
        test.setTimeout(180000);

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
        test.setTimeout(180000);

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
        test.setTimeout(180000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judgeOrders = new JudgeOrdersPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judgeOrders.approveCondonationOfDelay(globals.cmpNumber);
    });
});