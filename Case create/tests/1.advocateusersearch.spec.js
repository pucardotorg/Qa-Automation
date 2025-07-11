import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Import global config
const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

// Import values from global config
const BASE_URL = globalVars.baseURL;
const ENDPOINT_PATH = '/user/_search';
const TENANT_ID = 'kl';

// Use mobile number from environment variables or global config citizenUserInfo
const mobileNumber = process.env.CITIZEN_USERNAME || globalVars.citizenUserInfo?.mobileNumber;

console.log('[Config] BASE_URL:', BASE_URL);
console.log('[Config] TENANT_ID:', TENANT_ID);
console.log('[Config] mobileNumber from env:', process.env.CITIZEN_USERNAME ? '***' + process.env.CITIZEN_USERNAME.slice(-4) : 'Not set');
console.log('[Config] mobileNumber from global config:', globalVars.citizenUserInfo?.mobileNumber);
console.log('[Config] Final mobileNumber used:', mobileNumber);


let apiContext;

test.describe('User Search API Tests', () => {
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('should search user by mobile number and store advocateuserUUID', async () => {
    const requestBody = {
      tenantId: TENANT_ID,
      mobileNumber: mobileNumber,
      pageSize: '100',
      RequestInfo: {
        apiId: 'Rainmaker',
        authToken: null,
        msgId: `${Date.now()}|en_IN`,
        plainAccessRequest: {}
      }
    };

    const response = await apiContext.post(ENDPOINT_PATH, {
      data: requestBody
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.responseInfo.status).toBe('200');
    expect(Array.isArray(body.user)).toBe(true);
    expect(body.user.length).toBeGreaterThan(0);
    
    const advocateuserUUID = body.user[0].uuid;
    // Store in global-variables.json
    globalVars.advocateuserUUID = advocateuserUUID;

    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    
    console.log('Stored advocateuserUUID:', advocateuserUUID);
  });
}); 