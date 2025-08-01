const { request } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class LitigentAuthPage {
  constructor() {
    this.globalVarsPath = path.join(__dirname, '..', 'globalcitizenvariable.json');
    this.headers = {
      Authorization: 'Basic ZWdvdi11c2VyLWNsaWVudDo=',
    };
  }

  async getlitAuthToken() {
    let globalVars = JSON.parse(fs.readFileSync(this.globalVarsPath, 'utf8'));
    const apiContext = await request.newContext();
    const response = await apiContext.post(`${globalVars.baseURL}user/oauth/token?`, {
      headers: this.headers,
      form: {
        username: process.env.LITIGENT_USERNAME,
        password: process.env.LITIGENT_PASSWORD,
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
    const litigantToken = responseJson.access_token;

    // Ensure you are accessing the correct field for litigantUUID
    const litigantUUID = responseJson.UserRequest ? responseJson.UserRequest.uuid : null; // Adjust based on your actual response structure

    // Save the token and UUID to globalcitizenvariable.json
    const globalVarsPath = path.join(__dirname, '..', 'globalcitizenvariable.json');
    let globalVarsToUpdate = {};
    if (fs.existsSync(globalVarsPath)) {
      globalVarsToUpdate = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
    }

    //globalVarsToUpdate.litigantAuthToken = litigantToken;
    globalVarsToUpdate.litigantUUID = litigantUUID; 
    globalVarsToUpdate.litigentIndividualResponse=responseJson;// Save the UUID

    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVarsToUpdate, null, 2));

    return litigantToken; // Return the token if needed
  }
}

module.exports = new LitigentAuthPage();