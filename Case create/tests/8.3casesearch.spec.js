import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Case Search API Tests', () => {
    let apiContext;
    let BASE_URL;
    const ENDPOINT_PATH = '/case/v2/search/list';
    const TENANT_ID = 'kl';
    let globalVars;
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');

    test.beforeAll(async ({ playwright }) => {
        // Read global variables
        globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
        BASE_URL = globalVars.baseURL;

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
                "authToken": globalVars.judgeauthtoken,
                "userInfo": {
                    "id": 963,
                    "uuid": "639b8909-4f25-43da-a952-3417b09afb34",
                    "userName": "gJudge",
                    "name": "Judge",
                    "mobileNumber": "1002335566",
                    "emailId": null,
                    "locale": null,
                    "type": "EMPLOYEE",
                    "roles": [
                        {
                            "name": "JUDGE_ROLE",
                            "code": "JUDGE_ROLE",
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

        // Extract CNR number from response and update global variables
        const cnrNumber = parsedResponse.caseList[0].cnrNumber;
        console.log('Extracted CNR Number:', cnrNumber);

        // Update global variables
        globalVars.cnrNumber = cnrNumber;
        fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
        console.log('Updated global variables with new CNR number:', cnrNumber);
    });
}); 