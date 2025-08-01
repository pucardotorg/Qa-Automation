const { request } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class AdvocateUserSearch {
  constructor() {
    this.globalVarsPath = path.join(__dirname, '..', 'globalcitizenvariable.json');
  }

  async searchAdvocateByMobileNumber(mobileNumber, authToken) {
    const globalVars = JSON.parse(fs.readFileSync(this.globalVarsPath, 'utf8'));
    const apiContext = await request.newContext();

    const requestBody = {
      tenantId: 'kl',
      mobileNumber: mobileNumber, // Assuming userUuid is the mobile number
      pageSize: '100',
      RequestInfo: {
        apiId: 'Rainmaker',
        authToken: authToken,
        msgId: `${Date.now()}|en_IN`,
        plainAccessRequest: {},
      },
    };

    const response = await apiContext.post(`${globalVars.baseURL}user/_search`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to fetch advocate information: ${response.status()} - ${await response.text()}`);
    }

    return await response.json();
  }
}

module.exports = new AdvocateUserSearch();