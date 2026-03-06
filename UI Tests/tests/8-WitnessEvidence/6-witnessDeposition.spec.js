import { test, expect } from "@playwright/test";
import globalVariables from "../../global-variables.json";
import fs from "fs";
import path from "path";
const globalVarsPath = path.join(__dirname, "../../global-variables.json");

test("Witness Deposition Test", async ({ page }) => {
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

  // Wait for home page to load
  console.log("Waiting for home page to load...");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000); // Additional wait to ensure page is fully loaded

  // click on "All Cases" button
  await page.getByRole("link", { name: "All Cases" }).click();
  // Set the case ID to search for
  const caseId = globalVariables.filingNumber;

  // Wait for the page to be fully loaded
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // Find and fill the Case Name or ID field using updated XPath
  const caseNameField = page.locator(
    'xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[3]/div/input',
  );
  await expect(caseNameField).toBeVisible({ timeout: 10000 });
  console.log("Found Case Name or ID field, entering case ID...");
  await caseNameField.type(caseId);
  await caseNameField.press("Enter");

  // Click the search button after entering the case ID
  const searchButton = page.locator(
    'xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[2]/form/div/div/div[4]/button/header',
  );
  await expect(searchButton).toBeVisible({ timeout: 10000 });
  await searchButton.click();

  // Wait for the record to be displayed after search
  console.log("Filling Number-" + caseId);

  const resultRow = page.locator("tr");
  await expect(resultRow.first()).toBeVisible({ timeout: 10000 });

  // Click on the case ID after search using the provided XPath
  const caseIdCell = page.locator(
    'xpath=//*[@id="root"]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[2]/div/span/table/tbody/tr[1]/td[1]',
  );
  await expect(caseIdCell).toBeVisible({ timeout: 10000 });
  const clickableLink = caseIdCell.locator("a,button");
  if ((await clickableLink.count()) > 0) {
    await clickableLink.first().click();
    console.log("Clicked child link/button in case ID cell");
  } else {
    await caseIdCell.click();
    console.log("Clicked case ID cell directly");
  }
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // Click on kebab menu
  await page.getByRole("img").nth(5).click();

  // Click on "Take Witness Deposition" option
  await page.getByText("Take Witness Deposition").click();
  await page.waitForTimeout(2000);

  // Select witness from dropdown
  await page.locator(".select > .cp").first().click();
  await page.locator(".cp.profile-dropdown--item").first().click();

  // Select Witness Marked As option from dropdown
  await page.locator("div:nth-child(2) > .select-wrap > .select > .cp").click();
  await page.locator(".cp.profile-dropdown--item").first().click();

  // Enter the deposition details in the text editor
  await page.locator(".ql-editor").click();
  await page.locator(".ql-editor").fill("Checking witness deposition");
  // Submit the witness deposition
  await page.getByRole("button", { name: "Submit" }).click();

  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Submit & E-Sign" }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  await page.getByRole("button", { name: "Proceed To Sign" }).click();

  await page.getByRole("button", { name: "Upload Signed copy" }).click();
  // download the document
  await page.getByText("click here").click();
  let [download] = await Promise.all([
    page.waitForEvent("download"), // wait for the download trigger
    page.click("text=click here"), // replace with your selector
  ]);

  const projectDownloadPath = path.join(
    __dirname,
    "downloads",
    await download.suggestedFilename(),
  );

  // Save the file to the defined path2
  await download.saveAs(projectDownloadPath);
  console.log(`File downloaded and saved to: ${projectDownloadPath}`);
  await page.waitForTimeout(2000);
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(projectDownloadPath);

  await page.getByRole("button", { name: "Submit" }).nth(1).click();
  //   await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  await page.getByRole("button", { name: "Close" }).click();

  await page.waitForTimeout(2000);
  await page.getByRole("button").filter({ hasText: /^$/ }).click();

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  //   go to home page
  const home = page.getByRole("link", { name: "Home" });
  await expect(home).toBeVisible({ timeout: 5000 });
  await Promise.all([page.waitForNavigation(), home.click()]);

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);

  // Witness Deposition Validation
  await page.getByText("Sign Witness Deposition").click();
  await page.getByRole("textbox").click();
  console.log("Filing Number : " + caseId);
  await page.getByRole("textbox").fill(caseId);

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  const searchbutton = page.locator(
    "xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div/div[2]/div[1]/div[2]/div[1]/div[1]/div/div/form/div/div/div[2]/button/header",
  );
  await expect(searchbutton).toBeVisible({ timeout: 10000 });
  await searchbutton.click();

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  const resultrow = page.locator("tr");
  await expect(resultrow.first()).toBeVisible({ timeout: 10000 });

  const caseIdcell = page.locator(
    "xpath=/html/body/div[1]/div/div/div/div[2]/div/div/div/div/div[2]/div[1]/div[2]/div[1]/div[2]/div/span/table/tbody/tr[1]/td[2]",
  );
  await expect(caseIdcell).toBeVisible({ timeout: 20000 });
  const clickablelink = caseIdcell.locator("a,button");
  if ((await clickablelink.count()) > 0) {
    await clickablelink.first().click();
    console.log("Clicked child link/button in case ID cell");
  } else {
    await caseIdcell.click();
    console.log("Clicked case ID cell directly");
  }
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  await page.getByRole("button", { name: "Proceed To Sign" }).click();

  await page.getByText("click here").click();
  [download] = await Promise.all([
    page.waitForEvent("download"), // wait for the download trigger
    page.click("text=click here"), // replace with your selector
  ]);

  const projectDownloadpath = path.join(
    __dirname,
    "downloads",
    await download.suggestedFilename(),
  );

  // Save the file to the defined path2
  await download.saveAs(projectDownloadpath);
  console.log(`File downloaded and saved to: ${projectDownloadpath}`);

  await page
    .getByRole("button", { name: "Upload Order Document with Signature" })
    .click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(projectDownloadpath);

  await page.getByRole("button", { name: "Submit Signature" }).click();
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: "Submit" }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  await page.getByRole("button", { name: "Close" }).click();
  await page.close();
});
