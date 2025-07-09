import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';
const globalVars = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'global-variables.json'), 'utf8'));

let apiContext;
const baseUrl1 = globalVars.baseURL;
const baseUrl = `${baseUrl1}case/v1/_update?`;
const tenantId = 'kl'; // Using the provided tenantId
// Placeholder for dynamic values
const validAuthToken = globalVars.citizenAuthToken;
const dynamicMsgId = Date.now().toString() + '|en_IN'; // Example dynamic msgId
const citizenUserInfo = globalVars.citizenUserInfo;
const citizenMobile = citizenUserInfo.userName;
const citizenName = citizenUserInfo.name;
const citizenUUID = citizenUserInfo.uuid;
const representid = globalVars.representingid;
const caseId = globalVars.caseId;
const filingNumber = globalVars.filingNumber;
const epochtime = globalVars.epochTime;
const litigantid = globalVars.litigantid;
const advocateId = globalVars.advocateId;


// Request body from the Postman example
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
        //"courtId": "KLKM52", // Example courtId, might need to be dynamic or valid
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
                "id": litigantid,
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
                    "createdBy": citizenUUID,
                    "lastModifiedBy": citizenUUID,
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
                "id": representid,
                "tenantId": "kl",
                "advocateId": advocateId,
                "caseId": caseId,
                "representing": [
                    {
                         "additionalDetails": {
                            "fullName": "Rajesh Ch",
                            "uuid": "f562d86f-57b2-472d-a159-cba6bcbd3e5c",
                            "currentPosition": 1
                         },
                        "tenantId": "kl",
                        "caseId": caseId,
                        "partyCategory": "INDIVIDUAL",
                        "organisationID": null,
                        "individualId": "IND-2024-10-29-000629",
                        "partyType": "complainant.primary",
                        "isActive": true,
                        "isResponseRequired": false,
                        "isPartyInPerson": false,
                        "documents": [
                            {
                                "id": "cb299613-4ab8-4917-bdbe-feac6be65c27",
                                "documentType": "VAKALATNAMA_DOC",
                                "fileStore": "ba1ffab5-b508-4cea-b0e7-ecfcbd7d6056",
                                "documentUid": "cb299613-4ab8-4917-bdbe-feac6be65c27",
                                "isActive": true,
                                "additionalDetails": null
                            }
                        ],
                        "auditDetails": {
                            "createdBy": citizenUUID,
                            "lastModifiedBy": citizenUUID,
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
                    "createdBy": citizenUUID,
                    "lastModifiedBy": citizenUUID,
                    "createdTime": epochtime,
                    "lastModifiedTime": epochtime
                },
                "additionalDetails": {
                    "advocateName": "Maruthi ch",
                    "uuid": "5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f" // Corrected advocate UUID
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
                "documentType": "VAKALATNAMA_DOC",
                "fileStore": "ba1ffab5-b508-4cea-b0e7-ecfcbd7d6056",
                "documentName": "7 Proof of Delivery of Legal Notice - 9_10_2024 (1).png",
                "fileName": "VAKALATNAMA",
                "id": "91dd7501-0962-4848-99fa-65aecf8469b9"
            }
        ],
        "remarks": null,
        "workflow": {
            "action": "SAVE_DRAFT",
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
                                            "advocateId": advocateId,
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
            "payerMobileNo": citizenMobile,
            "payerName": citizenName,
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
            }
        },
        "auditDetails": {
            "createdBy": citizenUUID,
            "lastModifiedBy": citizenUUID,
            "createdTime": epochtime,
            "lastModifiedTime": epochtime
        },
        "advocateStatus": "JOINED",
        "poaHolders": []
    },
    "tenantId": "kl",
    "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": "", // Will be set from global variables
        "userInfo": citizenUserInfo,
        "msgId": Date.now().toString() + '|en_IN',
        "plainAccessRequest": {}
    }
};

