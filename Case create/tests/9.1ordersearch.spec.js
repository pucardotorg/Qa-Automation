import { test, expect, request as playwrightRequest } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Order Search API', () => {
  let apiContext;
let globalVars;const globalVarsPath = path.join(__dirname,  '../../global-variables.json');

  // Import values from global config into variables
  let baseURL;
  let tenantId;
  let filingNumber;
  let judgeauthtoken;
  let searchEndpoint;
  
  let validBody;

  test.beforeAll(async ({ playwright }) => {
    // Read global variables
globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

    // Import values from global config into variables
    baseURL = globalVars.baseURL;
    tenantId = globalVars.citizenUserInfo?.tenantId || "kl";
    filingNumber = globalVars.filingNumber;
    judgeauthtoken = globalVars.judgeauthtoken;
    searchEndpoint = `${baseURL}order/v1/search`;

    // Initialize valid body with imported values
    validBody = {
  criteria: {
        filingNumber: filingNumber,
        tenantId: tenantId,
    status: "DRAFT_IN_PROGRESS",
    courtId: "KLKM52"
  },
  RequestInfo: {
    apiId: "Rainmaker",
        authToken: judgeauthtoken,
    msgId: `${Date.now()}|en_IN`,
    plainAccessRequest: {}
  }
};

    apiContext = await playwrightRequest.newContext({
      baseURL: baseURL,
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
    console.log('Order Search Request Body:', JSON.stringify(validBody, null, 2));
    console.log('Using Filing Number:', filingNumber);
    console.log('Using Judge Auth Token:', judgeauthtoken);
    console.log('Using Tenant ID:', tenantId);
    
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
 