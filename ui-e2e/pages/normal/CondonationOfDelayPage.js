const path = require('path');
const fs = require('fs');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

/**
 * CondonationOfDelayPage
 *
 * Covers:
 *  - initiateCondonationOfDelay(cmpNumber)  — citizen raises a Condonation
 *    of Delay application, signs it, and dismisses the payment modal.
 *
 * Source ref:
 *   UI Tests/tests/6-ResubmitCaseFSO/14-initiateCondOfDelayApp.spec.js
 *   UI Tests/tests/6-ResubmitCaseFSO/17-initiateCondOfDelayApp.spec.js  (identical)
 */
class CondonationOfDelayPage extends BasePage {
    constructor(page, globals) {
        super(page, globals);
    }

    /**
     * Navigate to the case by cmpNumber, raise a Condonation of Delay application
     * (reason, prayer, document type = Others, document title, supporting file upload),
     * sign it, and close the payment modal.
     *
     * Prerequisites: citizen must already be logged in before calling this method.
     *
     * @param {string} cmpNumber - CMP number to navigate to
     */
    async initiateCondonationOfDelay(cmpNumber) {
        // Navigate to the case from the citizen home table
        await this.page.waitForTimeout(1000);
        await this.page.getByRole('cell', { name: cmpNumber }).click();
        await this.page.waitForTimeout(1000);

        console.log('[CondonationOfDelayPage] Initiating Condonation of Delay Application...');

        // Open filings panel
        await this.page.getByRole('button', { name: 'Make Filings' }).click();
        await this.page
            .locator('div')
            .filter({ hasText: /^Raise Application$/ })
            .click();

        // Select Application Type = Condonation of delay
        await this.page.locator('path').nth(4).click();
        await this.page
            .locator('#jk-dropdown-unique div')
            .filter({ hasText: 'Condonation of delay' })
            .click();

        // Fill Reason of Delay (rich editor)
        await this.page.locator('.ql-editor').first().click();
        await this.page.locator('.ql-editor').first().fill('reason of delay testing');

        // Fill Prayer text
        await this.page.getByRole('textbox', { name: 'Type here' }).click();
        await this.page.getByRole('textbox', { name: 'Type here' }).fill('prayer testing');

        await this.page.waitForTimeout(3000);

        // Select Document Type = Others
        await this.page
            .locator('form')
            .getByRole('img')
            .filter({ hasText: /^$/ })
            .nth(3)
            .click();
        await this.page
            .locator('#jk-dropdown-unique div')
            .filter({ hasText: 'Others' })
            .click();

        // Fill Document Title
        await this.page.locator('.citizen-card-input').first().click();
        await this.page.locator('.citizen-card-input').first().fill('document title testing');

        // Upload supporting document (cheque image as stand-in)
        const uploadDocPath = resolveFromUiE2E('documents', 'cheque.png');
        if (fs.existsSync(uploadDocPath)) {
            const fileInput = await this.page.$('input[type="file"]');
            if (fileInput) {
                await fileInput.setInputFiles(uploadDocPath);
            }
        } else {
            console.warn('[CondonationOfDelayPage] Upload document not found at:', uploadDocPath);
        }

        await this.page.waitForTimeout(6000);

        // Generate Application
        await this.page
            .getByRole('button')
            .filter({ hasText: 'Generate Application' })
            .click();

        // Add Signature — download PDF and re-upload
        console.log('[CondonationOfDelayPage] Adding Signature...');
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
        console.log(`[CondonationOfDelayPage] Application downloaded: ${projectDownloadPath}`);

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

        console.log('[CondonationOfDelayPage] Application submitted and payment modal dismissed.');
    }
}

module.exports = { CondonationOfDelayPage };
