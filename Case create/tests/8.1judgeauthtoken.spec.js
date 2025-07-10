import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
const baseUrl = globalVars.baseURL;

const headers = {
  Authorization: 'Basic ZWdvdi11c2VyLWNsaWVudDo=',
};

test('judgeauthtoken', async () => {
  const username = process.env.JUDGE_USERNAME;
  const password = process.env.JUDGE_PASSWORD;

  const apiContext = await request.newContext();
    const empresponse= await apiContext.post(`${baseUrl}user/oauth/token?_=1748935894913`,
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
  const judgeUserInfo = responseJson.UserRequest;
  const judgeUUID = judgeUserInfo?.uuid;
  console.log('Full Response JSON:', responseJson);
  console.log('Judge Auth Token:', judgeauthtoken);
  console.log('Judge User Info:', judgeUserInfo);
  console.log('Judge UUID:', judgeUUID);

  // Update global-variables.json
  let globalVarsUpdated = {};
  try {
    globalVarsUpdated = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
  } catch (err) {
    console.log('No existing global variables file found, creating new one');
  }
  globalVarsUpdated.judgeusername = username;
  globalVarsUpdated.judgepassword = password;
  globalVarsUpdated.judgeauthtoken = judgeauthtoken;
  globalVarsUpdated.Judgeuserinfo = judgeUserInfo;
  globalVarsUpdated.JudgeUUID = judgeUUID;
  fs.writeFileSync(globalVarsPath, JSON.stringify(globalVarsUpdated, null, 2));
  console.log('Updated global variables with Judge credentials, token, user info, and UUID');
}); 