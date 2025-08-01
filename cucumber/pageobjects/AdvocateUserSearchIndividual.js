const { request } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class AdvocateUserSearchIndividual {
  constructor() {
    this.globalVarsPath = path.join(__dirname, '..', 'globalcitizenvariable.json');
  }

  async searchIndividualAdvocateByUuid(userUuid, authToken) {
    const globalVars = JSON.parse(fs.readFileSync(this.globalVarsPath, 'utf8'));
    const apiContext = await request.newContext();

    const requestBody = {
      tenantId: 'kl',
      mobileNumber: userUuid, // Assuming userUuid is the mobile number
      pageSize: '100',
      RequestInfo: {
        apiId: 'Rainmaker',
        authToken: authToken,
        msgId: `${Date.now()}|en_IN`,
        plainAccessRequest: {},
      },
    };

    const response = await apiContext.post(`${globalVars.baseURL}individual/v1/_search`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to fetch individual advocate information: ${response.status()} - ${await response.text()}`);
    }

    return await response.json();
  }
}

module.exports = new AdvocateUserSearchIndividual();