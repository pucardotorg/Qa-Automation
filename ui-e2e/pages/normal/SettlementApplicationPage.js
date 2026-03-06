const path = require('path');
const fs = require('fs');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

/**
 * SettlementApplicationPage
 *
 * Covers:
 *  - initiateSettlementApplication(cmpNumber)  — citizen raises Settlement application
 *  - approveSettlementApplication(cmpNumber)   — judge approves and issues order
 *
 * Source refs:
 *   UI Tests/tests/3-TwoCompTwoAdv/9-initiateSettlementApplication.spec.js
 *   UI Tests/tests/3-TwoCompTwoAdv/9.2-approveSettlementJudge.spec.js
 */
class SettlementApplicationPage extends BasePage {
    constructor(page, globals) {
        super(page, globals);
    }

    // ───────────────────────────────────────────────────────────────────────────
    // CITIZEN: Raise Settlement Application
    // ───────────────────────────────────────────────────────────────────────────

    /**
     * Navigate to case by cmpNumber, raise a Settlement application,
     * sign it, and dismiss the payment modal.
     * @param {string} cmpNumber  e.g. 'CMP/137/2026'
     */
    async initiateSettlementApplication(cmpNumber) {
        // Land on the case from the citizen home table
        await this.page.waitForTimeout(2000);
        await this.page.getByRole('cell', { name: cmpNumber }).click();
        await this.page.waitForTimeout(1000);

        console.log('Initiating Settlement Application...');
        await this.page.getByRole('button', { name: 'Make Filings' }).click();
        await this.page.getByText('Raise Application').click();

        // Select Application Type = Settlement
        await this.page
            .locator('div')
            .filter({ hasText: /^Application Type\*$/ })
            .getByRole('img')
            .click();
        await this.page.waitForTimeout(500);
        await this.page.getByText('Settlement').click();

        // Fill in the reason/details textbox
        await this.page.getByRole('textbox', { name: 'Type here' }).click();
        await this.page.getByRole('textbox', { name: 'Type here' }).fill('test');

        // Generate application
        await this.page.getByRole('button').filter({ hasText: 'Generate Application' }).click();
        await this.page.waitForTimeout(2000);

        // Add Signature — download PDF and re-upload
        console.log('Adding Signature...');
        await this.page.getByRole('button', { name: 'Add Signature' }).click();

        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.page.getByText('click here').click(),
        ]);

        const projectDownloadPath = path.join(resolveFromUiE2E('downloads'), await download.suggestedFilename());
        fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
        await download.saveAs(projectDownloadPath);
        console.log(`Settlement application downloaded: ${projectDownloadPath}`);

        // Upload signed document
        await this.page.getByRole('button', { name: 'Upload document with Signature' }).click();
        await this.page.waitForTimeout(1000);
        await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

        // Wait for Submit Signature to become enabled after file processing
        await this.page.waitForTimeout(3000);
        const submitSigBtn = this.page.getByRole('button', { name: 'Submit Signature' });
        await submitSigBtn.waitFor({ state: 'visible', timeout: 15000 });
        await this.page.waitForFunction(
            () => !document.querySelector('button[name="Submit Signature"], button:has-text("Submit Signature")')?.disabled,
            { timeout: 15000 }
        ).catch(() => console.log('[SettlementApplication] Submit Signature still disabled, force clicking'));
        await submitSigBtn.click({ force: true });

        // Proceed and close payment modal
        await this.page.getByRole('button', { name: 'Proceed' }).click();
        await this.page
            .locator('.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg')
            .click();
    }

    // ───────────────────────────────────────────────────────────────────────────
    // JUDGE: Approve Settlement Application and Issue Order
    // ───────────────────────────────────────────────────────────────────────────

    /**
     * Open case by cmpNumber from All Cases, approve the settlement application,
     * fill settlement fields, preview/sign PDF, upload, and issue order.
     * @param {string} cmpNumber  e.g. 'CMP/137/2026'
     */
    async approveSettlementApplication(cmpNumber) {
        await this.page.getByRole('link', { name: 'All Cases' }).click();
        await this.page.waitForTimeout(1000);
        await this.page.getByRole('cell', { name: cmpNumber }).click();
        await this.page.waitForTimeout(1000);

        // Navigate to Applications tab and select Settlement
        await this.page.getByRole('button', { name: 'Applications' }).click();
        await this.page.getByRole('table').getByText('Settlement').click();
        await this.page.getByRole('button', { name: 'Approve' }).click();

        // Fill settlement details
        await this.page
            .locator('input[name="settlementAgreementDate"]')
            .fill(this.globals.settleAgreementDate || '');

        // Settlement Mechanism dropdown → Conciliation
        await this.page
            .locator('div')
            .filter({ hasText: /^Settlement Mechanism\*$/ })
            .getByRole('img')
            .click();
        await this.page.waitForTimeout(500);
        await this.page
            .locator('#jk-dropdown-unique div')
            .filter({ hasText: 'Conciliation' })
            .click();

        // "No" radio (some compliance field)
        await this.page.locator('div').filter({ hasText: /^No$/ }).getByRole('radio').check();

        // Nature of Disposal dropdown → first option
        await this.page
            .locator('div')
            .filter({ hasText: /^Nature of Disposal\*$/ })
            .getByRole('img')
            .click();
        await this.page.waitForTimeout(500);
        await this.page.locator('#jk-dropdown-unique div').nth(1).click();

        // Confirm
        await this.page.getByRole('button').filter({ hasText: 'Confirm' }).click();

        // Fill order text in rich editor
        await this.page.getByRole('paragraph').click();
        await this.page.locator('.ql-editor').fill('test');
        await this.page.waitForTimeout(1000);

        // Preview PDF and sign
        await this.page.getByRole('button').filter({ hasText: 'Preview PDF' }).click();
        await this.page.getByRole('button', { name: 'Add Signature' }).click();

        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.page.getByText('click here').click(),
        ]);

        const projectDownloadPath = path.join(resolveFromUiE2E('downloads'), await download.suggestedFilename());
        fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
        await download.saveAs(projectDownloadPath);
        console.log(`Settlement order downloaded: ${projectDownloadPath}`);

        // Upload signed order
        await this.page.getByRole('button', { name: 'Upload Order Document with' }).click();
        await this.page.waitForTimeout(2000);
        await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

        // Wait for Submit Signature to become enabled after file processing
        await this.page.waitForTimeout(3000);
        const submitSigBtn = this.page.getByRole('button', { name: 'Submit Signature' });
        await submitSigBtn.waitFor({ state: 'visible', timeout: 15000 });
        await this.page.waitForFunction(
            () => !document.querySelector('button[name="Submit Signature"], button:has-text("Submit Signature")')?.disabled,
            { timeout: 15000 }
        ).catch(() => console.log('[Settlement approveSettlement] Submit Signature still disabled, force clicking'));
        await submitSigBtn.click({ force: true });

        // Issue Order
        await this.page.getByRole('button', { name: 'Issue Order' }).click();
        await this.page.waitForTimeout(3000);

        // Dismiss success screen (same two-variant pattern as reviewAdvReplacement)
        const successToast = this.page.getByText('You have successfully issued');
        const hasToast = await successToast.isVisible({ timeout: 5000 }).catch(() => false);
        if (hasToast) {
            console.log('[approveSettlement] Success variant A: toast dismissal');
            await successToast.click();
            await this.page.getByRole('button', { name: 'Close' }).click({ force: true }).catch(() => { });
            await this.page.getByRole('heading', { name: 'Order successfully issued!' }).click({ force: true }).catch(() => { });
        } else {
            console.log('[approveSettlement] Success variant B: direct Close button');
            await this.page.getByRole('button', { name: 'Close' }).click({ force: true });
        }

        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
    }
}

module.exports = { SettlementApplicationPage };
