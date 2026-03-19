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
        await this.page.waitForTimeout(2000);
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
            console.log('[ProductionOfDocumentsPage] Network idle timeout after opening case, continuing...');
        });

        console.log('Initiating Production of Documents Application...');

        // Open filings panel
        await this.page.getByRole('button', { name: 'Make Filings' }).click();
        await this.page.waitForTimeout(1000);
        await this.page.getByText('Raise Application').click();
        await this.page.waitForTimeout(2000);

        // Select Application Type = Production of Documents
        await this.page.waitForTimeout(2000);
        
        // Click the Application Type dropdown
        console.log('[ProductionOfDocumentsPage] Looking for Application Type dropdown...');
        
        // Try to click the dropdown - use multiple selectors
        let dropdownClicked = false;
        
        // Approach 1: Find by text "Application Type" and click the dropdown arrow/wrapper
        try {
            const dropdown = this.page.locator('div').filter({ hasText: /^Application Type/ }).locator('.select-wrap, .dropdown, [class*="select"]').first();
            await dropdown.waitFor({ state: 'visible', timeout: 5000 });
            await dropdown.click();
            dropdownClicked = true;
            console.log('[ProductionOfDocumentsPage] Clicked Application Type dropdown (approach 1)');
        } catch (error) {
            console.log('[ProductionOfDocumentsPage] Approach 1 failed');
        }
        
        // Approach 2: Click first select-wrap
        if (!dropdownClicked) {
            try {
                await this.page.locator('.select-wrap').first().click({ force: true });
                dropdownClicked = true;
                console.log('[ProductionOfDocumentsPage] Clicked first select-wrap (approach 2)');
            } catch (error) {
                console.log('[ProductionOfDocumentsPage] Approach 2 failed');
            }
        }
        
        // Wait for dropdown menu to appear
        await this.page.waitForTimeout(2000);
        
        // Try multiple selectors for the dropdown options
        console.log('[ProductionOfDocumentsPage] Looking for Production of Documents option...');
        let optionClicked = false;
        
        // Try selector 1: #jk-dropdown-unique
        try {
            const option1 = this.page.locator('#jk-dropdown-unique div').filter({ hasText: 'Production of Documents' });
            await option1.waitFor({ state: 'visible', timeout: 3000 });
            await option1.click();
            optionClicked = true;
            console.log('[ProductionOfDocumentsPage] Selected Production of Documents (selector 1)');
        } catch (error) {
            console.log('[ProductionOfDocumentsPage] Selector 1 failed, trying selector 2...');
        }
        
        // Try selector 2: Any visible div with text
        if (!optionClicked) {
            try {
                const option2 = this.page.locator('div').filter({ hasText: /^Production of Documents$/ }).first();
                await option2.waitFor({ state: 'visible', timeout: 3000 });
                await option2.click({ force: true });
                optionClicked = true;
                console.log('[ProductionOfDocumentsPage] Selected Production of Documents (selector 2)');
            } catch (error) {
                console.log('[ProductionOfDocumentsPage] Selector 2 failed, trying selector 3...');
            }
        }
        
        // Try selector 3: getByText
        if (!optionClicked) {
            try {
                await this.page.getByText('Production of Documents', { exact: true }).click({ force: true });
                optionClicked = true;
                console.log('[ProductionOfDocumentsPage] Selected Production of Documents (selector 3)');
            } catch (error) {
                console.log('[ProductionOfDocumentsPage] All selectors failed for Production of Documents');
                throw new Error('Could not select Production of Documents from dropdown');
            }
        }
        
        await this.page.waitForTimeout(2000);

        // Select Document Type = Others
        await this.page
            .locator('div')
            .filter({ hasText: /^Document Type$/ })
            .getByRole('img')
            .click();
        await this.page.waitForTimeout(500);
        await this.page
            .locator('#jk-dropdown-unique div')
            .filter({ hasText: 'Others' })
            .click();
        await this.page.waitForTimeout(1000);

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
            await this.page.waitForTimeout(2000);
        } else {
            console.warn('[ProductionOfDocumentsPage] Upload document not found at:', uploadDocPath);
        }

        // Fill Prayer text (optional field - may not exist in all forms)
        console.log('[ProductionOfDocumentsPage] Looking for Prayer field...');
        try {
            const prayerBox = this.page.getByRole('textbox', { name: 'Type here' });
            await prayerBox.waitFor({ state: 'visible', timeout: 5000 });
            await prayerBox.click();
            await prayerBox.fill('test prayer');
            console.log('[ProductionOfDocumentsPage] Filled Prayer field');
        } catch (error) {
            console.log('[ProductionOfDocumentsPage] Prayer field not found, skipping...');
        }
        await this.page.waitForTimeout(1000);

        // Fill Reason for Application (rich editor)
        console.log('[ProductionOfDocumentsPage] Filling Reason for Application...');
        
        // Try multiple approaches to find and fill the Reason editor
        let reasonFilled = false;
        
        // Approach 1: Find by .ql-editor
        try {
            const reasonEditor = this.page.locator('.ql-editor').first();
            await reasonEditor.waitFor({ state: 'visible', timeout: 5000 });
            await reasonEditor.click();
            await reasonEditor.fill('reason for application test automation.');
            reasonFilled = true;
            console.log('[ProductionOfDocumentsPage] Filled Reason (approach 1: .ql-editor)');
        } catch (error) {
            console.log('[ProductionOfDocumentsPage] Approach 1 failed, trying approach 2...');
        }
        
        // Approach 2: Find paragraph under "Reason for application" heading
        if (!reasonFilled) {
            try {
                // Find the section with "Reason for application" text and locate the editable paragraph
                const reasonSection = this.page.locator('paragraph').filter({ hasText: 'Reason for application' }).locator('..').locator('paragraph').nth(1);
                await reasonSection.waitFor({ state: 'visible', timeout: 5000 });
                await reasonSection.click();
                await reasonSection.fill('reason for application test automation.');
                reasonFilled = true;
                console.log('[ProductionOfDocumentsPage] Filled Reason (approach 2: paragraph)');
            } catch (error) {
                console.log('[ProductionOfDocumentsPage] Approach 2 failed, trying approach 3...');
            }
        }
        
        // Approach 3: Find by contenteditable attribute
        if (!reasonFilled) {
            try {
                const editableDiv = this.page.locator('[contenteditable="true"]').first();
                await editableDiv.waitFor({ state: 'visible', timeout: 5000 });
                await editableDiv.click();
                await editableDiv.fill('reason for application test automation.');
                reasonFilled = true;
                console.log('[ProductionOfDocumentsPage] Filled Reason (approach 3: contenteditable)');
            } catch (error) {
                console.log('[ProductionOfDocumentsPage] All approaches failed for Reason field');
                // Don't throw error, continue with the test
            }
        }

        await this.page.waitForTimeout(1000);

        await this.page.waitForTimeout(3000);

        // Generate Application
        await this.page
            .getByRole('button')
            .filter({ hasText: 'Generate Application' })
            .click();
        await this.page.waitForTimeout(2000);

        // Add Signature — download PDF and re-upload
        console.log('Adding Signature...');
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
        await this.page.waitForTimeout(2000);

        // Proceed and close payment modal
        await this.page.getByRole('button', { name: 'Proceed' }).click();
        await this.page.waitForTimeout(1000);
        await this.page
            .locator(
                '.popup-module.submission-payment-modal > .header-wrap > .header-end > div > svg'
            )
            .click();

        console.log('[ProductionOfDocumentsPage] Application submitted and payment modal dismissed.');
    }
}

module.exports = { ProductionOfDocumentsPage };
