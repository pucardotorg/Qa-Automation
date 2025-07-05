import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
let globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
const BASE_URL = globalVars.baseURL;

test.describe('Application Create API Tests', () => {
    let apiContext;
    const ENDPOINT_PATH = '/application/v1/create'; 
    const TENANT_ID = 'kl';

    test.beforeAll(async ({ playwright }) => {
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

    test('should create a new application (200 OK) and update global variables', async () => {
        const timestamp = Date.now();
        const requestBody = {
            "tenantId": TENANT_ID,
            "application": {
                "applicationDetails": {
                    "applicationTitle": "Application for Others",
                    "prayer": "faf",
                    "reasonForApplication": "afaf",
                    "advocateIndividualId": "IND-2024-11-19-000893"
                },
                "tenantId": TENANT_ID,
                "filingNumber": globalVars.filingNumber,
                "cnrNumber": globalVars.cnrNumber,
                "cmpNumber": "CMP/1167/2025", 
                "caseId": globalVars.caseId,
                "referenceId": null,
                "createdDate": timestamp,
                "applicationType": "OTHERS",
                "status": "PENDING_NOTICE",
                "isActive": true,
                "createdBy": globalVars.citizenUserInfo.uuid,
                "statuteSection": {
                    "tenantId": TENANT_ID
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
                            "code": "Rajesh Ch",
                            "name": "Rajesh Ch",
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
                    "onBehalOfName": "Rajesh Ch",
                    "partyType": "complainant",
                    "isResponseRequired": true,
                    "owner": "Maruthi ch"
                },
                "documents": [
                    {
                        "documentType": "application/pdf",
                        "fileStore": "78abb8bd-c5e0-4cb1-9818-48425f10615a",
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
                "authToken": globalVars.citizenAuthToken,
                "userInfo": {
                    "id": 1181,
                    "uuid": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
                    "userName": "6303338642",
                    "name": "Maruthi ch",
                    "mobileNumber": "6303338642",
                    "emailId": "marruthi@gmail.com",
                    "locale": null,
                    "type": "CITIZEN",
                    "roles": [
                        { "name": "USER_REGISTER", "code": "USER_REGISTER", "tenantId": "kl" },
                        { "name": "CASE_VIEWER", "code": "CASE_VIEWER", "tenantId": "kl" },
                        { "name": "HEARING_VIEWER", "code": "HEARING_VIEWER", "tenantId": "kl" },
                        { "name": "Citizen", "code": "CITIZEN", "tenantId": "kl" },
                        { "name": "ADVOCATE_ROLE", "code": "ADVOCATE_ROLE", "tenantId": "kl" },
                        { "name": "APPLICATION_CREATOR", "code": "APPLICATION_CREATOR", "tenantId": "kl" },
                        { "name": "EVIDENCE_CREATOR", "code": "EVIDENCE_CREATOR", "tenantId": "kl" },
                        { "name": "EVIDENCE_EDITOR", "code": "EVIDENCE_EDITOR", "tenantId": "kl" },
                        { "name": "SUBMISSION_DELETE", "code": "SUBMISSION_DELETE", "tenantId": "kl" },
                        { "name": "HEARING_ACCEPTOR", "code": "HEARING_ACCEPTOR", "tenantId": "kl" },
                        { "name": "ORDER_VIEWER", "code": "ORDER_VIEWER", "tenantId": "kl" },
                        { "name": "SUBMISSION_RESPONDER", "code": "SUBMISSION_RESPONDER", "tenantId": "kl" },
                        { "name": "CASE_EDITOR", "code": "CASE_EDITOR", "tenantId": "kl" },
                        { "name": "EVIDENCE_VIEWER", "code": "EVIDENCE_VIEWER", "tenantId": "kl" },
                        { "name": "ADVOCATE_VIEWER", "code": "ADVOCATE_VIEWER", "tenantId": "kl" },
                        { "name": "APPLICATION_VIEWER", "code": "APPLICATION_VIEWER", "tenantId": "kl" },
                        { "name": "SUBMISSION_CREATOR", "code": "SUBMISSION_CREATOR", "tenantId": "kl" },
                        { "name": "TASK_VIEWER", "code": "TASK_VIEWER", "tenantId": "kl" },
                        { "name": "ADVOCATE_APPLICATION_VIEWER", "code": "ADVOCATE_APPLICATION_VIEWER", "tenantId": "kl" },
                        { "name": "CASE_CREATOR", "code": "CASE_CREATOR", "tenantId": "kl" },
                        { "name": "PENDING_TASK_CREATOR", "code": "PENDING_TASK_CREATOR", "tenantId": "kl" }
                    ],
                    "active": true,
                    "tenantId": TENANT_ID,
                    "permanentCity": null
                },
                "msgId": `${timestamp}|en_IN`,
                "plainAccessRequest": {}
            }
        };

        console.log('Create Application Request Body:', JSON.stringify(requestBody, null, 2));

        const response = await apiContext.post(`${ENDPOINT_PATH}?tenantId=${TENANT_ID}`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Connection': 'keep-alive',
                'Referer': `${BASE_URL}/ui/employee/create-application`
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
            fs.writeFileSync(path.join(__dirname, '..', 'global-variables.json'), JSON.stringify(globalVars, null, 2));
            console.log('Updated global variables with application ID, Number, Created Date, Statute Section ID, and Document details');
        }
    });

    test('should fail with 401 for missing auth token', async () => {
        const timestamp = Date.now();
        const noTokenBody = {
            "tenantId": TENANT_ID,
            "application": {
                "filingNumber": globalVars.filingNumber,
                "cnrNumber": globalVars.cnrNumber,
                "cmpNumber": "CMP/1167/2025",
                "caseId": globalVars.caseId,
                "createdDate": timestamp,
                "applicationType": "OTHERS",
                "status": "PENDING_NOTICE",
                "isActive": true,
                "createdBy": globalVars.citizenUserInfo.uuid
            },
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
            "application": {
                "filingNumber": globalVars.filingNumber,
                "cnrNumber": globalVars.cnrNumber,
                "cmpNumber": "CMP/1167/2025",
                "caseId": globalVars.caseId,
                "createdDate": timestamp,
                "applicationType": "OTHERS",
                "status": "PENDING_NOTICE",
                "isActive": true,
                "createdBy": globalVars.citizenUserInfo.uuid
            },
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
});