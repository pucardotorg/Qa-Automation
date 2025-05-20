import { test, expect } from '@playwright/test';

test('Login and Search Case Test', async ({ page }) => {
  // Navigate to the login page
  await page.goto('https://dristi-kerala-uat.pucar.org/digit-ui/citizen/dristi/home/login');
  await page.waitForLoadState('networkidle');

  // Verify the page title
  const title = await page.title();
  console.log('Page title:', title);

  // Enter mobile number
  const mobileInput = page.getByRole('textbox').or(page.locator('input[type="text"]'));
  await expect(mobileInput).toBeVisible({ timeout: 10000 });
  await mobileInput.fill('9032273758');
  
  // Wait and click Sign In - using multiple possible selectors
  const signInButton = page.locator('button:has-text("Sign In")').or(
    page.getByRole('button', { name: 'Sign In' })
  ).or(
    page.locator('button[type="submit"]')
  ).or(
    page.locator('.submit-bar')
  );

  // Wait for button to be visible and enabled
  await expect(signInButton).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Click the button
  try {
    await signInButton.click({ timeout: 10000 });
    console.log('Successfully clicked Sign In button');
  } catch (error) {
    console.log('Error clicking button:', error);
    await signInButton.click({ force: true });
  }

  // Wait for OTP popup
  console.log('Waiting for OTP popup...');
  await page.waitForTimeout(5000);

  // Get all text inputs after the mobile number input
  const otpInputs = await page.locator('input[type="text"]').all();
  console.log('Found', otpInputs.length, 'potential OTP input fields');

  // Enter OTP digits
  const otpDigits = ['1', '2', '3', '4', '5', '6'];
  for (let i = 1; i < otpInputs.length && i <= 6; i++) {
    try {
      await otpInputs[i].fill(otpDigits[i-1]);
      await page.waitForTimeout(500);
    } catch (error) {
      console.log('Failed to enter digit in input field', i, error);
    }
  }

  await page.waitForTimeout(1000);

  // Click Verify button
  try {
    const verifyButton = page.getByRole('button', { name: /verify/i }).or(
      page.locator('button:has-text("Verify")')
    ).or(
      page.locator('button[type="submit"]').last()
    );

    await verifyButton.waitFor({ state: 'visible', timeout: 5000 });
    await verifyButton.click();
    console.log('Successfully clicked Verify button');
    
    // Wait for page to load after verification
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  } catch (error) {
    console.log('Failed to find or click Verify button:', error);
  }

  // Now search for the case
  console.log('Searching for case...');
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Find and fill the Case Name or ID field using exact XPath
  const caseNameField = page.locator('xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[3]/div/input[1]');
  
  await expect(caseNameField).toBeVisible({ timeout: 10000 });
  console.log('Found Case Name or ID field, entering case ID...');
  await caseNameField.fill('KL-001007-2025');
  
  // Debug: Log all buttons on the page
  const allButtons = await page.locator('button').all();
  console.log('Found', allButtons.length, 'buttons on the page');
  for (const button of allButtons) {
    const text = await button.textContent();
    const isVisible = await button.isVisible();
    console.log('Button text:', text, 'Visible:', isVisible);
  }
  
  // Find the form element first
  const searchForm = page.locator('form').filter({ hasText: 'Case Name or ID' });
  
  // Then find the search button within the form
  const searchButton = searchForm.locator('button').filter({ hasText: 'Search' });
  
  // Verify it's the search button
  const buttonText = await searchButton.textContent();
  console.log('Found button with text:', buttonText);
  
  await expect(searchButton).toBeVisible({ timeout: 10000 });
  console.log('Found search button, attempting to click...');
  
  // Take a screenshot before clicking
  await page.screenshot({ path: 'before-search-click.png' });
  
  // Click with a small delay to ensure the page is ready
  await page.waitForTimeout(1000);
  await searchButton.click();
  console.log('Clicked search button');
  
  // Wait for any network requests to complete
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot after clicking
  await page.screenshot({ path: 'after-search-click.png' });
  
  // Wait for 5 seconds to display the case results
  console.log('Waiting for case results...');
  await page.waitForTimeout(5000);
  
  // Log completion
  console.log('Test completed');
}); 