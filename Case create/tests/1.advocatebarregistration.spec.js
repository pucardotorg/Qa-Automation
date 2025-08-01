import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load global variablesconst globalVarsPath = path.join(__dirname,  '../../global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

// Set up dynamic values
const baseURL = globalVars.baseURL || 'https://dristi-kerala-uat.pucar.org/';
const origin = baseURL.replace(/\/$/, '');
const searchUrl = `${origin}/advocate/v1/_search?tenantId=kl&_=${Date.now()}`;
const referer = `${origin}/ui/citizen/home/home-pending-task`;
const advocateIndividualId = globalVars.advocateIndividualId || 'IND-2024-11-19-000893';

test('Advocate search and store details', async ({ request }) => {
  // Prepare headers
  const headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Content-Type': 'application/json;charset=utf-8',
    'Origin': origin,
    'Referer': referer,
    'Cookie': globalVars.cookie || '',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'TE': 'trailers'
  };

  // Prepare request body
  const requestBody = {
    criteria: [{ individualId: advocateIndividualId }],
    tenantId: 'kl',
    RequestInfo: {
      apiId: 'Rainmaker',
      authToken: globalVars.citizenAuthToken,
      userInfo: globalVars.citizenUserInfo,
      msgId: Date.now().toString() + '^|en_IN',
      plainAccessRequest: {}
    }
  };

  // Make the API request
  const response = await request.post(searchUrl, {
    headers,
    data: requestBody
  });

  expect([200, 201]).toContain(response.status());

  const responseBody = await response.json();
  console.log('Advocate search response:', responseBody);

  // Extract username and barRegistrationNumber
  const advocate = responseBody.advocates?.[0]?.responseList?.[0];
  const username = advocate?.additionalDetails?.username;
  const barRegistrationNumber = advocate?.barRegistrationNumber;
  const advocateIdProof = advocate?.documents?.[0]?.fileStore;
  console.log('username:', username);
  console.log('barRegistrationNumber:', barRegistrationNumber);
  console.log('advocateIdProof:', advocateIdProof);

  expect(username).toBeTruthy();
  expect(barRegistrationNumber).toBeTruthy();
  expect(advocateIdProof).toBeTruthy(); 
  // Store in global variables
  globalVars.advocateusername = username;
  globalVars.advocatebarregistration = barRegistrationNumber;
  globalVars.advocateidproof = advocateIdProof;
  fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2), 'utf8');
});