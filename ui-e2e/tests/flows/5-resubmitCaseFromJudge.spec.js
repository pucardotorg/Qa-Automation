const { test } = require('@playwright/test');
const path = require('path');
const { LoginPage } = require('../../pages/common/LoginPage');
const { FileCasePage } = require('../../pages/normal/FileCasePage');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { PaymentPage } = require('../../pages/employee/PaymentPage');
const { FSOPage } = require('../../pages/employee/FSOPage');
const { JudgePage } = require('../../pages/employee/JudgePage');
const { JudgeOrdersPage } = require('../../pages/employee/JudgeOrdersPage');
const { ReSubmitCasePage } = require('../../pages/normal/ReSubmitCasePage');
const { NoticePaymentPage } = require('../../pages/normal/NoticePaymentPage');
const { CourtStaffPage } = require('../../pages/employee/CourtStaffPage');
const { JoinCasePage } = require('../../pages/normal/JoinCasePage');
const { ProfileCorrectionPage } = require('../../pages/normal/ProfileCorrectionPage');
const { loadGlobalVariables, saveGlobalVariables } = require('../../helpers/env');

/**
 * Judge Resubmit Case Flow — End to End
 *
 * Scenario source:
 *   UI Tests/tests/7-JudgeReSubmitCase/1-fileCase.spec.js
 *   UI Tests/tests/7-JudgeReSubmitCase/2-paymentNm.spec.js
 *   UI Tests/tests/7-JudgeReSubmitCase/3-fso.spec.js
 *   UI Tests/tests/7-JudgeReSubmitCase/4-returnCaseFromJudge.spec.js
 *   UI Tests/tests/7-JudgeReSubmitCase/4.1-reSubmitCaseFromAdv.spec.js
 *   UI Tests/tests/7-JudgeReSubmitCase/5-fso.spec.js
 *   UI Tests/tests/7-JudgeReSubmitCase/5.1-registerCase.spec.js
 *   UI Tests/tests/7-JudgeReSubmitCase/6-issueNotice.spec.js
 *   UI Tests/tests/7-JudgeReSubmitCase/7-NoticePayment.spec.js
 *   UI Tests/tests/7-JudgeReSubmitCase/8-CourtStaff.spec.js
 *   UI Tests/tests/7-JudgeReSubmitCase/8.1-joincase.spec.js
 *   UI Tests/tests/7-JudgeReSubmitCase/8.2-joinCasePayment.spec.js
 *
 * Flow:
 *   01 — Citizen files a case
 *   02 — Naya Mitra collects payment for filing (Stamp)
 *   03 — FSO scrutinizes and forwards case to Judge
 *   04 — Judge sends case back to litigant for correction
 *   05 — Citizen/Advocate resubmits the corrected case
 *   06 — FSO scrutinizes and forwards re-submitted case to Judge
 *   07 — Judge registers case, captures accessCode + cmpNumber
 *   08 — Judge issues notice to accused
 *   09 — Naya Mitra collects payment for notice (Stamp)
 *   10 — Court staff e-signs and sends the notice
 *   11 — Accused advocate joins the case
 *   12 — Naya Mitra collects payment for join case (Stamp)
 *
 * Global variables required:
 *   citizenUsername, litigantUsername, complainantAge,
 *   respondentFirstName, respondentPincode, respondentState,
 *   respondentDistrict, respondentCity, respondentAddress,
 *   chequeSignatoryName, payeeBankName, payeeBranchName, chequeNumber,
 *   issuanceDate, payerBankName, payerBranchName, ifsc, chequeAmount,
 *   policeStation, depositDate, reasonForReturnOfCheque,
 *   liabilityNature, dateOfDispatch, dateOfService, noOfAdvocates,
 *   accusedADV, accusedLitigant,
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

test.describe.serial('Judge Resubmit Case Flow - End to End', () => {
    let globals;

    test.beforeAll(() => {
        globals = loadGlobalVariables();
        const dateOfService = computeDateOfService(16);
        globals.dateOfService = dateOfService;
        saveGlobalVariables({ dateOfService });
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 01 — Citizen files a case
    // Source: UI Tests/tests/7-JudgeReSubmitCase/1-fileCase.spec.js
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
    // 02 — Naya Mitra collects payment for the filed case (Stamp)
    // Source: UI Tests/tests/7-JudgeReSubmitCase/2-paymentNm.spec.js
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
    // 03 — FSO scrutinizes and forwards case to Judge
    // Source: UI Tests/tests/7-JudgeReSubmitCase/3-fso.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('03 - FSO scrutinizes and forwards case to Judge', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const fso = new FSOPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsFSO();

        await fso.scrutinizeAndForward(globals.filingNumber, globals.fsoComments);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 04 — Judge sends case back to litigant for correction
    // Source: UI Tests/tests/7-JudgeReSubmitCase/4-returnCaseFromJudge.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('04 - Judge sends case back to litigant for correction', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judge.returnCaseToLitigant(globals.filingNumber, globals.judgeReturnReason);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 05 — Citizen/Advocate resubmits the corrected case
    // Source: UI Tests/tests/7-JudgeReSubmitCase/4.1-reSubmitCaseFromAdv.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('05 - Citizen resubmits the judge-returned case', async ({ page }) => {
        test.setTimeout(600000);

        const login = new LoginPage(page, globals);
        const reSubmit = new ReSubmitCasePage(page, globals);

        await login.open();
        await login.loginWithMobileOtp(globals.citizenUsername);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await reSubmit.resubmitCaseFromJudgeReturn(globals.filingNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 06 — FSO scrutinizes and forwards re-submitted case to Judge
    // Source: UI Tests/tests/7-JudgeReSubmitCase/5-fso.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('06 - FSO scrutinizes and forwards re-submitted case', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const fso = new FSOPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsFSO();

        await fso.scrutinizeAndForward(globals.filingNumber, globals.fsoComments);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 07 — Judge registers the case and captures accessCode + cmpNumber
    // Source: UI Tests/tests/7-JudgeReSubmitCase/5.1-registerCase.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('07 - Judge registers case and captures accessCode & cmpNumber', async ({ page }) => {
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
    // 08 — Judge issues notice to accused
    // Source: UI Tests/tests/7-JudgeReSubmitCase/6-issueNotice.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('08 - Judge issues notice to accused', async ({ page }) => {
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

    test('09 - Citizen selects notice address and payment method', async ({ page }) => {
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
    // 10 — Naya Mitra collects payment for notice (Stamp)
    // Source: UI Tests/tests/7-JudgeReSubmitCase/7-NoticePayment.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('10 - Naya Mitra collects payment for notice', async ({ page }) => {
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
    // 11 — Court staff e-signs and sends the notice
    // Source: UI Tests/tests/7-JudgeReSubmitCase/8-CourtStaff.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('11 - Court staff e-signs and sends notice', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const courtStaff = new CourtStaffPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsEmployee(globals.courtStaffUsername, globals.courtStaffPassword);
        await courtStaff.processESignAndSend(globals.cmpNumber);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 12 — Accused advocate joins the case
    // Source: UI Tests/tests/7-JudgeReSubmitCase/8.1-joincase.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('12 - Accused advocate joins the case', async ({ page }) => {
        test.setTimeout(600000);

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

    // ─────────────────────────────────────────────────────────────────────────────
    // 13 — Naya Mitra collects payment for join case (Stamp)
    // Source: UI Tests/tests/7-JudgeReSubmitCase/8.2-joinCasePayment.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('13 - Naya Mitra collects payment for join case', async ({ page }) => {
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
    // 14 — Citizen initiates a Profile Correction Application
    // Source: UI Tests/tests/7-JudgeReSubmitCase/9-ProfileEditingApp.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('14 - Citizen initiates profile correction application', async ({ page }) => {
        test.setTimeout(600000);

        const login = new LoginPage(page, globals);
        const profileCorrection = new ProfileCorrectionPage(page, globals);

        await login.open();
        await login.loginWithMobileOtp(globals.citizenUsername);

        await profileCorrection.initiateProfileCorrectionApplication(globals.cmpNumber, {
            age: globals.profileCorrectionAge,
            lastName: globals.profileCorrectionLastName,
            middleName: globals.profileCorrectionMiddleName,
            reason: globals.profileCorrectionReason,
        });
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 15 — Naya Mitra collects payment for the Profile Correction Application
    // Source: UI Tests/tests/7-JudgeReSubmitCase/10-profileEditingPayment.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('15 - Naya Mitra collects payment for profile correction', async ({ page }) => {
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
    // 16 — Judge approves the Profile Correction Application
    // Source: UI Tests/tests/7-JudgeReSubmitCase/11-approveProfileEditingApp.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('16 - Judge approves profile correction application', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judge.approveProfileCorrectionApplication(globals.cmpNumber);
    })

    // ─────────────────────────────────────────────────────────────────────────────
    // 17 — Judge submits a document (Affidavit) on the case
    // Source: UI Tests/tests/7-JudgeReSubmitCase/12-submitDocumentJudge.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('17 - Judge submits document on the case', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        // Resolve the cheque image path from the shared documents folder
        const chequeFilePath = path.resolve(
            __dirname,
            '../../documents/cheque.png'
        );

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judge.submitDocumentAsJudge(
            globals.cmpNumber,
            globals.judgeDocumentType,
            chequeFilePath,
            globals.judgeDocumentReason
        );
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 18 — Citizen initiates a Bail Bond Surety
    // Source: UI Tests/tests/7-JudgeReSubmitCase/13-initiateBailBondSurety.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
  /*  test('18 - Citizen initiates bail bond surety', async ({ page }) => {
        test.setTimeout(1200000);

        const login = new LoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        // Resolve the cheque image used as the surety document
        const chequeFilePath = path.resolve(
            __dirname,
            '../../documents/cheque.png'
        );

        await login.open();
        await login.loginWithMobileOtp(globals.citizenUsername);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        await judge.initiateBailBondSurety(globals.cmpNumber, chequeFilePath);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 19 — Judge approves the Bail Bond Surety
    // Source: UI Tests/tests/7-JudgeReSubmitCase/14-approveBailBondSurety.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('19 - Judge approves bail bond surety', async ({ page }) => {
        test.setTimeout(600000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judge.approveBailBondSurety(globals.cmpNumber);
    });*/
});
