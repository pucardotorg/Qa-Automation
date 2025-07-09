import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
const globalVars = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'global-variables.json'), 'utf8'));
const baseUrl = globalVars.baseURL;
const updateUrl = `${baseUrl}case/v1/_update?`;

// Read global variables from JSON file
//const globalVars = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'global-variables.json'), 'utf8'));
const citizenUserInfo = globalVars.citizenUserInfo;
const citizenMobile = citizenUserInfo.userName;
const citizenName = citizenUserInfo.name;
const citizenUUID = citizenUserInfo.uuid;
const representid = globalVars.representingid;
const caseId = globalVars.caseId;
const filingNumber = globalVars.filingNumber;
const epochtime = globalVars.epochTime;
const citizenAuthToken = globalVars.citizenAuthToken;
const advocateId = globalVars.advocateId;

const casePayload = {
    "cases": {
        "id": caseId,
        "tenantId": "kl",
        "resolutionMechanism": "COURT",
        "caseTitle": "Rajesh Ch vs ",
        "isActive": true,
        "caseDescription": "Case description",
        "filingNumber": filingNumber,
        "advocateCount": 0,
        "courtCaseNumber": null,
        "caseNumber": null,
        "caseType": null,
        "cnrNumber": null,
        "cmpNumber": null,
        "accessCode": null,
        "outcome": null,
        "pendingAdvocateRequests": null,
        "courtId": null,
        "benchId": null,
        "linkedCases": [],
        "filingDate": null,
        "registrationDate": null,
        "judgementDate": null,
        "caseDetails": {},
        "caseCategory": "CRIMINAL",
        "judgeId": null,
        "stage": null,
        "substage": null,
        "natureOfPleading": null,
        "statutesAndSections": [
            {
                "id": "444c8198-08dd-4867-a90c-fb10ed27358e",
                "tenantId": "kl",
                "statute": null,
                "sections": [
                    "Negotiable Instrument Act",
                    "02."
                ],
                "subsections": [
                    "138",
                    "03."
                ],
                "additionalDetails": null,
                "auditdetails": {
                    "createdBy": citizenUUID,
                    "lastModifiedBy": citizenUUID,
                    "createdTime": epochtime,
                    "lastModifiedTime": epochtime
                },
                "strSections": "Negotiable Instrument Act,02.",
                "strSubsections": "138,03."
            }
        ],
        "litigants": [
            {
                "tenantId": "kl",
                "caseId": caseId,
                "partyCategory": "INDIVIDUAL",
                "individualId": "IND-2024-10-29-000629",
                "partyType": "complainant.primary",
                "additionalDetails": {
                    "fullName": "Rajesh Ch",
                    "uuid": "f562d86f-57b2-472d-a159-cba6bcbd3e5c",
                    "currentPosition": 1
                }
            }
        ],
        "representatives": [
            {
                "id": representid,
                "tenantId": "kl",
                "advocateId": advocateId,
                "caseId": caseId,
                "representing": [],
                "isActive": true,
                "documents": null,
                "auditDetails": {
                    "createdBy": citizenUUID,
                    "lastModifiedBy": citizenUUID,
                    "createdTime": epochtime,
                    "lastModifiedTime": epochtime
                },
                "additionalDetails": null,
                "hasSigned": false
            }
        ],
        "status": "DRAFT_IN_PROGRESS",
        "documents": [
            {
                "fileName": "AADHAR",
                "fileStore": "b7b06ce0-c41b-431c-8825-06f9f92fea3f",
                "documentName": "adhaar.jpg",
                "documentType": "COMPLAINANT_ID_PROOF"
            }
        ],
        "remarks": null,
        "workflow": {
            "action": "SAVE_DRAFT",
            "comments": null,
            "documents": [
                {
                    "id": null,
                    "documentType": null,
                    "fileStore": null,
                    "documentUid": null,
                    "additionalDetails": null
                }
            ],
            "assignes": [],
            "rating": null,
            "additionalDetails": null
        },
        "additionalDetails": {
            "advocateDetails": {
                "formdata": [
                    {
                        "data": {},
                        "isenabled": true,
                        "displayindex": 0
                    }
                ]
            },
            "payerName": citizenName,
            "payerMobileNo": citizenMobile,
            "complainantDetails": {
                "formdata": [
                    {
                        "isenabled": true,
                        "data": {
                            "complainantType": {
                                "id": 1,
                                "code": "INDIVIDUAL",
                                "name": "Individual",
                                "isactive": true,
                                "commonFields": true,
                                "isIndividual": true,
                                "complainantTypeId": 1,
                                "showCompanyDetails": false,
                                "complainantLocation": true
                            },
                            "complainantVerification": {
                                "mobileNumber": "9032273758",
                                "otpNumber": "123456",
                                "individualDetails": {
                                    "individualId": "IND-2024-10-29-000629",
                                    "userUuid": "f562d86f-57b2-472d-a159-cba6bcbd3e5c",
                                    "document": [
                                        {
                                            "fileName": "AADHAR",
                                            "fileStore": "b7b06ce0-c41b-431c-8825-06f9f92fea3f",
                                            "documentName": "adhaar.jpg"
                                        }
                                    ],
                                    "addressDetails-select": {
                                        "pincode": "500089",
                                        "district": "Hyderabad",
                                        "city": "Manikonda",
                                        "state": "Telangana",
                                        "coordinates": {
                                            "longitude": 78.36590233349611,
                                            "latitude": 17.41527225357707
                                        },
                                        "locality": "1, 12, Janmabhoomi Colony, Pappulaguda"
                                    },
                                    "addressDetails": {
                                        "pincode": "500089",
                                        "district": "Hyderabad",
                                        "city": "Manikonda",
                                        "state": "Telangana",
                                        "coordinates": {
                                            "longitude": 78.36590233349611,
                                            "latitude": 17.41527225357707
                                        },
                                        "locality": "1, 12, Janmabhoomi Colony, Pappulaguda"
                                    },
                                    "currentAddressDetails-select": {
                                        "pincode": "500089",
                                        "district": "Hyderabad",
                                        "city": "Manikonda",
                                        "state": "Telangana",
                                        "coordinates": {
                                            "longitude": 78.36590233349611,
                                            "latitude": 17.41527225357707
                                        },
                                        "locality": "1, 12, Janmabhoomi Colony, Pappulaguda",
                                        "isCurrAddrSame": {
                                            "code": "YES",
                                            "name": "YES"
                                        }
                                    },
                                    "currentAddressDetails": {
                                        "pincode": "500089",
                                        "district": "Hyderabad",
                                        "city": "Manikonda",
                                        "state": "Telangana",
                                        "coordinates": {
                                            "longitude": 78.36590233349611,
                                            "latitude": 17.41527225357707
                                        },
                                        "locality": "1, 12, Janmabhoomi Colony, Pappulaguda",
                                        "isCurrAddrSame": {
                                            "code": "YES",
                                            "name": "YES"
                                        }
                                    }
                                },
                                "isUserVerified": true
                            },
                            "complainantId": {
                                "complainantId": true
                            },
                            "firstName": "Rajesh",
                            "middleName": "",
                            "lastName": "Ch",
                            "complainantAge": "45",
                            "addressDetails-select": {
                                "pincode": "500089",
                                "state": "Telangana",
                                "district": "Hyderabad",
                                "city": "Manikonda",
                                "locality": "1, 12, Janmabhoomi Colony, Pappulaguda"
                            },
                            "addressDetails": {
                                "pincode": "500089",
                                "district": "Hyderabad",
                                "city": "Manikonda",
                                "state": "Telangana",
                                "coordinates": {
                                    "longitude": 78.36590233349611,
                                    "latitude": 17.41527225357707
                                },
                                "locality": "1, 12, Janmabhoomi Colony, Pappulaguda"
                            },
                            "currentAddressDetails-select": {
                                "pincode": "500089",
                                "state": "Telangana",
                                "district": "Hyderabad",
                                "city": "Manikonda",
                                "locality": "1, 12, Janmabhoomi Colony, Pappulaguda"
                            },
                            "currentAddressDetails": {
                                "pincode": "500089",
                                "district": "Hyderabad",
                                "city": "Manikonda",
                                "state": "Telangana",
                                "coordinates": {
                                    "longitude": 78.36590233349611,
                                    "latitude": 17.41527225357707
                                },
                                "locality": "1, 12, Janmabhoomi Colony, Pappulaguda",
                                "isCurrAddrSame": {
                                    "code": "YES",
                                    "name": "YES"
                                }
                            },
                            "transferredPOA": {
                                "code": "NO",
                                "name": "NO",
                                "showPoaDetails": false
                            },
                            "companyDetailsUpload": null,
                            "poaAuthorizationDocument": null,
                            "poaVerification": {
                                "isUserVerified": false
                            }
                        },
                        "displayindex": 0,
                        "isFormCompleted": true
                    }
                ],
                "isCompleted": true
            }
        },
        "auditDetails": {
            "createdBy": citizenUUID,
            "lastModifiedBy": citizenUUID,
            "createdTime": epochtime,
            "lastModifiedTime": epochtime
        },
        "advocateStatus": null,
        "poaHolders": []
    },
    "tenantId": "kl",
    "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": citizenAuthToken,
        "userInfo": citizenUserInfo,
        "msgId": "1750866462003^|en_IN",
        "plainAccessRequest": {}
    }
};

