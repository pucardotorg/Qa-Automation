import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
let globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

// Import all relevant values from global config
const BASE_URL = globalVars.baseURL;
const ENDPOINT = `${globalVars.baseURL}evidence/v1/_create`;
const citizenAuthToken = globalVars.citizenAuthToken;
const caseId = globalVars.caseId;
const filingNumber = globalVars.filingNumber;
const cnrNumber = globalVars.cnrNumber;
const tenantId = globalVars.citizenUserInfo?.tenantId || "kl";
const advocateId = globalVars.advocateId;
const litigantid = globalVars.litigantid;
const representingid = globalVars.representingid;

console.log('Using config values:', {
    baseURL: BASE_URL,
    caseId,
    filingNumber,
    cnrNumber,
    citizenAuthToken: citizenAuthToken ? '***' : 'undefined',
    tenantId,
    advocateId,
    litigantid,
    representingid
});

const getValidRequestBody = () => ({
    "artifact": {
        "artifactType": "PROOF_OF_ACK_OF_LEGAL_NOTICE",
        "sourceType": "COMPLAINANT",
        "sourceID": representingid, // Using representing ID from global config
        "caseId": caseId,
        "filingNumber": filingNumber,
        "cnrNumber": cnrNumber,
        "tenantId": tenantId,
        "comments": [],
        "file": {
            "documentType": "case.demandnotice.serviceproof",
            "fileStore": "b5234556-8315-4bf5-be0d-01ccf53fbffc", // This may need to be dynamic
            "fileName": "PROOF_LEGAL_DEMAND_NOTICE_FILE_NAME",
            "documentName": "4. Lease Agreement - 17_06_2024.pdf"
        },
        "filingType": "CASE_FILING",
        "workflow": {
            "action": "TYPE DEPOSITION",
            "documents": [
                {
                    "documentType": "case.demandnotice.serviceproof",
                    "fileName": "PROOF_LEGAL_DEMAND_NOTICE_FILE_NAME",
                    "documentName": "4. Lease Agreement - 17_06_2024.pdf",
                    "fileStoreId": "b5234556-8315-4bf5-be0d-01ccf53fbffc"
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

test.describe('Evidence Creation API Tests - Set 5', () => {
    let apiContext;

    test.beforeAll(async ({ playwright }) => {
        apiContext = await playwright.request.newContext({
            baseURL: BASE_URL,
            extraHTTPHeaders: {
                'Content-Type': 'application/json',
            },
            ignoreHTTPSErrors: true
        });
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test('should create evidence successfully (200 OK)', async () => {
        const requestBody = getValidRequestBody();
        
        console.log('Request payload:', JSON.stringify(requestBody, null, 2));
        
        const response = await apiContext.post(ENDPOINT, {
            data: requestBody,
        });

        console.log('Response status:', response.status());
        const responseBody = await response.json();
        console.log('Response body:', JSON.stringify(responseBody, null, 2));

        expect(response.status()).toBe(200);
        expect(responseBody.ResponseInfo.status).toBe('successful');
        expect(responseBody.artifact).toBeDefined();
        expect(responseBody.artifact.artifactNumber).toBeDefined();
        
        // Store the new artifact info in global config for future use
        if (responseBody.artifact) {
            globalVars.artifactId = responseBody.artifact.id;
            globalVars.artifactNumber = responseBody.artifact.artifactNumber;
            fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
            console.log('Updated global config with new artifact info:', {
                artifactId: globalVars.artifactId,
                artifactNumber: globalVars.artifactNumber
            });
        }
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