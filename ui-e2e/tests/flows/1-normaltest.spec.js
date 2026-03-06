const { test } = require('@playwright/test');
const { LoginPage } = require('../../pages/common/LoginPage');
const { FileCasePage } = require('../../pages/normal/FileCasePage');
const { TransferApplicationPage } = require('../../pages/normal/TransferApplicationPage');
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

/**
 * Full Case Flow — 2 Complainants (litigantUsername3 + litigantUsername2) + 2 Advocates
 *
 * Scenario source: UI Tests/tests/3-TwoCompTwoAdv/1-fileCase2Comp2Adv.spec.js
 *
 * Global variables required:
 *   citizenUsername, litigantUsername3, litigantUsername2, complainantAge,
 *   respondentFirstName, respondentPincode, respondentState, respondentDistrict,
 *   respondentCity, respondentAddress,
 *   chequeSignatoryName, payeeBankName, payeeBranchName, chequeNumber, issuanceDate,
 *   payerBankName, payerBranchName, ifsc, chequeAmount, policeStation,
 *   depositDate, reasonForReturnOfCheque,
 *   liabilityNature, dateOfDispatch, dateOfService,
 *   noOfAdvocates, advocateBarId, advocateName,
 *   courtStaffUsername, courtStaffPassword,
 *   accusedADV, accusedLitigant, respondentFirstName
 */

function computeDateOfService(daysBefore = 16) {
    const today = new Date();
    const d = new Date(today);
    d.setDate(today.getDate() - daysBefore);
    return d.toISOString().split('T')[0];
}

test.describe.serial('2-Complainant 2-Advocate Full Case Flow - End to End', () => {
    let globals;

    test.beforeAll(() => {
        globals = loadGlobalVariables();
        const dateOfService = computeDateOfService(16);
        globals.dateOfService = dateOfService;
        saveGlobalVariables({ dateOfService });
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // 01 — File a case: 2 Complainants (litigantUsername3 + litigantUsername2) +
    //      1 Accused (Individual) + 2 Advocates (one per complainant)
    // ─────────────────────────────────────────────────────────────────────────────

    // ─── Transfer Application Scenarios ────────────────────────────────
    // Source: UI Tests/tests/3-TwoCompTwoAdv/8-initiateTransferApplication.spec.js
    //         UI Tests/tests/3-TwoCompTwoAdv/8.1-transferApplicationPayment.spec.js
    //         UI Tests/tests/3-TwoCompTwoAdv/8.2-rejectTransferJudge.spec.js
    // ─────────────────────────────────────────────────────────────────



    test('23 - Accused joins case as Party in Person', async ({ page }) => {
        test.setTimeout(180000);

        const joinCase = new JoinCasePage(page, globals);
        await joinCase.open();
        await joinCase.joinAsAccused(
            globals.filingNumber,
            globals.accessCode,
            globals.respondentFirstName
        );
    });

    test('24 - Accused advocate joins replacing PiP (with judge approval + payment)', async ({ page }) => {
        test.setTimeout(180000);

        const joinCase = new JoinCasePage(page, globals);
        await joinCase.open();
        await joinCase.joinAsAdvocatePip(
            globals.filingNumber,
            globals.accessCode,
            globals.noOfAdvocates
        );
    });
    test('25 - Naya Mitra collects payment for join case (advocate PiP)', async ({ page }) => {
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

    test('26 - Judge reviews and approves advocate replacement request (first time)', async ({ page }) => {
        test.setTimeout(180000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();
        await judge.reviewAdvReplacement(globals.cmpNumber);
    });

    test('27 - Second advocate adds to case without payment (judge approval)', async ({ page }) => {
        test.setTimeout(180000);

        const joinCase = new JoinCasePage(page, globals);
        await joinCase.open();
        await joinCase.joinAsAdvocateAddWithoutPayment(
            globals.filingNumber,
            globals.accessCode
        );
    });

    test('28 - Third advocate replaces existing advocate without payment (judge approval)', async ({ page }) => {
        test.setTimeout(180000);

        const joinCase = new JoinCasePage(page, globals);
        await joinCase.open();
        await joinCase.joinAsAdvocateReplaceWithoutPayment(
            globals.filingNumber,
            globals.accessCode
        );
    });

    test('29 - Judge reviews and approves advocate replacement request (second time)', async ({ page }) => {
        test.setTimeout(180000);

        const employeeLogin = new EmployeeLoginPage(page, globals);
        const judge = new JudgePage(page, globals);

        await employeeLogin.open();
        await employeeLogin.loginAsJudge();
        await judge.reviewAdvReplacement(globals.cmpNumber);
    });
});
