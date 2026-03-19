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
        await this.page.waitForTimeout(2000);
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
            console.log('[CondonationOfDelayPage] Network idle timeout after opening case, continuing...');
        });

        console.log('[CondonationOfDelayPage] Initiating Condonation of Delay Application...');

        // Open filings panel
        await this.page.getByRole('button', { name: 'Make Filings' }).click();
        await this.page.waitForTimeout(1000);
        await this.page
            .locator('div')
            .filter({ hasText: /^Raise Application$/ })
            .click();
        await this.page.waitForTimeout(2000);

        // Select Application Type = Condonation of delay
        console.log('[CondonationOfDelayPage] Selecting Application Type...');
        
        // Click the dropdown
        let dropdownClicked = false;
        try {
            const dropdown = this.page.locator('div').filter({ hasText: /^Application Type/ }).locator('.select-wrap, .dropdown, [class*="select"]').first();
            await dropdown.waitFor({ state: 'visible', timeout: 5000 });
            await dropdown.click();
            dropdownClicked = true;
            console.log('[CondonationOfDelayPage] Clicked Application Type dropdown');
        } catch (error) {
            console.log('[CondonationOfDelayPage] Trying alternative dropdown selector...');
            await this.page.locator('.select-wrap').first().click({ force: true });
            dropdownClicked = true;
        }
        
        await this.page.waitForTimeout(1000);
        
        // Select "Condonation of delay" from dropdown
        let optionClicked = false;
        try {
            const option = this.page.locator('#jk-dropdown-unique div').filter({ hasText: /Condonation of delay/ });
            await option.waitFor({ state: 'visible', timeout: 5000 });
            await option.click();
            optionClicked = true;
            console.log('[CondonationOfDelayPage] Selected Condonation of delay');
        } catch (error) {
            console.log('[CondonationOfDelayPage] Trying alternative selector...');
            await this.page.getByText('Condonation of delay', { exact: true }).click({ force: true });
        }
        
        await this.page.waitForTimeout(2000);
        
        // Wait for form to load
        await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
            console.log('[CondonationOfDelayPage] Network idle timeout after selecting type');
        });

        // Fill Reason of Delay (rich editor)
        console.log('[CondonationOfDelayPage] Filling Reason of Delay...');
        let reasonFilled = false;
        
        try {
            const reasonEditor = this.page.locator('.ql-editor').first();
            await reasonEditor.waitFor({ state: 'visible', timeout: 5000 });
            await reasonEditor.click();
            await reasonEditor.fill('reason of delay testing');
            reasonFilled = true;
            console.log('[CondonationOfDelayPage] Filled Reason (ql-editor)');
        } catch (error) {
            console.log('[CondonationOfDelayPage] ql-editor not found, trying contenteditable...');
            try {
                const editableDiv = this.page.locator('[contenteditable="true"]').first();
                await editableDiv.waitFor({ state: 'visible', timeout: 5000 });
                await editableDiv.click();
                await editableDiv.fill('reason of delay testing');
                console.log('[CondonationOfDelayPage] Filled Reason (contenteditable)');
            } catch (error2) {
                console.log('[CondonationOfDelayPage] Could not fill Reason field');
            }
        }
        
        await this.page.waitForTimeout(1000);

        // Fill Prayer text (optional)
        console.log('[CondonationOfDelayPage] Looking for Prayer field...');
        try {
            const prayerBox = this.page.getByRole('textbox', { name: 'Type here' });
            await prayerBox.waitFor({ state: 'visible', timeout: 5000 });
            await prayerBox.click();
            await prayerBox.fill('prayer testing');
            console.log('[CondonationOfDelayPage] Filled Prayer field');
        } catch (error) {
            console.log('[CondonationOfDelayPage] Prayer field not found, skipping...');
        }

        await this.page.waitForTimeout(3000);

        // Select Document Type = Others
        console.log('[CondonationOfDelayPage] Selecting Document Type...');
        try {
            const docTypeDropdown = this.page.locator('div').filter({ hasText: /^Document Type/ }).locator('.select-wrap, [role="img"]').first();
            await docTypeDropdown.waitFor({ state: 'visible', timeout: 5000 });
            await docTypeDropdown.click();
        } catch (error) {
            console.log('[CondonationOfDelayPage] Trying alternative Document Type selector...');
            await this.page.locator('form').getByRole('img').filter({ hasText: /^$/ }).nth(3).click();
        }
        
        await this.page.waitForTimeout(500);
        
        try {
            const othersOption = this.page.locator('#jk-dropdown-unique div').filter({ hasText: /^Others$/ });
            await othersOption.waitFor({ state: 'visible', timeout: 5000 });
            await othersOption.click();
            console.log('[CondonationOfDelayPage] Selected Others');
        } catch (error) {
            await this.page.getByText('Others', { exact: true }).click({ force: true });
        }
        
        await this.page.waitForTimeout(1000);

        // Fill Document Title
        console.log('[CondonationOfDelayPage] Filling Document Title...');
        const docTitleInput = this.page.locator('.citizen-card-input').first();
        await docTitleInput.waitFor({ state: 'visible', timeout: 10000 });
        await docTitleInput.click();
        await docTitleInput.fill('document title testing');
        await this.page.waitForTimeout(1000);

        // Upload supporting document (cheque image as stand-in)
        console.log('[CondonationOfDelayPage] Uploading document...');
        const uploadDocPath = resolveFromUiE2E('documents', 'cheque.png');
        if (fs.existsSync(uploadDocPath)) {
            const fileInput = await this.page.$('input[type="file"]');
            if (fileInput) {
                await fileInput.setInputFiles(uploadDocPath);
                console.log('[CondonationOfDelayPage] Document uploaded');
            }
        } else {
            console.warn('[CondonationOfDelayPage] Upload document not found at:', uploadDocPath);
        }

        await this.page.waitForTimeout(6000);

        // Generate Application
        console.log('[CondonationOfDelayPage] Generating Application...');
        await this.page
            .getByRole('button')
            .filter({ hasText: 'Generate Application' })
            .click();
        await this.page.waitForTimeout(2000);

        // Add Signature — download PDF and re-upload
        console.log('[CondonationOfDelayPage] Adding Signature...');
        await this.page.getByRole('button', { name: 'Add Signature' }).click();
        await this.page.waitForTimeout(1000);

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
        await this.page.waitForTimeout(2000);

        // Proceed and close payment modal
        await this.page.getByRole('button', { name: 'Proceed' }).click();
        await this.page.waitForTimeout(1000);
        await this.page
            .locator(
                '.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg'
            )
            .click();

        console.log('[CondonationOfDelayPage] Application submitted and payment modal dismissed.');
    }
}

module.exports = { CondonationOfDelayPage };