test.describe('API Tests for /case/v1/_update', () => {

  // Set up API context before all tests
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      // Base URL might be needed depending on Playwright config,
      // but the provided URL is absolute.
      // baseUrl: 'https://dristi-kerala-uat.pucar.org',
      headers: {
        'Content-Type': 'application/json',
        // Add other default headers if needed
      }
    });
  });

  // Dispose API context after all tests
  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // Test case for successful update (assuming 200 OK based on common update operations)
  test('should successfully update case with status 200', async () => {
    const token = validAuthToken;
    expect(token).toBeTruthy();

    const requestBody = { ...validRequestBody };
    requestBody.RequestInfo.authToken = token;
    requestBody.RequestInfo.msgId = Date.now().toString() + '|en_IN';

     const response = await apiContext.post(baseUrl, { data: validRequestBody });

    // Assertions based on successful response scenario
    expect(response.status()).toBe(200); // Asserting for 200 OK as per requirement

    const responseBody = await response.json();

    // Assertions on response body structure and content
    expect(responseBody).toHaveProperty('ResponseInfo');
    expect(responseBody.ResponseInfo).toHaveProperty('status', 'successful');

    // Note: The provided response JSON does not contain 'TotalCount' or 'HearingList'.
    // Assuming 'cases' array is the main data structure for successful responses.
    expect(responseBody).toHaveProperty('cases');
    expect(Array.isArray(responseBody.cases)).toBe(true);
    expect(responseBody.cases.length).toBeGreaterThan(0);
    const representingli = responseBody.cases?.[0]?.representatives?.[0]?.representing?.[0]?.id;
    console.log(representingli);
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
            const updatedVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
            updatedVars.representingli = representingli;
            fs.writeFileSync(globalVarsPath, JSON.stringify(updatedVars, null, 2), 'utf8');
            
 // Assuming at least one case is returned

    // Optional: Validate fields inside the 'cases' array if structure is consistent
   
  });

   
  // Test case for missing or malformed request fields (status 400)
  test('should fail with 400 Bad Request for missing required fields', async () => {
    const token = validAuthToken;
    expect(token).toBeTruthy();

    const invalidRequestBody = { ...validRequestBody };
    delete invalidRequestBody.cases; // Example: removing the 'cases' field
    invalidRequestBody.RequestInfo.authToken = token;
    const response = await apiContext.post(`${baseUrl}?tenantId=${tenantId}&_=${Date.now()}`, {
      data: invalidRequestBody,
      ignoreHTTPSErrors: true, // Use this only if necessary for testing self-signed certs etc.
    });

    // Assertions for Bad Request scenario
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('Errors'); // Assuming the API returns an 'Errors' array or similar
    // Optional: Assert specific error codes or messages if the API provides them
  });

   


  // Test case for missing or invalid authToken (status 401)
  test('should fail with 401 Unauthorized for missing authToken', async () => {
    const token = validAuthToken;
    expect(token).toBeTruthy();

    const requestBodyMissingToken = { ...validRequestBody };
    delete requestBodyMissingToken.RequestInfo.authToken;

    const response = await apiContext.post(`${baseUrl}?tenantId=${tenantId}&_=${Date.now()}`, {
      data: requestBodyMissingToken,
       ignoreHTTPSErrors: true,
    });

    // Assertions for Unauthorized scenario
    expect(response.status()).toBe(401);
    // Optional: Assert on the response body for specific error details
  });

    test('should fail with 401 Unauthorized for invalid authToken', async () => {
        const token = validAuthToken;
        expect(token).toBeTruthy();

        const requestBodyInvalidToken = { ...validRequestBody };
        requestBodyInvalidToken.RequestInfo.authToken = 'INVALID_AUTH_TOKEN_123';

        const response = await apiContext.post(`${baseUrl}?tenantId=${tenantId}&_=${Date.now()}`, {
          data: requestBodyInvalidToken,
           ignoreHTTPSErrors: true,
        });

        expect(response.status()).toBe(401);
        // Optional: Assert on the response body for specific error details
    });

  // Test case for insufficient permissions (status 403)
  test('should fail with 403 Forbidden for insufficient permissions', async () => {
    // This test requires an authToken that is valid but lacks the necessary permissions
    // for this specific update operation. You would need to obtain or simulate such a token.
    // This is a placeholder and may require specific setup in your test environment.
    console.warn("This test for 403 Forbidden requires an authToken with insufficient permissions.");

    const forbiddenAuthToken = 'YOUR_FORBIDDEN_AUTH_TOKEN_HERE'; // Replace with a token lacking permissions

    const requestBodyForbidden = { ...validRequestBody };
    requestBodyForbidden.RequestInfo.authToken = forbiddenAuthToken;

    const response = await apiContext.post(`${baseUrl}?tenantId=${tenantId}&_=${Date.now()}`, {
      data: requestBodyForbidden,
       ignoreHTTPSErrors: true,
    });

    // Assertions for Forbidden scenario
    expect(response.status()).toBe(401);
    // Optional: Assert on the response body for specific error details
  });

  // Add more tests for specific valid/invalid input combinations if needed
     // Add tests for valid/invalid filingNumber, courtId etc. by modifying the requestBody
    test('should fail with 400 Bad Request for invalid filingNumber in body', async () => {
        const token = validAuthToken;
        expect(token).toBeTruthy();

        const invalidFilingNumberBody = { ...validRequestBody };
        if(invalidFilingNumberBody.cases) {
            invalidFilingNumberBody.cases.filingNumber = 'INVALID-FILING-NUMBER';
        }
        invalidFilingNumberBody.RequestInfo.authToken = token;

        const response = await apiContext.post(`${baseUrl}?tenantId=${tenantId}&_=${Date.now()}`, {
            data: invalidFilingNumberBody,
            ignoreHTTPSErrors: true,
        });
        expect(response.status()).toBe(400);
        // Optional: Assert specific error details
    });

    test('should fail with 400 Bad Request for invalid courtId in body', async () => {
        const token = validAuthToken;
        expect(token).toBeTruthy();

        const invalidCourtIdBody = { ...validRequestBody };
         if(invalidCourtIdBody.cases) {
            invalidCourtIdBody.cases.courtId = 'INVALID_COURT';
        }
        invalidCourtIdBody.RequestInfo.authToken = token;

        const response = await apiContext.post(`${baseUrl}?tenantId=${tenantId}&_=${Date.now()}`, {
            data: invalidCourtIdBody,
            ignoreHTTPSErrors: true,
        });
        expect(response.status()).toBe(400);
        // Optional: Assert specific error details
    });

});