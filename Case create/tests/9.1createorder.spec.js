import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Order Management API - Create Order', () => {
    let apiContext;
    let globalVars;
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');

    // Import values from global config into variables
    let baseURL;
    let tenantId;
    let cnrNumber;
    let filingNumber;
    let judgeauthtoken;
    let judgeUserResponse;
    
    const ENDPOINT_PATH = '/order-management/v1/_createOrder';

    test.beforeAll(async ({ playwright }) => {
        // Read global variables
        globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
        
        // Import values from global config into variables
        baseURL = globalVars.baseURL;
        tenantId = globalVars.citizenUserInfo?.tenantId || "kl";
        cnrNumber = globalVars.cnrNumber;
        filingNumber = globalVars.filingNumber;
        judgeauthtoken = globalVars.judgeauthtoken;
        judgeUserResponse = globalVars.judgeUserResponse;

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

    const createValidRequestBody = (overrides = {}) => {
        const timestamp = Date.now();
        return {
            "order": {
                "createdDate": null,
                "tenantId": tenantId,
                "cnrNumber": cnrNumber,
                "filingNumber": filingNumber,
                "statuteSection": {
                    "tenantId": tenantId
                },
                "orderTitle": "SCHEDULE_OF_HEARING_DATE",
                "orderCategory": "INTERMEDIATE",
                "orderType": "SCHEDULE_OF_HEARING_DATE",
                "status": "",
                "isActive": true,
                "workflow": {
                    "action": "SAVE_DRAFT",
                    "comments": "Creating order",
                    "assignes": null,
                    "rating": null,
                    "documents": [{}]
                },
                "documents": [],
                "additionalDetails": {
                    "formdata": {
                        "hearingDate": "2025-06-17",
                        "hearingPurpose": {
                            "id": 5,
                            "type": "ADMISSION",
                            "isactive": true,
                            "code": "ADMISSION"
                        },
                        "orderType": {
                            "code": "SCHEDULE_OF_HEARING_DATE",
                            "type": "SCHEDULE_OF_HEARING_DATE",
                            "name": "ORDER_TYPE_SCHEDULE_OF_HEARING_DATE"
                        }
                    }
                }
            },
            "RequestInfo": {
                "apiId": "Rainmaker",
                "authToken": judgeauthtoken,
                "userInfo": judgeUserResponse?.UserRequest,
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            },
            ...overrides
        };
    };

    test('should create a hearing with a valid request (200 OK)', async () => {
        const requestBody = createValidRequestBody();
        console.log('Create Order Request Body:', JSON.stringify(requestBody, null, 2));
        console.log('Using CNR Number:', cnrNumber);
        console.log('Using Filing Number:', filingNumber);
        console.log('Using Judge Auth Token:', judgeauthtoken);
        
        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${tenantId}&_=${Date.now()}`, { 
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': baseURL,
                'Connection': 'keep-alive',
                'Referer': `${baseURL}ui/employee/create-order`
            }
        });

        console.log('Response Status:', response.status());
        const responseBody = await response.text();
        console.log('Response Body:', responseBody);

        expect(response.status()).toBe(200);
        const parsedResponse = JSON.parse(responseBody);
        expect(parsedResponse.ResponseInfo.status).toBe('successful');
        expect(parsedResponse.order).toBeDefined();
        expect(parsedResponse.order.id).toMatch(/[0-9a-fA-F-]{36}/);
        expect(parsedResponse.order.tenantId).toBe(tenantId);
        expect(parsedResponse.order.filingNumber).toBe(requestBody.order.filingNumber);

        console.log('Created Order ID:', parsedResponse.order.id);
        console.log('Created Order Number:', parsedResponse.order.orderNumber);
    });
});
