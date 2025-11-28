// e2e/tests/filecase.spec.js
const { test, expect } = require('@playwright/test');
const { loginCitizen } = require('../../e2e/helpers/auth');
const { HomePage } = require('../../e2e/pages/home.page');
const { FileCasePage } = require('../../e2e/pages/filecase.page');

test.describe('@filing File Case workflow', () => {
  test('User can start filing a case and see filing steps', async ({ page }) => {
    await loginCitizen(page);

    const home = new HomePage(page);
    await home.openFileCase();

    const fileCase = new FileCasePage(page);
    await fileCase.proceedFromCaseType();

    // Checklist visible
    await expect(fileCase.downloadChecklistBtn).toBeVisible();
    await expect(fileCase.startFilingBtn).toBeVisible();

    await fileCase.startFiling();

    // Verify wizard steps are shown
    await expect(fileCase.stepLitigant).toBeVisible();
    await expect(fileCase.stepCaseSpecific).toBeVisible();
    await expect(fileCase.stepAdditional).toBeVisible();
    await expect(fileCase.stepPayment).toBeVisible();
    await expect(fileCase.stepReview).toBeVisible();

    // Verify first section visible
    await expect(fileCase.complainantDetailsHeader).toBeVisible();
  });
});
