import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
const globalVarsPath = path.join(__dirname, "../../global-variables.json");
let globalVariables = JSON.parse(fs.readFileSync(globalVarsPath, "utf8"));

test("Dristi Kerala login and selecting notice address and payment method", async ({ page }) => {
  test.setTimeout(180000);
  // Go to the login page
  await page.goto(`${globalVariables.baseURL}ui/citizen/select-language`);
  // sign in
  await page.getByRole("button").click();
  // Enter mobile number
  await page.getByRole("textbox").fill(globalVariables.citizenUsername);

  // Click on Sign In button
  await page.getByRole("button").click();
  // Enter OTP
  await page.locator(".input-otp").first().fill("1");
  await page.locator("input:nth-child(2)").fill("2");
  await page.locator("input:nth-child(3)").fill("3");
  await page.locator("input:nth-child(4)").fill("4");
  await page.locator("input:nth-child(5)").fill("5");
  await page.locator("input:nth-child(6)").fill("6");

  // Click on Verify button
  await page.getByRole("button", { name: "Verify" }).click();

  // Search for the case using filing number
  await page.waitForTimeout(1000);
  await page.getByRole('cell', { name: globalVariables.cmpNumber }).click();
  await page.waitForTimeout(1000);

  // Selecting the notice pending payment
  await page.getByText('Take Steps - Notice').click();
  test.setTimeout(180000);
  // Selecting the address and payment menthod for notice
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('.header-end > div > svg').click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  await page.close();
});