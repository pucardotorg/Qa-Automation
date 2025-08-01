const fs = require('fs');
const path = require('path');
const { Given, When, Then } = require('@cucumber/cucumber');
const LitigentAuthPage = require('../pageobjects/LitigentAuthPage.js'); // Ensure this path is correct

let authToken;

Given('I want to login as a litigant', function () {
  console.log('Setting up login for litigant...');
});

When('I request the litigant auth token', async function () {
  console.log('Requesting litigant auth token...');
  authToken = await LitigentAuthPage.getlitAuthToken(); // Fetch the token
});

Then('litigant auth token is generated as {string}', function (expected) {
  console.log('Auth Token:', authToken);
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
  globalVars.litgantAuthToken = authToken;

  // Write the updated content back to the file
  fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
});