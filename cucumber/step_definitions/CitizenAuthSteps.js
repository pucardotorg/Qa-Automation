const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');
const CitizenAuthPage = require('../pageobjects/CitizenAuthPage.js'); // Ensure this path is correct

let authToken;

Given('I want to login auth token', function () {
  console.log('Setting up login for auth token...');
});

When('I click on citizen URL', async function () {
  console.log('Clicking on citizen URL...');
  authToken = await CitizenAuthPage.getAuthToken(); // Assuming this method fetches the token
});

Then('auth token is generated as {string}', function (expected) {
  console.log('Auth Token:', authToken);
  if (expected !== 'authtoken') {
    throw new Error(`Expected keyword "authtoken", got "${expected}"`);
  }

  // Save the authToken to globalcitizenvariable.json
  const globalVarsPath = path.join(__dirname, '..', 'globalcitizenvariable.json');

  // Initialize globalVars as an empty object
  let globalVars = {};

  // Check if the file exists and read its content
  if (fs.existsSync(globalVarsPath)) {
    const fileContent = fs.readFileSync(globalVarsPath, 'utf8');
    if (fileContent) {
      globalVars = JSON.parse(fileContent);
    }
  }

  // Update the authToken
  globalVars.citizenAuthToken = authToken;

  // Write the updated content back to the file
  fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
});
