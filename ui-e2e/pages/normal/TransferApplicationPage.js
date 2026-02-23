const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

class TransferApplicationPage extends BasePage {
    constructor(page, globals) {
        super(page, globals);
    }

    /**
     * Navigates to the citizen portal and logs in with mobile OTP.
     * @param {string} mobileNumber - defaults to globals.citizenUsername
     */
    async open() {
        await this.goto('ui/citizen/select-language');
    }

    /**
     * Initiates a Transfer Application for a given case number.
     * Handles: navigate → raise application → fill form → generate → sign → submit.
     * @param {string} caseNumber - the CMP number to navigate to
     */
    async initiateTransferApplication(caseNumber) {
        // Wait for the citizen cases list to finish rendering after login
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);

        // Find and click the case row — allow 30s for the table to populate
        console.log(`[TransferApplication] Looking for case cell: ${caseNumber}`);
        const caseCell = this.page.getByRole('cell', { name: caseNumber });
        await caseCell.waitFor({ state: 'visible', timeout: 30000 });
        await caseCell.click();
        await this.page.waitForTimeout(1000);

        // Open Raise Application panel
        console.log('Initiating Transfer Application...');
        await this.page.getByRole('button', { name: 'Make Filings' }).click();
        await this.page.locator('div').filter({ hasText: /^Raise Application$/ }).click();

        // Select Transfer from application type dropdown
        await this.page.locator('path').nth(4).click();
        await this.page.locator('#jk-dropdown-unique div').filter({ hasText: 'Transfer' }).click();

        // Fill transfer form fields
        await this.page.locator('input[name="requestedCourt"]').click();
        await this.page.locator('input[name="requestedCourt"]').fill('test');
        await this.page.locator('input[name="groundsForTransfer"]').click();
        await this.page.locator('input[name="groundsForTransfer"]').fill('test');
        await this.page.getByRole('textbox', { name: 'Type here' }).click();
        await this.page.getByRole('textbox', { name: 'Type here' }).fill('test');

        // Generate the application
        await this.page.getByRole('button').filter({ hasText: 'Generate Application' }).click();

        // Add Signature — download, save, re-upload
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
        console.log(`Transfer application downloaded: ${projectDownloadPath}`);

        // Upload signed document
        await this.page.getByRole('button', { name: 'Upload document with Signature' }).click();
        await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);
        await this.page.getByRole('button', { name: 'Submit Signature' }).click();

        // Proceed and dismiss the payment modal
        await this.page.getByRole('button', { name: 'Proceed' }).click();
        await this.page
            .locator('.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg')
            .click();
    }
}

module.exports = { TransferApplicationPage };
