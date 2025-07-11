import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Application Create API Tests', () => {
    let apiContext;
    let globalVars;
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');

    // Import values from global config into variables
    let baseURL;
    let tenantId;
    let filingNumber;
    let cnrNumber;
    let caseId;
    let citizenAuthToken;
    let citizenUserInfo;
    let firstName;
    let lastName;
    let litigentIndividual;
    let litigentIndividualId;
    let litigentuuid;
    
    const ENDPOINT_PATH = '/application/v1/create'; 

    test.beforeAll(async ({ playwright }) => {
        // Read global variables
        globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
        
        // Import values from global config into variables
        baseURL = globalVars.baseURL;
        tenantId = globalVars.citizenUserInfo?.tenantId || "kl";
        filingNumber = globalVars.filingNumber;
        cnrNumber = globalVars.cnrNumber;
        caseId = globalVars.caseId;
        citizenAuthToken = globalVars.citizenAuthToken;
        citizenUserInfo = globalVars.citizenUserInfo;
        
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
        console.log('Filing Number:', filingNumber);
        console.log('CNR Number:', cnrNumber);
        console.log('Case ID:', caseId);
        console.log('Citizen Auth Token:', citizenAuthToken ? '***' + citizenAuthToken.slice(-4) : 'Not set');
        console.log('Citizen User Info:', citizenUserInfo?.name);
        console.log('Litigant Name:', `${firstName} ${lastName}`);
        console.log('Litigant Individual ID:', litigentIndividualId);
        console.log('Litigant UUID:', litigentuuid);
        console.log('================================');

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

    test('should create a new application (200 OK) and update global variables', async () => {
        const timestamp = Date.now();
        const requestBody = {
            "tenantId": tenantId,
            "application": {
                "applicationDetails": {
                    "applicationTitle": "Application for Others",
                    "prayer": "faf",
                    "reasonForApplication": "afaf",
                    "advocateIndividualId": "IND-2024-11-19-000893"
                },
                "tenantId": tenantId,
                "filingNumber": filingNumber,
                "cnrNumber": cnrNumber,
                "cmpNumber": "CMP/1167/2025", 
                "caseId": caseId,
                "referenceId": null,
                "createdDate": timestamp,
                "applicationType": "OTHERS",
                "status": "PENDING_NOTICE",
                "isActive": true,
                "createdBy": citizenUserInfo?.uuid,
                "statuteSection": {
                    "tenantId": tenantId
                },
                "additionalDetails": {
                    "formdata": {
                        "submissionType": {
                            "code": "APPLICATION",
                            "name": "APPLICATION"
                        },
                        "applicationType": {
                            "type": "OTHERS",
                            "name": "APPLICATION_TYPE_OTHERS",
                            "isActive": true
                        },
                        "selectComplainant": {
                            "code": `${firstName} ${lastName}`,
                            "name": `${firstName} ${lastName}`,
                            "uuid": "f562d86f-57b2-472d-a159-cba6bcbd3e5c"
                        },
                        "applicationTitle": "Application for Others",
                        "othersDocument": {
                            "documents": [
                                {}
                            ]
                        },
                        "prayer": {
                            "text": "faf"
                        },
                        "applicationDetails": {
                            "text": "afaf"
                        }
                    },
                    "onBehalOfName": `${firstName} ${lastName}`,
                    "partyType": "complainant",
                    "isResponseRequired": true,
                    "owner": citizenUserInfo?.name
                },
                "documents": [
                    {
                        "documentType": "application/pdf",
                        "fileStore": globalVars.applicationDocumentFileStore,
                        "documentOrder": 0,
                        "additionalDetails": {
                            "name": "10.Scrutiny.Checklist.Update (3).pdf"
                        }
                    }
                ],
                "onBehalfOf": [
                    "f562d86f-57b2-472d-a159-cba6bcbd3e5c"
                ],
                "comment": [],
                "workflow": {
                    "id": "workflow123",
                    "action": "CREATE",
                    "status": "in_progress",
                    "comments": "Workflow comments",
                    "documents": [
                        {}
                    ]
                }
            },
            "RequestInfo": {
                "apiId": "Rainmaker",
                "authToken": citizenAuthToken,
                "userInfo": citizenUserInfo ,
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            }
        };

        console.log('Create Application Request Body:', JSON.stringify(requestBody, null, 2));
        console.log('Using Filing Number:', filingNumber);
        console.log('Using CNR Number:', cnrNumber);
        console.log('Using Case ID:', caseId);
        console.log('Using Citizen Auth Token:', citizenAuthToken);
        console.log('Using Citizen User Info:', citizenUserInfo?.name);

        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${tenantId}`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': baseURL,
                'Connection': 'keep-alive',
                'Referer': `${baseURL}/ui/employee/create-application`
            }
        });

        console.log('Response Status:', response.status());
        const responseBody = await response.text();
        console.log('Response Body:', responseBody);

        expect(response.status()).toBe(200);
        const parsedResponse = JSON.parse(responseBody);
        expect(parsedResponse.ResponseInfo.status).toBe('successful');
        expect(parsedResponse.application).toBeDefined();
        expect(typeof parsedResponse.application).toBe('object');

        if (parsedResponse.application) {
            const applicationId = parsedResponse.application.id;
            const applicationNumber = parsedResponse.application.applicationNumber;
            const applicationCreatedDate = parsedResponse.application.createdDate;
            const statuteSectionId = parsedResponse.application.statuteSection.id;
            const documentId = parsedResponse.application.documents[0].id;
            const documentFileStore = parsedResponse.application.documents[0].fileStore;

            console.log('Extracted Application ID:', applicationId);
            console.log('Extracted Application Number:', applicationNumber);
            console.log('Extracted Application Created Date:', applicationCreatedDate);
            console.log('Extracted Statute Section ID:', statuteSectionId);
            console.log('Extracted Document ID:', documentId);
            console.log('Extracted Document File Store:', documentFileStore);

            globalVars.applicationId = applicationId;
            globalVars.applicationNumber = applicationNumber;
            globalVars.applicationCreatedDate = applicationCreatedDate;
            globalVars.statuteSectionId = statuteSectionId;
            globalVars.applicationDocumentId = documentId;
            globalVars.applicationDocumentFileStore = documentFileStore;
            fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
            console.log('Updated global variables with application ID, Number, Created Date, Statute Section ID, and Document details');
        }
    });

    test('should fail with 401 for missing auth token', async () => {
        const timestamp = Date.now();
        const noTokenBody = {
            "tenantId": tenantId,
            "application": {
                "filingNumber": filingNumber,
                "cnrNumber": cnrNumber,
                "cmpNumber": "CMP/1167/2025",
                "caseId": caseId,
                "createdDate": timestamp,
                "applicationType": "OTHERS",
                "status": "PENDING_NOTICE",
                "isActive": true,
                "createdBy": citizenUserInfo?.uuid
            },
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
            "application": {
                "filingNumber": filingNumber,
                "cnrNumber": cnrNumber,
                "cmpNumber": "CMP/1167/2025",
                "caseId": caseId,
                "createdDate": timestamp,
                "applicationType": "OTHERS",
                "status": "PENDING_NOTICE",
                "isActive": true,
                "createdBy": citizenUserInfo?.uuid
            },
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
});