test.describe('Case Creation API Tests', () => {

    test('Create Case with Invalid Auth Token', async ({ request }) => {
        const payload = { ...casePayload };
        payload.RequestInfo.authToken = 'invalid-token';

        const response = await request.post(updateUrl, {
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

        const response = await request.post(updateUrl, {
            data: payload,
        });

        // Expecting unauthorized or similar error for empty token
        expect(response.status()).toBeGreaterThanOrEqual(400);
        // Further assertions can be added based on actual API response for empty token
    });

    test.only('Create Case with Correct Auth Token', async ({ request }) => {
        const payload = { ...casePayload };
        const token = citizenAuthToken;
        payload.RequestInfo.authToken = token; // Use the token directly, not as a string template

        const response = await request.post(updateUrl, {
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
        //console.log(responseBody.cases[0]);
        const litigantid=responseBody.cases[0].litigants[0].id;

        // Update global-variables.json
        const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
        const updatedVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
        updatedVars.filingNumber = filingNumber;
        updatedVars.caseId = caseId;
        updatedVars.litigantid=litigantid;
        fs.writeFileSync(globalVarsPath, JSON.stringify(updatedVars, null, 2));
        console.log('Stored filingNumber and caseId in global-variables.json:', filingNumber, caseId);
    });

    
});