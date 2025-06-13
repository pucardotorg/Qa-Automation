import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Create Demand for Application API Tests', () => {
    let apiContext;
    const BASE_URL = 'https://dristi-kerala-uat.pucar.org';
    const ENDPOINT_PATH = '/etreasury/payment/v1/_createDemand';
    const TENANT_ID = 'kl';
    let globalVars;

    test.beforeAll(async ({ playwright }) => {
        const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
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

    test('should create demand successfully (200 OK)', async () => {
        const timestamp = Date.now();
        const requestBody = {
            "tenantId": TENANT_ID,
            "entityType": "application-voluntary-submission",
            "filingNumber": globalVars.filingNumber,
            "consumerCode": `${globalVars.applicationNumber}_APPL_FILING`,
            "calculation": [
                {
                    "tenantId": TENANT_ID,
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
                "authToken": globalVars.citizenAuthToken,
                "userInfo": globalVars.citizenUserInfo,
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            }
        };

        console.log('Create Demand Request Body:', JSON.stringify(requestBody, null, 2));

        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${TENANT_ID}`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'https://dristi-kerala-uat.pucar.org',
                'Connection': 'keep-alive',
                'Referer': 'https://dristi-kerala-uat.pucar.org/ui/employee/create-application'
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
        expect(demand.tenantId).toBe(TENANT_ID);
        expect(demand.consumerCode).toBe(`${globalVars.applicationNumber}_APPL_FILING`);
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
            fs.writeFileSync(path.join(__dirname, '..', 'global-variables.json'), JSON.stringify(globalVars, null, 2));
            console.log('Updated global variables with demand ID:', demand.id);
        }
    });

    test('should fail with 401 for missing auth token', async () => {
        const timestamp = Date.now();
        const noTokenBody = {
            "tenantId": TENANT_ID,
            "entityType": "application-voluntary-submission",
            "filingNumber": globalVars.filingNumber,
            "consumerCode": `${globalVars.applicationNumber}_APPL_FILING`,
            "calculation": [
                {
                    "tenantId": TENANT_ID,
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

        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${TENANT_ID}`, {
            data: noTokenBody
        });

        expect(response.status()).toBe(401);
    });

    test('should fail with 401 for invalid auth token', async () => {
        const timestamp = Date.now();
        const invalidTokenBody = {
            "tenantId": TENANT_ID,
            "entityType": "application-voluntary-submission",
            "filingNumber": globalVars.filingNumber,
            "consumerCode": `${globalVars.applicationNumber}_APPL_FILING`,
            "calculation": [
                {
                    "tenantId": TENANT_ID,
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

        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${TENANT_ID}`, {
            data: invalidTokenBody
        });

        expect(response.status()).toBe(401);
    });

    test('should fail with 401 for invalid tenant ID', async () => {
        const timestamp = Date.now();
        const invalidTenantBody = {
            "tenantId": "invalid-tenant",
            "entityType": "application-voluntary-submission",
            "filingNumber": globalVars.filingNumber,
            "consumerCode": `${globalVars.applicationNumber}_APPL_FILING`,
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
                "authToken": globalVars.citizenAuthToken,
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
