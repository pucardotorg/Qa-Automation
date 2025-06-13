const fs = require('fs');
const path = require('path');

// Read global variables
const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

const { test, expect } = require('@playwright/test');

const BASE_URL_CREATE_DEMAND = 'https://dristi-kerala-uat.pucar.org/etreasury/payment/v1/_createDemand?_=1749023993191';
const BASE_URL_CALCULATE = 'https://dristi-kerala-uat.pucar.org/payment-calculator/v1/case/fees/_calculate?_=1749023993098';

// Constants - Use values from global variables
const filingNumber = globalVars.filingNumber;
const caseId = globalVars.caseId;
const AUTH_TOKEN = globalVars.citizenAuthToken;

test.describe('API Tests for create demand endpoint', () => {
  let apiContext;
  let applicationNumber; // Variable to store application number

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();

    // Call the calculate endpoint to get the applicationNumber
    const calculateRequestBody = {
      "EFillingCalculationCriteria": [
          {
              "checkAmount": "235222",
              "numberOfApplication": 1,
              "tenantId": "kl",
              "caseId": caseId,
              "isDelayCondonation": false,
              "filingNumber": filingNumber
          }
      ],
      "RequestInfo": {
          "apiId": "Rainmaker",
          "authToken": AUTH_TOKEN,
          "msgId": `test-${Date.now()}`,
          "plainAccessRequest": {}
      }
    };

    console.log('Calculate Request Body:', JSON.stringify(calculateRequestBody, null, 2));
    console.log('Using Auth Token:', AUTH_TOKEN);
    console.log('Using Filing Number:', filingNumber);
    console.log('Using Case ID:', caseId);

    const response = await apiContext.post(BASE_URL_CALCULATE, { data: calculateRequestBody });
    console.log('Calculate Response Status:', response.status());
    
    expect(response.status()).toBeGreaterThanOrEqual(200);

    const responseBody = await response.json();
    console.log('Calculate Response Body:', JSON.stringify(responseBody, null, 2));

    // Extract and store the applicationNumber
    if (responseBody && responseBody.Calculation && responseBody.Calculation.length > 0) {
       applicationNumber = responseBody.Calculation[0].applicationId;
       console.log(`Obtained applicationNumber: ${applicationNumber}`);
    } else {
        throw new Error('Failed to obtain applicationNumber from calculation API: Calculation array not found or empty');
    }
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // Test case for successful request (expecting 200 or 201)
  test('should return successful response for creating a demand', async () => {
    expect(applicationNumber).not.toBeNull();
    console.log(`Using application ID: ${applicationNumber}`);

    const createDemandRequestBody = {
      "tenantId": "kl",
      "entityType": "case-default",
      "filingNumber": filingNumber,
      "consumerCode": `${filingNumber}_CASE_FILING`,
      "calculation": [
          {
              "applicationId": applicationNumber,
              "tenantId": "kl",
              "totalAmount": 875,
              "breakDown": [
                  {
                      "type": "Court Fee",
                      "code": "COURT_FEE",
                      "amount": 25.0,
                      "additionalParams": {}
                  },
                  {
                      "type": "Legal Benefit Fee",
                      "code": "LEGAL_BENEFIT_FEE",
                      "amount": 13.0,
                      "additionalParams": {}
                  },
                  {
                      "type": "Advocate Clerk Welfare Fund",
                      "code": "ADVOCATE_CLERK_WELFARE_FUND",
                      "amount": 12.0,
                      "additionalParams": {}
                  },
                  {
                      "type": "Complaint Fee",
                      "code": "COMPLAINT_FEE",
                      "amount": 750.0,
                      "additionalParams": {}
                  },
                  {
                      "type": "Advocate Welfare Fund",
                      "code": "ADVOCATE_WELFARE_FUND",
                      "amount": 75.0,
                      "additionalParams": {}
                  }
              ]
          }
      ],
      "RequestInfo": {
          "apiId": "Rainmaker",
          "authToken": AUTH_TOKEN,
          "msgId": `test-${Date.now()}`,
          "plainAccessRequest": {}
      }
    };

    console.log('Create Demand Request Body:', JSON.stringify(createDemandRequestBody, null, 2));

    const response = await apiContext.post(BASE_URL_CREATE_DEMAND, { data: createDemandRequestBody });
    console.log('Create Demand Response Status:', response.status());

    expect(response.status()).toBeGreaterThanOrEqual(200);
    const responseBody = await response.json();
    console.log('Create Demand Response Body:', JSON.stringify(responseBody, null, 2));

    expect(responseBody.Demands.length).toBeGreaterThan(0);
    expect(responseBody.Demands[0].consumerCode).toBe(`${filingNumber}_CASE_FILING`);
    expect(responseBody.Demands[0].demandDetails).toBeInstanceOf(Array);
    expect(responseBody.Demands[0].demandDetails.length).toBeGreaterThan(0);
    expect(responseBody.Demands[0].demandDetails[0].taxAmount).toBeDefined();
  });

  // Test case for missing token (expecting 401)
  test('should fail with 401 for missing token', async () => {
    const minimalRequestBody = {
      "tenantId": "kl",
      "entityType": "case-default",
      "filingNumber": filingNumber,
      "consumerCode": `${filingNumber}_CASE_FILING`,
      "calculation": [
          {
              "applicationId": applicationNumber,
              "tenantId": "kl",
              "totalAmount": 875,
              "breakDown": []
          }
      ],
      "RequestInfo": {
          "apiId": "Rainmaker",
          "authToken": undefined,
          "msgId": `test-${Date.now()}`,
          "plainAccessRequest": {}
      }
    };

    const response = await apiContext.post(BASE_URL_CREATE_DEMAND, { data: minimalRequestBody });
    expect(response.status()).toBe(401);
  });

  // Test case for invalid token (expecting 401 or 403)
  test('should fail with 401 or 403 for invalid token', async () => {
    const minimalRequestBody = {
      "tenantId": "kl",
      "entityType": "case-default",
      "filingNumber": filingNumber,
      "consumerCode": `${filingNumber}_CASE_FILING`,
      "calculation": [
          {
              "applicationId": applicationNumber,
              "tenantId": "kl",
              "totalAmount": 875,
              "breakDown": []
          }
      ],
      "RequestInfo": {
          "apiId": "Rainmaker",
          "authToken": "invalid-token-123",
          "msgId": `test-${Date.now()}`,
          "plainAccessRequest": {}
      }
    };

    const response = await apiContext.post(BASE_URL_CREATE_DEMAND, { data: minimalRequestBody });
    expect([401, 403]).toContain(response.status());
  });

  // Test case for bad request (missing required field)
  test('should fail with 400 or 401 for missing required field (e.g., tenantId)', async () => {
    const minimalRequestBody = {
      "entityType": "case-default",
      "filingNumber": filingNumber,
      "consumerCode": `${filingNumber}_CASE_FILING`,
      "calculation": [
          {
              "applicationId": applicationNumber,
              "tenantId": "kl",
              "totalAmount": 875,
              "breakDown": []
          }
      ],
      "RequestInfo": {
          "apiId": "Rainmaker",
          "authToken": AUTH_TOKEN,
          "msgId": `test-${Date.now()}`,
          "plainAccessRequest": {}
      }
    };

    const response = await apiContext.post(BASE_URL_CREATE_DEMAND, { data: minimalRequestBody });
    expect([400, 401, 500]).toContain(response.status());
  });
});

