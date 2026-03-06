const path = require('path');
const fs = require('fs');
const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

class JoinCasePage extends BasePage {
  constructor(page, globals) {
    super(page, globals);

    this.signInBtn = page.getByRole('button').first();
    this.mobileInput = page.getByRole('textbox');
    this.continueBtn = page.getByRole('button');
    this.verifyBtn = page.getByRole('button', { name: 'Verify' });
    this.joinCaseBtn = page.getByRole('button', { name: 'Join Case' });
    this.caseNumberInput = page.locator('input[name="caseNumber"]');
    this.searchBtn = page.getByRole('button', { name: 'Search' });
    this.proceedBtn = page.getByRole('button', { name: 'Proceed' });
    this.validationCodeInput = page.locator('input[name="validationCode"]');
    this.accusedRadio = page.locator('div').filter({ hasText: /^Accused$/ }).getByRole('radio');
    this.noRadio = page.locator('div').filter({ hasText: /^No$/ }).getByRole('radio');
    this.litigantDropdown = page.locator('div').filter({ hasText: /^Which litigant\(s\) are you representing\?$/ }).getByRole('textbox');
    this.advocateMobileInput = page.locator('input[name="mobileNumber"]');
    this.verifyMobileBtn = page.getByRole('button', { name: 'Verify Mobile Number' });
    this.noOfAdvocatesInput = page.locator('input[name="noOfAdvocates"]');
  }

  async open() {
    await this.goto('ui/citizen/select-language');
  }

