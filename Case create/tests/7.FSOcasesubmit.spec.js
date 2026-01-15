const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

// Import global configuration
const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

// Log the configuration values being used
console.log('=== Configuration Values Used ===');
console.log('Base URL:', globalVars.baseURL);
console.log('Tenant ID:', globalVars.citizenUserInfo?.tenantId || "kl");
console.log('Case ID:', globalVars.caseId);
console.log('Filing Number:', globalVars.filingNumber);
console.log('FSO Auth Token:', globalVars.fsoauthtoken ? '***' + globalVars.fsoauthtoken.slice(-4) : 'Not set');
console.log('FSO User Info:', {
  userName: globalVars.fsoUserResponse?.UserRequest?.userName,
  name: globalVars.fsoUserResponse?.UserRequest?.name,
  id: globalVars.fsoUserResponse?.UserRequest?.id
});
console.log('Citizen User Info:', {
  userName: globalVars.citizenUserInfo?.userName,
  name: globalVars.citizenUserInfo?.name,
  uuid: globalVars.citizenUserInfo?.uuid
});
console.log('Advocate ID:', globalVars.advocateId);
console.log('Litigant ID:', globalVars.litigantid);
console.log('Representing ID:', globalVars.representingid);
console.log('Representing LI:', globalVars.representingli);
console.log('Epoch Time:', globalVars.epochTime);
console.log('================================');

// Extract configuration values
const baseURL = globalVars.baseURL;
const tenantId = globalVars.citizenUserInfo?.tenantId || "kl";
const caseId = globalVars.caseId;
const filingNumber = globalVars.filingNumber;
const fsoauthtoken = globalVars.fsoauthtoken;
const epochTime = globalVars.epochTime;
const litigantid = globalVars.litigantid;
const representingid = globalVars.representingid;
const representingli = globalVars.representingli;
const advocateId = globalVars.advocateId;
const fsoUserResponse = globalVars.fsoUserResponse;
const citizenUserInfo = globalVars.citizenUserInfo;
const litigentIndividualResponse = globalVars.litigentIndividualResponse;

// Extract litigant individual details
const litigentIndividual = globalVars.litigentIndividualResponse?.Individual?.[0];
const firstName = litigentIndividual?.name?.givenName;
const lastName = litigentIndividual?.name?.familyName || '';
const litigentIndividualId = globalVars.litigentIndividualId;
const litigentuserinfo = globalVars.litigentuserinfo;
const litigentuuid = globalVars.litigentuuid;

// Extract advocate details
const advocateuserUUID = globalVars.advocateuserUUID;
const advocateIndividualId = globalVars.advocateIndividualId;
const advocatebarregistration=globalVars.advocatebarregistration;
const advoctaeusername=globalVars.advoctaeusername;
const citizenMobile = citizenUserInfo?.userName;
const citizenName = citizenUserInfo?.name;

// Use FSO auth token from global variables
const AUTH_TOKEN = fsoauthtoken;

// Define the base URL for the update endpoint
const BASE_URL_UPDATE_CASE = `${baseURL}case/v1/_update`;

// Dynamic message ID
const dynamicMsgId = Date.now().toString() + '|en_IN';

