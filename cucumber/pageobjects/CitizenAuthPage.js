const { request } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class CitizenAuthPage {
  constructor() {
    this.globalVarsPath = path.join(__dirname, '..', 'globalcitizenvariable.json');
    this.headers = {
      Authorization: 'Basic ZWdvdi11c2VyLWNsaWVudDo=',
    };
  }

  async getAuthToken() {
    let globalVars = JSON.parse(fs.readFileSync(this.globalVarsPath, 'utf8'));
    const apiContext = await request.newContext();
    const response = await apiContext.post(`${globalVars.baseURL}user/oauth/token?`, {
      headers: this.headers,
      form: {
        username: process.env.CITIZEN_USERNAME,
        password: process.env.CITIZEN_PASSWORD,
        tenantId: "kl",
        userType: "citizen",
        scope: "read",
        grant_type: "password",
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to fetch auth token: ${response.status()} - ${await response.text()}`);
    }

    const responseJson = await response.json();
    const citizentoken = responseJson.access_token;
    const citizenUserInfo = responseJson.UserRequest; // Adjust this based on your actual response structure

    // Read and update global variables
    globalVars.citizenAuthToken = citizentoken;
    globalVars.citizenUserInfo = citizenUserInfo; // Save the citizen user info

    // Write the updated content back to the file
   fs.writeFileSync(this.globalVarsPath, JSON.stringify(globalVars, null, 2));
      console.log('Successfully updated globalcitizenvariable.json');

    console.log("Full response:", responseJson);
    console.log("Access token:", citizentoken);
    console.log("Citizen User Info:", citizenUserInfo);

    return citizentoken; // Return the token if needed
  }
}

module.exports = new CitizenAuthPage();