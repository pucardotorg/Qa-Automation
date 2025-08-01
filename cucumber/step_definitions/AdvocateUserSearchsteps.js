const fs = require('fs');
const path = require('path');
const { Given, When, Then } = require('@cucumber/cucumber');
const AdvocateUserSearch = require('../pageobjects/AdvocateUserSearch.js'); // Ensure this path is correct

let authToken;

Given('I want to search for an advocate', function () {
  console.log('Setting up search for advocate...');
   // Replace with the actual mobile number or UUID
});

When('I request the advocate user information', async function () {
  console.log('Requesting advocate user information...');
  const globalVarsPath = path.join(__dirname, '..', 'globalcitizenvariable.json');
  const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
  authToken = globalVars.citizenAuthToken; // Get the auth token from the global variables
  console.log('Using citizenAuthToken:', authToken); // Log the token to verify
  
  // Check if citizenUserInfo is defined
  //console.log('Global Variables:', globalVars); // Log global variables for debugging
  const uuid = globalVars.citizenUserInfo?.uuid; // Use optional chaining to avoid errors
  console.log('Using mobileNumber:', uuid); // Log the mobile number to verify
  
  // Proceed with the request
  const response = await AdvocateIndividualSearch.searchAdvocateByMobileNumber(mobileNumber, authToken);
  console.log('Response from searchAdvocateByMobileNumber:', response); // Log the response
  this.response = response; // Store the response for later validation
});

Then('the response should be successful and contain the advocate information', function () {
  console.log('Response:', this.response);
  
});