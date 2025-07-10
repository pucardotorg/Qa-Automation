import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Create Demand for Application API Tests', () => {
    let apiContext;
    let globalVars;
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');

    // Import values from global config into variables
    let baseURL;
    let tenantId;
    let filingNumber;
    let applicationNumber;
    let citizenAuthToken;
    let citizenUserInfo;
    
    const ENDPOINT_PATH = '/etreasury/payment/v1/_createDemand';

    test.beforeAll(async ({ playwright }) => {
        // Read global variables
        globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
        
        // Import values from global config into variables
        baseURL = globalVars.baseURL;
        tenantId = globalVars.citizenUserInfo?.tenantId || "kl";
        filingNumber = globalVars.filingNumber;
        applicationNumber = globalVars.applicationNumber;
        citizenAuthToken = globalVars.citizenAuthToken;
        citizenUserInfo = globalVars.citizenUserInfo;

        apiContext = await playwright.request.newContext({
            baseURL: baseURL,
            extraHTTPHeaders: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test('should create demand successfully (200 OK)', async () => {
        const timestamp = Date.now();
        const requestBody = {
            "tenantId": tenantId,
            "entityType": "application-voluntary-submission",
            "filingNumber": filingNumber,
            "consumerCode": `${applicationNumber}_APPL_FILING`,
            "calculation": [
                {
                    "tenantId": tenantId,
                    "totalAmount": "20",
                    "breakDown": [
                        {
                            "type": "Application Fee",
                            "code": "APPLICATION_FEE",
                            "amount": "20",
                            "additionalParams": {}
                        }
                    ]
                }
            ],
            "RequestInfo": {
                "apiId": "Rainmaker",
                "authToken": citizenAuthToken,
                "userInfo": citizenUserInfo,
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            }
        };

        console.log('Create Demand Request Body:', JSON.stringify(requestBody, null, 2));
        console.log('Using Filing Number:', filingNumber);
        console.log('Using Application Number:', applicationNumber);
        console.log('Using Consumer Code:', `${applicationNumber}_APPL_FILING`);
        console.log('Using Citizen Auth Token:', citizenAuthToken);

        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${tenantId}`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': baseURL,
                'Connection': 'keep-alive',
                'Referer': `${baseURL}ui/employee/create-application`
            }
        });

        console.log('Response Status:', response.status());
        const responseBody = await response.text();
        console.log('Response Body:', responseBody);

        expect(response.status()).toBe(200);
        const parsedResponse = JSON.parse(responseBody);
        expect(parsedResponse.ResponseInfo.status).toBe('201 CREATED');
        expect(parsedResponse.Demands).toBeDefined();
        expect(Array.isArray(parsedResponse.Demands)).toBe(true);
        expect(parsedResponse.Demands.length).toBeGreaterThan(0);

        // Validate demand details
        const demand = parsedResponse.Demands[0];
        expect(demand.tenantId).toBe(tenantId);
        expect(demand.consumerCode).toBe(`${applicationNumber}_APPL_FILING`);
        expect(demand.consumerType).toBe('application-voluntary-submission');
        expect(demand.status).toBe('ACTIVE');
        expect(demand.isPaymentCompleted).toBe(false);

        // Validate demand details array
        expect(demand.demandDetails).toBeDefined();
        expect(Array.isArray(demand.demandDetails)).toBe(true);
        expect(demand.demandDetails.length).toBeGreaterThan(0);

        // Store demand ID in global variables for future use
        if (demand.id) {
            globalVars.demandId = demand.id;
            fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
            console.log('Updated global variables with demand ID:', demand.id);
        }
    });

    test('should fail with 401 for missing auth token', async () => {
        const timestamp = Date.now();
        const noTokenBody = {
            "tenantId": tenantId,
            "entityType": "application-voluntary-submission",
            "filingNumber": filingNumber,
            "consumerCode": `${applicationNumber}_APPL_FILING`,
            "calculation": [
                {
                    "tenantId": tenantId,
                    "totalAmount": "20",
                    "breakDown": [
                        {
                            "type": "Application Fee",
                            "code": "APPLICATION_FEE",
                            "amount": "20",
                            "additionalParams": {}
                        }
                    ]
                }
            ],
            "RequestInfo": {
                "apiId": "Rainmaker",
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            }
        };

        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${tenantId}`, {
            data: noTokenBody
        });

        expect(response.status()).toBe(401);
    });

    test('should fail with 401 for invalid auth token', async () => {
        const timestamp = Date.now();
        const invalidTokenBody = {
            "tenantId": tenantId,
            "entityType": "application-voluntary-submission",
            "filingNumber": filingNumber,
            "consumerCode": `${applicationNumber}_APPL_FILING`,
            "calculation": [
                {
                    "tenantId": tenantId,
                    "totalAmount": "20",
                    "breakDown": [
                        {
                            "type": "Application Fee",
                            "code": "APPLICATION_FEE",
                            "amount": "20",
                            "additionalParams": {}
                        }
                    ]
                }
            ],
            "RequestInfo": {
                "apiId": "Rainmaker",
                "authToken": "invalid-token",
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            }
        };

        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${tenantId}`, {
            data: invalidTokenBody
        });

        expect(response.status()).toBe(401);
    });

    test('should fail with 401 for invalid tenant ID', async () => {
        const timestamp = Date.now();
        const invalidTenantBody = {
            "tenantId": "invalid-tenant",
            "entityType": "application-voluntary-submission",
            "filingNumber": filingNumber,
            "consumerCode": `${applicationNumber}_APPL_FILING`,
            "calculation": [
                {
                    "tenantId": "invalid-tenant",
                    "totalAmount": "20",
                    "breakDown": [
                        {
                            "type": "Application Fee",
                            "code": "APPLICATION_FEE",
                            "amount": "20",
                            "additionalParams": {}
                        }
                    ]
                }
            ],
            "RequestInfo": {
                "apiId": "Rainmaker",
                "authToken": citizenAuthToken,
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            }
        };

        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=invalid-tenant`, {
            data: invalidTenantBody
        });

        expect(response.status()).toBe(401);
    });
});
