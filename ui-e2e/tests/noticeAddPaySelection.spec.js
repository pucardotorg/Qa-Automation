const { test } = require('@playwright/test');
const { LoginPage } = require('../pages/common/LoginPage');
const { NoticePaymentPage } = require('../pages/normal/NoticePaymentPage');
const { loadGlobalVariables } = require('../helpers/env');

test('Citizen selects notice address and payment method', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const login = new LoginPage(page, globals);
  const noticePayment = new NoticePaymentPage(page, globals);

  // Login as citizen
  await login.open();
  await login.loginWithMobileOtp(globals.citizenUsername);
  
  // Wait for dashboard to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Complete notice payment flow
  await noticePayment.completeNoticePaymentFlow(globals.cmpNumber);
});
