const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

/**
 * ReSubmitCasePage
 *
 * Covers:
 *  - resubmitCase(filingNumber)  — citizen searches for a returned case,
 *                                  makes the required correction, and re-submits
 *                                  with a fresh signed PDF.
 *
 * Source ref:
 *   UI Tests/tests/6-ResubmitCaseFSO/2.2-reSubmitCaseFromAdv.spec.js
 */
class ReSubmitCasePage extends BasePage {
    constructor(page, globals) {
        super(page, globals);
    }

    /**
     * Citizen searches for a case that was returned by the FSO, makes a minor
     * correction (payerBankName = 'Resubmit'), navigates through the wizard, and
     * re-signs & re-submits the case.
     *
     * Prerequisites: citizen must already be logged in before calling this method.
     *
     * @param {string} filingNumber - The filing number of the returned case
     */
    async resubmitCase(filingNumber) {
        console.log(`[ReSubmitCasePage] Searching for returned case: ${filingNumber}`);

        // Search for the case by filing number
        await this.page.locator('input[name="caseSearchText"]').click();
        await this.page.locator('input[name="caseSearchText"]').fill(filingNumber);
        await this.page.getByRole('button').filter({ hasText: 'Search' }).click();

        // Open the returned case
        await this.page.getByRole('cell', { name: filingNumber }).click();
        console.log('[ReSubmitCasePage] Opened returned case for correction.');

        // Make the required correction (payerBankName = 'Resubmit' signals re-submission)
        await this.page.locator('input[name="payerBankName"]').click();
        await this.page.locator('input[name="payerBankName"]').fill('Resubmit');

        // Navigate through the wizard steps
        await this.page.getByRole('button').filter({ hasText: 'Next' }).click();

        // Close/dismiss any side panel
        await this.page.locator('.header-end > div > svg').click();

        // Advance to the signature step
        await this.page.getByRole('button').filter({ hasText: 'Next' }).click();

        // Consent checkbox
        await this.page.getByRole('checkbox').check();

        // Upload Signed copy — triggers the download modal
        await this.page.getByRole('button', { name: 'Upload Signed copy' }).click();

        // Download the PDF
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.page.getByRole('button', { name: 'Download PDF' }).click(),
        ]);

        const projectDownloadPath = path.join(
            resolveFromUiE2E('downloads'),
            await download.suggestedFilename()
        );
        fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
        await download.saveAs(projectDownloadPath);
        console.log(`[ReSubmitCasePage] Signed PDF downloaded: ${projectDownloadPath}`);

        // Upload the signed PDF
        await this.page.getByRole('button', { name: 'Upload Signed PDF' }).click();
        await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

        // Wait for file upload processing
        await this.page.waitForTimeout(12000);

        // Submit Signature
        await this.page.getByRole('button', { name: 'Submit Signature' }).click();
        console.log('[ReSubmitCasePage] Signature submitted.');

        // Submit the re-submitted case
        await this.page.getByRole('button').filter({ hasText: 'Submit Case' }).click();
        console.log('[ReSubmitCasePage] Case re-submitted successfully.');

        await this.page.waitForLoadState('networkidle');
    }
}

module.exports = { ReSubmitCasePage };
