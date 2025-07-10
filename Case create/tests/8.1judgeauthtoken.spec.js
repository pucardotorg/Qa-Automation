import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
const baseUrl = globalVars.baseURL;

// Import values from global config into variables
const baseURL = globalVars.baseURL;
const tenantId = globalVars.citizenUserInfo?.tenantId || "kl";

const headers = {
  Authorization: 'Basic ZWdvdi11c2VyLWNsaWVudDo=',
};

test('judgeauthtoken', async () => {
  const username = process.env.JUDGE_USERNAME;
  const password = process.env.JUDGE_PASSWORD;

  const apiContext = await request.newContext();
  const empresponse = await apiContext.post(`${baseURL}user/oauth/token?_=1748935894913`,
        {
            headers: headers,
           form: {
        username: username,
        password: password,
        district: "KOLLAM",
        courtroom: "KLKM52",
        userType: "EMPLOYEE",
        tenantId: tenantId,
        scope: "read",
        grant_type: "password"
           }  
        });

  expect(empresponse.ok()).toBeTruthy();
  const responseJson = await empresponse.json();
  const judgeauthtoken = responseJson.access_token;
  const judgeUserInfo = responseJson.UserRequest;
  const judgeUUID = judgeUserInfo?.uuid;
  console.log('Full Response JSON:', responseJson);
  console.log('Judge Auth Token:', judgeauthtoken);
  console.log('Judge User Info:', judgeUserInfo);
  console.log('Judge UUID:', judgeUUID);

  // Update global-variables.json
  globalVars.judgeusername = username;
  globalVars.judgepassword = password;
  globalVars.judgeauthtoken = judgeauthtoken;
  globalVars.judgeUserResponse = responseJson;
  fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
  console.log('Updated global variables with Judge credentials, token, and user response');
}); 