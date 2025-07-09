import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Order Management API - Update Order (Publish)', () => {
    let apiContext;
    let BASE_URL;
    const ENDPOINT_PATH = '/order-management/v1/_updateOrder';
    const TENANT_ID = 'kl';
    let globalVars;

    // Utility: Compute next working day (skip weekends)
    const getNextValidHearingDate = () => {
        let date = new Date();
        date.setDate(date.getDate() + 1); // Tomorrow

        while (date.getDay() === 0 || date.getDay() === 6) {
            date.setDate(date.getDate() + 1); // Skip weekends
        }

        return date;
    };

    // Format to YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];

    // Format to DD-MM-YYYY for businessOfTheDay
    const formatDDMMYYYY = (date) => {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    };

    test.beforeAll(async ({ playwright }) => {
        const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
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

    const createValidUpdateRequestBody = (overrides = {}) => {
        const timestamp = Date.now();
        const nextHearingDate = getNextValidHearingDate();
        const hearingDateISO = formatDate(nextHearingDate); // YYYY-MM-DD
        const hearingDateReadable = formatDDMMYYYY(nextHearingDate); // DD-MM-YYYY

        return {
            "order": {
                "id": globalVars.orderId,
                "tenantId": TENANT_ID,
                "filingNumber": globalVars.filingNumber,
                "courtId": "KLKM52",
                "cnrNumber": globalVars.cnrNumber,
                "applicationNumber": [],
                "hearingNumber": null,
                "orderNumber": globalVars.orderNumber,
                "linkedOrderNumber": null,
                "createdDate": timestamp,
                "issuedBy": null,
                "orderType": "SCHEDULE_OF_HEARING_DATE",
                "orderCategory": "INTERMEDIATE",
                "status": "DRAFT_IN_PROGRESS",
                "comments": "Updating hearing date",
                "isActive": true,
                "statuteSection": {
                    "id": "f93ee010-787b-47e4-9420-395987c5a7ac",
                    "tenantId": TENANT_ID,
                    "statute": null,
                    "sections": ["str"],
                    "subsections": ["str"],
                    "additionalDetails": null,
                    "auditDetails": {
                        "createdBy": "639b8909-4f25-43da-a952-3417b09afb34",
                        "lastModifiedBy": "639b8909-4f25-43da-a952-3417b09afb34",
                        "createdTime": timestamp,
                        "lastModifiedTime": timestamp
                    }
                },
                "orderTitle": "SCHEDULE_OF_HEARING_DATE",
                "workflow": {
                    "action": "E-SIGN",
                    "comments": "Publishing order",
                    "assignes": null,
                    "rating": null,
                    "documents": [{
                        "isActive": true,
                        "documentType": "SIGNED",
                        "fileStore": "758dcbda-4428-4b26-a061-e510ffc2ea58",
                        "documentOrder": 1,
                        "additionalDetails": {
                            "name": "Order: Schedule of Hearing Date.pdf"
                        }
                    }]
                },
                "documents": [{
                    "isActive": true,
                    "documentType": "SIGNED",
                    "fileStore": "758dcbda-4428-4b26-a061-e510ffc2ea58",
                    "documentOrder": 1,
                    "additionalDetails": {
                        "name": "Order: Schedule of Hearing Date.pdf"
                    }
                }],
                "additionalDetails": {
                    "formdata": {
                        "hearingDate": hearingDateISO,
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
                        },
                        "namesOfPartiesRequired": [
                            {
                                "code": "Hemadri Rt",
                                "name": "Hemadri Rt (Complainant)",
                                "uuid": ["700a3a1b-f7e1-4e31-a0cd-04f8777e4f66"],
                                "isJoined": true,
                                "partyType": "complainant",
                                "partyUuid": "700a3a1b-f7e1-4e31-a0cd-04f8777e4f66",
                                "individualId": "IND-2025-02-18-000070"
                            },
                            {
                                "code": "Accused Details",
                                "name": "Accused Details (Accused)",
                                "isJoined": false,
                                "uniqueId": "ffec932e-8204-49f9-9d19-7108e11da7f6",
                                "partyType": "respondent"
                            }
                        ],
                        "comments": {
                            "text": "Updating hearing date"
                        }
                    },
                    "businessOfTheDay": `For Admission on ${hearingDateReadable}`
                },
                "auditDetails": {
                    "createdBy": "639b8909-4f25-43da-a952-3417b09afb34",
                    "lastModifiedBy": "639b8909-4f25-43da-a952-3417b09afb34",
                    "createdTime": timestamp,
                    "lastModifiedTime": timestamp
                }
            },
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
                        { "name": "ORDER_CREATOR", "code": "ORDER_CREATOR", "tenantId": TENANT_ID },
                        { "name": "JUDGE_ROLE", "code": "JUDGE_ROLE", "tenantId": TENANT_ID },
                        { "name": "ORDER_ESIGN", "code": "ORDER_ESIGN", "tenantId": TENANT_ID }
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

    test('should publish a hearing order with a valid request (200 OK)', async () => {
        const requestBody = createValidUpdateRequestBody();
        console.log('Update Order Request Body:', JSON.stringify(requestBody, null, 2));
        
        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${TENANT_ID}&_=${Date.now()}`, { 
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Connection': 'keep-alive',
                'Referer': `${BASE_URL}ui/employee/create-order`
            }
        });

        console.log('Response Status:', response.status());
        const responseBody = await response.text();
        console.log('Response Body:', responseBody);

        expect(response.status()).toBe(200);
        const parsedResponse = JSON.parse(responseBody);

        expect(parsedResponse.ResponseInfo.status).toBe('successful');
        expect(parsedResponse.order).toBeDefined();
        expect(parsedResponse.order.status).toBe('PUBLISHED');
        expect(parsedResponse.order.id).toBe(globalVars.orderId);
        expect(parsedResponse.order.tenantId).toBe(TENANT_ID);
    });
});
