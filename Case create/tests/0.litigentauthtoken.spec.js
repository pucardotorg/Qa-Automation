import { test, expect, request } from '@playwright/test';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
const baseUrl = globalVars.baseURL;

const headers = {
  Authorization: 'Basic ZWdvdi11c2VyLWNsaWVudDo=',
};

test('litigentauthtoken', async () => {
  const apiContext = await request.newContext();
  // Step 1: Get token for litigant
  const tokenResponse = await apiContext.post(`${baseUrl}user/oauth/token?`, {
    headers: headers,
    form: {
      username: process.env.LITIGENT_USERNAME,
      password: process.env.LITIGENT_PASSWORD,
      tenantId: 'kl',
      userType: 'citizen',
      scope: 'read',
      grant_type: 'password',
    },
  });
  const tokenJson = await tokenResponse.json();
  const litigentToken = tokenJson.access_token;
  // Store token if needed
  globalVars.litigentAuthToken = litigentToken;
  fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));

  // Step 2: Fetch user info using the token
  const userSearchUrl = `${baseUrl}user/_search`;
  const userSearchBody = {
    tenantId: 'kl',
    mobileNumber: process.env.LITIGENT_USERNAME,
    pageSize: '100',
    RequestInfo: {
      apiId: 'Rainmaker',
      authToken: litigentToken,
      msgId: `${Date.now()}|en_IN`,
      plainAccessRequest: {},
    },
  };
  const userSearchResponse = await apiContext.post(userSearchUrl, {
    data: userSearchBody,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${litigentToken}`,
    },
  });
  const userSearchJson = await userSearchResponse.json();
  if (userSearchJson.user && userSearchJson.user.length > 0) {
    globalVars.litigentuserinfo = userSearchJson.user[0];
    globalVars.litigentuuid = userSearchJson.user[0].uuid;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    console.log('Stored litigentuserinfo and litigentuuid:', userSearchJson.user[0]);
  } else {
    console.log('No user found for litigant mobile number');
  }

  console.log('Litigent Auth Token:', litigentToken);
}); 