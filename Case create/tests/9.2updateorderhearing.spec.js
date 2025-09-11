import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Order Management API - Update Order (Publish)', () => {
    let apiContext;
    let globalVars;
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');

    // Import values from global config into variables
    let baseURL;
    let tenantId;
    let orderId;
    let filingNumber;
    let cnrNumber;
    let orderNumber;
    let judgeauthtoken;
    let judgeUserResponse;
    let firstName;
    let lastName;
    let litigentIndividual;
    let litigentIndividualId;
    let litigentuuid;
    
    const ENDPOINT_PATH = '/order-management/v1/_updateOrder';

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
        // Read global variables
        globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
        
        // Import values from global config into variables
        baseURL = globalVars.baseURL;
        tenantId = globalVars.citizenUserInfo?.tenantId || "kl";
        orderId = globalVars.orderId;
        filingNumber = globalVars.filingNumber;
        cnrNumber = globalVars.cnrNumber;
        orderNumber = globalVars.orderNumber;
        judgeauthtoken = globalVars.judgeauthtoken;
        judgeUserResponse = globalVars.judgeUserResponse;
        
        // Extract litigant individual details
        litigentIndividual = globalVars.litigentIndividualResponse?.Individual?.[0];
        firstName = litigentIndividual?.name?.givenName;
        lastName = litigentIndividual?.name?.familyName || '';
        litigentIndividualId = globalVars.litigentIndividualId;
        litigentuuid = globalVars.litigentuuid;

        // Log configuration values being used
        console.log('=== Configuration Values Used ===');
        console.log('Base URL:', baseURL);
        console.log('Tenant ID:', tenantId);
        console.log('Order ID:', orderId);
        console.log('Filing Number:', filingNumber);
        console.log('CNR Number:', cnrNumber);
        console.log('Order Number:', orderNumber);
        console.log('Judge Auth Token:', judgeauthtoken ? '***' + judgeauthtoken.slice(-4) : 'Not set');
        console.log('Litigant Name:', `${firstName} ${lastName}`);
        console.log('Litigant Individual ID:', litigentIndividualId);
        console.log('Litigant UUID:', litigentuuid);
        console.log('================================');

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

    const createValidUpdateRequestBody = (overrides = {}) => {
        const timestamp = Date.now();
        const nextHearingDate = getNextValidHearingDate();
        const hearingDateISO = formatDate(nextHearingDate); // YYYY-MM-DD
        const hearingDateReadable = formatDDMMYYYY(nextHearingDate); // DD-MM-YYYY

        return {
            "order": {
                "id": orderId,
                "tenantId": tenantId,
                "filingNumber": filingNumber,
                "courtId": "KLKM52",
                "cnrNumber": cnrNumber,
                "applicationNumber": [],
                "hearingNumber": null,
                "orderNumber": orderNumber,
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
                    "tenantId": tenantId,
                    "statute": null,
                    "sections": ["str"],
                    "subsections": ["str"],
                    "additionalDetails": null,
                    "auditDetails": {
                        "createdBy": judgeUserResponse?.UserRequest?.uuid,
                        "lastModifiedBy": judgeUserResponse?.UserRequest?.uuid,
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
                        "fileStore": globalVars.UATfilestore["orderTitle"],
                        "documentOrder": 1,
                        "additionalDetails": {
                            "name": "Order: Schedule of Hearing Date.pdf"
                        }
                    }]
                },
                "documents": [{
                    "isActive": true,
                    "documentType": "SIGNED",
                    "fileStore": globalVars.UATfilestore["orderTitle"],
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
                                "code": `${firstName} ${lastName}`,
                                "name": `${firstName} ${lastName} (Complainant)`,
                                "uuid": [litigentuuid],
                                "isJoined": true,
                                "partyType": "complainant",
                                "partyUuid": litigentuuid,
                                "individualId": litigentIndividualId
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
                    "createdBy": judgeUserResponse?.UserRequest?.uuid, 
                    "lastModifiedBy": judgeUserResponse?.UserRequest?.uuid,
                    "createdTime": timestamp,
                    "lastModifiedTime": timestamp
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

    test('should publish a hearing order with a valid request (200 OK)', async () => {
        const requestBody = createValidUpdateRequestBody();
        console.log('Update Order Request Body:', JSON.stringify(requestBody, null, 2));
        console.log('Using Order ID:', orderId);
        console.log('Using Filing Number:', filingNumber);
        console.log('Using CNR Number:', cnrNumber);
        console.log('Using Order Number:', orderNumber);
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
        expect(parsedResponse.order.status).toBe('PUBLISHED');
        expect(parsedResponse.order.id).toBe(orderId);
        expect(parsedResponse.order.tenantId).toBe(tenantId);
    });
});
