const path = require('path');
const fs = require('fs');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

/**
 * OthersApplicationPage
 *
 * Covers:
 *  - initiateOthersApplication(cmpNumber)  — citizen raises an "Others"
 *    application, signs it, and dismisses the payment modal.
 *
 * Source ref:
 *   UI Tests/tests/6-ResubmitCaseFSO/11-initiateOthersApp.spec.js
 */
class OthersApplicationPage extends BasePage {
    constructor(page, globals) {
        super(page, globals);
    }

    /**
     * Navigate to the case by cmpNumber, raise an "Others" application
     * with title, prayer, and reason, sign it, and close the payment modal.
     *
     * Prerequisites: citizen must already be logged in before calling this method.
     *
     * @param {string} cmpNumber - CMP number to navigate to
     */
    async initiateOthersApplication(cmpNumber) {
        // Navigate to the case from the citizen home table
        await this.page.waitForTimeout(1000);
        await this.page.getByRole('cell', { name: cmpNumber }).click();
        await this.page.waitForTimeout(1000);

        console.log('[OthersApplicationPage] Initiating Others Application...');

        // Open filings panel
        await this.page.getByRole('button', { name: 'Make Filings' }).click();
        await this.page
            .locator('div')
            .filter({ hasText: /^Raise Application$/ })
            .click();

        // Select Application Type = Others
        await this.page.locator('path').nth(4).click();
        await this.page
            .locator('#jk-dropdown-unique div')
            .filter({ hasText: 'Others' })
            .click();

        // Fill Application Title
        await this.page.locator('input[name="applicationTitle"]').click();
        await this.page.locator('input[name="applicationTitle"]').fill('application title');

        // Fill Prayer text
        await this.page.getByRole('textbox', { name: 'Type here' }).click();
        await this.page.getByRole('textbox', { name: 'Type here' }).fill('prayer text');

        // Fill details in rich editor
        await this.page.locator('.ql-editor').click();
        await this.page.locator('.ql-editor').fill('details testing');

        // Generate Application
        await this.page
            .getByRole('button')
            .filter({ hasText: 'Generate Application' })
            .click();

        // Add Signature — download PDF and re-upload
        console.log('[OthersApplicationPage] Adding Signature...');
        await this.page.getByRole('button', { name: 'Add Signature' }).click();

        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.page.getByText('click here').click(),
        ]);

        const projectDownloadPath = path.join(
            resolveFromUiE2E('downloads'),
            await download.suggestedFilename()
        );
        fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
        await download.saveAs(projectDownloadPath);
        console.log(`[OthersApplicationPage] Application downloaded: ${projectDownloadPath}`);

        // Upload signed document
        await this.page
            .getByRole('button', { name: 'Upload document with Signature' })
            .click();
        await this.page.waitForTimeout(1000);
        await this.page.locator('input[type="file"]').nth(1).setInputFiles(projectDownloadPath);

        await this.page.waitForTimeout(3000);
        const submitSigBtn = this.page.getByRole('button', { name: 'Submit Signature' });
        await submitSigBtn.waitFor({ state: 'visible', timeout: 15000 });
        await submitSigBtn.click({ force: true });

        // Proceed and close payment modal
        await this.page.getByRole('button', { name: 'Proceed' }).click();
        await this.page
            .locator(
                '.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg'
            )
            .click();

        console.log('[OthersApplicationPage] Application submitted and payment modal dismissed.');
    }
}

module.exports = { OthersApplicationPage };
