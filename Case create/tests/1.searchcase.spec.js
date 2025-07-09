import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Case Search API Tests', () => {
    let apiContext;
    let globalVars;
    let BASE_URL;
    const ENDPOINT_PATH = '/case/v2/search/list';
    const TENANT_ID = 'kl';
    let representativeId;
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');

    test.beforeAll(async ({ playwright }) => {
        // Read global variables
        globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
        BASE_URL = globalVars.baseURL;

        // Store frequently used global config values in variables
        var citizenUserInfo = globalVars.citizenUserInfo;
        var citizenAuthToken = globalVars.citizenAuthToken;
        var filingNumber = globalVars.filingNumber;
        var baseURL = globalVars.baseURL;
        var cnrNumber = globalVars.cnrNumber;
        var advocateId = globalVars.advocateId;

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
                "authToken": citizenAuthToken,
                "userInfo": citizenUserInfo,
                "msgId": `${Date.now()}|en_IN`
            },
            "criteria": {
                "filingNumber": filingNumber
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
        // If you want, you can also use the variable here:
        // expect(parsedResponse.caseList[0].filingNumber).toBe(filingNumber);
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