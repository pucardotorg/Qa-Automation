const { request } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class LitigentUserSearch {
  constructor() {
    this.globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
  }

  async searchLitigantByUuid(userUuid, authToken) {
    const globalVars = JSON.parse(fs.readFileSync(this.globalVarsPath, 'utf8'));
    const apiContext = await request.newContext();

    const requestBody = {
      Individual: {
        userUuid: [userUuid],
      },
      RequestInfo: {
        apiId: 'Rainmaker',
        authToken: authToken,
        msgId: `${Date.now()}|en_IN`,
        plainAccessRequest: {},
      },
    };

    console.log('Requesting litigant user information with:', {
      userUuid: userUuid,
      authToken: authToken,
    });

    const response = await apiContext.post(`${globalVars.baseURL}individual/v1/_search?tenantId=kl&limit=1000&offset=0&_=${Date.now()}`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to fetch litigant information: ${response.status()} - ${await response.text()}`);
    }

    return await response.json();
  }
}

module.exports = new LitigentUserSearch();