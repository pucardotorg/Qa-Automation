import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Hearing Search API Tests', () => {
    let apiContext;
    let globalVars;
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');

    // Import values from global config into variables
    let baseURL;
    let tenantId;
    let filingNumber;
    let judgeauthtoken;
    
    const ENDPOINT_PATH = '/hearing/v1/search';

    test.beforeAll(async ({ playwright }) => {
        // Read global variables
        globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
        
        // Import values from global config into variables
        baseURL = globalVars.baseURL;
        tenantId = globalVars.citizenUserInfo?.tenantId || "kl";
        filingNumber = globalVars.filingNumber;
        judgeauthtoken = globalVars.judgeauthtoken;

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

    test('should search hearing by filing number and update global variables (200 OK)', async () => {
        const timestamp = Date.now();
        const requestBody = {
            "hearing": {
                "tenantId": tenantId
            },
            "criteria": {
                "tenantID": tenantId,
                "filingNumber": filingNumber,
                "courtId": "KLKM52"
            },
            "RequestInfo": {
                "apiId": "Rainmaker",
                "authToken": judgeauthtoken,
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            }
        };

        console.log('Search Hearing by Filing Number Request Body:', JSON.stringify(requestBody, null, 2));
        console.log('Using Filing Number:', filingNumber);
        console.log('Using Judge Auth Token:', judgeauthtoken);
        console.log('Using Tenant ID:', tenantId);
        
        const response = await apiContext.post(`${ENDPOINT_PATH}?_=${timestamp}`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': baseURL,
                'Connection': 'keep-alive',
                'Referer': `${baseURL}/ui/employee/create-order`
            }
        });

        console.log('Response Status:', response.status());
        const responseBody = await response.text();
        console.log('Response Body:', responseBody);

        expect(response.status()).toBe(200);
        const parsedResponse = JSON.parse(responseBody);
        
        expect(parsedResponse.responseInfo.status).toBe('successful');
        expect(parsedResponse.HearingList).toBeDefined();
        expect(Array.isArray(parsedResponse.HearingList)).toBe(true);

        // Extract hearing details from response
        if (parsedResponse.HearingList.length > 0) {
            const hearingDetails = parsedResponse.HearingList[0];
            const hearingId = hearingDetails.hearingId;
            console.log('Extracted Hearing ID:', hearingId);
            const hearingNumber = hearingDetails.hearingNumber;
            console.log('Extracted Hearing Number:', hearingNumber);

            // Update global variables
            globalVars.hearingId = hearingId;
            globalVars.hearingNumber = hearingNumber;
            fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
            console.log('Updated global variables with hearing details');
        }
    });

    test('should fail with 401 for missing auth token', async () => {
        const noTokenBody = {
            "RequestInfo": {
                "apiId": "Rainmaker",
                "msgId": `${Date.now()}|en_IN`
            },
            "criteria": {
                "filingNumber": filingNumber
            }
        };

        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${tenantId}`, {
            data: noTokenBody
        });
        expect(response.status()).toBe(401);
    });

    test('should fail with 401 for invalid auth token', async () => {
        const invalidTokenBody = {
            "RequestInfo": {
                "apiId": "Rainmaker",
                "authToken": "invalid-token",
                "msgId": `${Date.now()}|en_IN`
            },
            "criteria": {
                "filingNumber": filingNumber
            }
        };

        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${tenantId}`, {
            data: invalidTokenBody
        });
        expect(response.status()).toBe(401);
    });
}); 