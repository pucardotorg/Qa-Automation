const fs = require('fs');
const path = require('path');

// Read global variables
const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

const { test, expect } = require('@playwright/test');

const BASE_URL_FETCH_BILL = 'https://dristi-kerala-uat.pucar.org/billing-service/bill/v2/_fetchbill';

// Constants for URL parameters and request body
const tenantId = 'kl';
const businessService = 'application-voluntary-submission';
const consumerCode = globalVars.applicationNumber + '_APPL_FILING';
const AUTH_TOKEN = globalVars.nayamitraAuthToken;

let billId = null; // Variable to store the extracted billId

test.describe('API Tests for fetch bill endpoint', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // Test case for successful request (expecting 200)
  test('should return successful response (200) and extract billId for valid request', async () => {
    const timestamp = Date.now();
    const fetchBillRequestBody = {
      "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": AUTH_TOKEN,
        "userInfo": globalVars.citizenUserInfo,
        "msgId": `${timestamp}|en_IN`,
        "plainAccessRequest": {}
      }
    };

    // Construct the URL with query parameters
    const fetchBillUrl = `${BASE_URL_FETCH_BILL}?consumerCode=${consumerCode}&tenantId=${tenantId}&businessService=${businessService}&_=${timestamp}`;
    
    console.log('Request URL:', fetchBillUrl);
    console.log('Request Body:', JSON.stringify(fetchBillRequestBody, null, 2));
    console.log('Using Auth Token:', AUTH_TOKEN);
    console.log('Using Consumer Code:', consumerCode);

    const response = await apiContext.post(fetchBillUrl, { 
      data: fetchBillRequestBody,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Log response status and headers
    console.log('Response Status:', response.status());
    console.log('Response Headers:', await response.headers());

    const responseBody = await response.json();
    console.log('Full Response Body:', JSON.stringify(responseBody, null, 2));

    // Expect status code 200 or 201 for success
    expect([200, 201]).toContain(response.status());

    // Assertions based on the provided successful response structure
    expect(responseBody.Bill).toBeInstanceOf(Array);
    
    if (responseBody.Bill.length === 0) {
      console.log('Warning: Bill array is empty. This might indicate:');
      console.log('1. No bills exist for this consumer code');
      console.log('2. Permission issues with the current auth token');
      console.log('3. Incorrect consumer code format');
    } else {
      // Extract and store the billId
      billId = responseBody.Bill[0].id;
      expect(billId).toBeDefined();
      console.log(`Extracted Bill ID: ${billId}`);

      // Optional: Assert other fields in the response if needed
      expect(responseBody.Bill[0].consumerCode).toBe(consumerCode);
      expect(responseBody.Bill[0].totalAmount).toBeDefined();
      expect(responseBody.Bill[0].billDetails).toBeInstanceOf(Array);
      expect(responseBody.Bill[0].billDetails.length).toBeGreaterThan(0);
      expect(responseBody.Bill[0].billDetails[0].amount).toBeDefined();

      // Store bill ID in global variables for future use
      if (billId) {
        globalVars.billId = billId;
        fs.writeFileSync(path.join(__dirname, '..', 'global-variables.json'), JSON.stringify(globalVars, null, 2));
        console.log('Updated global variables with bill ID:', billId);
      }
    }
  });

  // Test case for missing token (expecting 401)
  test('should fail with 401 for missing token', async () => {
    const timestamp = Date.now();
    const fetchBillRequestBodyWithoutToken = {
      "RequestInfo": {
        "apiId": "Rainmaker",
        "msgId": `${timestamp}|en_IN`,
        "plainAccessRequest": {}
      }
    };
    const fetchBillUrl = `${BASE_URL_FETCH_BILL}?consumerCode=${consumerCode}&tenantId=${tenantId}&businessService=${businessService}&_=${timestamp}`;
    const response = await apiContext.post(fetchBillUrl, { 
      data: fetchBillRequestBodyWithoutToken,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    expect(response.status()).toBe(401);
  });

  // Test case for invalid token (expecting 401)
  test('should fail with 401 for invalid token', async () => {
    const timestamp = Date.now();
    const fetchBillRequestBodyWithInvalidToken = {
      "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": 'invalid-token-123',
        "msgId": `${timestamp}|en_IN`,
        "plainAccessRequest": {}
      }
    };
    const fetchBillUrl = `${BASE_URL_FETCH_BILL}?consumerCode=${consumerCode}&tenantId=${tenantId}&businessService=${businessService}&_=${timestamp}`;
    const response = await apiContext.post(fetchBillUrl, { 
      data: fetchBillRequestBodyWithInvalidToken,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    expect(response.status()).toBe(401);
  });

  // Test case for invalid tenant ID
  test('should fail with 401 for invalid tenant ID', async () => {
    const timestamp = Date.now();
    const fetchBillRequestBody = {
      "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": AUTH_TOKEN,
        "userInfo": globalVars.citizenUserInfo,
        "msgId": `${timestamp}|en_IN`,
        "plainAccessRequest": {}
      }
    };
    const fetchBillUrl = `${BASE_URL_FETCH_BILL}?consumerCode=${consumerCode}&tenantId=invalid-tenant&businessService=${businessService}&_=${timestamp}`;
    const response = await apiContext.post(fetchBillUrl, { 
      data: fetchBillRequestBody,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    expect(response.status()).toBe(401);
  });
});
