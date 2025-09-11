import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import globalVariables from '../utils/global-variables';

test.describe('API Tests for evidence search endpoint', () => {
  let apiContext;
  let globalVars;
  const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');

  // Import values from global config into variables
  let baseURL;
  let tenantId;
  let judgeauthtoken;
  let caseId;
  let filingNumber;
  let baseUrl;
  
  let validRequestBody;

  test.beforeAll(async ({ playwright }) => {
    // Read global variables
    globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
    
    // Import values from global config into variables
    baseURL = globalVars.baseURL;
    tenantId = globalVars.citizenUserInfo?.tenantId || 'kl';
    judgeauthtoken = globalVars.judgeauthtoken;
    caseId = globalVars.caseId;
    filingNumber = globalVars.filingNumber;
    baseUrl = `${baseURL}evidence/v1/_search`;

    // Initialize valid request body with imported values
    validRequestBody = {
    "apiOperation": "SEARCH",
    "Individual": {
      "tenantId": tenantId
    },
    "criteria": {
      "caseId": caseId,
      "filingNumber": filingNumber,
      "tenantId": tenantId,
      "courtId": "KLKM52"
    },
    "tenantId": tenantId,
    "pagination": {
      "limit": 10,
      "offSet": 0
    },
    "RequestInfo": {
      "apiId": "Rainmaker",
        "authToken": judgeauthtoken,
      "msgId": `${Date.now()}|en_IN`,
      "plainAccessRequest": {}
    }
  };

    apiContext = await playwright.request.newContext({ ignoreHTTPSErrors: true });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // Test case for successful request
  test('should return successful response for valid request', async () => {
    console.log('Evidence Search Request Body:', JSON.stringify(validRequestBody, null, 2));
    console.log('Using Case ID:', caseId);
    console.log('Using Filing Number:', filingNumber);
    console.log('Using Judge Auth Token:', judgeauthtoken);
    console.log('Using Tenant ID:', tenantId);

    const response = await apiContext.post(`${baseUrl}?_=${Date.now()}`, { data: validRequestBody });

    // Expect status code 200 for success
    expect(response.status()).toBe(200);
    const responseBody = await response.json();

    // Assertions on response body structure and values
    expect(responseBody.ResponseInfo).toBeDefined();
    expect(responseBody.ResponseInfo.status).toBe('successful');
    expect(responseBody.artifacts).toBeDefined();
    expect(Array.isArray(responseBody.artifacts)).toBe(true);
    
    // Validate pagination
    expect(responseBody.pagination).toBeDefined();
    expect(responseBody.pagination.limit).toBe(10);
    expect(responseBody.pagination.offSet).toBe(0);
    expect(typeof responseBody.pagination.totalCount).toBe('number');

    // Print all artifacts information
    console.log('\nArtifacts found:');
    responseBody.artifacts.forEach((artifact, index) => {
      console.log(`\nArtifact ${index + 1}:`);
      console.log('ID:', artifact.id);
      console.log('Number:', artifact.artifactNumber);
      console.log('Status:', artifact.status);
      console.log('Type:', artifact.artifactType);
      console.log('Source Type:', artifact.sourceType);
    });

    // Update global variables with first artifact information
    if (responseBody.artifacts.length > 0) {
      const artifact = responseBody.artifacts[0];
      globalVars.artifactId = artifact.id;
      globalVars.artifactNumber = artifact.artifactNumber;
      
      // Write back to global variables file
      fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));

      console.log('\nUpdated Global Variables:');
      console.log('Artifact ID:', artifact.id);
      console.log('Artifact Number:', artifact.artifactNumber);
    }
  });

  // Test case for missing token
  test('should fail with 401 for missing token', async () => {
    const requestBodyWithoutToken = {
      ...validRequestBody,
      RequestInfo: {
        ...validRequestBody.RequestInfo,
        authToken: undefined
      }
    };
    const response = await apiContext.post(`${baseUrl}?_=${Date.now()}`, { data: requestBodyWithoutToken });
    expect(response.status()).toBe(401);
  });

  // Test case for invalid token
  test('should fail with 401 for invalid token', async () => {
    const requestBodyWithInvalidToken = {
      ...validRequestBody,
      RequestInfo: {
        ...validRequestBody.RequestInfo,
        authToken: 'invalid-token-123'
      }
    };
    const response = await apiContext.post(`${baseUrl}?_=${Date.now()}`, { data: requestBodyWithInvalidToken });
    expect(response.status()).toBe(401);
  });

  // Test case for missing required field
  test('should fail with 400 for missing required field (e.g., tenantId)', async () => {
    const requestBodyWithoutTenantId = {
      ...validRequestBody,
      criteria: {
        ...validRequestBody.criteria,
        tenantId: undefined
      }
    };
    const response = await apiContext.post(`${baseUrl}?_=${Date.now()}`, { data: requestBodyWithoutTenantId });
    expect(response.status()).toBe(400);
  });
});
