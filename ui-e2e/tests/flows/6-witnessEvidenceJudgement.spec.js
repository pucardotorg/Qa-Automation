const { test } = require('@playwright/test');
const path = require('path');
const { LoginPage } = require('../../pages/common/LoginPage');
const { FileCasePage } = require('../../pages/normal/FileCasePage');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { PaymentPage } = require('../../pages/employee/PaymentPage');
const { FSOPage } = require('../../pages/employee/FSOPage');
const { JudgePage } = require('../../pages/employee/JudgePage');
const { JudgeOrdersPage } = require('../../pages/employee/JudgeOrdersPage');
const { loadGlobalVariables, saveGlobalVariables } = require('../../helpers/env');

/**
 * Witness Evidence & Judgement Flow — End to End
 *
 * Scenario source:
 *   UI Tests/tests/8-WitnessEvidence/1-fileCase.spec.js
 *   UI Tests/tests/8-WitnessEvidence/2-paymentNm.spec.js
 *   UI Tests/tests/8-WitnessEvidence/3-fso.spec.js
 *   UI Tests/tests/8-WitnessEvidence/4-registerCase.spec.js
 *   UI Tests/tests/8-WitnessEvidence/5-startHearing.spec.js
 *   UI Tests/tests/8-WitnessEvidence/6-witnessDeposition.spec.js
 *   UI Tests/tests/8-WitnessEvidence/7-endHearing.spec.js
 *   UI Tests/tests/8-WitnessEvidence/8-evidence.spec.js
 *
 * Flow:
 *   01 — Citizen files a case
 *   02 — Naya Mitra collects payment for filing (Stamp)
 *   03 — FSO scrutinizes and forwards case to Judge
 *   04 — Judge registers case (with hearing date), captures accessCode + cmpNumber
 *   05 — Judge starts the hearing
 *   06 — Judge takes witness deposition (submit + e-sign)
 *   07 — Judge signs the witness deposition (from Sign Witness Deposition)
 *   08 — Judge ends the hearing
 *   09 — Judge marks a document as evidence
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
 *   judgeUsername, judgePassword
 */

function computeDateOfService(daysBefore = 16) {
    const today = new Date();
    const d = new Date(today);
    d.setDate(today.getDate() - daysBefore);
    return d.toISOString().split('T')[0];
}

test.describe.serial('Witness Evidence & Judgement Flow - End to End', () => {
    let globals;

    test.beforeAll(() => {
        globals = loadGlobalVariables();
        const dateOfService = computeDateOfService(16);
        globals.dateOfService = dateOfService;
        saveGlobalVariables({ dateOfService });
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 01 — Citizen files a case
    // Source: UI Tests/tests/8-WitnessEvidence/1-fileCase.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('01 - Citizen files a case', async ({ page }) => {
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

    // ─────────────────────────────────────────────────────────────────────────────
    // 02 — Naya Mitra collects payment for the filed case (Stamp)
    // Source: UI Tests/tests/8-WitnessEvidence/2-paymentNm.spec.js
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
    // 03 — FSO scrutinizes and forwards case to Judge
    // Source: UI Tests/tests/8-WitnessEvidence/3-fso.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('03 - FSO scrutinizes and forwards case to Judge', async ({ page }) => {
        test.setTimeout(180000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const fso = new FSOPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsFSO();

        await fso.scrutinizeAndForward(globals.filingNumber, 'FSO comments');
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 04 — Judge registers case (hearing date variant) and captures accessCode + cmpNumber
    // Source: UI Tests/tests/8-WitnessEvidence/4-registerCase.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('04 - Judge registers case and captures accessCode & cmpNumber', async ({ page }) => {
        test.setTimeout(300000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        const { accessCode, cmpNumber } = await judge.registerCaseWithHearingDate(globals.filingNumber);

        saveGlobalVariables({ ...globals, accessCode, cmpNumber });
        console.log('Access Code:', accessCode);
        console.log('CMP Number:', cmpNumber);
        globals.accessCode = accessCode;
        globals.cmpNumber = cmpNumber;
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 05 — Judge starts the hearing
    // Source: UI Tests/tests/8-WitnessEvidence/5-startHearing.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('05 - Judge starts the hearing', async ({ page }) => {
        test.setTimeout(180000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judge.startHearing(globals.filingNumber);
        await page.close();
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 06 — Judge takes and signs witness deposition
    // Source: UI Tests/tests/8-WitnessEvidence/6-witnessDeposition.spec.js
    // (both take + sign are in one test in the source spec)
    // ─────────────────────────────────────────────────────────────────────────────
    test('06 - Judge takes and signs witness deposition', async ({ page }) => {
        test.setTimeout(300000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judge.takeWitnessDeposition(globals.filingNumber, 'Checking witness deposition');
        await judge.signWitnessDeposition(globals.filingNumber);
        await page.close();
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 07 — Judge ends the hearing
    // Source: UI Tests/tests/8-WitnessEvidence/7-endHearing.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('07 - Judge ends the hearing', async ({ page }) => {
        test.setTimeout(180000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judge.endHearing(globals.filingNumber);
        await page.close();
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 08 — Judge marks a document as evidence
    // Source: UI Tests/tests/8-WitnessEvidence/8-evidence.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('08 - Judge marks document as evidence', async ({ page }) => {
        test.setTimeout(180000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        await judge.markAsEvidence(globals.filingNumber, '1');
        await page.close();
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 09 — Judge issues Admit Case (Order for Taking Cognizance) and captures ST Number
    // Source: UI Tests/tests/8-WitnessEvidence/9-admitCase.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('09 - Judge issues Admit Case and captures ST Number', async ({ page }) => {
        test.setTimeout(180000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judgeOrders = new JudgeOrdersPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        // admitCase() navigates to cmpNumber, generates Order for Taking Cognizance,
        // signs/issues it, and returns the captured ST number
        const stNumber = await judgeOrders.admitCase(globals.cmpNumber);

        saveGlobalVariables({ ...globals, stNumber });
        console.log('ST Number:', stNumber);
        globals.stNumber = stNumber;
        await page.close();
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 10 — Judge issues Judgement Order (Guilty / Acquitted verdict)
    // Source: UI Tests/tests/8-WitnessEvidence/10-judgementOrder.spec.js
    // ─────────────────────────────────────────────────────────────────────────────
    test('10 - Judge issues Judgement Order', async ({ page }) => {
        test.setTimeout(180000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judgeOrders = new JudgeOrdersPage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();

        // Uses stNumber saved in test 09; Finding defaults to 'Acquitted'
        await judgeOrders.issueJudgementOrder(
            globals.stNumber,
            'Acquitted',
            '2 months of jail.',
            'Judgement order'
        );
        await page.close();
    });
});
