const path = require('path');
const fs = require('fs');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

/**
 * ProductionOfDocumentsPage
 *
 * Covers:
 *  - initiateProductionOfDocuments(cmpNumber)  — citizen raises a
 *    Production of Documents application, signs it, and dismisses
 *    the payment modal.
 *
 * Source ref:
 *   UI Tests/tests/6-ResubmitCaseFSO/8-initiateProductionDocApp.spec.js
 */
class ProductionOfDocumentsPage extends BasePage {
    constructor(page, globals) {
        super(page, globals);
    }

    /**
     * Navigate to the case by cmpNumber, raise a Production of Documents
     * application (type = Others, with title, uploaded doc, prayer, and reason),
     * sign it, and close the payment modal.
     *
     * Prerequisites: citizen must already be logged in before calling this method.
     *
     * @param {string} cmpNumber - CMP number to navigate to (e.g. 'CMP/145/2026')
     */
    async initiateProductionOfDocuments(cmpNumber) {
        // Navigate to the case from the citizen home table
        await this.page.waitForTimeout(1000);
        await this.page.getByRole('cell', { name: cmpNumber }).click();
        await this.page.waitForTimeout(1000);

        console.log('Initiating Production of Documents Application...');

        // Open filings panel
        await this.page.getByRole('button', { name: 'Make Filings' }).click();
        await this.page.getByText('Raise Application').click();

        // Select Application Type = Production of Documents
        await this.page.locator('path').nth(4).click();
        await this.page
            .locator('#jk-dropdown-unique div')
            .filter({ hasText: 'Production of Documents' })
            .click();

        // Select Document Type = Others
        await this.page
            .locator('div')
            .filter({ hasText: /^Document Type$/ })
            .getByRole('img')
            .click();
        await this.page
            .locator('#jk-dropdown-unique div')
            .filter({ hasText: 'Others' })
            .click();

        // Fill Document Title
        await this.page
            .locator('div')
            .filter({ hasText: /^Document Title$/ })
            .getByRole('textbox')
            .click();
        await this.page
            .locator('div')
            .filter({ hasText: /^Document Title$/ })
            .getByRole('textbox')
            .fill('title text');

        // Upload supporting document (cheque image as a stand-in)
        const uploadDocPath = resolveFromUiE2E('documents', 'cheque.png');
        if (fs.existsSync(uploadDocPath)) {
            await this.page.locator('input[type="file"]').first().setInputFiles(uploadDocPath);
        } else {
            console.warn('[ProductionOfDocumentsPage] Upload document not found at:', uploadDocPath);
        }

        // Fill Prayer text
        await this.page.getByRole('textbox', { name: 'Type here' }).click();
        await this.page.getByRole('textbox', { name: 'Type here' }).fill('test prayer');

        // Fill Reason for Application (rich editor)
        await this.page.locator('.ql-editor').first().click();
        await this.page.locator('.ql-editor').first().fill('reason for application test automation.');

        await this.page.waitForTimeout(3000);

        // Generate Application
        await this.page
            .getByRole('button')
            .filter({ hasText: 'Generate Application' })
            .click();

        // Add Signature — download PDF and re-upload
        console.log('Adding Signature...');
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
        console.log(`Production of Documents application downloaded: ${projectDownloadPath}`);

        // Upload signed document (use .last() as a second file input appears after signature flow)
        await this.page
            .getByRole('button', { name: 'Upload document with Signature' })
            .click();
        await this.page.waitForTimeout(1000);
        await this.page.locator('input[type="file"]').last().setInputFiles(projectDownloadPath);

        // Wait for Submit Signature to become enabled
        await this.page.waitForTimeout(3000);
        const submitSigBtn = this.page.getByRole('button', { name: 'Submit Signature' });
        await submitSigBtn.waitFor({ state: 'visible', timeout: 15000 });
        await this.page
            .waitForFunction(
                () =>
                    !document.querySelector(
                        'button[name="Submit Signature"], button:has-text("Submit Signature")'
                    )?.disabled,
                { timeout: 15000 }
            )
            .catch(() =>
                console.log('[ProductionOfDocuments] Submit Signature still disabled, force clicking')
            );
        await submitSigBtn.click({ force: true });

        // Proceed and close payment modal
        await this.page.getByRole('button', { name: 'Proceed' }).click();
        await this.page
            .locator(
                '.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg'
            )
            .click();

        console.log('[ProductionOfDocumentsPage] Application submitted and payment modal dismissed.');
    }
}

module.exports = { ProductionOfDocumentsPage };