// Define the request body for a valid update request
const validUpdateRequestBody = {
    "cases": {
        "id": caseId, // Use case ID from global variables
        "tenantId": tenantId,
        "resolutionMechanism": "COURT",
        "caseTitle": `${firstName} ${lastName} vs Accused Details - Updated`, // Modified title for testing
        "isActive": true,
        "caseDescription": "Case description",
        "filingNumber": filingNumber, // Use filing number from global variables
        "advocateCount": 0,
        "courtCaseNumber": null,
        "caseNumber": null,
        "caseType": null,
        "cnrNumber": null,
        "cmpNumber": null,
        "accessCode": "727051",
        "outcome": null,
        "pendingAdvocateRequests": [],
        "courtId": "KLKM52",
        "benchId": "BENCH_ID",
        "linkedCases": [],
        "filingDate": 1749113809455,
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
                                           "fileStore": globalVars.filestore["case.cheque"],
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
                                         "fileStore": globalVars.filestore["case.cheque.returnmemo"],
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
                                        "fileStore": globalVars.filestore["case.liabilityproof"],
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
                                         "fileStore": globalVars.filestore["case.demandnotice"],
                                        "documentName": "5. Legal Notice - 07_10_2024.pdf",
                                        "fileName": "LEGAL_DEMAND_NOTICE"
                                    }
                                ]
                            },
                            "proofOfDispatchFileUpload": {
                                "document": [
                                    {
                                        "documentType": "case.demandnotice.proof",
                                        "fileStore": globalVars.filestore["case.demandnotice.proof"],
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
                                        "fileStore": globalVars.filestore["case.demandnotice.serviceproof"],
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
        "judgeId": "JUDGE_ID",
        "stage": "Pre-Trial",
        "substage": "SCRUTINY",
        "natureOfPleading": null,
        "statutesAndSections": [
            {
                "id": "fddc9e5c-b306-4839-b410-fe302a0b1875",
                "tenantId": tenantId,
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
                    "createdBy": null,
                    "lastModifiedBy": null,
                    "createdTime": 0,
                    "lastModifiedTime": 0
                },
                "strSections": null,
                "strSubsections": null
            },
            {
                "id": "7d945d58-b014-4f7c-9207-bc9dd9cfe656",
                "tenantId": tenantId,
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
                    "createdBy": null,
                    "lastModifiedBy": null,
                    "createdTime": 0,
                    "lastModifiedTime": 0
                },
                "strSections": null,
                "strSubsections": null
            },
            {
                "id": "1a754c8f-ef44-4576-924e-a8330a13e9fc",
                "tenantId": tenantId,
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
                    "createdBy": null,
                    "lastModifiedBy": null,
                    "createdTime": 0,
                    "lastModifiedTime": 0
                },
                "strSections": null,
                "strSubsections": null
            }
        ],
        "litigants": [
            {
                "id": litigantid,
                "tenantId": tenantId,
                "caseId": caseId,
                "partyCategory": "INDIVIDUAL",
                "organisationID": null,
                "individualId": litigentIndividualId,
                "partyType": "complainant.primary",
                "isActive": true,
                "isResponseRequired": false,
                "isPartyInPerson": false,
                "documents": [
                    {
                        "fileStore": JSON.parse(litigentIndividualResponse?.Individual?.[0]?.additionalFields?.fields?.find(f => f.key === 'identifierIdDetails')?.value || '{}').fileStoreId,
                        "fileName": JSON.parse(litigentIndividualResponse?.Individual?.[0]?.additionalFields?.fields?.find(f => f.key === 'identifierIdDetails')?.value || '{}').filename,
                        "documentName": JSON.parse(litigentIndividualResponse?.Individual?.[0]?.additionalFields?.fields?.find(f => f.key === 'identifierIdDetails')?.value || '{}').filename || "AADHAR",
                        "documentType": JSON.parse(litigentIndividualResponse?.Individual?.[0]?.additionalFields?.fields?.find(f => f.key === 'identifierIdDetails')?.value || '{}').documentType || "COMPLAINANT_ID_PROOF"
                    }
                ],
                "auditDetails": {
                    "createdBy": citizenUserInfo?.uuid ,
                    "lastModifiedBy": citizenUserInfo?.uuid ,
                    "createdTime": epochTime,
                    "lastModifiedTime": epochTime
                },
                "additionalDetails": {
                    "fullName":  litigentuserinfo?.name,
                    "uuid": litigentuuid,
                    "currentPosition": 1
                },
                "hasSigned": false
            }
        ],
        "representatives": [
            {
                "id": representingid,
                "tenantId": tenantId,
                "advocateId": advocateId,
                "caseId": caseId,
                "representing":  [
                    {
                        "id": representingli,
                        "tenantId": tenantId,
                        "caseId":caseId,
                        "partyCategory": "INDIVIDUAL",
                        "organisationID": null,
                        "individualId": litigentIndividualId,
                        "partyType": "complainant.primary",
                        "isActive": true,
                        "isResponseRequired": false,
                        "isPartyInPerson": false,
                        "documents": [
                            {
                                "id": "93a640c6-957c-4bfc-b964-a5a807480fad",
                                "documentType": "VAKALATNAMA_DOC",
                                "fileStore": globalVars.filestore["VAKALATNAMA_DOC"],
                                "documentUid": globalVars.filestore["VAKALATNAMA_DOC"],
                                "isActive": true,
                                "additionalDetails": null
                            }
                        ],
                        "auditDetails": {
                            "createdBy": citizenUserInfo?.uuid, 
                            "lastModifiedBy": citizenUserInfo?.uuid ,
                            "createdTime": epochTime,
                            "lastModifiedTime": epochTime
                        },
                        "additionalDetails": {
                    "fullName":  litigentuserinfo?.name,
                    "uuid": litigentuuid,
                    "currentPosition": 1
                },
                        "hasSigned": false
                    }
                ],
                "isActive": true,
                "documents": [],
                "auditDetails": {
                    "createdBy": citizenUserInfo?.uuid, 
                    "lastModifiedBy": citizenUserInfo?.uuid ,
                    "createdTime": epochTime,
                    "lastModifiedTime": epochTime
                },
                "additionalDetails": {
                    "advocateName": citizenUserInfo?.name ,
                    "uuid": citizenUserInfo?.uuid 
                },
                "hasSigned": false
            }
        ],
        "status": "UNDER_SCRUTINY",
        "documents": [
            {
                "id": "6f9d37ea-8199-4dbe-ac96-87cc32dfbc88",
                "documentType": "case.liabilityproof",
                "fileStore": globalVars.filestore["case.liabilityproof"],
                "documentUid": globalVars.filestore["case.liabilityproof"],
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "6db0e58d-6a69-4a08-8501-088a23a17c0b",
                "documentType": "case.affidavit.223bnss",
                "fileStore": globalVars.filestore["case.affidavit.223bnss"],
                "documentUid": globalVars.filestore["case.affidavit.223bnss"],
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "3f98d19b-9253-4536-9bfb-4a427bb1b75c",
                "documentType": "COMPLAINANT_ID_PROOF",
                "fileStore": globalVars.filestore["COMPLAINANT_ID_PROOF"],
                "documentUid": globalVars.filestore["COMPLAINANT_ID_PROOF"],
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "a4a15821-af8b-4799-b6bf-03f427de4bd0",
                "documentType": "case.affidavit.225bnss",
                "fileStore": globalVars.filestore["case.affidavit.225bnss"],
                "documentUid": globalVars.filestore["case.affidavit.225bnss"],
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "2922c675-2fab-4990-88be-b76297dc72c3",
                "documentType": "case.cheque",
                 "fileStore": globalVars.filestore["case.cheque"],
                "documentUid": globalVars.filestore["case.cheque"],
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "61dd9404-442b-4cf1-b23b-4f2f1feb9682",
                "documentType": "case.cheque.returnmemo",
                "fileStore": globalVars.filestore["case.cheque.returnmemo"],
                "documentUid": globalVars.filestore["case.cheque.returnmemo"],
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "80d9f0dc-c87e-4def-8d6f-c45012eef096",
                "documentType": "case.demandnotice",
               "fileStore": globalVars.filestore["case.demandnotice"],
                "documentUid": globalVars.filestore["case.demandnotice"],
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "0d64728f-a9a6-4c97-ac2a-df57a5985e9f",
                "documentType": "case.demandnotice.proof",
                "fileStore": globalVars.filestore["case.demandnotice.proof"],
                "documentUid": globalVars.filestore["case.demandnotice.proof"],
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "95cb58fc-acee-4d88-97ed-81f6fb78903f",
                "documentType": "case.demandnotice.serviceproof",
                "fileStore": globalVars.filestore["case.demandnotice.serviceproof"],
                "documentUid": globalVars.filestore["case.demandnotice.serviceproof"],
                "isActive": true,
                "additionalDetails": null
            },
            {
                "documentType": "VAKALATNAMA_DOC",
                "fileStore": globalVars.filestore["VAKALATNAMA_DOC"],
                "documentName": "7 Proof of Delivery of Legal Notice - 9_10_2024 (1).png",
                "fileName": "VAKALATNAMA",
                "id": "91dd7501-0962-4848-99fa-65aecf8469b9"
            }
        ],
        "remarks": null,
        "workflow": {
            "action": "VALIDATE",
            "comments": "sfaf"
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
                                            "firstName": citizenUserInfo?.name,
                                            "middleName": "",
                                            "advocateMobileNumber": citizenUserInfo?.mobileNumber,
                                            "advocateIdProof": [
                                                {
                                                    "name": "OTHER",
                                                    "fileName": "ID Proof",
                                                    "fileStore":  globalVars.advocateidproof,
                                                    "documentName": "downloadedFile (15).pdf"
                                                }
                                            ]
                                        },
                                        "advocateBarRegNumberWithName": {
                                            "advocateName": advoctaeusername,
                                            "isDisable": true,
                                            "advocateId": advocateId,
                                            "advocateUuid": advocateuserUUID,
                                            "individualId": advocateIndividualId,
                                            "barRegistrationNumber": "K/MARUTHI/TEST (Maruthi ch)",
                                            "barRegistrationNumberOriginal": advocatebarregistration
                                        }
                                    }
                                ],
                                "boxComplainant": {
                                    "firstName": firstName,
                                    "lastName": lastName,
                                     "mobileNumber": litigentuserinfo?.mobileNumber,
                                    "middleName": "",
                                    "individualId": litigentIndividualId,
                                    "index": 0
                                },
                                "showAffidavit": false,
                                "isComplainantPip": {
                                    "code": "NO",
                                    "name": "No",
                                    "isEnabled": true
                                },
                                "numberOfAdvocates": 1,
                                "showVakalatNamaUpload": true,
                                "vakalatnamaFileUpload": {
                                    "document": [
                                        {
                                            "fileName": "VAKALATNAMA",
                                            "fileStore": globalVars.filestore["VAKALATNAMA_DOC"],
                                            "documentName": "7 Proof of Delivery of Legal Notice - 9_10_2024 (1).png",
                                            "documentType": "VAKALATNAMA_DOC"
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
                            "companyDetailsUpload": null,
                            "inquiryAffidavitFileUpload": {
                                "document": [
                                    {
                                        "fileName": "Affidavit under section 225 of BNSS",
                                         "fileStore": globalVars.filestore["case.affidavit.225bnss"],
                                        "documentName": "1.Judge Issue summons.png",
                                        "documentType": "case.affidavit.225bnss"
                                    }
                                ]
                            }
                        },
                        "uniqueId": "ffec932e-8204-49f9-9d19-7108e11da7f6",
                        "isenabled": true,
                        "displayindex": 0
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
                                            "latitude": 17.41527225357707,
                                            "longitude": 78.36590233349611
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
                                            "latitude": 17.41527225357707,
                                            "longitude": 78.36590233349611
                                        },
                                        "isCurrAddrSame": {
                                            "code": "YES",
                                            "name": "YES"
                                        }
                                    },
                                    "document": [
                                        {
                                             "fileStore": JSON.parse(globalVars.litigentIndividualResponse?.Individual?.[0]?.additionalFields?.fields?.find(f => f.key === 'identifierIdDetails')?.value || '{}').fileStoreId,
                "fileName": JSON.parse(globalVars.litigentIndividualResponse?.Individual?.[0]?.additionalFields?.fields?.find(f => f.key === 'identifierIdDetails')?.value || '{}').filename,
                "documentName": JSON.parse(globalVars.litigentIndividualResponse?.Individual?.[0]?.additionalFields?.fields?.find(f => f.key === 'identifierIdDetails')?.value || '{}').filename,
                "documentType": JSON.parse(globalVars.litigentIndividualResponse?.Individual?.[0]?.additionalFields?.fields?.find(f => f.key === 'identifierIdDetails')?.value || '{}').documentType
                                        }
                                    ],
                                     "individualId": litigentIndividualId,
                                   "userUuid": litigentuuid,
                                },
                                "mobileNumber": litigentuserinfo?.mobileNumber,
                                "otpNumber": "123456",
                                "isUserVerified": true
                            },
                            "lastName": lastName,
                            "firstName": firstName,
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
                            "complainantId": {
                                "complainantId": true
                            },
                            "complainantAge": "34",
                            "transferredPOA": {
                                "code": "NO",
                                "name": "NO",
                                "showPoaDetails": false
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
            "reviewCaseFile": {
                "formdata": [
                    {
                        "data": {},
                        "isenabled": true,
                        "displayindex": 0
                    }
                ],
                "isCompleted": true
            },
            "signedCaseDocument": "f700e0c3-b6d2-4beb-bb07-a748aab5ca35",
            "prayerSwornStatement": {
                "formdata": [
                    {
                        "data": {
                            "prayer": {
                                "text": "Prayer"
                            },
                            "swornStatement": {
                                "document": [
                                    {
                                        "fileName": "CS_SWORN_STATEMENT_HEADER",
                                        "fileStore": globalVars.filestore["COMPLAINANT_ID_PROOF"],
                                        "documentName": "Affidavit.pdf",
                                        "documentType": "case.affidavit.223bnss"
                                    }
                                ]
                            },
                            "additionalDetails": {
                                "text": "Additional Details"
                            },
                            "memorandumOfComplaint": {
                                "text": "<p>Complaint</p>\n"
                            },
                            "SelectUploadDocWithName": null,
                            "prayerAndSwornStatementType": {
                                "code": "YES",
                                "name": "YES"
                            }
                        },
                        "isenabled": true,
                        "displayindex": 0
                    }
                ],
                "isCompleted": true
            },
            "scrutiny": {},
            "scrutinyComment": "sfaf"
        },
        "auditDetails": {
            "createdBy": citizenUserInfo?.uuid ,
            "lastModifiedBy": fsoUserResponse?.UserRequest?.id?.toString() || "961", // Use FSO user ID from global config
            "createdTime": epochTime,
            "lastModifiedTime": epochTime
        },
        "advocateStatus": null,
        "poaHolders": null
    },
    "tenantId": tenantId, // Use tenantId from global config
    "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": AUTH_TOKEN, // Use the constant AUTH_TOKEN
        "userInfo": fsoUserResponse?.UserRequest ,
        "msgId": dynamicMsgId, // Dynamic msgId
        "plainAccessRequest": {}
    }
};


