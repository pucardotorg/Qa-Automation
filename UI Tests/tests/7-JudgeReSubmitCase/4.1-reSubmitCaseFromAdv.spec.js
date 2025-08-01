import { test, expect } from "@playwright/test";
const path = require("path");
const fs = require("fs");

// Load global variables
const globalVarsPath = path.resolve(__dirname, "../../global-variables.json");
const globalVariables = JSON.parse(
  fs.readFileSync(globalVarsPath, "utf8")
);
test("Dristi Kerala login and file a case", async ({ page }) => {
  // Go to the login page
  test.setTimeout(120000);
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
  // case search
  // Assuming the file input exists (even if hidden)
  const fileInput = await page.$('input[type="file"]');

  // Path to the file you want to upload
  const filePath = path.resolve(__dirname, "./Test.png");
  //await fileInput.setInputFiles(filePath);
  await page.locator('input[name="caseSearchText"]').click();
  await page
    .locator('input[name="caseSearchText"]')
    .fill(globalVariables.filingNumber);
  await page.getByRole("button").filter({ hasText: "Search" }).click();
  await page.getByRole("cell", { name: globalVariables.filingNumber }).click();
  await page.waitForTimeout(2000);
  await page.getByRole("button").filter({ hasText: "Next" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button").filter({ hasText: "Next" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button").filter({ hasText: "Next" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button").filter({ hasText: "Next" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button").filter({ hasText: "Next" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button").filter({ hasText: "Next" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button").filter({ hasText: "Next" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button").filter({ hasText: "Next" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button").filter({ hasText: "Next" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button").filter({ hasText: "Skip & Continue" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button").filter({ hasText: "Next" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Upload Signed copy" }).click();
  await page.getByRole("button", { name: "Upload Signed PDF" }).click();
  await page.locator('input[type="file"]').first().setInputFiles(filePath);
  await page.getByRole("button", { name: "Submit Signature" }).click();
  await page.waitForTimeout(3000);
  await page.getByRole("button").filter({ hasText: "Submit Case" }).click();
  await page.waitForTimeout(3000);
});
