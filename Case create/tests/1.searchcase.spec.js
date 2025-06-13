import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Case Search API Tests', () => {
    let apiContext;
    const BASE_URL = 'https://dristi-kerala-uat.pucar.org';
    const ENDPOINT_PATH = '/case/v2/search/list';
    const TENANT_ID = 'kl';
    let globalVars;
    let representativeId;
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');

    test.beforeAll(async ({ playwright }) => {
        // Read global variables
        globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

        apiContext = await playwright.request.newContext({
            baseURL: BASE_URL,
            extraHTTPHeaders: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test('should search case by filing number and update global variables (200 OK)', async () => {
        const requestBody = {
            "RequestInfo": {
                "apiId": "Rainmaker",
                "authToken": globalVars.citizenAuthToken,
                "userInfo": {
                    "id": 1934,
                    "uuid": "4c9c972f-1868-4333-a80a-1f02e505c757",
                    "userName": "8800000019",
                    "name": "ADV Eight Nineteen  ",
                    "mobileNumber": "8800000019",
                    "emailId": null,
                    "locale": null,
                    "type": "CITIZEN",
                    "roles": [
                        {
                            "name": "USER_REGISTER",
                            "code": "USER_REGISTER",
                            "tenantId": "kl"
                        },
                        {
                            "name": "CASE_VIEWER",
                            "code": "CASE_VIEWER",
                            "tenantId": "kl"
                        },
                        {
                            "name": "HEARING_VIEWER",
                            "code": "HEARING_VIEWER",
                            "tenantId": "kl"
                        },
                        {
                            "name": "Citizen",
                            "code": "CITIZEN",
                            "tenantId": "kl"
                        },
                        {
                            "name": "ADVOCATE_ROLE",
                            "code": "ADVOCATE_ROLE",
                            "tenantId": "kl"
                        },
                        {
                            "name": "APPLICATION_CREATOR",
                            "code": "APPLICATION_CREATOR",
                            "tenantId": "kl"
                        },
                        {
                            "name": "EVIDENCE_CREATOR",
                            "code": "EVIDENCE_CREATOR",
                            "tenantId": "kl"
                        },
                        {
                            "name": "EVIDENCE_EDITOR",
                            "code": "EVIDENCE_EDITOR",
                            "tenantId": "kl"
                        },
                        {
                            "name": "SUBMISSION_DELETE",
                            "code": "SUBMISSION_DELETE",
                            "tenantId": "kl"
                        },
                        {
                            "name": "HEARING_ACCEPTOR",
                            "code": "HEARING_ACCEPTOR",
                            "tenantId": "kl"
                        },
                        {
                            "name": "ORDER_VIEWER",
                            "code": "ORDER_VIEWER",
                            "tenantId": "kl"
                        },
                        {
                            "name": "SUBMISSION_RESPONDER",
                            "code": "SUBMISSION_RESPONDER",
                            "tenantId": "kl"
                        },
                        {
                            "name": "CASE_EDITOR",
                            "code": "CASE_EDITOR",
                            "tenantId": "kl"
                        },
                        {
                            "name": "EVIDENCE_VIEWER",
                            "code": "EVIDENCE_VIEWER",
                            "tenantId": "kl"
                        },
                        {
                            "name": "ADVOCATE_VIEWER",
                            "code": "ADVOCATE_VIEWER",
                            "tenantId": "kl"
                        },
                        {
                            "name": "APPLICATION_VIEWER",
                            "code": "APPLICATION_VIEWER",
                            "tenantId": "kl"
                        },
                        {
                            "name": "SUBMISSION_CREATOR",
                            "code": "SUBMISSION_CREATOR",
                            "tenantId": "kl"
                        },
                        {
                            "name": "TASK_VIEWER",
                            "code": "TASK_VIEWER",
                            "tenantId": "kl"
                        },
                        {
                            "name": "ADVOCATE_APPLICATION_VIEWER",
                            "code": "ADVOCATE_APPLICATION_VIEWER",
                            "tenantId": "kl"
                        },
                        {
                            "name": "CASE_CREATOR",
                            "code": "CASE_CREATOR",
                            "tenantId": "kl"
                        },
                        {
                            "name": "PENDING_TASK_CREATOR",
                            "code": "PENDING_TASK_CREATOR",
                            "tenantId": "kl"
                        }
                    ],
                    "active": true,
                    "tenantId": "kl",
                    "permanentCity": null
                },
                "msgId": `${Date.now()}|en_IN`
            },
            "criteria": {
                "filingNumber": globalVars.filingNumber
            }
        };

        console.log('Search Case by Filing Number Request Body:', JSON.stringify(requestBody, null, 2));
        
        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${TENANT_ID}`, {
            data: requestBody
        });

        console.log('Response Status:', response.status());
        const responseBody = await response.text();
        console.log('Response Body:', responseBody);

        expect(response.status()).toBe(200);
        const parsedResponse = JSON.parse(responseBody);
        expect(parsedResponse.ResponseInfo.status).toBe('successful');
        expect(Array.isArray(parsedResponse.caseList)).toBe(true);
        expect(parsedResponse.caseList.length).toBeGreaterThan(0);
        expect(parsedResponse.caseList[0].filingNumber).toBe(globalVars.filingNumber);
        console.log(parsedResponse);

       representativeId = parsedResponse.cases.representatives[0].id;
        console.log("Representative ID:", representativeId);
        // Extract CNR number from response and update global variables
        const cnrNumber = parsedResponse.caseList[0].cnrNumber;
        console.log('Extracted CNR Number:', cnrNumber);

        // Update global variables
        globalVars.cnrNumber = cnrNumber;
        fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
        console.log('Updated global variables with new CNR number:', cnrNumber);
    });
}); 