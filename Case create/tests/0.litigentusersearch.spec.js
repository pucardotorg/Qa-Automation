import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

// Import configuration values from global config
const baseURL = globalVars.baseURL;
const tenantId = 'kl'; // This is hardcoded in the original, keeping as constant
const userUuid = globalVars.litigentuuid;
const authToken = globalVars.litigentAuthToken;

console.log('Using baseURL from global config:', baseURL);
console.log('Using tenantId:', tenantId);
console.log('Using litigentuuid from global config:', userUuid);
console.log('Using litigentAuthToken from global config:', authToken);

const ENDPOINT_PATH = `/individual/v1/_search?tenantId=${tenantId}&limit=1000&offset=0&_=${Date.now()}`;
let apiContext;

const cookie = '_ga_P0JH39REGV=GS2.1.s1752066421$o60$g1$t1752066439$j42$l0$h0; _ga=GA1.1.268185039.1750425578; _ga_6DRDK00D5W=GS2.1.s1751813767$o8$g0$t1751813767$j60$l0$h0';

test.describe('Litigent Individual User Search API Tests', () => {
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: baseURL,
      extraHTTPHeaders: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Type': 'application/json;charset=utf-8',
        'Origin': baseURL,
        'Referer': `${baseURL}ui/citizen/dristi/home`,
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

  test('should search individual by litigentuuid and store litigentIndividualId', async () => {
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
    const litigentIndividualId = body.Individual[0].individualId;
    // Store in global-variables.json
    globalVars.litigentIndividualResponse = body;
    globalVars.litigentIndividualId = litigentIndividualId;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    console.log('Stored litigentIndividualId:', litigentIndividualId);
    console.log('Stored full litigent individual search response.');
  });
}); 