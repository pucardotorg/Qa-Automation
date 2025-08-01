import { Given, When, Then } from '@cucumber/cucumber';
import CitizenAuthPage from '../pageObjects/citizenauthpage.js';

let authToken;

Given('I have valid credentials', function () {
  console.log('Setting up valid credentials...');
});

When('I request the citizen auth token', async function () {
  authToken = await CitizenAuthPage.getAuthToken();
});

Then('I should receive a valid auth token', function () {
  console.log('Auth Token:', authToken);
  if (!authToken) {
    throw new Error('Auth token was not received');
  }
});

module.exports = {
  default: {
    require: [
      'step_definitions/**/*.js',
      'pageObjects/**/*.js'
    ],
    format: ['progress'],
    publishQuiet: true,
  },
};