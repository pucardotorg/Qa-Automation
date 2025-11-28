// e2e/helpers/auth.js
/**
 * Perform language selection, mobile sign-in and OTP verification.
 * Uses process.env.MOBILE and process.env.OTP if available.
 * @param {import('@playwright/test').Page} page
 */
async function loginCitizen(page) {
  // Navigate to language selection
  await page.goto('/ui/citizen/select-language');
  // Continue with default English
  await page.getByRole('button', { name: /continue/i }).click();

  // Mobile login
  const mobile = process.env.MOBILE || '8827000000';
  await page.getByRole('textbox').first().fill(mobile);
  await page.getByRole('button', { name: /sign in/i }).click();

  // OTP inputs (6 boxes)
  const otp = (process.env.OTP || '123456').padEnd(6, '0').slice(0, 6);
  const boxes = await page.getByRole('textbox').all();
  // Ensure we type into the last 6 OTP inputs on the page
  const lastSix = boxes.slice(-6);
  for (let i = 0; i < lastSix.length; i++) {
    await lastSix[i].fill(otp[i]);
  }
  await page.getByRole('button', { name: /verify/i }).click();

  // Wait for home to load (pending tasks/home dashboard)
  await page.waitForURL(/\/ui\/citizen\/(home|dristi\/home)/);
}

module.exports = { loginCitizen };
