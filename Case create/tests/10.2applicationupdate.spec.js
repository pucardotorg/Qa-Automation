import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Application Update API Tests', () => {
    let apiContext;
    let BASE_URL;
    const ENDPOINT_PATH = '/application/v1/update'; 
    const TENANT_ID = 'kl';
    let globalVars;

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

    test('should update an existing application (200 OK)', async () => {
        const timestamp = Date.now();
        const requestBody = {
            "tenantId": TENANT_ID,
            "application": {
                "responseRequired": false,
                "id": globalVars.applicationId,
                "tenantId": TENANT_ID,
                "caseId": globalVars.caseId,
                "courtId": "KLKM52",
                "filingNumber": globalVars.filingNumber,
                "cnrNumber": globalVars.cnrNumber,
                "cmpNumber": null,
                "referenceId": null,
                "createdDate": globalVars.applicationCreatedDate,
                "createdBy": globalVars.citizenUserInfo.uuid,
                "onBehalfOf": [
                    "f562d86f-57b2-472d-a159-cba6bcbd3e5c"
                ],
                "applicationCMPNumber": null,
                "applicationType": "OTHERS",
                "applicationNumber": globalVars.applicationNumber,
                "issuedBy": null,
                "status": "PENDINGESIGN",
                "comment": [],
                "isActive": true,
                "reasonForApplication": null,
                "applicationDetails": {
                    "prayer": "faf",
                    "applicationTitle": "Application for Others",
                    "advocateIndividualId": "IND-2024-11-19-000893",
                    "reasonForApplication": "afaf"
                },
                "statuteSection": {
                    "id": globalVars.statuteSectionId,
                    "tenantId": TENANT_ID,
                    "statute": null,
                    "sections": null,
                    "subsections": null,
                    "additionalDetails": null,
                    "auditdetails": {
                        "createdBy": globalVars.citizenUserInfo.uuid,
                        "lastModifiedBy": globalVars.citizenUserInfo.uuid,
                        "createdTime": globalVars.applicationCreatedDate,
                        "lastModifiedTime": timestamp
                    },
                    "strSections": null,
                    "strSubsections": null
                },
                "documents": [
                    {
                        "id": globalVars.applicationDocumentId,
                        "documentType": "application/pdf",
                        "fileStore": globalVars.applicationDocumentFileStore,
                        "documentUid": null,
                        "documentOrder": 0,
                        "additionalDetails": {
                            "name": "10.Scrutiny.Checklist.Update (3).pdf"
                        },
                        "isActive": true
                    },
                    {
                        "documentType": "SIGNED",
                        "fileStore": "5cc9ddb8-0478-40d6-86e2-81131e63e147",
                        "documentOrder": 2,
                        "additionalDetails": {
                            "name": "Application: Others.pdf"
                        }
                    }
                ],
                "additionalDetails": {
                    "owner": "Maruthi ch",
                    "formdata": {
                        "prayer": {
                            "text": "faf"
                        },
                        "othersDocument": {
                            "documents": [
                                {}
                            ]
                        },
                        "submissionType": {
                            "code": "APPLICATION",
                            "name": "APPLICATION"
                        },
                        "applicationType": {
                            "name": "APPLICATION_TYPE_OTHERS",
                            "type": "OTHERS",
                            "isActive": true
                        },
                        "applicationTitle": "Application for Others",
                        "selectComplainant": {
                            "code": "Rajesh Ch",
                            "name": "Rajesh Ch",
                            "uuid": "f562d86f-57b2-472d-a159-cba6bcbd3e5c"
                        },
                        "applicationDetails": {
                            "text": "afaf"
                        }
                    },
                    "partyType": "complainant",
                    "onBehalOfName": "Rajesh Ch",
                    "isResponseRequired": true
                },
                "auditDetails": {
                    "createdBy": globalVars.citizenUserInfo.uuid,
                    "lastModifiedBy": globalVars.citizenUserInfo.uuid,
                    "createdTime": globalVars.applicationCreatedDate,
                    "lastModifiedTime": timestamp
                },
                "workflow": {
                    
                    "documents": [
                        {}
                    ],
                    "action": "ESIGN"
                }
            },
            "RequestInfo": {
                "apiId": "Rainmaker",
                "authToken": globalVars.citizenAuthToken,
                "userInfo": globalVars.citizenUserInfo,
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            }
        };

        console.log('Update Application Request Body:', JSON.stringify(requestBody, null, 2));

        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${TENANT_ID}`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Connection': 'keep-alive',
                'Referer': `${BASE_URL}ui/employee/create-application`
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
            console.log('Updated Application ID:', parsedResponse.application.id);
            console.log('Updated Application Number:', parsedResponse.application.applicationNumber);
        }
    });

    test('should fail with 401 for missing auth token', async () => {
        const timestamp = Date.now();
        const noTokenBody = {
            "tenantId": TENANT_ID,
            "application": {
                "id": globalVars.applicationId,
                "tenantId": TENANT_ID,
                "caseId": globalVars.caseId,
                "filingNumber": globalVars.filingNumber,
                "cnrNumber": globalVars.cnrNumber,
                "cmpNumber": null,
                "createdDate": globalVars.applicationCreatedDate,
                "createdBy": globalVars.citizenUserInfo.uuid,
                "applicationType": "OTHERS",
                "status": "PENDINGESIGN"
            },
            "RequestInfo": {
                "apiId": "Rainmaker",
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            }
        };

        const response = await apiContext.post(ENDPOINT_PATH, {
            data: noTokenBody
    });
    expect(response.status()).toBe(401);
  });

    test('should fail with 401 for invalid auth token', async () => {
        const timestamp = Date.now();
        const invalidTokenBody = {
            "tenantId": TENANT_ID,
            "application": {
                "id": globalVars.applicationId,
                "tenantId": TENANT_ID,
                "caseId": globalVars.caseId,
                "filingNumber": globalVars.filingNumber,
                "cnrNumber": globalVars.cnrNumber,
                "cmpNumber": null,
                "createdDate": globalVars.applicationCreatedDate,
                "createdBy": globalVars.citizenUserInfo.uuid,
                "applicationType": "OTHERS",
                "status": "PENDINGESIGN"
            },
            "RequestInfo": {
                "apiId": "Rainmaker",
                "authToken": "invalid-token",
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            }
        };

        const response = await apiContext.post(ENDPOINT_PATH, {
            data: invalidTokenBody
    });
    expect(response.status()).toBe(401);
  });
});