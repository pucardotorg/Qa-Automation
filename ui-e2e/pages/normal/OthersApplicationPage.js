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
        await this.page.waitForTimeout(2000);
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
            console.log('[OthersApplicationPage] Network idle timeout after opening case, continuing...');
        });

        console.log('[OthersApplicationPage] Initiating Others Application...');

        // Open filings panel
        await this.page.getByRole('button', { name: 'Make Filings' }).click();
        await this.page.waitForTimeout(1000);
        await this.page
            .locator('div')
            .filter({ hasText: /^Raise Application$/ })
            .click();
        await this.page.waitForTimeout(2000);

        // Select Application Type = Others
        console.log('[OthersApplicationPage] Selecting Application Type...');
        
        // Click the dropdown
        let dropdownClicked = false;
        try {
            const dropdown = this.page.locator('div').filter({ hasText: /^Application Type/ }).locator('.select-wrap, .dropdown, [class*="select"]').first();
            await dropdown.waitFor({ state: 'visible', timeout: 5000 });
            await dropdown.click();
            dropdownClicked = true;
            console.log('[OthersApplicationPage] Clicked Application Type dropdown');
        } catch (error) {
            console.log('[OthersApplicationPage] Trying alternative dropdown selector...');
            await this.page.locator('.select-wrap').first().click({ force: true });
            dropdownClicked = true;
        }
        
        await this.page.waitForTimeout(1000);
        
        // Select "Others" from dropdown
        let optionClicked = false;
        try {
            const option = this.page.locator('#jk-dropdown-unique div').filter({ hasText: /^Others$/ });
            await option.waitFor({ state: 'visible', timeout: 5000 });
            await option.click();
            optionClicked = true;
            console.log('[OthersApplicationPage] Selected Others');
        } catch (error) {
            console.log('[OthersApplicationPage] Trying alternative selector for Others...');
            await this.page.getByText('Others', { exact: true }).click({ force: true });
        }
        
        await this.page.waitForTimeout(2000);
        
        // Wait for form to load
        await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
            console.log('[OthersApplicationPage] Network idle timeout after selecting Others');
        });

        // Fill Application Title
        console.log('[OthersApplicationPage] Filling Application Title...');
        const titleInput = this.page.locator('input[name="applicationTitle"]');
        await titleInput.waitFor({ state: 'visible', timeout: 10000 });
        await titleInput.click();
        await titleInput.fill('application title');
        await this.page.waitForTimeout(1000);

        // Fill Prayer text (optional)
        console.log('[OthersApplicationPage] Looking for Prayer field...');
        try {
            const prayerBox = this.page.getByRole('textbox', { name: 'Type here' });
            await prayerBox.waitFor({ state: 'visible', timeout: 5000 });
            await prayerBox.click();
            await prayerBox.fill('prayer text');
            console.log('[OthersApplicationPage] Filled Prayer field');
        } catch (error) {
            console.log('[OthersApplicationPage] Prayer field not found, skipping...');
        }
        await this.page.waitForTimeout(1000);

        // Fill details in rich editor
        console.log('[OthersApplicationPage] Filling Details...');
        let detailsFilled = false;
        
        try {
            const editor = this.page.locator('.ql-editor').first();
            await editor.waitFor({ state: 'visible', timeout: 5000 });
            await editor.click();
            await editor.fill('details testing');
            detailsFilled = true;
            console.log('[OthersApplicationPage] Filled details (ql-editor)');
        } catch (error) {
            console.log('[OthersApplicationPage] ql-editor not found, trying contenteditable...');
        }
        
        if (!detailsFilled) {
            try {
                const editableDiv = this.page.locator('[contenteditable="true"]').first();
                await editableDiv.waitFor({ state: 'visible', timeout: 5000 });
                await editableDiv.click();
                await editableDiv.fill('details testing');
                console.log('[OthersApplicationPage] Filled details (contenteditable)');
            } catch (error) {
                console.log('[OthersApplicationPage] Could not fill details field');
            }
        }
        
        await this.page.waitForTimeout(2000);

        // Generate Application
        console.log('[OthersApplicationPage] Generating Application...');
        await this.page
            .getByRole('button')
            .filter({ hasText: 'Generate Application' })
            .click();
        await this.page.waitForTimeout(2000);

        // Add Signature — download PDF and re-upload
        console.log('[OthersApplicationPage] Adding Signature...');
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
        await this.page.waitForTimeout(2000);

        // Proceed and close payment modal
        await this.page.getByRole('button', { name: 'Proceed' }).click();
        await this.page.waitForTimeout(1000);
        await this.page
            .locator(
                '.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg'
            )
            .click();

        console.log('[OthersApplicationPage] Application submitted and payment modal dismissed.');
    }
}

module.exports = { OthersApplicationPage };
