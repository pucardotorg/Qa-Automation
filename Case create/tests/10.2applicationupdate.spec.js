import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

test.describe('Application Update API Tests', () => {
    let apiContext;
    let globalVars;
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');

    // Import values from global config into variables
    let baseURL;
    let tenantId;
    let applicationId;
    let caseId;
    let filingNumber;
    let cnrNumber;
    let applicationCreatedDate;
    let citizenUserInfo;
    let citizenAuthToken;
    let applicationNumber;
    let statuteSectionId;
    let applicationDocumentId;
    let applicationDocumentFileStore;
    let firstName;
    let lastName;
    let litigentIndividual;
    let litigentIndividualId;
    let litigentuuid;
    
    const ENDPOINT_PATH = '/application/v1/update'; 

    test.beforeAll(async ({ playwright }) => {
        // Read global variables
        globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
        
        // Import values from global config into variables
        baseURL = globalVars.baseURL;
        tenantId = globalVars.citizenUserInfo?.tenantId || "kl";
        applicationId = globalVars.applicationId;
        caseId = globalVars.caseId;
        filingNumber = globalVars.filingNumber;
        cnrNumber = globalVars.cnrNumber;
        applicationCreatedDate = globalVars.applicationCreatedDate;
        citizenUserInfo = globalVars.citizenUserInfo;
        citizenAuthToken = globalVars.citizenAuthToken;
        applicationNumber = globalVars.applicationNumber;
        statuteSectionId = globalVars.statuteSectionId;
        applicationDocumentId = globalVars.applicationDocumentId;
        applicationDocumentFileStore = globalVars.applicationDocumentFileStore;
        
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
        console.log('Application ID:', applicationId);
        console.log('Case ID:', caseId);
        console.log('Filing Number:', filingNumber);
        console.log('CNR Number:', cnrNumber);
        console.log('Application Number:', applicationNumber);
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

    test('should update an existing application (200 OK)', async () => {
        const timestamp = Date.now();
        const requestBody = {
            "tenantId": tenantId,
            "application": {
                "responseRequired": false,
                "id": applicationId,
                "tenantId": tenantId,
                "caseId": caseId,
                "courtId": "KLKM52",
                "filingNumber": filingNumber,
                "cnrNumber": cnrNumber,
                "cmpNumber": null,
                "referenceId": null,
                "createdDate": applicationCreatedDate,
                "createdBy": citizenUserInfo?.uuid,
                "onBehalfOf": [
                    "f562d86f-57b2-472d-a159-cba6bcbd3e5c"
                ],
                "applicationCMPNumber": null,
                "applicationType": "OTHERS",
                "applicationNumber": applicationNumber,
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
                    "id": statuteSectionId,
                    "tenantId": tenantId,
                    "statute": null,
                    "sections": null,
                    "subsections": null,
                    "additionalDetails": null,
                    "auditdetails": {
                        "createdBy": citizenUserInfo?.uuid,
                        "lastModifiedBy": citizenUserInfo?.uuid,
                        "createdTime": applicationCreatedDate,
                        "lastModifiedTime": timestamp
                    },
                    "strSections": null,
                    "strSubsections": null
                },
                "documents": [
                    {
                        "id": applicationDocumentId,
                        "documentType": "application/pdf",
                        "fileStore": applicationDocumentFileStore,
                        "documentUid": null,
                        "documentOrder": 0,
                        "additionalDetails": {
                            "name": "10.Scrutiny.Checklist.Update (3).pdf"
                        },
                        "isActive": true
                    },
                    {
                        "documentType": "SIGNED",
                        "fileStore": globalVars.UATfilestore["application"],
                        "documentOrder": 2,
                        "additionalDetails": {
                            "name": "Application: Others.pdf"
                        }
                    }
                ],
                "additionalDetails": {
                    "owner": citizenUserInfo?.name,
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
                            "code": `${firstName} ${lastName}`,
                            "name": `${firstName} ${lastName}`,
                            "uuid": "f562d86f-57b2-472d-a159-cba6bcbd3e5c"
                        },
                        "applicationDetails": {
                            "text": "afaf"
                        }
                    },
                    "partyType": "complainant",
                    "onBehalOfName": `${firstName} ${lastName}`,
                    "isResponseRequired": true
                },
                "auditDetails": {
                    "createdBy": citizenUserInfo?.uuid,
                    "lastModifiedBy": citizenUserInfo?.uuid,
                    "createdTime": applicationCreatedDate,
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
                "authToken": citizenAuthToken,
                "userInfo": citizenUserInfo,
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            }
        };

        console.log('Update Application Request Body:', JSON.stringify(requestBody, null, 2));
        console.log('Using Application ID:', applicationId);
        console.log('Using Case ID:', caseId);
        console.log('Using Filing Number:', filingNumber);
        console.log('Using CNR Number:', cnrNumber);
        console.log('Using Application Number:', applicationNumber);
        console.log('Using Citizen Auth Token:', citizenAuthToken);
        console.log('Using Citizen User Info:', citizenUserInfo?.name);

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
            "tenantId": tenantId,
            "application": {
                "id": applicationId,
                "tenantId": tenantId,
                "caseId": caseId,
                "filingNumber": filingNumber,
                "cnrNumber": cnrNumber,
                "cmpNumber": null,
                "createdDate": applicationCreatedDate,
                "createdBy": citizenUserInfo?.uuid,
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
            "tenantId": tenantId,
            "application": {
                "id": applicationId,
                "tenantId": tenantId,
                "caseId": caseId,
                "filingNumber": filingNumber,
                "cnrNumber": cnrNumber,
                "cmpNumber": null,
                "createdDate": applicationCreatedDate,
                "createdBy": citizenUserInfo?.uuid,
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