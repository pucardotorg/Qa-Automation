const path = require('path');
const fs = require('fs');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

/**
 * ProfileCorrectionPage — Page Object for the citizen-side
 * "Profile Correction Application" flow.
 *
 * Converted from:
 *   UI Tests/tests/7-JudgeReSubmitCase/9-ProfileEditingApp.spec.js
 */
class ProfileCorrectionPage extends BasePage {
    constructor(page, globals) {
        super(page, globals);

        // ── Locators ──────────────────────────────────────────────────────────────
        this.partiesTab = page.getByRole('button', { name: 'Parties' });
        this.editDetailsLink = page.getByText('Edit Details');
        this.ageInput = page.locator('input[name="complainantAge"]');
        this.lastNameInput = page.locator('input[name="lastName"]');
        this.middleNameInput = page.locator('input[name="middleName"]');
        this.reasonTextarea = page.locator('textarea').nth(1);
        this.submitBtn = page.getByRole('button').filter({ hasText: 'Submit' });
        this.confirmBtn = page.getByRole('button', { name: 'Confirm' });
        this.addSignatureBtn = page.getByRole('button', { name: 'Add Signature' });
        this.uploadWithSigBtn = page.getByRole('button', { name: 'Upload document with Signature' });
        this.submitSignatureBtn = page.getByRole('button', { name: 'Submit Signature' });
        this.proceedBtn = page.getByRole('button', { name: 'Proceed' });
        this.paymentModalCloseBtn = page.locator(
            '.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg'
        );
    }

    /**
     * Navigate to a case using the CMP number cell in the case list.
     * @param {string} cmpNumber - e.g. 'CMP/173/2026'
     */
    async openCaseByCmpNumber(cmpNumber) {
        await this.page.waitForTimeout(1000);
        await this.page.getByRole('cell', { name: cmpNumber }).click();
        await this.page.waitForTimeout(1000);
    }

    /**
     * Open the Parties tab and click the action icon for the first complainant row,
     * then choose "Edit Details".
     */
    async navigateToEditDetails() {
        await this.partiesTab.click();
        // Open the kebab / action menu for the first party's last column
        await this.page.locator('td:nth-child(6)').first().click();
        // Click the action icon (3rd div within the complainant row)
        await this.page
            .getByRole('row', { name: 'Rajesh Ch Complainant Joined' })
            .locator('div')
            .nth(2)
            .click();
        await this.editDetailsLink.click();
    }

    /**
     * Fill in the profile-correction form fields.
     * @param {Object} opts
     * @param {string} opts.age        - New age value
     * @param {string} opts.lastName   - New last name
     * @param {string} opts.middleName - New middle name
     * @param {string} opts.reason     - Reason for correction
     */
    async fillCorrectionForm({
        age = '23',
        lastName = 'Verma',
        middleName = 'Ch',
        reason = 'Changing the middle and last name, age',
    } = {}) {
        await this.ageInput.click();
        await this.ageInput.fill(age);

        await this.lastNameInput.click();
        await this.lastNameInput.fill('');
        await this.lastNameInput.fill(lastName);

        await this.middleNameInput.click();
        await this.middleNameInput.fill(middleName);

        await this.reasonTextarea.click();
        await this.reasonTextarea.fill(reason);
    }

    /**
     * Submit the correction form and confirm.
     */
    async submitForm() {
        await this.submitBtn.click();
        await this.confirmBtn.click();
    }

    /**
     * Download the signature document, upload it, and submit.
     */
    async addAndSubmitSignature() {
        console.log('[ProfileCorrectionPage] Adding Signature...');
        await this.addSignatureBtn.click();

        // Download the pre-filled PDF
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.page.click('text=click here'),
        ]);

        const projectDownloadPath = path.join(
            resolveFromUiE2E('downloads'),
            await download.suggestedFilename()
        );
        fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
        await download.saveAs(projectDownloadPath);
        console.log(`[ProfileCorrectionPage] File downloaded: ${projectDownloadPath}`);

        // Upload the signed file
        await this.uploadWithSigBtn.click();
        await this.page.waitForTimeout(6000);
        await this.page.locator('input[type="file"]').nth(2).setInputFiles(projectDownloadPath);

        await this.submitSignatureBtn.click();
        await this.proceedBtn.click();

        // Close the payment modal that appears after submission
        await this.paymentModalCloseBtn.click();
    }

    /**
     * Full flow: open case → navigate to edit details → fill form → submit → sign.
     *
     * @param {string} cmpNumber - Case CMP number to open
     * @param {Object} formData  - Optional overrides for fillCorrectionForm()
     */
    async initiateProfileCorrectionApplication(cmpNumber, formData = {}) {
        console.log('[ProfileCorrectionPage] Initiating Profile Correction Application...');
        await this.openCaseByCmpNumber(cmpNumber);
        await this.navigateToEditDetails();
        await this.fillCorrectionForm(formData);
        await this.submitForm();
        await this.addAndSubmitSignature();
        console.log('[ProfileCorrectionPage] Profile Correction Application submitted successfully.');
    }
}

module.exports = { ProfileCorrectionPage };
