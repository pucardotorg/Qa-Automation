const fs = require('fs');
const path = require('path');
const { Given, When, Then } = require('@cucumber/cucumber');
const AdvocateUserSearchIndividual = require('../pageobjects/AdvocateUserSearchIndividual'); // Ensure this path is correct

let authToken;
let userUuid; // This will hold the UUID for the advocate

Given('I want to search for an individual advocate', function () {
  console.log('Setting up search for individual advocate...');
  userUuid = 'your-advocate-mobile-number'; // Replace with the actual mobile number or UUID
});

When('I request the individual advocate information', async function () {
  console.log('Requesting individual advocate information...');
  const globalVarsPath = path.join(__dirname, '..', 'globalcitizenvariable.json');
  const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
  authToken = globalVars.citizenAuthToken; // Get the auth token from the global variables
  console.log('Using citizenAuthToken:', authToken); // Log the token to verify
  const uuid = globalVars.citizenUserInfo?.uuid; // Use optional chaining to avoid errors
  console.log('Using mobileNumber:', uuid);
  // Proceed with the request
  const response = await AdvocateUserSearchIndividual.searchIndividualAdvocateByUuid(uuid, authToken);
  this.response = response; // Store the response for later validation
});

Then('the response should be successful and contain the advocate information', function () {
  console.log('Response:', this.response);
  
});