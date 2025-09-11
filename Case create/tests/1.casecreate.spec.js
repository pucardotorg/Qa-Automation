import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Read global variables from JSON file
const globalVars = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'global-variables.json'), 'utf8'));
const baseUrl = globalVars.baseURL;
const createUrl = `${baseUrl}case/v1/_create?`;

const citizenUserInfo = globalVars.citizenUserInfo;
const citizenMobile = citizenUserInfo.userName;
const citizenName = citizenUserInfo.name;
const advocateId = globalVars.advocateId;

const casePayload = {
    "cases": {
        "tenantId": "kl",
        "resolutionMechanism": "COURT",
        "caseDescription": "Case description",
        "linkedCases": [],
        "caseDetails": {},
        "caseCategory": "CRIMINAL",
        "statutesAndSections": [
            {
                "tenantId": "kl",
                "sections": [
                    "Negotiable Instrument Act",
                    "02."
                ],
                "subsections": [
                    "138",
                    "03."
                ]
            }
        ],
        "litigants": [],
        "representatives": [
            {
               "advocateId": advocateId, // ! DONT CHANGE (Need to call Advocate Search API)
                "tenantId": "kl",
                "representing": []
            }
        ],
        "documents": [],
        "workflow": {
            "action": "SAVE_DRAFT",
            "comments": null,
            "assignes": null,
            "documents": [
                {
                    "documentType": null,
                    "fileStore": null,
                    "documentUid": null,
                    "additionalDetails": null
                }
            ]
        },
        "additionalDetails": {
            "payerMobileNo": citizenMobile,
            "payerName": citizenName,
            "advocateDetails": {
                "formdata": [
                    {
                        "isenabled": true,
                        "displayindex": 0,
                        "data": {}
                    }
                ]
            }
        }
    },
    "tenantId": "kl",
    "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": "", // This will be updated for each test case
        "userInfo": citizenUserInfo,
        "msgId": "1747766769872|en_IN",
        "plainAccessRequest": {}
    }
};

test.describe('Case Creation API Tests', () => {

    test('Create Case with Invalid Auth Token', async ({ request }) => {
        const payload = { ...casePayload };
        payload.RequestInfo.authToken = 'invalid-token';

        const response = await request.post(createUrl, {
            data: payload,
        });

        // Based on previous command output indicating InvalidAccessTokenException
        expect(response.status()).toBeGreaterThanOrEqual(400);
        const responseBody = await response.json();
        expect(responseBody.Errors).toBeDefined();
        expect(responseBody.Errors[0].code).toBe('InvalidAccessTokenException');
    });

    test('Create Case with Empty Auth Token', async ({ request }) => {
        const payload = { ...casePayload };
        payload.RequestInfo.authToken = '';

        const response = await request.post(createUrl, {
            data: payload,
        });

        // Expecting unauthorized or similar error for empty token
        expect(response.status()).toBeGreaterThanOrEqual(400);
        // Further assertions can be added based on actual API response for empty token
    });

    test.only('Create Case with Correct Auth Token', async ({ playwright }) => {
        const payload = { ...casePayload };
        const token = globalVars.citizenAuthToken;
        payload.RequestInfo.authToken = token;

        // Create API request context with ignoreHTTPSErrors: true
        const apiContext = await playwright.request.newContext({ ignoreHTTPSErrors: true });
        const response = await apiContext.post(createUrl, {
            data: payload,
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.ResponseInfo.status).toBe('successful');
        expect(responseBody.cases).toBeDefined();
        expect(responseBody.cases.length).toBe(1);

        // Extract filingNumber and caseId
        const filingNumber = responseBody.cases[0].filingNumber;
        const caseId = responseBody.cases[0].id;
        const representingid=responseBody.cases[0].representatives[0].id;	

        // Update global-variables.json
        const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
        const updatedVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
        updatedVars.filingNumber = filingNumber;
        updatedVars.caseId = caseId;
        updatedVars.representingid=representingid;
        fs.writeFileSync(globalVarsPath, JSON.stringify(updatedVars, null, 2));
        console.log('Stored filingNumber and caseId in global-variables.json:', filingNumber, caseId);
    });

    
});