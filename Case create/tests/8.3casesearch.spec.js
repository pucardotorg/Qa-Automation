import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Case Search API Tests', () => {
    let apiContext;
    let globalVars;
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');

    // Import values from global config into variables
    let baseURL;
    let tenantId;
    let filingNumber;
    let judgeauthtoken;
    let judgeUserResponse;
    
    const ENDPOINT_PATH = '/case/v2/search/list';

    test.beforeAll(async ({ playwright }) => {
        // Read global variables
        globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
        
        // Import values from global config into variables
        baseURL = globalVars.baseURL;
        tenantId = globalVars.citizenUserInfo?.tenantId || "kl";
        filingNumber = globalVars.filingNumber;
        judgeauthtoken = globalVars.judgeauthtoken;
        judgeUserResponse = globalVars.judgeUserResponse;

        apiContext = await playwright.request.newContext({
            baseURL: baseURL,
            extraHTTPHeaders: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            ignoreHTTPSErrors: true 
        });
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test('should search case by filing number and update global variables (200 OK)', async () => {
        const requestBody = {
            "RequestInfo": {
                "apiId": "Rainmaker",
                "authToken": judgeauthtoken,
                "userInfo": judgeUserResponse?.UserRequest ,
                "msgId": `${Date.now()}|en_IN`
            },
            "criteria": {
                "filingNumber": filingNumber
            }
        };

        console.log('Search Case by Filing Number Request Body:', JSON.stringify(requestBody, null, 2));
        console.log('Using Filing Number:', filingNumber);
        console.log('Using Judge Auth Token:', judgeauthtoken);
        
        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${tenantId}`, {
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
        expect(parsedResponse.caseList[0].filingNumber).toBe(filingNumber);

        // Extract CNR number from response and update global variables
        const cnrNumber = parsedResponse.caseList[0].cnrNumber;
        console.log('Extracted CNR Number:', cnrNumber);

        // Update global variables
        globalVars.cnrNumber = cnrNumber;
        fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
        console.log('Updated global variables with new CNR number:', cnrNumber);
    });
}); 