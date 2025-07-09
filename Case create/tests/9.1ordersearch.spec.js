import { test, expect, request as playwrightRequest } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
let globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
const BASE_URL = `${globalVars.baseURL}order/v1/search`;

const validBody = {
  criteria: {
    filingNumber: globalVars.filingNumber,
    tenantId: "kl",
    status: "DRAFT_IN_PROGRESS",
    courtId: "KLKM52"
  },
  RequestInfo: {
    apiId: "Rainmaker",
    authToken: globalVars.judgeauthtoken,
    msgId: `${Date.now()}|en_IN`,
    plainAccessRequest: {}
  }
};

test.describe('Order Search API', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    // Set the auth token from global variables
    validBody.RequestInfo.authToken = globalVars.judgeauthtoken;

    apiContext = await playwrightRequest.newContext({
      baseURL: globalVars.baseURL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('should return order list for valid request and store order details', async () => {
    const response = await apiContext.post('/order/v1/search', {
      data: validBody
    });
    
    console.log('Response Status:', response.status());
    const responseBody = await response.text();
    console.log('Response Body:', responseBody);

    expect(response.status()).toBe(200);
    const body = JSON.parse(responseBody);
    expect(body).toHaveProperty('ResponseInfo');
    expect(body.ResponseInfo.status).toBe('successful');
    expect(body).toHaveProperty('TotalCount');
    expect(typeof body.TotalCount).toBe('number');
    expect(body).toHaveProperty('list');
    expect(Array.isArray(body.list)).toBe(true);

    // Extract order details from response
    const orderDetails = body.list[0];
    const orderId = orderDetails.id;
    const orderNumber = orderDetails.orderNumber;

    console.log('Extracted Order ID:', orderId);
    console.log('Extracted Order Number:', orderNumber);

    // Update global variables
    globalVars.orderId = orderId;
    globalVars.orderNumber = orderNumber;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    console.log('Updated global variables with order details');
  });

  test('should fail with 401 for missing authToken', async () => {
    const noTokenBody = { ...validBody, RequestInfo: { ...validBody.RequestInfo } };
    delete noTokenBody.RequestInfo.authToken;
    const response = await apiContext.post('/order/v1/search', {
      data: noTokenBody
    });
    expect(response.status()).toBe(401);
  });

  test('should fail with 401 for invalid authToken', async () => {
    const invalidTokenBody = { ...validBody, RequestInfo: { ...validBody.RequestInfo, authToken: 'invalid-token' } };
    const response = await apiContext.post('/order/v1/search', {
      data: invalidTokenBody
    });
    expect(response.status()).toBe(401);
  });
});
 