const path = require('path');
const fs = require('fs');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

/**
 * WithdrawalApplicationPage
 *
 * Covers:
 *  - initiateWithdrawalApplication(cmpNumber)  — citizen raises Withdrawal application,
 *                                                signs it, and dismisses the payment modal
 *  - approveWithdrawalApplication(cmpNumber)   — judge approves and issues the withdrawal order
 *
 * Source refs:
 *   UI Tests/tests/4-FiledFromLit/9-initiateWithdrawalApplication.spec.js
 *   UI Tests/tests/4-FiledFromLit/9.2-approveWithdrawalJudge.spec.js
 */
class WithdrawalApplicationPage extends BasePage {
    constructor(page, globals) {
        super(page, globals);
    }

    // ───────────────────────────────────────────────────────────────────────────
    // CITIZEN: Raise Withdrawal Application
    // ───────────────────────────────────────────────────────────────────────────

    /**
     * Navigate to case by cmpNumber, raise a Withdrawal application,
     * sign it, and dismiss the payment modal.
     * @param {string} cmpNumber  e.g. 'CMP/137/2026'
     */
    async initiateWithdrawalApplication(cmpNumber) {
        // Land on the case from the citizen home table
        await this.page.waitForTimeout(1000);
        await this.page.getByRole('cell', { name: cmpNumber }).click();
        await this.page.waitForTimeout(1000);

        console.log('Initiating Withdrawal Application...');
        await this.page.getByRole('button', { name: 'Make Filings' }).click();
        await this.page.getByText('Raise Application').click();

        // Select Application Type = Withdrawal
        await this.page
            .locator('div')
            .filter({ hasText: /^Application Type\*$/ })
            .getByRole('img')
            .click();
        await this.page.getByText('Withdrawal').click();

        // Select Reason for Withdrawal = Other
        await this.page
            .locator('div')
            .filter({ hasText: /^Reason for Withdrawal\*$/ })
            .getByRole('img')
            .click();
        await this.page
            .locator('#jk-dropdown-unique div')
            .filter({ hasText: 'Other' })
            .click();

        // Fill the reason textbox
        const reasonBox = this.page.locator('.ql-editor').or(this.page.locator('textarea')).first();
        await reasonBox.click();
        await reasonBox.fill('Withdrawal Application Automation testing');

        // Generate application
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
        console.log(`Withdrawal application downloaded: ${projectDownloadPath}`);

        // Upload signed document
        await this.page
            .getByRole('button', { name: 'Upload document with Signature' })
            .click();
        await this.page.waitForTimeout(1000);
        await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

        // Wait for Submit Signature to become enabled after file processing
        await this.page.waitForTimeout(3000);
        const submitSigBtn = this.page.getByRole('button', { name: 'Submit Signature' });
        await submitSigBtn.waitFor({ state: 'visible', timeout: 60000 });
        await this.page
            .waitForFunction(
                () =>
                    !document.querySelector(
                        'button[name="Submit Signature"], button:has-text("Submit Signature")'
                    )?.disabled,
                { timeout: 60000 }
            )
            .catch(() =>
                console.log('[WithdrawalApplication] Submit Signature still disabled, force clicking')
            );
        await submitSigBtn.click({ force: true });

        // Proceed and close payment modal
        await this.page.getByRole('button', { name: 'Proceed' }).click();
        await this.page
            .locator(
                '.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg'
            )
            .click();
    }

    // ───────────────────────────────────────────────────────────────────────────
    // JUDGE: Approve Withdrawal Application and Issue Order
    // ───────────────────────────────────────────────────────────────────────────

    /**
     * Open case by cmpNumber from All Cases, approve the withdrawal application,
     * select Nature of Disposal, preview/sign PDF, upload, and issue order.
     * @param {string} cmpNumber  e.g. 'CMP/137/2026'
     */
    async approveWithdrawalApplication(cmpNumber) {
        await this.page.getByRole('link', { name: 'All Cases' }).click();
        await this.page.waitForTimeout(1000);
        await this.page.getByRole('cell', { name: cmpNumber }).click();
        await this.page.waitForTimeout(1000);

        // Navigate to Applications tab and select Withdrawal
        await this.page.getByRole('button', { name: 'Applications' }).click();
        await this.page.getByRole('table').getByText('Withdrawal').click();

        console.log(' Approving Withdrawal Application...');
        await this.page.getByRole('button', { name: 'Approve' }).click();

        // Select Nature of Disposal = Uncontested
        await this.page
            .locator('div')
            .filter({ hasText: /^Nature of Disposal\*$/ })
            .getByRole('img')
            .click();
        await this.page.getByText('Uncontested').click();

        // Confirm the approval
        await this.page.getByRole('button').filter({ hasText: 'Confirm' }).click();

        // Click the order text area (rich editor)
        await this.page.getByRole('paragraph').click();
        await this.page.waitForTimeout(1000);

        // Preview PDF and sign
        await this.page.getByRole('button').filter({ hasText: 'Preview PDF' }).click();
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
        console.log(`Withdrawal order downloaded: ${projectDownloadPath}`);

        // Upload signed order
        await this.page.getByRole('button', { name: 'Upload Order Document with' }).click();
        await this.page.waitForTimeout(2000);
        await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);

        // Wait for Submit Signature to become enabled
        await this.page.waitForTimeout(3000);
        const submitSigBtn = this.page.getByRole('button', { name: 'Submit Signature' });
        await submitSigBtn.waitFor({ state: 'visible', timeout: 60000 });
        await this.page
            .waitForFunction(
                () =>
                    !document.querySelector(
                        'button[name="Submit Signature"], button:has-text("Submit Signature")'
                    )?.disabled,
                { timeout: 60000 }
            )
            .catch(() =>
                console.log('[WithdrawalApplication approveWithdrawal] Submit Signature still disabled, force clicking')
            );
        await submitSigBtn.click({ force: true });

        // Issue Order
        await this.page.getByRole('button', { name: 'Issue Order' }).click();
        await this.page.waitForTimeout(3000);

        // Dismiss success screen
        const successToast = this.page.getByText('You have successfully issued');
        const hasToast = await successToast.isVisible({ timeout: 5000 }).catch(() => false);
        if (hasToast) {
            console.log('[approveWithdrawal] Success variant A: toast dismissal');
            await successToast.click();
            await this.page.getByRole('button', { name: 'Close' }).click({ force: true }).catch(() => { });
            await this.page
                .getByRole('heading', { name: 'Order successfully issued!' })
                .click({ force: true })
                .catch(() => { });
        } else {
            console.log('[approveWithdrawal] Success variant B: direct Close button');
            await this.page.getByRole('button', { name: 'Close' }).click({ force: true });
        }

        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
    }
}

module.exports = { WithdrawalApplicationPage };
