import { test, expect } from "@playwright/test";
import globalVariables from "../../global-variables.json";
import fs from "fs";
import path from "path";
const globalVarsPath = path.join(__dirname, "../../global-variables.json");

test("Start Hearing Test", async ({ page }) => {
  test.setTimeout(1800000);
  // Navigate to the employee login page
  console.log("Navigating to employee login page...");
  await page.goto(`${globalVariables.baseURL}ui/employee/user/login`);
  await page.waitForLoadState("networkidle");

  console.log("Entering username...");
  const usernameInput = page.locator('input[name="username"]');
  //await expect(usernameInput).toBeVisible({ timeout: 10000 });
  await usernameInput.fill(globalVariables.judgeUsername);
  console.log(`Entered username: ${globalVariables.judgeUsername}`);

  // Enter password
  console.log("Entering password...");
  const passwordInput = page.locator('input[name="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await passwordInput.fill(globalVariables.judgePassword);
  console.log("Entered password");

  // Click Continue button
  console.log("Looking for Continue button...");
  const continueButton = page
    .getByRole("button", { name: "Continue" })
    .or(page.locator('button:has-text("Continue")'));
  await expect(continueButton).toBeVisible({ timeout: 10000 });
  await continueButton.click();
  console.log("Clicked Continue button");

  // Fill the case number in the search field and click on the case
  await page
    .getByRole("textbox", { name: "Search Case Name or Number" })
    .click();

  const caseId = globalVariables.filingNumber;
  await page.waitForTimeout(2000);
  console.log(`Searching for case ID: ${caseId}`);
  await page
    .getByRole("textbox", { name: "Search Case Name or Number" })
    .fill(caseId);
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.waitForLoadState("networkidle");

  await page.locator("td:nth-child(7) > div > div > div > svg > path").click();
  await page.waitForTimeout(5000);

  console.log("Clicking on Start Hearing...");
  // Click on "Start Hearing" button

  await page.getByText("Start Hearing").click();
  await page.waitForLoadState("networkidle");
  console.log("Clicked on Start Hearing");
  await page.waitForTimeout(5000);
  console.log("Test completed successfully");
  await page.close();
});
