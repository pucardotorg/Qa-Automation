const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');
const { tryClick } = require('../common/uiactions');


class FileCasePage extends BasePage {
  constructor(page, globals) {
    super(page, globals);
  }

  async startFiling() {
    await this.page.getByRole('button', { name: 'File Case' }).click();
    await this.page.getByRole('button', { name: 'Proceed' }).click();
    await this.page.getByRole('button', { name: 'Start Filing' }).click();
  }

  async fillComplainantDetails() {
    await this.page.locator('div').filter({ hasText: /^Individual$/ }).getByRole('radio').check();
    await this.page.locator('input[name="mobileNumber"]').click();
    await this.page.locator('input[name="mobileNumber"]').fill(this.globals.litigantUsername);
    await this.page.getByRole('button', { name: 'Verify Mobile Number' }).click();
    await this.fillOtpSixOnes();
    await this.page.getByRole('button', { name: 'Verify', exact: true }).click();
    await this.page.locator('input[name="complainantAge"]').fill(this.globals.complainantAge);

    // Robust Continue on Complainant step
    const cont1 = this.page.locator('button:has-text("Continue")').first();
    await expect(cont1).toBeVisible({ timeout: 15000 });
    await expect(cont1).toBeEnabled({ timeout: 15000 });
    await cont1.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(150);
    await cont1.click();
    await this.waitIdle();
  }

  async fillAccusedDetails() {
   
// 1) Scope to Accused 1 card (you already have this)
let accusedCard = this.page
.locator('form, section, div')
.filter({ has: this.page.getByRole('heading', { level: 1, name: /^Accused\s*1$/i }) })
.first();

//await accusedCard.scrollIntoViewIfNeeded();

// 2) Select "Individual" inside the card (keep your resilient tryClick logic)
let selected = false;
//selected = selected || (await tryClick(accusedCard.locator('label:has-text("Individual")')));
selected = selected || (await tryClick(accusedCard.getByRole('radio', { name: /^Individual$/ })));
//selected = selected || (await tryClick(accusedCard.getByRole('button', { name: /^Individual$/ })));
// ... other fallbacks you already added ...

// 3) Reveal/advance: click the card’s Continue (fallback Add/Edit if your UI uses it)
const clickIfVisible = async (loc) => {
if (await loc.isVisible().catch(() => false)) {
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  await loc.click({ force: true });
  return true;
}
return false;
};

let advanced = await clickIfVisible(accusedCard.getByRole('button', { name: /Continue/i }).first());
if (!advanced) {
advanced = await clickIfVisible(accusedCard.getByRole('button', { name: /Add Accused|Add|Edit/i }).first());
}

// 4) Do NOT wait for or fill first-name on this screen (no inputs here).
// The inputs appear on the next step. Let the subsequent page object method handle them.
await this.waitIdle();
  }
 

  async fillChequeDetails()   { 
    // Avoid re-selecting "Individual" here to prevent duplicate accused selection.
    // Assume the selection was already made in fillAccusedDetails().

    // Do not auto-fill respondent first name to avoid unintended defaults.
    // If the field needs to be filled, the calling test should provide it explicitly.

    // Pincode
    await this.page
      .locator('div')
      .filter({ hasText: /^Pincode$/ })
      .getByRole('textbox')
      .fill(this.globals.respondentPincode);

    // State
    await this.page
      .locator('div')
      .filter({ hasText: /^State$/ })
      .getByRole('textbox')
      .fill(this.globals.respondentState);

    // District
    await this.page
      .locator('div')
      .filter({ hasText: /^District$/ })
      .getByRole('textbox')
      .fill(this.globals.respondentDistrict);

    // City / Town
    await this.page
      .locator('div')
      .filter({ hasText: /^City\/Town$/ })
      .getByRole('textbox')
      .fill(this.globals.respondentCity);

    await this.waitIdle();
  }

