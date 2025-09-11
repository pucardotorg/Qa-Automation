import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Import global config
const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

// Import values from global config
const BASE_URL = globalVars.baseURL;
const TENANT_ID = globalVars.citizenUserInfo.tenantId || 'kl';
const advocateIndividualId = globalVars.advocateIndividualId;
const citizenUserInfo = globalVars.citizenUserInfo;
const authToken = globalVars.citizenAuthToken;

// Build endpoint path dynamically
const ENDPOINT_PATH = `/advocate/v1/_search?tenantId=${TENANT_ID}&_=${Date.now()}`;

console.log('[Config] BASE_URL:', BASE_URL);
console.log('[Config] TENANT_ID:', TENANT_ID);
console.log('[Config] advocateIndividualId:', advocateIndividualId);
console.log('[Config] authToken:', authToken);

let apiContext;

test.describe('Advocate ID API Tests', () => {
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      ignoreHTTPSErrors: true
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('should search advocate by individualId and store advocateId', async () => {
    const requestBody = {
      criteria: [
        {
          individualId: advocateIndividualId
        }
      ],
      tenantId: TENANT_ID,
      RequestInfo: {
        apiId: 'Rainmaker',
        authToken: authToken,
        userInfo: citizenUserInfo,
        msgId: `${Date.now()}|en_IN`,
        plainAccessRequest: {}
      }
    };

    const response = await apiContext.post(ENDPOINT_PATH, {
      data: requestBody
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.responseInfo.status).toBe('successful');
    expect(Array.isArray(body.advocates)).toBe(true);
    expect(body.advocates.length).toBeGreaterThan(0);
    const advocateId = body.advocates[0].responseList[0].id;
    // Store in global-variables.json
    globalVars.advocateId = advocateId;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    console.log('Stored advocateId:', advocateId);
  });
}); 