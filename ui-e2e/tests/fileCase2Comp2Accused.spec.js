const { test } = require('@playwright/test');
const { loadGlobalVariables, saveGlobalVariables } = require('../helpers/env');
const { LoginPage } = require('../pages/common/LoginPage');
const { FileCasePage } = require('../pages/normal/FileCasePage');

/**
 * Scenario: File a case with 2 Complainants and 1 Accused (Entity — One-person company)
 *
 * Source reference: UI Tests/tests/2-TwoComp/1-fileCase2Comp1AccEntity.spec.js
 *
 * Global variables required:
 *   citizenUsername, litigantUsername, litigantUsername2, complainantAge,
 *   respondentCompanyName, respondentFirstName, respondentPincode, respondentState,
 *   respondentDistrict, respondentCity, respondentAddress,
 *   chequeSignatoryName, payeeBankName, payeeBranchName, chequeNumber, issuanceDate,
 *   payerBankName, payerBranchName, ifsc, chequeAmount, policeStation,
 *   depositDate, reasonForReturnOfCheque,
 *   liabilityNature, dateOfDispatch, dateOfService
 */

function computeDateOfService(daysBefore = 16) {
    const today = new Date();
    const d = new Date(today);
    d.setDate(today.getDate() - daysBefore);
    return d.toISOString().split('T')[0];
}

test(
    'File a case – 2 Complainants, 1 Accused (Entity)',
    async ({ page }) => {
        test.setTimeout(180000);

        // Load & update globals with computed date of service
        let globals = loadGlobalVariables();
        const dateOfService = computeDateOfService(16);
        globals = saveGlobalVariables({ dateOfService });

        const login = new LoginPage(page, globals);
        const fileCase = new FileCasePage(page, globals);

        // 1. Login as citizen
        await login.open();
        await login.loginWithMobileOtp(globals.citizenUsername);

        // 2. Start filing
        await fileCase.startFiling();

        // 3. Fill 2 complainants (both Individual type, separate mobile OTP verification)
        await fileCase.fillTwoComplainantDetails();

        // 4. Fill accused details as Entity (One-person company)
        await fileCase.fillAccusedAsEntityDetails();

        // 5. Cheque details
        await fileCase.fillChequeDetails();

        // 6. Debt / liability details
        await fileCase.fillDebtLiability();

        // 7. Legal Demand Notice details
        await fileCase.fillLegalDemandNotice();

        // 8. Skip witness step and advance (clicks Continue twice)
        await fileCase.skipWitnessAndAdvance();

        // 9. Complaint and supporting documents
        await fileCase.fillComplaintAndDocs();

        // 10. Advocate details (2 complainants → 2 advocate sections)
        await fileCase.fillAdvocateDetails();

        // 11. Process delivery (courier services – just clicks Continue)
        await fileCase.processdelivery();

        // 12. Review, sign, and submit case
        await fileCase.processdelivery1();

        // 13. Capture and persist the filing number
        const filingNumber = await fileCase.captureFilingNumber();
        saveGlobalVariables({ filingNumber });
        console.log('Filing Number:', filingNumber);
    }
);
