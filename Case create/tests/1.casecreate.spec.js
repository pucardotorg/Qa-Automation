import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const baseUrl = 'https://dristi-kerala-uat.pucar.org/case';
const createUrl = `${baseUrl}/v1/_create?_=1747766769872`;

// Read global variables from JSON file
const globalVars = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'global-variables.json'), 'utf8'));

const casePayload = {
    "cases": {
        "tenantId": "kl",
        "resolutionMechanism": "COURT",
        "caseDescription": "Case description",
        "linkedCases": [],
        "caseDetails": {},
        "caseCategory": "CRIMINAL",
        "statutesAndSections": [
            {
                "tenantId": "kl",
                "sections": [
                    "Negotiable Instrument Act",
                    "02."
                ],
                "subsections": [
                    "138",
                    "03."
                ]
            }
        ],
        "litigants": [],
        "representatives": [
            {
               //id:"1d779f1b-deba-4ffc-adde-c67bff584d54",
                "advocateId": "ead05651-b931-45f2-bbd7-c4b9ac30d960",
                "tenantId": "kl",
                "representing": []
            }
        ],
        "documents": [],
        "workflow": {
            "action": "SAVE_DRAFT",
            "comments": null,
            "assignes": null,
            "documents": [
                {
                    "documentType": null,
                    "fileStore": null,
                    "documentUid": null,
                    "additionalDetails": null
                }
            ]
        },
        "additionalDetails": {
            "payerMobileNo": "8800000019",
            "payerName": "ADV Eight Nineteen ",
            "advocateDetails": {
                "formdata": [
                    {
                        "isenabled": true,
                        "displayindex": 0,
                        "data": {}
                    }
                ]
            }
        }
    },
    "tenantId": "kl",
    "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": "", // This will be updated for each test case
        "userInfo": {
            "id": 1934,
            "uuid": "4c9c972f-1868-4333-a80a-1f02e505c757",
            "userName": "8800000019",
            "name": "ADV Eight Nineteen  ",
            "mobileNumber": "8800000019",
            "emailId": null,
            "locale": null,
            "type": "CITIZEN",
            "roles": [
                {
                    "name": "USER_REGISTER",
                    "code": "USER_REGISTER",
                    "tenantId": "kl"
                },
                {
                    "name": "CASE_VIEWER",
                    "code": "CASE_VIEWER",
                    "tenantId": "kl"
                },
                {
                    "name": "HEARING_VIEWER",
                    "code": "HEARING_VIEWER",
                    "tenantId": "kl"
                },
                {
                    "name": "Citizen",
                    "code": "CITIZEN",
                    "tenantId": "kl"
                },
                {
                    "name": "ADVOCATE_ROLE",
                    "code": "ADVOCATE_ROLE",
                    "tenantId": "kl"
                },
                {
                    "name": "APPLICATION_CREATOR",
                    "code": "APPLICATION_CREATOR",
                    "tenantId": "kl"
                },
                {
                    "name": "EVIDENCE_CREATOR",
                    "code": "EVIDENCE_CREATOR",
                    "tenantId": "kl"
                },
                {
                    "name": "EVIDENCE_EDITOR",
                    "code": "EVIDENCE_EDITOR",
                    "tenantId": "kl"
                },
                {
                    "name": "SUBMISSION_DELETE",
                    "code": "SUBMISSION_DELETE",
                    "tenantId": "kl"
                },
                {
                    "name": "HEARING_ACCEPTOR",
                    "code": "HEARING_ACCEPTOR",
                    "tenantId": "kl"
                },
                {
                    "name": "ORDER_VIEWER",
                    "code": "ORDER_VIEWER",
                    "tenantId": "kl"
                },
                {
                    "name": "SUBMISSION_RESPONDER",
                    "code": "SUBMISSION_RESPONDER",
                    "tenantId": "kl"
                },
                {
                    "name": "CASE_EDITOR",
                    "code": "CASE_EDITOR",
                    "tenantId": "kl"
                },
                {
                    "name": "EVIDENCE_VIEWER",
                    "code": "EVIDENCE_VIEWER",
                    "tenantId": "kl"
                },
                {
                    "name": "ADVOCATE_VIEWER",
                    "code": "ADVOCATE_VIEWER",
                    "tenantId": "kl"
                },
                {
                    "name": "APPLICATION_VIEWER",
                    "code": "APPLICATION_VIEWER",
                    "tenantId": "kl"
                },
                {
                    "name": "SUBMISSION_CREATOR",
                    "code": "SUBMISSION_CREATOR",
                    "tenantId": "kl"
                },
                {
                    "name": "TASK_VIEWER",
                    "code": "TASK_VIEWER",
                    "tenantId": "kl"
                },
                {
                    "name": "ADVOCATE_APPLICATION_VIEWER",
                    "code": "ADVOCATE_APPLICATION_VIEWER",
                    "tenantId": "kl"
                },
                {
                    "name": "CASE_CREATOR",
                    "code": "CASE_CREATOR",
                    "tenantId": "kl"
                },
                {
                    "name": "PENDING_TASK_CREATOR",
                    "code": "PENDING_TASK_CREATOR",
                    "tenantId": "kl"
                }
            ],
            "active": true,
            "tenantId": "kl",
            "permanentCity": null
        },
        "msgId": "1747766769872|en_IN",
        "plainAccessRequest": {}
    }
};

test.describe('Case Creation API Tests', () => {

    test('Create Case with Invalid Auth Token', async ({ request }) => {
        const payload = { ...casePayload };
        payload.RequestInfo.authToken = 'invalid-token';

        const response = await request.post(createUrl, {
            data: payload,
        });

        // Based on previous command output indicating InvalidAccessTokenException
        expect(response.status()).toBeGreaterThanOrEqual(400);
        const responseBody = await response.json();
        expect(responseBody.Errors).toBeDefined();
        expect(responseBody.Errors[0].code).toBe('InvalidAccessTokenException');
    });

    test('Create Case with Empty Auth Token', async ({ request }) => {
        const payload = { ...casePayload };
        payload.RequestInfo.authToken = '';

        const response = await request.post(createUrl, {
            data: payload,
        });

        // Expecting unauthorized or similar error for empty token
        expect(response.status()).toBeGreaterThanOrEqual(400);
        // Further assertions can be added based on actual API response for empty token
    });

    test.only('Create Case with Correct Auth Token', async ({ request }) => {
        const payload = { ...casePayload };
        const token = globalVars.citizenAuthToken;
        payload.RequestInfo.authToken = token; // Use the token directly, not as a string template

        const response = await request.post(createUrl, {
            data: payload,
        });

        // Based on previous successful command output
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.ResponseInfo.status).toBe('successful');
        expect(responseBody.cases).toBeDefined();
        expect(responseBody.cases.length).toBe(1);

        // Extract filingNumber and caseId
        const filingNumber = responseBody.cases[0].filingNumber;
        const caseId = responseBody.cases[0].id;

        // Update global-variables.json
        const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
        const updatedVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
        updatedVars.filingNumber = filingNumber;
        updatedVars.caseId = caseId;
        fs.writeFileSync(globalVarsPath, JSON.stringify(updatedVars, null, 2));
        console.log('Stored filingNumber and caseId in global-variables.json:', filingNumber, caseId);
    });
});