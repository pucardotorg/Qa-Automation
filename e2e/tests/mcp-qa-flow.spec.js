// e2e/tests/mcp-qa-flow.spec.js
const { test, expect } = require('@playwright/test');
const { loginCitizen } = require('../../e2e/helpers/auth');
const { HomePage } = require('../../e2e/pages/home.page');
const { CasePage } = require('../../e2e/pages/case.page');
const { FilingFormPage } = require('../../e2e/pages/filingform.page');
const { SigningPage } = require('../../e2e/pages/signing.page');
const { PaymentPage } = require('../../e2e/pages/payment.page');
const path = require('path');

// Choose a reusable PDF for signed upload
const SIGNED_DOC = path.resolve(__dirname, '../../UI Tests/tests/1-Normal/Testimages/Affidavit.pdf');

// This flow expects BASE_URL to be set to: https://dristi-kerala-qa.pucar.org
// and MOBILE / OTP set accordingly in e2e/.env or environment variables.

test.describe('@mcp @qa MCP QA end-to-end filing + signing + payment', () => {
  test('Login -> latest case -> Make Filing -> fill forms -> sign -> pay -> Pending Review', async ({ page }) => {
    // Ensure we target the QA URL via baseURL
    if (!process.env.BASE_URL || !/kerala-qa\.pucar\.org/.test(process.env.BASE_URL)) {
      test.info().log('Warning: BASE_URL not set to QA. Set BASE_URL=https://dristi-kerala-qa.pucar.org in e2e/.env');
    }

    await loginCitizen(page);

    const home = new HomePage(page);
    // In case we land on a different home path, ensure we are on the home dashboard
    await home.goto();
    await expect(home.table).toBeVisible();

    // Filter by Stage=Cognizance and open latest case by Case ID
    await home.openCognizanceLatestCase();

    const casePage = new CasePage(page);
    // If Make Filing button is present on case detail, click it; otherwise we may already be in the filing wizard
    if (await casePage.makeFilingBtn.isVisible().catch(() => false)) {
      await casePage.startMakeFiling();
    }

    // Fill forms across multiple steps as required
    const form = new FilingFormPage(page);
    for (let i = 0; i < 6; i++) {
      // Fill required fields on the current step
      await form.fillRequiredFields();
      // Proceed to next step where applicable
      await form.proceed();
      // Small wait for UI to transition
      await page.waitForLoadState('networkidle');
    }

    // Signing step: download + upload signed PDF, then proceed
    const signing = new SigningPage(page);
    await signing.downloadRequiredDocument();
    await signing.uploadSignedDocument(SIGNED_DOC);
    await signing.proceed();

    // Payment: start and confirm
    const payment = new PaymentPage(page);
    await payment.startPayment();
    await payment.confirmPayment();
    await payment.waitForCompletion();

    // Post-payment: verify the case status becomes Pending Review
    // Navigate back to case page if redirected elsewhere
    // Try to locate a status label containing 'Pending Review'
    const statusLocator = page.getByText(/pending review/i).first();
    await expect(statusLocator).toBeVisible({ timeout: 60_000 });
  });
});