  async loginWithMobile(mobileNumber) {
    await this.signInBtn.click();
    await this.mobileInput.click();
    await this.mobileInput.fill(mobileNumber);
    await this.page.waitForTimeout(1000);
    await this.continueBtn.click();

    // Enter OTP
    await this.enterOTP('123456');
    await this.verifyBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async enterOTP(otp = '123456') {
    const digits = otp.split('');
    await this.page.locator('.input-otp').first().fill(digits[0]);
    await this.page.locator('input:nth-child(2)').fill(digits[1]);
    await this.page.locator('input:nth-child(3)').fill(digits[2]);
    await this.page.locator('input:nth-child(4)').fill(digits[3]);
    await this.page.locator('input:nth-child(5)').fill(digits[4]);
    await this.page.locator('input:nth-child(6)').fill(digits[5]);
  }

  async searchAndSelectCase(filingNumber) {
    await this.joinCaseBtn.click();
    await this.caseNumberInput.click();
    await this.page.waitForTimeout(1000);
    await this.caseNumberInput.fill(filingNumber);
    await this.page.waitForTimeout(1000);
    await this.searchBtn.click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('.cp').first().click();
    await this.page.waitForTimeout(1000);
    await this.proceedBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async verifyAccessCode(accessCode) {
    if (!accessCode) {
      throw new Error(
        '[JoinCasePage] accessCode is empty. ' +
        'Ensure captureAccessCodeAndCmpNumber() resolved it correctly in the previous test step.'
      );
    }

    // Wait for the validation code screen to load
    await this.validationCodeInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.validationCodeInput.click();
    await this.validationCodeInput.fill(accessCode);
    await this.page.waitForTimeout(1000);

    // Wait for the Verify button to become enabled (code entry enables it)
    const verifyBtn = this.page.getByRole('button', { name: 'Verify' }).last();
    await expect(verifyBtn).toBeEnabled({ timeout: 10000 });
    await verifyBtn.click();
    await this.page.waitForTimeout(2000);
    await this.joinCaseBtn.nth(1).click();
    await this.page.waitForTimeout(2000);
  }

  async selectLitigantDetails(respondentName) {
    await this.accusedRadio.check();
    await this.noRadio.check();
    await this.litigantDropdown.click();
    await this.page.waitForTimeout(1000);

    // Try to find checkbox with respondent name (case-insensitive, partial match)
    const checkbox = this.page.locator('div').filter({ hasText: new RegExp(respondentName, 'i') }).getByRole('checkbox');
    const count = await checkbox.count();

    if (count > 0) {
      await checkbox.first().check();
    } else {
      // Fallback: check first checkbox in the dropdown
      console.log(`Could not find checkbox for: ${respondentName}, using first available`);
      await this.page.getByRole('checkbox').first().check();
    }

    await this.page.locator('.select-user-join-case').click();
    await this.proceedBtn.click();
  }

  async verifyAdvocateMobile(mobileNumber) {
    await this.advocateMobileInput.click();
    await this.advocateMobileInput.fill(mobileNumber);
    await this.verifyMobileBtn.click();

    // Enter OTP
    await this.enterOTP('123456');
    await this.page.getByRole('button', { name: 'Verify', exact: true }).click();
  }

  async uploadVakalatnama(noOfAdvocates = '1') {
    await this.noOfAdvocatesInput.click();
    await this.noOfAdvocatesInput.fill(noOfAdvocates);
    await this.page.waitForTimeout(1000);

    // Resolve the Affidavit path — use global variable if set, otherwise default
    const affidavitRelPath = this.globals.AffidavitPath || 'documents/Affidavit.pdf';
    const affidavitPath = path.isAbsolute(affidavitRelPath)
      ? affidavitRelPath
      : resolveFromUiE2E(...affidavitRelPath.split('/'));

    if (!fs.existsSync(affidavitPath)) {
      throw new Error(`[JoinCasePage] Affidavit file not found: ${affidavitPath}`);
    }

    await this.page.locator('input[type="file"]').setInputFiles(affidavitPath);
    await this.page.waitForTimeout(2000);
    await this.proceedBtn.click();
    await this.page.waitForTimeout(5000);
    await this.page.waitForLoadState('networkidle');
  }

  async joinCaseFlow(advocateMobile, filingNumber, accessCode, respondentName, litigantMobile, noOfAdvocates = '1') {
    await this.loginWithMobile(advocateMobile);
    await this.searchAndSelectCase(filingNumber);
    await this.verifyAccessCode(accessCode);
    await this.selectLitigantDetails(respondentName);
    await this.verifyAdvocateMobile(litigantMobile);
    await this.uploadVakalatnama(noOfAdvocates);
  }
  /**
   * 7.1 — Registered accused joins case as Party in Person (no advocate).
   */
  async joinAsAccused(filingNumber, accessCode, respondentName) {
    await this.loginWithMobile(this.globals.accusedLitigant);
    await this.searchAndSelectCase(filingNumber);
    await this.verifyAccessCode(accessCode);

    // Select Accused role
    await this.accusedRadio.check();
    // Not representing anyone (PiP = No)
    await this.noRadio.check();
    await this.page.waitForTimeout(1000);

    // "Which litigant are you?" — check if it's pre-selected (disabled readonly input)
    // When there is only one accused the app auto-populates the field; opening the
    // dropdown on a disabled input causes an infinite hang.
    const litigantContainer = this.page.locator('div').filter({ hasText: /^Which litigant are you\?$/ });
    const disabledInput = litigantContainer.locator('input[disabled], input[readonly]');
    const isPreSelected = await disabledInput.count() > 0;

    if (isPreSelected) {
      console.log(`[joinAsAccused] Litigant already pre-selected: ${await disabledInput.first().inputValue().catch(() => 'unknown')}`);
    } else {
      // Multiple litigants — open dropdown and pick the right one
      await litigantContainer.getByRole('img').click({ force: true });
      await this.page.waitForTimeout(500);
      const accusedOpt = this.page.locator('#jk-dropdown-unique div').filter({ hasText: respondentName });
      if (await accusedOpt.count() > 0) {
        await accusedOpt.first().click();
      } else {
        console.log(`[joinAsAccused] Option not found for: ${respondentName}, selecting first available`);
        await this.page.locator('#jk-dropdown-unique div').first().click();
      }
      await this.page.waitForTimeout(500);
    }

    // Not joining as Party in Person — click the "No" span
    await this.page.locator('div').filter({ hasText: /^Are you joining as a Party in Person\?YesNo$/ }).locator('span').nth(2).click();
    await this.proceedBtn.click();
    await this.page.waitForTimeout(5000);
    await this.page.waitForLoadState('networkidle');
  }



  /**
   * 7.2 — Accused advocate joins replacing the PiP, with judge approval and payment.
   */
  async joinAsAdvocatePip(filingNumber, accessCode, noOfAdvocates) {
    await this.loginWithMobile(this.globals.accusedADV);
    await this.searchAndSelectCase(filingNumber);
    await this.verifyAccessCode(accessCode);

    // Select Accused role, representing someone (Yes)
    await this.accusedRadio.check();
    await this.page.locator('div').filter({ hasText: /^Yes$/ }).getByRole('radio').check();

    // Select which litigants to represent — use img chevron (force:true bypasses select-wrap overlay)
    await this.page.locator('div').filter({ hasText: /^Which litigant\(s\) are you representing\?$/ }).getByRole('img').click({ force: true });
    await this.page.locator('div').filter({ hasText: /^Automation Accused$/ }).getByRole('checkbox').check();
    await this.page.getByText('BackProceed').click();

    // Select advocate to replace — use img chevron (force:true bypasses select-wrap overlay)
    await this.page.locator('div').filter({ hasText: /^Which advocates are you replacing\?$/ }).getByRole('img').click({ force: true });
    await this.page.locator('div').filter({ hasText: /^Select All$/ }).getByRole('checkbox').check();
    await this.page.getByText('BackProceed').click();

    // Judge approval + reason
    await this.page.locator('div').filter({ hasText: /^Judge$/ }).getByRole('radio').check();
    await this.page.getByRole('textbox', { name: 'Type here' }).fill('replacement text');
    await this.proceedBtn.click();

    // Fill advocate details
    await this.page.locator('input[name="noOfAdvocates"]').fill(noOfAdvocates || this.globals.noOfAdvocates || '1');
    await this.page.waitForTimeout(1000);

    // Resolve Vakalatnama path absolutely
    const vakalatRelPath = this.globals.VakalatnamaPath || 'documents/Vakalatnama.png';
    const vakalatPath = path.isAbsolute(vakalatRelPath)
      ? vakalatRelPath
      : resolveFromUiE2E(...vakalatRelPath.split('/'));

    if (fs.existsSync(vakalatPath)) {
      await this.page.locator('input[type="file"]').setInputFiles(vakalatPath);
    } else {
      console.warn(`[JoinCasePage] Vakalatnama file not found: ${vakalatPath}`);
    }
    await this.page.waitForTimeout(2000);
    await this.proceedBtn.click();
    await this.page.waitForTimeout(5000);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 7.5 — Second accused advocate joins case: adding advocate without payment (judge approval).
   * Logs in with globals.advocateMobileNumber2 (dedicated second advocate mobile).
   */
  async joinAsAdvocateAddWithoutPayment(filingNumber, accessCode) {
    await this.loginWithMobile(this.globals.advocateMobileNumber2 || this.globals.accusedADV);
    await this.searchAndSelectCase(filingNumber);
    await this.verifyAccessCode(accessCode);

    // Select Accused role, not replacing (No)
    await this.accusedRadio.check();
    await this.noRadio.check();
    await this.page.waitForTimeout(1000);

    // Select litigant to represent — use img chevron (force:true bypasses select-wrap overlay)
    await this.page.locator('div').filter({ hasText: /^Which litigant\(s\) are you representing\?$/ }).getByRole('img').click({ force: true });
    await this.page.waitForTimeout(500);
    // Checkbox may be rendered as disabled in DOM but is still interactable via UI — use force:true
    await this.page.locator('div').filter({ hasText: /^Automation Accused$/ }).getByRole('checkbox').check({ force: true });
    await this.page.getByText('ComplainantAccused').click();
    await this.proceedBtn.click();

    // No payment
    await this.noRadio.check();
    await this.page.waitForTimeout(2000);
    await this.proceedBtn.click();
    await this.page.waitForTimeout(5000);
    await this.page.waitForLoadState('networkidle');
  }



  /**
   * 7.6 — Third accused advocate replaces an existing advocate, without payment (judge approval).
   * Logs in with globals.advocateMobileNumber3 (dedicated third advocate mobile).
   */
  async joinAsAdvocateReplaceWithoutPayment(filingNumber, accessCode) {
    await this.loginWithMobile(this.globals.advocateMobileNumber3 || this.globals.accusedADV);
    await this.searchAndSelectCase(filingNumber);
    await this.verifyAccessCode(accessCode);

    // Select Accused role, replacing (Yes)
    await this.accusedRadio.check();
    await this.page.locator('div').filter({ hasText: /^Yes$/ }).getByRole('radio').check();
    await this.page.waitForTimeout(1000);

    // Select all litigants — use img chevron (force:true bypasses select-wrap overlay)
    await this.page.locator('div').filter({ hasText: /^Which litigant\(s\) are you representing\?$/ }).getByRole('img').click({ force: true });
    await this.page.waitForTimeout(500);
    // Checkbox may appear disabled in DOM — force:true bypasses disabled attribute
    await this.page.locator('div').filter({ hasText: /^Select All$/ }).getByRole('checkbox').check({ force: true });
    await this.page.getByText('BackProceed').click();

    // Select the advocate to replace — use img chevron (force:true bypasses select-wrap overlay)
    await this.page.locator('div').filter({ hasText: /^Which advocates are you replacing\?$/ }).getByRole('img').click({ force: true });
    await this.page.waitForTimeout(500);
    await this.page.locator('div').filter({ hasText: /^ADV ACC \(Automation Accused\)$/ }).getByRole('checkbox').check({ force: true });
    await this.page.getByText('BackProceed').click();

    // Judge approval + reason
    await this.page.locator('div').filter({ hasText: /^Judge$/ }).getByRole('radio').check();
    await this.page.getByRole('textbox', { name: 'Type here' }).fill('test');
    await this.proceedBtn.click();

    // No payment
    await this.noRadio.check();
    await this.page.waitForTimeout(2000);
    await this.proceedBtn.click();
    await this.page.waitForTimeout(5000);

    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = { JoinCasePage };
