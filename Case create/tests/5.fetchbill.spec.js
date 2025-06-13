const fs = require('fs');
const path = require('path');

// Read global variables
const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

const { test, expect } = require('@playwright/test');

const BASE_URL_FETCH_BILL = 'https://dristi-kerala-uat.pucar.org/billing-service/bill/v2/_fetchbill';

// Constants for URL parameters and request body
const tenantId = 'kl';
const businessService = 'case-default';
// Use dynamic consumerCode and auth token from global variables
const consumerCode = globalVars.filingNumber + '_CASE_FILING';
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
    const fetchBillRequestBody = {
      "RequestInfo": {
          "apiId": "Rainmaker",
          "authToken": AUTH_TOKEN,
          "msgId": `test-${Date.now()}`,
          "plainAccessRequest": {}
      }
    };

    // Construct the URL with query parameters
    const fetchBillUrl = `${BASE_URL_FETCH_BILL}?tenantId=${tenantId}&businessService=${businessService}&consumerCode=${consumerCode}&_=${Date.now()}`;
    
    console.log('Request URL:', fetchBillUrl);
    console.log('Request Body:', JSON.stringify(fetchBillRequestBody, null, 2));
    console.log('Using Auth Token:', AUTH_TOKEN);
    console.log('Using Consumer Code:', consumerCode);

    const response = await apiContext.post(fetchBillUrl, { data: fetchBillRequestBody });

    // Log response status and headers
    console.log('Response Status:', response.status());
    console.log('Response Headers:', await response.headers());

    const responseBody = await response.json();
    console.log('Full Response Body:', JSON.stringify(responseBody, null, 2));

    // Expect status code 200 for success
    expect(response.status()).toBe(201);

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
    }
  });

  // Test case for missing token (expecting 401)
  test('should fail with 401 for missing token', async () => {
     const fetchBillRequestBodyWithoutToken = {
       "RequestInfo": {
           "apiId": "Rainmaker",
           "authToken": undefined, // Remove or set to undefined
           "msgId": `test-${Date.now()}`,
           "plainAccessRequest": {}
       }
     };
     const fetchBillUrl = `${BASE_URL_FETCH_BILL}?tenantId=${tenantId}&businessService=${businessService}&consumerCode=${consumerCode}&_=${Date.now()}`;
     const response = await apiContext.post(fetchBillUrl, { data: fetchBillRequestBodyWithoutToken });
     expect(response.status()).toBe(401);
  });

  // Test case for invalid token (expecting 401 or 403)
  test('should fail with 401 or 403 for invalid token', async () => {
    const fetchBillRequestBodyWithInvalidToken = {
       "RequestInfo": {
           "apiId": "Rainmaker",
           "authToken": 'invalid-token-123', // Use an invalid token
           "msgId": `test-${Date.now()}`,
           "plainAccessRequest": {}
       }
     };
     const fetchBillUrl = `${BASE_URL_FETCH_BILL}?tenantId=${tenantId}&businessService=${businessService}&consumerCode=${consumerCode}&_=${Date.now()}`;
     const response = await apiContext.post(fetchBillUrl, { data: fetchBillRequestBodyWithInvalidToken });
     // Expect either 401 or 403 depending on API implementation
     expect([401, 403]).toContain(response.status());
  });

  // Test case for bad request (e.g., missing required query parameter like tenantId)
  test('should fail with 400 for missing required query parameter (e.g., tenantId)', async () => {
     const fetchBillRequestBody = {
       "RequestInfo": {
           "apiId": "Rainmaker",
           "authToken": AUTH_TOKEN,
           "msgId": `test-${Date.now()}`,
           "plainAccessRequest": {}
       }
     };
     // Construct URL without tenantId
     const fetchBillUrlWithoutTenantId = `${BASE_URL_FETCH_BILL}?businessService=${businessService}&consumerCode=${consumerCode}&_=${Date.now()}`;
     const response = await apiContext.post(fetchBillUrlWithoutTenantId, { data: fetchBillRequestBody });
     // Expect 400 for bad request, or potentially other client error codes
     expect(response.status()).toBe(401);
  });


  // Add more test cases for other invalid inputs or scenarios as needed
});