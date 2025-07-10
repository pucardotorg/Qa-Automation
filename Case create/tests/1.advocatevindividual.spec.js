import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
const BASE_URL = 'https://dristi-kerala-uat.pucar.org';
const ENDPOINT_PATH = '/individual/v1/_search?tenantId=kl&limit=1000&offset=0&_=' + Date.now();
let apiContext;

const userUuid = globalVars.advocateuserUUID || '5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f';
const authToken = globalVars.citizenAuthToken;

const cookie = '_ga_P0JH39REGV=GS2.1.s1752066421$o60$g1$t1752066439$j42$l0$h0; _ga=GA1.1.268185039.1750425578; _ga_6DRDK00D5W=GS2.1.s1751813767$o8$g0$t1751813767$j60$l0$h0';

test.describe('Individual User Search API Tests', () => {
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
        'Origin': 'https://dristi-kerala-uat.pucar.org',
        'Referer': 'https://dristi-kerala-uat.pucar.org/ui/citizen/dristi/home',
        'Authorization': `Bearer ${authToken}`,
        'Cookie': cookie,
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