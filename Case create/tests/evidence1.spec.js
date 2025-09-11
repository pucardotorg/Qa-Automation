import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
let globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

// Import values from global config into variables
const baseURL = globalVars.baseURL;
const endpoint = `${baseURL}evidence/v1/_create`;
const tenantId = globalVars.citizenUserInfo?.tenantId || 'kl';
const caseId = globalVars.caseId;
const filingNumber = globalVars.filingNumber;
const cnrNumber = globalVars.cnrNumber;
const citizenAuthToken = globalVars.citizenAuthToken;

// If you want to make sourceID and fileStore dynamic, you can import them from globalVars as well
const sourceID = 'IND-2024-11-19-000893'; // Replace with globalVars value if available
const fileStore = 'e15ebf03-fe7f-4c69-8c7f-3df146a6e3d1'; // Replace with globalVars value if available

const getValidRequestBody = () => ({
    "artifact": {
        "artifactType": "BOUNCED_CHEQUE",
        "sourceType": "COMPLAINANT",
        "sourceID": sourceID, // This might need to be dynamic from globalVars
        "caseId": caseId,
        "filingNumber": filingNumber,
        "cnrNumber": cnrNumber,
        "tenantId": tenantId,
        "comments": [],
        "file": {
            "documentType": "case.cheque",
            "fileStore": fileStore, // This may need to be dynamic
            "fileName": "CS_BOUNCED_CHEQUE",
            "documentName": "1. Cheque - 15_09_2024.png"
        },
        "filingType": "CASE_FILING",
        "workflow": {
            "action": "TYPE DEPOSITION",
            "documents": [
                {
                    "documentType": "case.cheque",
                    "fileName": "CS_BOUNCED_CHEQUE",
                    "documentName": "1. Cheque - 15_09_2024.png",
                    "fileStoreId": fileStore
                }
            ]
        }
    },
    "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": citizenAuthToken,
        "msgId": `${Date.now()}|en_IN`,
        "plainAccessRequest": {}
    }
});

test.describe('Evidence Creation API Tests', () => {
    let apiContext;

    test.beforeAll(async ({ playwright }) => {
        apiContext = await playwright.request.newContext({
            baseURL: baseURL,
            extraHTTPHeaders: {
                'Content-Type': 'application/json',
            },
            ignoreHTTPSErrors: true
        });
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test('should create evidence successfully (201 Created)', async () => {
        const requestBody = getValidRequestBody();
        console.log('Evidence Create Request Body:', JSON.stringify(requestBody, null, 2));
        console.log('Using Case ID:', caseId);
        console.log('Using Filing Number:', filingNumber);
        console.log('Using CNR Number:', cnrNumber);
        console.log('Using Tenant ID:', tenantId);
        console.log('Using Citizen Auth Token:', citizenAuthToken);
        
        const response = await apiContext.post(endpoint, {
            data: requestBody,
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.ResponseInfo.status).toBe('successful');
        expect(responseBody.artifact).toBeDefined();
        expect(responseBody.artifact.artifactNumber).toBeDefined();
    });

    test('should fail with 401 for missing authToken', async () => {
        const requestBody = getValidRequestBody();
        requestBody.RequestInfo.authToken = '';

        const response = await apiContext.post(endpoint, {
            data: requestBody,
        });

        expect(response.status()).toBe(401);
    });

    test('should fail with 401 for invalid authToken', async () => {
        const requestBody = getValidRequestBody();
        requestBody.RequestInfo.authToken = 'invalid-token';

        const response = await apiContext.post(endpoint, {
            data: requestBody,
        });

        expect(response.status()).toBe(401);
    });

    test('should fail with 400 for bad request (e.g., missing artifact)', async () => {
        const requestBody = getValidRequestBody();
        delete requestBody.artifact;

        const response = await apiContext.post(endpoint, {
            data: requestBody,
        });

        expect(response.status()).toBe(401);
    });

    test('should fail with 400 for missing required field in artifact (e.g., tenantId)', async () => {
        const requestBody = getValidRequestBody();
        delete requestBody.artifact.tenantId;

        const response = await apiContext.post(endpoint, {
            data: requestBody,
        });

        expect(response.status()).toBe(401);
    });
}); 