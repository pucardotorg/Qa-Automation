const fs = require('fs');
const path = require('path');
const { Given, When, Then } = require('@cucumber/cucumber');
const LitigentUserSearch = require('../pageobjects/LitigentUserSearch.js'); // Ensure this path is correct

let authToken;
let userUuid; // This will hold the UUID for the litigant

Given('I want to search for a litigant', function () {
  console.log('Setting up search for litigant...');
  //userUuid = 'f562d86f-57b2-472d-a159-cba6bcbd3e5c'; // Hardcoded for testing
});

When('I request the litigant user information', async function () {
  console.log('Requesting litigant user information...');
  const globalVarsPath = path.join(__dirname, '..', 'globalcitizenvariable.json');
  const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
  authToken = globalVars.litgantAuthToken;
  userUuid = globalVars.litigantUUID;
   // userUuidGet the auth token from the global variables
  console.log('Using litigantAuthToken:', authToken); // Log the token to verify
  console.log('Global Variables:', globalVars); // Log global variables for debugging
  
  // Proceed with the request
  const response = await LitigentUserSearch.searchLitigantByUuid(userUuid, authToken);
  this.response = response; // Store the response for later validation
});

Then('the response should be successful and contain the litigant information', function () {
  console.log('Response:', this.response);
  if (!this.response || this.response.ResponseInfo.status !== 'successful') {
    throw new Error('Expected successful response, but got: ' + JSON.stringify(this.response));
  }
});