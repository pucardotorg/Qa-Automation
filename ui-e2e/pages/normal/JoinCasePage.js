const { expect } = require('@playwright/test');
const { BasePage } = require('../common/BasePage');

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
    await this.validationCodeInput.click();
    await this.validationCodeInput.click();
    await this.page.waitForTimeout(1000);
    await this.validationCodeInput.fill(accessCode);
    await this.page.waitForTimeout(1000);
    await this.verifyBtn.click();
    await this.page.waitForTimeout(2000);
    await this.joinCaseBtn.nth(1).click();
    await this.page.waitForTimeout(2000);
  }

  async selectLitigantDetails(respondentName) {
    await this.accusedRadio.check();
    await this.noRadio.check();
    await this.litigantDropdown.click();
    await this.page.locator('div').filter({ hasText: new RegExp(`^${respondentName}`) }).getByRole('checkbox').check();
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
    await this.page.locator('input[type="file"]').setInputFiles('./documents/Affidavit.pdf');
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
}

module.exports = { JoinCasePage };
