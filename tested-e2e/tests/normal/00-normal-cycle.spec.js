const { test, expect } = require('@playwright/test');
const { loadGlobalVariables, saveGlobalVariables } = require('../../helpers/env');
const { LoginPage } = require('../../pages/common/LoginPage');
const { FileCasePage } = require('../../pages/normal/FileCasePage');
const { EmployeeLoginPage } = require('../../pages/common/EmployeeLoginPage');
const { PaymentPage } = require('../../pages/common/PaymentPage');
const { FSOPage } = require('../../pages/normal/FSOPage');
const { RegisterCasePage } = require('../../pages/normal/RegisterCasePage');
const { NoticePage } = require('../../pages/normal/NoticePage');
const { CourtStaffPage } = require('../../pages/normal/CourtStaffPage');
const { AdmitCasePage } = require('../../pages/normal/AdmitCasePage');
const { SummonsPage } = require('../../pages/normal/SummonsPage');
const { ProclamationPage } = require('../../pages/normal/ProclamationPage');
const { AttachmentPage } = require('../../pages/normal/AttachmentPage');
const { WarrantPage } = require('../../pages/normal/WarrantPage');

function computeDateOfService(daysBefore = 16) {
  const today = new Date();
  const d = new Date(today);
  d.setDate(today.getDate() - daysBefore);
  return d.toISOString().split('T')[0];
}

test.describe('Normal Flow - Full End-to-End Cycle', () => {
  test('Runs 01 through 16 sequentially', async ({ page }) => {
    test.setTimeout(60 * 60 * 1000); // 60 minutes for full cycle

    // Load globals and set dateOfService
    let globals = loadGlobalVariables();
    globals.dateOfService = computeDateOfService(16);
    saveGlobalVariables({ dateOfService: globals.dateOfService });

    // 01 - Citizen files case
    const citizenLogin = new LoginPage(page, globals);
    await citizenLogin.open();
    await citizenLogin.loginWithMobileOtp(globals.citizenUsername);

    const fileCase = new FileCasePage(page, globals);
    await fileCase.startFiling();
    await fileCase.fillComplainantDetails();
    await fileCase.fillAccusedDetails();
    await fileCase.fillChequeDetails();
    await fileCase.fillDebtLiability();
    await fileCase.fillLegalDemandNotice();
    await fileCase.skipWitnessAndAdvance();
    await fileCase.fillComplaintAndDocs();
    await fileCase.fillAdvocateDetails();
    await fileCase.reviewSignAndSubmit();

    const filingNumber = await fileCase.captureFilingNumber();
    expect(filingNumber).toBeTruthy();
    saveGlobalVariables({ filingNumber });

    // 02 - NayaMitra collects offline payment (filing)
    globals = loadGlobalVariables();
    const empLogin = new EmployeeLoginPage(page, globals);
    await empLogin.openLogin();
    await empLogin.login(globals.nayamitraUsername, globals.nayamitraPassword);

    const payment = new PaymentPage(page, globals);
    await payment.collectOfflinePayment(globals.filingNumber);

    // 03 - FSO scrutinise and forward
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.fsoUsername, globals.fsoPassword);

    const fso = new FSOPage(page, globals);
    await fso.openScrutiniseCases();
    await fso.searchFilingAndOpen();
    await fso.forwardToJudgeWithComment('FSO comments');

    // 04 - Judge registers case (captures accessCode, cmpNumber)
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const register = new RegisterCasePage(page, globals);
    await register.goToAllCases();
    await register.searchByFilingNumberAndOpen();
    await register.registerCaseScheduleAndGenerateOrder();

    const { accessCode, cmpNumber } = await register.captureAccessAndCmpNumbers();
    expect(accessCode).toBeTruthy();
    expect(cmpNumber).toBeTruthy();

    // 05 - Judge issues Notice
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const notice = new NoticePage(page, globals);
    await notice.goToAllCases();
    await notice.openByCmpNumber();
    await notice.generateNoticeOrder();

    // 06 - NayaMitra payment for Notice (cmpNumber)
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.nayamitraUsername, globals.nayamitraPassword);

    await payment.collectOfflinePayment(globals.cmpNumber);

    // 07 - Court Staff sign and dispatch
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.courtStaffUsername, globals.courtStaffPassword);

    const staff = new CourtStaffPage(page, globals);
    await staff.openSignProcess();
    await staff.searchByCmpNumber(globals.cmpNumber);
    await staff.openFirstVs();
    await staff.eSignDownloadUpload();
    await staff.verifyInSentAndUpdateStatus(globals.cmpNumber);

    // 08 - Judge admit case to get ST number
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const admit = new AdmitCasePage(page, globals);
    await admit.goToAllCases();
    await admit.openByCmpNumber();
    await admit.generateAdmitOrder();

    const stNumber = await admit.captureSTNumber();
    expect(stNumber).toBeTruthy();

    // 09 - Judge issues Summons
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const summons = new SummonsPage(page, globals);
    await summons.goToAllCases();
    await summons.openByStNumber();
    await summons.generateSummons();

    // 10 - NayaMitra payment for Summons (stNumber)
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.nayamitraUsername, globals.nayamitraPassword);
    await payment.collectOfflinePayment(globals.stNumber);

    // 11 - Judge issues Proclamation
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const proclamation = new ProclamationPage(page, globals);
    await proclamation.goToAllCases();
    await proclamation.openByStNumber();
    await proclamation.generateProclamation();

    // 12 - NayaMitra payment for Proclamation (stNumber)
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.nayamitraUsername, globals.nayamitraPassword);
    await payment.collectOfflinePayment(globals.stNumber);

    // 13 - Judge issues Attachment
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const attachment = new AttachmentPage(page, globals);
    await attachment.goToAllCases();
    await attachment.openByStNumber();
    await attachment.generateAttachment();

    // 14 - NayaMitra payment for Attachment (stNumber)
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.nayamitraUsername, globals.nayamitraPassword);
    await payment.collectOfflinePayment(globals.stNumber);

    // 15 - Judge issues Warrant
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.judgeUsername, globals.judgePassword);

    const warrant = new WarrantPage(page, globals);
    await warrant.goToAllCases();
    await warrant.openByStNumber();
    await warrant.generateWarrant();

    // 16 - NayaMitra payment for Warrant (stNumber)
    globals = loadGlobalVariables();
    await empLogin.openLogin();
    await empLogin.login(globals.nayamitraUsername, globals.nayamitraPassword);
    await payment.collectOfflinePayment(globals.stNumber);

    // Final assertion that we have stNumber persisted
    const finalGlobals = loadGlobalVariables();
    expect(finalGlobals.stNumber).toBeTruthy();
  });
});
