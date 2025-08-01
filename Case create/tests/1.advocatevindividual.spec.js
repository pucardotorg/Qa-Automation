import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Import global configconst globalVarsPath = path.join(__dirname,  '../../global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

// Import values from global config
const BASE_URL = globalVars.baseURL;
const TENANT_ID = 'kl';
const userUuid = globalVars.advocateuserUUID;
const authToken = globalVars.citizenAuthToken;

// Build endpoint path dynamically
const ENDPOINT_PATH = `/individual/v1/_search?tenantId=${TENANT_ID}&limit=1000&offset=0&_=${Date.now()}`;

// If you want to use a cookie from config, add it to global-variables.json; otherwise, keep as is or remove if not needed
test.describe('Individual User Search API Tests', () => {
  console.log('[Config] BASE_URL:', BASE_URL);
  console.log('[Config] TENANT_ID:', TENANT_ID);
  console.log('[Config] userUuid:', userUuid);
  console.log('[Config] authToken:', authToken);

  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Type': 'application/json;charset=utf-8',
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}ui/citizen/dristi/home`,
        'Authorization': `Bearer ${authToken}`,
        // 'Cookie': cookie, // Uncomment and set from config if needed
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'TE': 'trailers'
      }
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('should search individual by userUuid and store advocateIndividualId', async () => {
    const requestBody = {
      Individual: {
        userUuid: [userUuid]
      },
      RequestInfo: {
        apiId: 'Rainmaker',
        authToken: authToken,
        msgId: `${Date.now()}|en_IN`,
        plainAccessRequest: {}
      }
    };

    const response = await apiContext.post(ENDPOINT_PATH, {
      data: requestBody
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ResponseInfo.status).toBe('successful');
    expect(Array.isArray(body.Individual)).toBe(true);
    expect(body.Individual.length).toBeGreaterThan(0);
    const advocateIndividualId = body.Individual[0].individualId;
    // Store in global-variables.json
    globalVars.advocateIndividualId = advocateIndividualId;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    console.log('Stored advocateIndividualId:', advocateIndividualId);
  });
}); 