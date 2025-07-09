import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
let globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

const BASE_URL = globalVars.baseURL;
const ENDPOINT = `${globalVars.baseURL}evidence/v1/_create`;

const getValidRequestBody = () => ({
    "artifact": {
        "artifactType": "RETURN_MEMO",
        "sourceType": "COMPLAINANT",
        "sourceID": "IND-2024-11-19-000893", // This might need to be dynamic
        "caseId": globalVars.caseId,
        "filingNumber": globalVars.filingNumber,
        "cnrNumber": globalVars.cnrNumber,
        "tenantId": "kl",
        "comments": [],
        "file": {
            "documentType": "case.cheque.returnmemo",
            "fileStore": "5cce560c-49d8-4e90-bc8f-ef363fa14680", // This may need to be dynamic
            "fileName": "CS_CHEQUE_RETURN_MEMO",
            "documentName": "2. Cheque Return Memo - 27_09_2024.png"
        },
        "filingType": "CASE_FILING",
        "workflow": {
            "action": "TYPE DEPOSITION",
            "documents": [
                {
                    "documentType": "case.cheque.returnmemo",
                    "fileName": "CS_CHEQUE_RETURN_MEMO",
                    "documentName": "2. Cheque Return Memo - 27_09_2024.png",
                    "fileStoreId": "5cce560c-49d8-4e90-bc8f-ef363fa14680"
                }
            ]
        }
    },
    "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": globalVars.citizenAuthToken,
        "msgId": `${Date.now()}|en_IN`,
        "plainAccessRequest": {}
    }
});

test.describe('Evidence Creation API Tests - Set 3', () => {
    let apiContext;

    test.beforeAll(async ({ playwright }) => {
        apiContext = await playwright.request.newContext({
            baseURL: BASE_URL,
            extraHTTPHeaders: {
                'Content-Type': 'application/json',
            },
        });
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test('should create evidence successfully (200 OK)', async () => {
        const requestBody = getValidRequestBody();
        
        const response = await apiContext.post(ENDPOINT, {
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

        const response = await apiContext.post(ENDPOINT, {
            data: requestBody,
        });

        expect(response.status()).toBe(401);
    });

    test('should fail with 401 for invalid authToken', async () => {
        const requestBody = getValidRequestBody();
        requestBody.RequestInfo.authToken = 'invalid-token';

        const response = await apiContext.post(ENDPOINT, {
            data: requestBody,
        });

        expect(response.status()).toBe(401);
    });

    test('should fail with 400 for bad request (e.g., missing artifact)', async () => {
        const requestBody = getValidRequestBody();
        delete requestBody.artifact;

        const response = await apiContext.post(ENDPOINT, {
            data: requestBody,
        });

        expect(response.status()).toBe(401);
    });

    test('should fail with 400 for missing required field in artifact (e.g., tenantId)', async () => {
        const requestBody = getValidRequestBody();
        delete requestBody.artifact.tenantId;

        const response = await apiContext.post(ENDPOINT, {
            data: requestBody,
        });

        expect(response.status()).toBe(401);
    });
}); 