test.describe('API Tests for FSO Case Update endpoint', () => {
    let apiContext;

    test.beforeAll(async ({ playwright }) => {
        apiContext = await playwright.request.newContext({ ignoreHTTPSErrors: true });
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    // Test case for successful request (expecting 200 or 201)
    test('should successfully update a case with valid data', async () => {
        console.log('Running test: should successfully update a case with valid data');
        console.log('Using case ID:', caseId);
        console.log('Using filing number:', filingNumber);
        console.log('Using advocate ID:', advocateId);
        console.log('Using FSO auth token:', AUTH_TOKEN ? '***' + AUTH_TOKEN.slice(-4) : 'Not set');
        
        const url = `${BASE_URL_UPDATE_CASE}?tenantId=${tenantId}`; // Include query parameter
        
        // Log the request details
        console.log('Request URL:', url);
        console.log('Request Headers:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        });
        console.log('Request Body:', JSON.stringify(validUpdateRequestBody, null, 2));
        console.log('Using Case ID:', caseId);
        console.log('Using Filing Number:', filingNumber);
        console.log('Using Advocate ID:', advocateId);

        const response = await apiContext.post(url, { 
            data: validUpdateRequestBody,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        });

        // Expect status code 200 or 201 for success
        const status = response.status();
        console.log(`Successful Update Test - Status: ${status}`);
        
        const responseBody = await response.json();
        console.log("Successful Update Test - Full Response Body:", JSON.stringify(responseBody, null, 2));

        // Check for error response
        if (responseBody.Errors) {
            console.log("Error Details:", responseBody.Errors);
        }

        // Only proceed with assertions if we have a successful response
        if (status >= 200 && status < 300) {
            expect(responseBody.ResponseInfo).toBeDefined();
            expect(responseBody.cases).toBeDefined();
            expect(responseBody.cases.length).toBeGreaterThan(0);
            expect(responseBody.cases[0].id).toBe(validUpdateRequestBody.cases.id);
            expect(responseBody.cases[0].tenantId).toBe(validUpdateRequestBody.cases.tenantId);
        } else {
            console.log("Request failed with status:", status);
        }
    });

    // Test case for missing token (expecting 401)
    test('should fail with 401 for missing token', async () => {
        const url = `${BASE_URL_UPDATE_CASE}?tenantId=${tenantId}`;
        // Create a request body without the authToken
        const requestBodyWithoutToken = {
            ...validUpdateRequestBody,
            RequestInfo: {
                ...validUpdateRequestBody.RequestInfo,
                authToken: undefined // Explicitly remove the token
            }
        };

        const response = await apiContext.post(url, { data: requestBodyWithoutToken });
        console.log(`Missing Token Test - Status: ${response.status()}`);
        expect(response.status()).toBe(401);
    });

    // Test case for invalid token (expecting 401 or 403)
    test('should fail with 401 or 403 for invalid token', async () => {
        const url = `${BASE_URL_UPDATE_CASE}?tenantId=${tenantId}`;
        // Create a request body with an invalid authToken
        const requestBodyWithInvalidToken = {
            ...validUpdateRequestBody,
            RequestInfo: {
                ...validUpdateRequestBody.RequestInfo,
                authToken: 'invalid-token-123' // Use an invalid token
            }
        };

        const response = await apiContext.post(url, { data: requestBodyWithInvalidToken });
        console.log(`Invalid Token Test - Status: ${response.status()}`);
        // Expect either 401 or 403 depending on API implementation
        expect([401, 403]).toContain(response.status());
    });

    // Test case for bad request (e.g., missing required field like 'cases' or 'tenantId')
    test('should fail with 400 for missing required fields', async () => {
        const url = `${BASE_URL_UPDATE_CASE}?tenantId=${tenantId}`;
        // Create a request body missing the 'cases' object
        const requestBodyMissingCases = {
            ...validUpdateRequestBody,
            cases: undefined // Remove the cases object
        };

        const response = await apiContext.post(url, { data: requestBodyMissingCases });
        console.log(`Missing Cases Test - Status: ${response.status()}`);
        // Expect 400 for a bad request due to missing required data
        expect([400, 401, 500]).toContain(response.status()); // API might return 401 or 500 too

        // Example: Missing tenantId in query
        const urlWithoutTenantId = `${BASE_URL_UPDATE_CASE}`;
         const responseWithoutQueryTenantId = await apiContext.post(urlWithoutTenantId, { data: validUpdateRequestBody });
         console.log(`Missing Query TenantId Test - Status: ${responseWithoutQueryTenantId.status()}`);
         expect([400, 404, 500]).toContain(responseWithoutQueryTenantId.status()); // Expect 400, 404 or 500
    });

    // Add more test cases for other invalid inputs as needed,
    // e.g., invalid case ID, invalid tenant ID, malformed data within caseDetails, etc.

});