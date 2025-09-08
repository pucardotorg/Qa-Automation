import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://dristi-kerala-qa.pucar.org/ui/employee/user/login');
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill('michaelGeorgeJudge');
  await page.locator('input[name="username"]').press('Tab');
  await page.locator('input[name="password"]').fill('');
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill('Beehyv@123');
  await page.getByRole('button').click();
  await page.getByRole('link', { name: 'All Cases' }).click();
  await page.getByRole('row', { name: 'AUTOMATION LIT vs Automation Accused Registration KL-001495-2025 NIA S138 08-09-' }).getByRole('cell').first().click();
  await page.getByRole('button').filter({ hasText: 'Register Case' }).click();
  await page.getByRole('button', { name: 'Schedule Hearing' }).click();
  await page.getByText('Select Custom Date').click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('button', { name: '1 Hearings' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.getByRole('button').filter({ hasText: 'Generate Order' }).click();
  await page.getByRole('button').filter({ hasText: 'Generate Order' }).click();
  await page.getByRole('button').filter({ hasText: 'Generate Order' }).click();



  await page.getByRole('textbox', { name: 'rdw-editor' }).click();
  await page.getByRole('textbox', { name: 'rdw-editor' }).fill('AUTOMATION ORDER GENERATED');
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.locator('div').filter({ hasText: /^Names Of Parties Required\*$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^AUTOMATION LIT \(Complainant\)$/ }).getByRole('checkbox').check();
  await page.locator('div').filter({ hasText: /^Automation Accused \(Accused\)$/ }).getByRole('checkbox').check();
  await page.locator('form').getByRole('button').filter({ hasText: 'Confirm' }).click();
  await page.getByRole('button').filter({ hasText: 'Preview PDF' }).click();
  await page.getByRole('button', { name: 'Add Signature' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByText('click here').click();
  const download = await downloadPromise;
  await page.getByRole('button', { name: 'Upload Order Document with' }).click();
  await page.locator('div').filter({ hasText: /^Drag and drop your file or Browse in my files$/ }).click();
  await page.locator('body').setInputFiles('Order.pdf');
  await page.getByRole('button', { name: 'Submit Signature' }).click();
  await page.getByRole('button', { name: 'Issue Order' }).click();
  await page.getByText('You have successfully issued').click();


  await page.getByRole('button', { name: 'Issue Notice' }).click();
  
  await page.locator('div').filter({ hasText: /^EditDelete$/ }).locator('div').nth(1).click();
  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Notice' }).click();
  await page.locator('div').filter({ hasText: /^Notice Type\*$/ }).getByRole('textbox').click();
  await page.locator('#jk-dropdown-unique div').filter({ hasText: 'Section 223 Notice' }).click();
  await page.locator('div').filter({ hasText: /^Notice to the Party\*$/ }).getByRole('textbox').click();
  await page.getByText('Automation Accused (Accused)').click();
  await page.getByRole('checkbox', { name: 'Add, city, district,' }).check();
  await page.getByRole('button').filter({ hasText: 'Confirm' }).click();
  await page.getByRole('button').filter({ hasText: 'Preview PDF' }).click();
  await page.getByRole('button', { name: 'Add Signature' }).click();
  const download1Promise = page.waitForEvent('download');
  await page.getByText('click here').click();
  const download1 = await download1Promise;
  await page.getByRole('button', { name: 'Upload Order Document with' }).click();
  await page.locator('div').filter({ hasText: /^Drag and drop your file or Browse in my files$/ }).click();
  await page.locator('body').setInputFiles('Order.pdf');
  await page.getByRole('button', { name: 'Submit Signature' }).click();
  await page.getByRole('button', { name: 'Issue Order' }).click();
  await page.getByText('You have successfully issued').click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('heading', { name: 'Order successfully issued!' }).click();
  
});