  async fillDebtLiability() {
    await this.page.locator('input[name="liabilityNature"]').fill(this.globals.liabilityNature);
    await this.page.locator('div').filter({ hasText: /^Full Liability$/ }).getByRole('radio').click();
    await this.clickContinue();
    await this.waitIdle();
  }

  async fillLegalDemandNotice() {
    const fallbackFile = path.join(process.cwd(), 'UI Tests', 'Test.png');
    await this.page.locator('input[name="dateOfDispatch"]').fill(this.globals.dateOfDispatch);
    if (fs.existsSync(fallbackFile)) {
      await this.page.locator('input[type="file"]').first().setInputFiles(fallbackFile);
      await this.page.locator('input[type="file"]').nth(2).setInputFiles(fallbackFile);
    }
    await this.page.locator('input[name="dateOfService"]').fill(this.globals.dateOfService);
    await this.page.locator('div').filter({ hasText: /^No$/ }).getByRole('radio').check();
    await this.clickContinue();
    await this.waitIdle();
    if (fs.existsSync(fallbackFile)) {
      await this.page.locator('input[type="file"]').last().setInputFiles(fallbackFile);
    }
    await this.clickContinue();
  }

  async skipWitnessAndAdvance() {
    await this.waitIdle();
    for (let i = 0; i < 2; i++) {
      await this.page.waitForTimeout(3000);
      await this.waitIdle();
      const continueBtn = this.page.getByRole('button').filter({ hasText: 'Continue' });
      await expect(continueBtn).toBeVisible({ timeout: 10000 });
      await continueBtn.click();
    }
  }

  async fillComplaintAndDocs() {
    const fallbackFile = path.join(process.cwd(), 'UI Tests', 'Test.png');
    await this.waitIdle();
    await this.page.getByRole('textbox', { name: 'rdw-editor' }).first().fill('test');
    if (fs.existsSync(fallbackFile)) {
      await this.page.locator('input[type="file"]').first().setInputFiles(fallbackFile);
    }
    await this.page.getByRole('textbox', { name: 'rdw-editor' }).nth(1).fill('test');
    await this.page.waitForTimeout(1000);
    await this.clickContinue();
    await this.waitIdle();
  }

  async fillAdvocateDetails() {
    const fallbackFile = path.join(process.cwd(), 'UI Tests', 'Test.png');
    await this.page.getByRole('textbox').first().fill(this.globals.noOfAdvocates || '1');
    if (fs.existsSync(fallbackFile)) {
      await this.page.locator('input[type="file"]').first().setInputFiles(fallbackFile);
    }
    await this.page.waitForTimeout(1000);
    await this.clickContinue();
    await this.waitIdle();
  }

  async reviewSignAndSubmit() {
    await this.page.waitForTimeout(1000);
    await this.page.locator('.header-end > div > svg > path:nth-child(2)').click();
    await this.page.getByRole('button', { name: 'Confirm Details' }).click();
    await this.page.getByRole('checkbox').check();
    await this.page.getByRole('button', { name: 'Upload Signed copy' }).click();

    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('button', { name: 'Download PDF' }).click(),
    ]);

    const projectDownloadPath = path.join(process.cwd(), 'tested-e2e', 'downloads', await download.suggestedFilename());
    fs.mkdirSync(path.dirname(projectDownloadPath), { recursive: true });
    await download.saveAs(projectDownloadPath);

    await this.page.getByRole('button', { name: 'Upload Signed PDF' }).click();
    await this.page.locator('input[type="file"]').first().setInputFiles(projectDownloadPath);
    await this.page.getByRole('button', { name: 'Submit Signature' }).click();
    await this.page.getByRole('button').filter({ hasText: 'Submit Case' }).click();
    await this.waitIdle();
  }

  async captureFilingNumber() {
    const filingNumber = await this.page.locator('span.e-filing-table-value-style').innerText();
    return filingNumber;
  }
}

module.exports = { FileCasePage };
