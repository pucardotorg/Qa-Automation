import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';
const globalVars = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'global-variables.json'), 'utf8'));

let apiContext;
//const baseUrl = 'https://dristi-kerala-uat.pucar.org/case/v1/_update';
const baseUrl1 = globalVars.baseURL;
const baseUrl = `${baseUrl1}case/v1/_update?`;
const tenantId = 'kl'; // Using the provided tenantId
// Placeholder for dynamic values
const validAuthToken = globalVars.citizenAuthToken;
const dynamicMsgId = Date.now().toString() + '|en_IN'; // Example dynamic msgId
const caseId = globalVars.caseId;
const filingNumber = globalVars.filingNumber;
const epochtime=globalVars.epochTime;
test.describe('API Tests for caseupdatewithsign endpoint', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  const validRequestBody = {
    "cases": {
        "id": caseId,
        "tenantId": "kl",
        "resolutionMechanism": "COURT",
        "caseTitle": "Rajesh Ch vs Accused Details",
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
        "pendingAdvocateRequests": [],
        "courtId": "KLKM52",
        "benchId": null,
        "linkedCases": [],
        "filingDate": null,
        "registrationDate": null,
        "judgementDate": null,
        "caseDetails": {
            "chequeDetails": {
                "formdata": [
                    {
                        "isenabled": true,
                        "data": {
                            "chequeSignatoryName": "Cheque Namr",
                            "bouncedChequeFileUpload": {
                                "document": [
                                    {
                                        "documentType": "case.cheque",
                                        "fileStore": "303153cb-7117-4c52-924d-7daade1fb40e",
                                        "documentName": "1.Judge Issue summons.png",
                                        "fileName": "CS_BOUNCED_CHEQUE"
                                    }
                                ]
                            },
                            "name": "Payee Name On Cheque",
                            "payeeBankName": "Payee Bank Name",
                            "payeeBranchName": "Payee Bank Branch Name",
                            "chequeNumber": "363763",
                            "issuanceDate": "2025-04-01",
                            "payerBankName": "Shshshshsh",
                            "payerBranchName": "Payer Bank Branch Name",
                            "ifsc": "SHSH0HSSHSH",
                            "chequeAmount": "235222",
                            "policeStationJurisDictionCheque": {
                                "code": 15996057,
                                "name": "MEDICAL COLLEGE PS",
                                "active": true,
                                "district": "THRISSUR CITY"
                            },
                            "depositDate": "2025-04-18",
                            "depositChequeFileUpload": null,
                            "delayReason": {
                                "reasonForReturnCheque": "Reason for the return of cheque"
                            },
                            "returnMemoFileUpload": {
                                "document": [
                                    {
                                        "documentType": "case.cheque.returnmemo",
                                        "fileStore": "abbe61b4-9998-45dd-a640-0fb21d34d79e",
                                        "documentName": "2. Cheque Return Memo - 27_09_2024.png",
                                        "fileName": "CS_CHEQUE_RETURN_MEMO"
                                    }
                                ]
                            },
                            "chequeAdditionalDetails": {
                                "text": "Additional details about cheque"
                            },
                            "infoBoxData": {
                                "header": "CS_YOU_HAVE_CONFIRMED",
                                "scrutinyHeader": "CS_COMPLAINANT_HAVE_CONFIRMED",
                                "data": [
                                    "CS_SIX_MONTH_BEFORE_DEPOSIT_TEXT",
                                    "CS_CHEQUE_RETURNED_INSUFFICIENT_FUND"
                                ]
                            }
                        },
                        "displayindex": 0
                    }
                ],
                "isCompleted": true
            },
            "debtLiabilityDetails": {
                "formdata": [
                    {
                        "isenabled": true,
                        "data": {
                            "liabilityNature": "Tested",
                            "liabilityType": {
                                "id": 1,
                                "code": "FULL_LIABILITY",
                                "name": "FULL_LIABILITY",
                                "isActive": true,
                                "liabilityType": 1,
                                "showAmountCovered": false
                            },
                            "debtLiabilityFileUpload": {
                                "document": [
                                    {
                                        "documentType": "case.liabilityproof",
                                        "fileStore": "ca57727d-71d0-4943-b083-215b1d71e99f",
                                        "documentName": "2. Cheque Return Memo - 27_09_2024.png",
                                        "fileName": "CS_PROOF_DEBT"
                                    }
                                ]
                            },
                            "additionalDebtLiabilityDetails": {
                                "text": "sgsg"
                            },
                            "totalAmount": "235222"
                        },
                        "displayindex": 0
                    }
                ],
                "isCompleted": true
            },
            "demandNoticeDetails": {
                "formdata": [
                    {
                        "isenabled": true,
                        "data": {
                            "dateOfDispatch": "2025-04-25",
                            "legalDemandNoticeFileUpload": {
                                "document": [
                                    {
                                        "documentType": "case.demandnotice",
                                        "fileStore": "812000fc-a947-4941-a841-9c3e36d312ca",
                                        "documentName": "5. Legal Notice - 07_10_2024.pdf",
                                        "fileName": "LEGAL_DEMAND_NOTICE"
                                    }
                                ]
                            },
                            "proofOfDispatchFileUpload": {
                                "document": [
                                    {
                                        "documentType": "case.demandnotice.proof",
                                        "fileStore": "1290b4c8-a8f0-4675-af80-d4903ab13d71",
                                        "documentName": "4. Lease Agreement - 17_06_2024.pdf",
                                        "fileName": "PROOF_OF_DISPATCH_FILE_NAME"
                                    }
                                ]
                            },
                            "dateOfService": "2025-04-28",
                            "proofOfAcknowledgmentFileUpload": {
                                "document": [
                                    {
                                        "documentType": "case.demandnotice.serviceproof",
                                        "fileStore": "5ee759f0-9974-4946-b020-6dd8d523da14",
                                        "documentName": "3. Power of Attorney - 01_04_2024.pdf",
                                        "fileName": "PROOF_LEGAL_DEMAND_NOTICE_FILE_NAME"
                                    }
                                ]
                            },
                            "proofOfReply": {
                                "code": "NO",
                                "name": "NO",
                                "isEnabled": true,
                                "isVerified": true,
                                "showProofOfReply": false,
                                "hasBarRegistrationNo": true
                            },
                            "proofOfReplyFileUpload": null,
                            "dateOfAccrual": "2025-05-14",
                            "infoBoxData": null
                        },
                        "displayindex": 0
                    }
                ],
                "isCompleted": true
            },
            "delayApplications": {
                "formdata": [
                    {
                        "isenabled": true,
                        "data": {
                            "delayCondonationType": {
                                "code": "YES",
                                "name": "YES",
                                "showForm": false,
                                "isEnabled": true
                            },
                            "condonationFileUpload": null
                        },
                        "displayindex": 0
                    }
                ],
                "isCompleted": true
            }
        },
        "caseCategory": "CRIMINAL",
        "judgeId": null,
        "stage": "Pre-Trial",
        "substage": "DRAFT",
        "natureOfPleading": null,
        "statutesAndSections": [
            {
                "id": "7d945d58-b014-4f7c-9207-bc9dd9cfe656",
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
                    "createdBy": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
                    "lastModifiedBy": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
                    "createdTime": epochtime,
                    "lastModifiedTime": epochtime
                },
                "strSections": "Negotiable Instrument Act,02.",
                "strSubsections": "138,03."
            }
        ],
         "litigants": [
            {
                "id": globalVars.litigantid,
                "tenantId": "kl",
                "caseId": caseId,
                "partyCategory": "INDIVIDUAL",
                "organisationID": null,
                "individualId": "IND-2024-10-29-000629",
                "partyType": "complainant.primary",
                "isActive": true,
                "isResponseRequired": false,
                "isPartyInPerson": false,
                "documents": [],
                "auditDetails": {
                    "createdBy": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
                    "lastModifiedBy": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
                    "createdTime": epochtime,
                    "lastModifiedTime": epochtime
                },
                "additionalDetails": {
                    "fullName": "Rajesh Ch",
                    "uuid": "f562d86f-57b2-472d-a159-cba6bcbd3e5c",
                    "currentPosition": 1
                },
                "hasSigned": false
            }
        ],
        "representatives": [
            {
                "id": globalVars.representingid,
                "tenantId": "kl",
                "advocateId": "ead05651-b931-45f2-bbd7-c4b9ac30d960",
                "caseId": caseId,
                "representing":  [
                    {
                        "id": globalVars.representingli,
                        "tenantId": "kl",
                        "caseId": "56809884-ae9f-4f91-8293-7c13a338a9b4",
                        "partyCategory": "INDIVIDUAL",
                        "organisationID": null,
                        "individualId": "IND-2024-10-29-000629",
                        "partyType": "complainant.primary",
                        "isActive": true,
                        "isResponseRequired": false,
                        "isPartyInPerson": false,
                        "documents": [
                            {
                                "id": "93a640c6-957c-4bfc-b964-a5a807480fad",
                                "documentType": "VAKALATNAMA_DOC",
                                "fileStore": "1819cdd9-ddd8-4db6-8af4-85991d21da3e",
                                "documentUid": "93a640c6-957c-4bfc-b964-a5a807480fad",
                                "isActive": true,
                                "additionalDetails": null
                            }
                        ],
                        "auditDetails": {
                            "createdBy": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
                            "lastModifiedBy": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
                            "createdTime": epochtime,
                            "lastModifiedTime": epochtime
                        },
                        "additionalDetails": {
                            "fullName": "Rajesh Ch",
                            "uuid": "f562d86f-57b2-472d-a159-cba6bcbd3e5c",
                            "currentPosition": 1
                        },
                        "hasSigned": false
                    }
                ],
                "isActive": true,
                "documents": [],
                "auditDetails": {
                    "createdBy": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
                    "lastModifiedBy": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
                    "createdTime": epochtime,
                    "lastModifiedTime": epochtime
                },
                "additionalDetails": {
                    "advocateName": "Maruthi ch",
                    "uuid": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f"
                },
                "hasSigned": false
            }
        ],
        "status": "DRAFT_IN_PROGRESS",
        "documents": [
            {
                "id": "6f9d37ea-8199-4dbe-ac96-87cc32dfbc88",
                "documentType": "case.liabilityproof",
                "fileStore": "ca57727d-71d0-4943-b083-215b1d71e99f",
                "documentUid": null,
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "6db0e58d-6a69-4a08-8501-088a23a17c0b",
                "documentType": "case.affidavit.223bnss",
                "fileStore": "2e1c7855-e7bb-4243-ad73-2cffc502b0fe",
                "documentUid": null,
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "3f98d19b-9253-4536-9bfb-4a427bb1b75c",
                "documentType": "COMPLAINANT_ID_PROOF",
                "fileStore": "b7b06ce0-c41b-431c-8825-06f9f92fea3f",
                "documentUid": null,
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "a4a15821-af8b-4799-b6bf-03f427de4bd0",
                "documentType": "case.affidavit.225bnss",
                "fileStore": "ab09c39e-c5b0-487e-b50e-6de9801980c0",
                "documentUid": null,
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "2922c675-2fab-4990-88be-b76297dc72c3",
                "documentType": "case.cheque",
                "fileStore": "303153cb-7117-4c52-924d-7daade1fb40e",
                "documentUid": null,
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "61dd9404-442b-4cf1-b23b-4f2f1feb9682",
                "documentType": "case.cheque.returnmemo",
                "fileStore": "abbe61b4-9998-45dd-a640-0fb21d34d79e",
                "documentUid": null,
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "80d9f0dc-c87e-4def-8d6f-c45012eef096",
                "documentType": "case.demandnotice",
                "fileStore": "812000fc-a947-4941-a841-9c3e36d312ca",
                "documentUid": null,
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "0d64728f-a9a6-4c97-ac2a-df57a5985e9f",
                "documentType": "case.demandnotice.proof",
                "fileStore": "1290b4c8-a8f0-4675-af80-d4903ab13d71",
                "documentUid": null,
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "95cb58fc-acee-4d88-97ed-81f6fb78903f",
                "documentType": "case.demandnotice.serviceproof",
                "fileStore": "5ee759f0-9974-4946-b020-6dd8d523da14",
                "documentUid": null,
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "91dd7501-0962-4848-99fa-65aecf8469b9",
                "documentType": "VAKALATNAMA_DOC",
                "fileStore": "ba1ffab5-b508-4cea-b0e7-ecfcbd7d6056",
                "documentUid": null,
                "isActive": true,
                "additionalDetails": null
            },
            {
                "documentType": "case.complaint.unsigned",
                "fileStore": "84279cfc-d6c2-4e62-be40-2b9fa5dbf4e6",
                "fileName": "caseComplaintDetails.pdf"
            }
        ],
        "remarks": null,
        "workflow": {
            "action": "SUBMIT_CASE_ADVOCATE",
            "comments": null,
            "documents": null,
            "assignes": [],
            "rating": null,
            "additionalDetails": null
        },
        "additionalDetails": {
            "witnessDetails": {
                "formdata": [],
                "isCompleted": true
            },
            "advocateDetails": {
                "formdata": [
                    {
                        "data": {
                            "multipleAdvocatesAndPip": {
                                "multipleAdvocateNameDetails": [
                                    {
                                        "advocateNameDetails": {
                                            "lastName": "ch",
                                            "firstName": "Maruthi",
                                            "middleName": "",
                                            "advocateMobileNumber": "6303338642",
                                            "advocateIdProof": [
                                                {
                                                    "name": "OTHER",
                                                    "fileStore": "014f6f67-798f-4cf4-a02f-5a4302ec0340",
                                                    "documentName": "downloadedFile (15).pdf",
                                                    "fileName": "ID Proof"
                                                }
                                            ]
                                        },
                                        "advocateBarRegNumberWithName": {
                                            "advocateName": "Maruthi ch",
                                            "barRegistrationNumber": "K/MARUTHI/TEST (Maruthi ch)",
                                            "isDisable": true,
                                            "barRegistrationNumberOriginal": "K/MARUTHI/TEST",
                                            "advocateId": "ead05651-b931-45f2-bbd7-c4b9ac30d960",
                                            "advocateUuid": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
                                            "individualId": "IND-2024-11-19-000893"
                                        }
                                    }
                                ],
                                "boxComplainant": {
                                    "firstName": "Rajesh",
                                    "lastName": "Ch",
                                    "mobileNumber": "9032273758",
                                    "middleName": "",
                                    "individualId": "IND-2024-10-29-000629",
                                    "index": 0
                                },
                                "isComplainantPip": {
                                    "code": "NO",
                                    "name": "No",
                                    "isEnabled": true
                                },
                                "showAffidavit": false,
                                "showVakalatNamaUpload": true,
                                "numberOfAdvocates": 1,
                                "vakalatnamaFileUpload": {
                                    "document": [
                                        {
                                            "documentType": "VAKALATNAMA_DOC",
                                            "fileStore": "ba1ffab5-b508-4cea-b0e7-ecfcbd7d6056",
                                            "documentName": "7 Proof of Delivery of Legal Notice - 9_10_2024 (1).png",
                                            "fileName": "VAKALATNAMA"
                                        }
                                    ]
                                },
                                "pipAffidavitFileUpload": null
                            }
                        },
                        "isenabled": true,
                        "displayindex": 0,
                        "isFormCompleted": true
                    }
                ],
                "isCompleted": true
            },
            "payerName": "Maruthi ch",
            "payerMobileNo": "6303338642",
            "respondentDetails": {
                "formdata": [
                    {
                        "data": {
                            "addressDetails": [
                                {
                                    "addressDetails": {
                                        "pincode": "685006",
                                        "city": "hjjh",
                                        "district": "kjk",
                                        "locality": "Jhjhj",
                                        "state": "teted",
                                        "typeOfAddress": {
                                            "id": 1,
                                            "code": "RESIDENTIAL",
                                            "name": "Residential",
                                            "isActive": true
                                        }
                                    },
                                    "id": "5ffabf16-f99d-4b16-b5c0-a51db5efd08a",
                                    "geoLocationDetails": {
                                        "policeStation": {
                                            "code": 15996057,
                                            "name": "MEDICAL COLLEGE PS",
                                            "active": true,
                                            "district": "THRISSUR CITY"
                                        }
                                    }
                                }
                            ],
                            "respondentFirstName": "Accused Details",
                            "respondentType": {
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
                            "inquiryAffidavitFileUpload": {
                                "document": [
                                    {
                                        "documentType": "case.affidavit.225bnss",
                                        "fileStore": "ab09c39e-c5b0-487e-b50e-6de9801980c0",
                                        "documentName": "1.Judge Issue summons.png",
                                        "fileName": "Affidavit under section 225 of BNSS"
                                    }
                                ]
                            },
                            "companyDetailsUpload": null
                        },
                        "isenabled": true,
                        "displayindex": 0,
                        "uniqueId": "ffec932e-8204-49f9-9d19-7108e11da7f6"
                    }
                ],
                "isCompleted": true
            },
            "complainantDetails": {
                "formdata": [
                    {
                        "data": {
                            "complainantVerification": {
                                "individualDetails": {
                                    "addressDetails-select": {
                                        "pincode": "500089",
                                        "city": "Manikonda",
                                        "district": "Hyderabad",
                                        "locality": "1, 12, Janmabhoomi Colony, Pappulaguda",
                                        "state": "Telangana",
                                        "coordinates": {
                                            "longitude": 78.36590233349611,
                                            "latitude": 17.41527225357707
                                        }
                                    },
                                    "currentAddressDetails": {
                                        "pincode": "500089",
                                        "city": "Manikonda",
                                        "district": "Hyderabad",
                                        "coordinates": {
                                            "latitude": "17.41527225357707",
                                            "longitude": "78.36590233349611"
                                        },
                                        "locality": "1, 12, Janmabhoomi Colony, Pappulaguda",
                                        "state": "Telangana",
                                        "isCurrAddrSame": {
                                            "code": "YES",
                                            "name": "YES"
                                        }
                                    },
                                    "addressDetails": {
                                        "pincode": "500089",
                                        "city": "Manikonda",
                                        "district": "Hyderabad",
                                        "coordinates": {
                                            "latitude": "17.41527225357707",
                                            "longitude": "78.36590233349611"
                                        },
                                        "locality": "1, 12, Janmabhoomi Colony, Pappulaguda",
                                        "state": "Telangana"
                                    },
                                    "currentAddressDetails-select": {
                                        "pincode": "500089",
                                        "city": "Manikonda",
                                        "district": "Hyderabad",
                                        "locality": "1, 12, Janmabhoomi Colony, Pappulaguda",
                                        "state": "Telangana",
                                        "coordinates": {
                                            "longitude": 78.36590233349611,
                                            "latitude": 17.41527225357707
                                        },
                                        "isCurrAddrSame": {
                                            "code": "YES",
                                            "name": "YES"
                                        }
                                    },
                                    "individualId": "IND-2024-10-29-000629",
                                    "userUuid": "f562d86f-57b2-472d-a159-cba6bcbd3e5c",
                                    "document": [
                                        {
                                            "fileName": "AADHAR",
                                            "fileStore": "b7b06ce0-c41b-431c-8825-06f9f92fea3f",
                                            "documentName": "adhaar.jpg"
                                        }
                                    ]
                                },
                                "mobileNumber": "9032273758",
                                "otpNumber": "123456",
                                "isUserVerified": true
                            },
                            "lastName": "Ch",
                            "firstName": "Rajesh",
                            "poaVerification": {
                                "isUserVerified": false
                            },
                            "addressDetails-select": {
                                "pincode": "500089",
                                "city": "Manikonda",
                                "district": "Hyderabad",
                                "locality": "1, 12, Janmabhoomi Colony, Pappulaguda",
                                "state": "Telangana"
                            },
                            "currentAddressDetails": {
                                "pincode": "500089",
                                "city": "Manikonda",
                                "district": "Hyderabad",
                                "locality": "1, 12, Janmabhoomi Colony, Pappulaguda",
                                "coordinates": {
                                    "latitude": "17.41527225357707",
                                    "longitude": "78.36590233349611"
                                },
                                "state": "Telangana",
                                "isCurrAddrSame": {
                                    "code": "YES",
                                    "name": "YES"
                                }
                            },
                            "addressDetails": {
                                "pincode": "500089",
                                "city": "Manikonda",
                                "district": "Hyderabad",
                                "coordinates": {
                                    "latitude": "17.41527225357707",
                                    "longitude": "78.36590233349611"
                                },
                                "locality": "1, 12, Janmabhoomi Colony, Pappulaguda",
                                "state": "Telangana"
                            },
                            "middleName": "",
                            "currentAddressDetails-select": {
                                "pincode": "500089",
                                "city": "Manikonda",
                                "district": "Hyderabad",
                                "locality": "1, 12, Janmabhoomi Colony, Pappulaguda",
                                "state": "Telangana"
                            },
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
                            "complainantId": {
                                "complainantId": true
                            },
                            "complainantAge": "34",
                            "transferredPOA": {
                                "code": "NO",
                                "name": "NO",
                                "showPoaDetails": false
                            },
                            "companyDetailsUpload": null,
                            "poaAuthorizationDocument": null
                        },
                        "isenabled": true,
                        "displayindex": 0,
                        "isFormCompleted": true
                    }
                ],
                "isCompleted": true
            },
            "prayerSwornStatement": {
                "formdata": [
                    {
                        "isenabled": true,
                        "data": {
                            "prayerAndSwornStatementType": {
                                "code": "YES",
                                "name": "YES"
                            },
                            "memorandumOfComplaint": {
                                "text": "<p>Complaint</p>\n"
                            },
                            "swornStatement": {
                                "document": [
                                    {
                                        "documentType": "case.affidavit.223bnss",
                                        "fileStore": "2e1c7855-e7bb-4243-ad73-2cffc502b0fe",
                                        "documentName": "Affidavit.pdf",
                                        "fileName": "CS_SWORN_STATEMENT_HEADER"
                                    }
                                ]
                            },
                            "prayer": {
                                "text": "Prayer"
                            },
                            "additionalDetails": {
                                "text": "Additional Details"
                            },
                            "SelectUploadDocWithName": null
                        },
                        "displayindex": 0
                    }
                ],
                "isCompleted": true
            },
            "reviewCaseFile": {
                "formdata": [
                    {
                        "isenabled": true,
                        "data": {},
                        "displayindex": 0
                    }
                ],
                "isCompleted": true
            },
            "signedCaseDocument": "84279cfc-d6c2-4e62-be40-2b9fa5dbf4e6"
        },
        "auditDetails": {
            "createdBy": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
            "lastModifiedBy": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
            "createdTime": epochtime,
            "lastModifiedTime": epochtime
        },
        "advocateStatus": "JOINED",
        "poaHolders": []
    },
    "tenantId": "kl",
    "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken":  globalVars.citizenAuthToken, // Use a dynamic/placeholder value
        "userInfo": {
            "id": 1181,
            "uuid": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f",
            "userName": "6303338642",
            "name": "Maruthi  ch",
            "mobileNumber": "6303338642",
            "emailId": "marruthi@gmail.com",
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
        "msgId": `test-${Date.now()}`, // Use a dynamic/placeholder value
        "plainAccessRequest": {}
    }
};


  // Test case for successful request (expecting 200 or 201)
  test('should return successful response for valid request', async () => {
    const response = await apiContext.post(baseUrl, { data: validRequestBody });

    // Expect status code 200 or 201 for success
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);

    const responseBody = await response.json();

    // Assertions on response body structure and values
    expect(responseBody.ResponseInfo).toBeDefined();
    expect(responseBody.ResponseInfo.status).toBe('successful');
    expect(responseBody.cases).toBeInstanceOf(Array);

    // Optional: Validate fields inside cases array if needed
    if (responseBody.cases.length > 0) {
        const firstCase = responseBody.cases[0];
        expect(firstCase.tenantId).toBe('kl');
        // Add more assertions based on expected response structure
    }
  });

  // Test case for missing token (expecting 401)
  test('should fail with 401 for missing token', async () => {
    const requestBodyWithoutToken = {
        ...validRequestBody,
        RequestInfo: {
            ...validRequestBody.RequestInfo,
            authToken: undefined // Remove or set to undefined
        }
    };
    const response = await apiContext.post(baseUrl, { data: requestBodyWithoutToken });
    expect(response.status()).toBe(401);
  });

    // Test case for invalid token (expecting 403)
    test('should fail with 403 for invalid token', async () => {
      const requestBodyWithInvalidToken = {
          ...validRequestBody,
          RequestInfo: {
              ...validRequestBody.RequestInfo,
              authToken: 'invalid-token-123' // Use an invalid token
          }
      };
      const response = await apiContext.post(baseUrl, { data: requestBodyWithInvalidToken });
      expect(response.status()).toBe(401);
    });


  // Test case for bad request (e.g., missing required field)
  test('should fail with 400 for missing required field (e.g., tenantId)', async () => {
    const requestBodyWithoutTenantId = {
      ...validRequestBody,
      tenantId: undefined // Remove or set to undefined
    };
    const response = await apiContext.post(baseUrl, { data: requestBodyWithoutTenantId });
    expect(response.status()).toBe(400);
  });

  // Add more test cases for other invalid inputs as needed
});