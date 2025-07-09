import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

// Read global variables
const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
let globalVars = {};
try {
  globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
} catch (err) {
  console.log('No existing global variables file found, creating new one');
}

const headers = {
  Authorization: 'Basic ZWdvdi11c2VyLWNsaWVudDo=',
};

test('judgeauthtoken', async () => {
  const username = process.env.JUDGE_USERNAME;
  const password = process.env.JUDGE_PASSWORD;

  const apiContext = await request.newContext();
  const empresponse = await apiContext.post(`${globalVars.baseURL}user/oauth/token?_=1748935894913`,
    {
      headers: headers,
      form: {
        username: username,
        password: password,
        district: "KOLLAM",
        courtroom: "KLKM52",
        userType: "EMPLOYEE",
        tenantId: "kl",
        scope: "read",
        grant_type: "password"
      }
    });

  expect(empresponse.ok()).toBeTruthy();
  const responseJson = await empresponse.json();
  const judgeauthtoken = responseJson.access_token;
  console.log('Full Response JSON:', responseJson);
  console.log('Judge Auth Token:', judgeauthtoken);

  // Update global-variables.json
  globalVars.judgeusername = username;
  globalVars.judgepassword = password;
  globalVars.judgeauthtoken = judgeauthtoken;
  fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
  console.log('Updated global variables with Judge credentials and token');
}); 