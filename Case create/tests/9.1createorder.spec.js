import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Order Management API - Create Order', () => {
    let apiContext;
    const BASE_URL = 'https://dristi-kerala-uat.pucar.org';
    const ENDPOINT_PATH = '/order-management/v1/_createOrder';
    const TENANT_ID = 'kl';
    let globalVars;

    test.beforeAll(async ({ playwright }) => {
        // Read global variables
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

    const createValidRequestBody = (overrides = {}) => {
        const timestamp = Date.now();
        return {
            "order": {
                "createdDate": null,
                "tenantId": TENANT_ID,
                "cnrNumber": globalVars.cnrNumber,
                "filingNumber": globalVars.filingNumber,
                "statuteSection": {
                    "tenantId": TENANT_ID
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
                "authToken": globalVars.judgeauthtoken,
                "userInfo": {
                    "id": 963,
                    "uuid": "3112af8e-7155-4476-8938-cee57b006654",
                    "userName": "gJudge",
                    "name": "Judge",
                    "mobileNumber": "1002335566",
                    "emailId": null,
                    "locale": null,
                    "type": "EMPLOYEE",
                    "roles": [
                        { "name": "DIARY_APPROVER", "code": "DIARY_APPROVER", "tenantId": TENANT_ID },
                        { "name": "HEARING_VIEWER", "code": "HEARING_VIEWER", "tenantId": TENANT_ID },
                        { "name": "WORKFLOW_ABANDON", "code": "WORKFLOW_ABANDON", "tenantId": TENANT_ID },
                        { "name": "ORDER_ESIGN", "code": "ORDER_ESIGN", "tenantId": TENANT_ID },
                        { "name": "Workflow Admin", "code": "WORKFLOW_ADMIN", "tenantId": TENANT_ID },
                        { "name": "APPLICATION_CREATOR", "code": "APPLICATION_CREATOR", "tenantId": TENANT_ID },
                        { "name": "DEPOSITION_PUBLISHER", "code": "DEPOSITION_PUBLISHER", "tenantId": TENANT_ID },
                        { "name": "HEARING_APPROVER", "code": "HEARING_APPROVER", "tenantId": TENANT_ID },
                        { "name": "SUBMISSION_RESPONDER", "code": "SUBMISSION_RESPONDER", "tenantId": TENANT_ID },
                        { "name": "ORDER_VIEWER", "code": "ORDER_VIEWER", "tenantId": TENANT_ID },
                        { "name": "ORDER_REASSIGN", "code": "ORDER_REASSIGN", "tenantId": TENANT_ID },
                        { "name": "CASE_EDITOR", "code": "CASE_EDITOR", "tenantId": TENANT_ID },
                        { "name": "TASK_CREATOR", "code": "TASK_CREATOR", "tenantId": TENANT_ID },
                        { "name": "APPLICATION_APPROVER", "code": "APPLICATION_APPROVER", "tenantId": TENANT_ID },
                        { "name": "DIARY_VIEWER", "code": "DIARY_VIEWER", "tenantId": TENANT_ID },
                        { "name": "Employee", "code": "EMPLOYEE", "tenantId": TENANT_ID },
                        { "name": "ORDER_DELETE", "code": "ORDER_DELETE", "tenantId": TENANT_ID },
                        { "name": "NOTIFICATION_APPROVER", "code": "NOTIFICATION_APPROVER", "tenantId": TENANT_ID },
                        { "name": "CASE_VIEWER", "code": "CASE_VIEWER", "tenantId": TENANT_ID },
                        { "name": "TASK_EDITOR", "code": "TASK_EDITOR", "tenantId": TENANT_ID },
                        { "name": "APPLICATION_REJECTOR", "code": "APPLICATION_REJECTOR", "tenantId": TENANT_ID },
                        { "name": "HEARING_EDITOR", "code": "HEARING_EDITOR", "tenantId": TENANT_ID },
                        { "name": "DIARY_EDITOR", "code": "DIARY_EDITOR", "tenantId": TENANT_ID },
                        { "name": "ORDER_APPROVER", "code": "ORDER_APPROVER", "tenantId": TENANT_ID },
                        { "name": "NOTIFICATION_CREATOR", "code": "NOTIFICATION_CREATOR", "tenantId": TENANT_ID },
                        { "name": "HEARING_CREATOR", "code": "HEARING_CREATOR", "tenantId": TENANT_ID },
                        { "name": "EVIDENCE_CREATOR", "code": "EVIDENCE_CREATOR", "tenantId": TENANT_ID },
                        { "name": "ORDER_CREATOR", "code": "ORDER_CREATOR", "tenantId": TENANT_ID },
                        { "name": "CALCULATION_VIEWER", "code": "CALCULATION_VIEWER", "tenantId": TENANT_ID },
                        { "name": "JUDGE_ROLE", "code": "JUDGE_ROLE", "tenantId": TENANT_ID },
                        { "name": "EVIDENCE_EDITOR", "code": "EVIDENCE_EDITOR", "tenantId": TENANT_ID },
                        { "name": "CASE_APPROVER", "code": "CASE_APPROVER", "tenantId": TENANT_ID },
                        { "name": "SUBMISSION_APPROVER", "code": "SUBMISSION_APPROVER", "tenantId": TENANT_ID },
                        { "name": "TASK_VIEWER", "code": "TASK_VIEWER", "tenantId": TENANT_ID },
                        { "name": "HEARING_SCHEDULER", "code": "HEARING_SCHEDULER", "tenantId": TENANT_ID }
                    ],
                    "active": true,
                    "tenantId": TENANT_ID,
                    "permanentCity": null
                },
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            },
            ...overrides
        };
    };

    test('should create a hearing with a valid request (200 OK)', async () => {
        const requestBody = createValidRequestBody();
        console.log('Create Order Request Body:', JSON.stringify(requestBody, null, 2));
        
        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${TENANT_ID}&_=${Date.now()}`, { 
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'https://dristi-kerala-uat.pucar.org',
                'Connection': 'keep-alive',
                'Referer': 'https://dristi-kerala-uat.pucar.org/ui/employee/create-order'
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
        expect(parsedResponse.order.tenantId).toBe(TENANT_ID);
        expect(parsedResponse.order.filingNumber).toBe(requestBody.order.filingNumber);

        console.log('Created Order ID:', parsedResponse.order.id);
        console.log('Created Order Number:', parsedResponse.order.orderNumber);
    });
});
