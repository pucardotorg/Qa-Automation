import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Import global configuration
const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

// Log the configuration values being used
console.log('=== Configuration Values Used ===');
console.log('Base URL:', globalVars.baseURL);
console.log('Tenant ID:', globalVars.citizenUserInfo?.tenantId || "kl");
console.log('Case ID:', globalVars.caseId);
console.log('Filing Number:', globalVars.filingNumber);
console.log('Judge Auth Token:', globalVars.judgeauthtoken ? '***' + globalVars.judgeauthtoken.slice(-4) : 'Not set');
console.log('Judge User Info:', {
  userName: globalVars.judgeUserResponse?.UserRequest?.userName,
  name: globalVars.judgeUserResponse?.UserRequest?.name,
  uuid: globalVars.judgeUserResponse?.UserRequest?.uuid
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
const judgeauthtoken = globalVars.judgeauthtoken;
const epochTime = globalVars.epochTime;
const litigantid = globalVars.litigantid;
const representingid = globalVars.representingid;
const representingli = globalVars.representingli;
const advocateId = globalVars.advocateId;
const judgeUserResponse = globalVars.judgeUserResponse;
const citizenUserInfo = globalVars.citizenUserInfo;

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

const citizenMobile = citizenUserInfo?.userName;
const citizenName = citizenUserInfo?.name;

// Build API URL
const apiUrl = `${baseURL}case/v1/_update?tenantId=${tenantId}`;

// Dynamic message ID
const dynamicMsgId = Date.now().toString() + '|en_IN';

test.describe('Judge Register Case API Tests', () => {
  let apiContext;

  const baseRequestBody = {
    "cases": {
        "id": caseId, // Use case ID from global variables
        "tenantId": tenantId,
        "resolutionMechanism": "COURT",
        "caseTitle": `${firstName} ${lastName} vs Accused Details`,
        "isActive": true,
        "caseDescription": "Case description",
        "filingNumber": filingNumber, // Use filing number from global variables
        "advocateCount": 0,
        "courtCaseNumber": null,
        "caseNumber": null,
        "caseType": null,
        "cnrNumber": null,
        "cmpNumber": null,
        "accessCode": "065880",
        "outcome": null,
        "pendingAdvocateRequests": [],
        "courtId": "KLKM52",
        "benchId": "BENCH_ID",
        "linkedCases": [],
        "filingDate": 1749208858960,
        "registrationDate": 1749212914578,
        "judgementDate": null,
        "caseDetails": {
            "chequeDetails": {
                "formdata": [
                    {
                        "data": {
                            "ifsc": "SHSH0HSSHSH",
                            "name": "Payee Name On Cheque",
                            "delayReason": {
                                "reasonForReturnCheque": "Reason for the return of cheque"
                            },
                            "depositDate": "2025-04-18",
                            "infoBoxData": {
                                "data": [
                                    "CS_SIX_MONTH_BEFORE_DEPOSIT_TEXT",
                                    "CS_CHEQUE_RETURNED_INSUFFICIENT_FUND"
                                ],
                                "header": "CS_YOU_HAVE_CONFIRMED",
                                "scrutinyHeader": "CS_COMPLAINANT_HAVE_CONFIRMED"
                            },
                            "chequeAmount": "235222",
                            "chequeNumber": "363763",
                            "issuanceDate": "2025-04-01",
                            "payeeBankName": "Payee Bank Name",
                            "payerBankName": "Shshshshsh",
                            "payeeBranchName": "Payee Bank Branch Name",
                            "payerBranchName": "Payer Bank Branch Name",
                            "chequeSignatoryName": "Cheque Namr",
                            "returnMemoFileUpload": {
                                "document": [
                                    {
                                        "fileName": "CS_CHEQUE_RETURN_MEMO",
                                        "fileStore": "abbe61b4-9998-45dd-a640-0fb21d34d79e",
                                        "documentName": "2. Cheque Return Memo - 27_09_2024.png",
                                        "documentType": "case.cheque.returnmemo"
                                    }
                                ]
                            },
                            "bouncedChequeFileUpload": {
                                "document": [
                                    {
                                        "fileName": "CS_BOUNCED_CHEQUE",
                                        "fileStore": "303153cb-7117-4c52-924d-7daade1fb40e",
                                        "documentName": "1.Judge Issue summons.png",
                                        "documentType": "case.cheque"
                                    }
                                ]
                            },
                            "chequeAdditionalDetails": {
                                "text": "Additional details about cheque"
                            },
                            "depositChequeFileUpload": null,
                            "policeStationJurisDictionCheque": {
                                "code": 15996057,
                                "name": "MEDICAL COLLEGE PS",
                                "active": true,
                                "district": "THRISSUR CITY"
                            }
                        },
                        "isenabled": true,
                        "displayindex": 0
                    }
                ],
                "isCompleted": true
            },
            "delayApplications": {
                "formdata": [
                    {
                        "data": {
                            "delayCondonationType": {
                                "code": "YES",
                                "name": "YES",
                                "showForm": false,
                                "isEnabled": true
                            },
                            "condonationFileUpload": null
                        },
                        "isenabled": true,
                        "displayindex": 0
                    }
                ],
                "isCompleted": true
            },
            "demandNoticeDetails": {
                "formdata": [
                    {
                        "data": {
                            "infoBoxData": null,
                            "proofOfReply": {
                                "code": "NO",
                                "name": "NO",
                                "isEnabled": true,
                                "isVerified": true,
                                "showProofOfReply": false,
                                "hasBarRegistrationNo": true
                            },
                            "dateOfAccrual": "2025-05-14",
                            "dateOfService": "2025-04-28",
                            "dateOfDispatch": "2025-04-25",
                            "proofOfReplyFileUpload": null,
                            "proofOfDispatchFileUpload": {
                                "document": [
                                    {
                                        "fileName": "PROOF_OF_DISPATCH_FILE_NAME",
                                        "fileStore": "1290b4c8-a8f0-4675-af80-d4903ab13d71",
                                        "documentName": "4. Lease Agreement - 17_06_2024.pdf",
                                        "documentType": "case.demandnotice.proof"
                                    }
                                ]
                            },
                            "legalDemandNoticeFileUpload": {
                                "document": [
                                    {
                                        "fileName": "LEGAL_DEMAND_NOTICE",
                                        "fileStore": "812000fc-a947-4941-a841-9c3e36d312ca",
                                        "documentName": "5. Legal Notice - 07_10_2024.pdf",
                                        "documentType": "case.demandnotice"
                                    }
                                ]
                            },
                            "proofOfAcknowledgmentFileUpload": {
                                "document": [
                                    {
                                        "fileName": "PROOF_LEGAL_DEMAND_NOTICE_FILE_NAME",
                                        "fileStore": "5ee759f0-9974-4946-b020-6dd8d523da14",
                                        "documentName": "3. Power of Attorney - 01_04_2024.pdf",
                                        "documentType": "case.demandnotice.serviceproof"
                                    }
                                ]
                            }
                        },
                        "isenabled": true,
                        "displayindex": 0
                    }
                ],
                "isCompleted": true
            },
            "debtLiabilityDetails": {
                "formdata": [
                    {
                        "data": {
                            "totalAmount": "235222",
                            "liabilityType": {
                                "id": 1,
                                "code": "FULL_LIABILITY",
                                "name": "FULL_LIABILITY",
                                "isActive": true,
                                "liabilityType": 1,
                                "showAmountCovered": false
                            },
                            "liabilityNature": "Tested",
                            "debtLiabilityFileUpload": {
                                "document": [
                                    {
                                        "fileName": "CS_PROOF_DEBT",
                                        "fileStore": "ca57727d-71d0-4943-b083-215b1d71e99f",
                                        "documentName": "2. Cheque Return Memo - 27_09_2024.png",
                                        "documentType": "case.liabilityproof"
                                    }
                                ]
                            },
                            "additionalDebtLiabilityDetails": {
                                "text": "sgsg"
                            }
                        },
                        "isenabled": true,
                        "displayindex": 0
                    }
                ],
                "isCompleted": true
            }
        },
        "caseCategory": "CRIMINAL",
        "judgeId": "JUDGE_ID",
        "stage": "Pre-Trial",
        "substage": "REGISTRATION",
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
                "id": "6526b66f-4c12-4055-970b-f2de6fd342cb",
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
                "documents": [],
                "auditDetails": {
                    "createdBy": citizenUserInfo?.uuid ,
                    "lastModifiedBy": citizenUserInfo?.uuid ,
                    "createdTime": epochTime,
                    "lastModifiedTime": epochTime
                },
                "additionalDetails":{
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
                                "fileStore": "1819cdd9-ddd8-4db6-8af4-85991d21da3e",
                                "documentUid": "93a640c6-957c-4bfc-b964-a5a807480fad",
                                "isActive": true,
                                "additionalDetails": null
                            }
                        ],
                        "auditDetails": {
                            "createdBy": citizenUserInfo?.uuid,
                            "lastModifiedBy": citizenUserInfo?.uuid,
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
                    "lastModifiedBy": citizenUserInfo?.uuid,
                    "createdTime": epochTime,
                    "lastModifiedTime": epochTime
                },
                "additionalDetails": {
                    "advocateName": citizenUserInfo?.name,
                    "uuid": citizenUserInfo?.uuid
                },
                "hasSigned": false
            }
        ],
        "status": "PENDING_REGISTRATION",
        "documents": [
            {
                "id": "3f98d19b-9253-4536-9bfb-4a427bb1b75c",
                "documentType": "COMPLAINANT_ID_PROOF",
                "fileStore": "b7b06ce0-c41b-431c-8825-06f9f92fea3f",
                "documentUid": null,
                "isActive": true,
                "additionalDetails": null
            },
            {
                "id": "6f9d37ea-8199-4dbe-ac96-87cc32dfbc88",
                "documentType": "case.liabilityproof",
                "fileStore": "ca57727d-71d0-4943-b083-215b1d71e99f",
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
                "id": "95cb58fc-acee-4d88-97ed-81f6fb78903f",
                "documentType": "case.demandnotice.serviceproof",
                "fileStore": "5ee759f0-9974-4946-b020-6dd8d523da14",
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
                "id": "0d64728f-a9a6-4c97-ac2a-df57a5985e9f",
                "documentType": "case.demandnotice.proof",
                "fileStore": "1290b4c8-a8f0-4675-af80-d4903ab13d71",
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
                "id": "15a30e89-2b98-404e-b693-12074a59586f",
                "documentType": "case.complaint.signed",
                "fileStore": "f700e0c3-b6d2-4beb-bb07-a748aab5ca35",
                "documentUid": "15a30e89-2b98-404e-b693-12074a59586f",
                "isActive": true,
                "additionalDetails": null
            }
        ],
        "remarks": null,
        "workflow": {
            "action": "REGISTER"
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
                                            "advocateMobileNumber": citizenUserInfo?.mobileNumber,
                                            "middleName": "",
                                            "advocateIdProof": [
                                                {
                                                    "name": "OTHER",
                                                    "fileName": "ID Proof",
                                                    "fileStore": "014f6f67-798f-4cf4-a02f-5a4302ec0340",
                                                    "documentName": "downloadedFile (15).pdf"
                                                }
                                            ]
                                        },
                                        "advocateBarRegNumberWithName": {
                                            "advocateName": citizenUserInfo?.name,
                                            "isDisable": true,
                                            "advocateId": advocateId,
                                            "advocateUuid": advocateuserUUID,
                                            "individualId": advocateIndividualId,
                                            "barRegistrationNumber": "K/MARUTHI/TEST (Maruthi ch)",
                                            "barRegistrationNumberOriginal": "K/MARUTHI/TEST"
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
                                            "fileStore": "ba1ffab5-b508-4cea-b0e7-ecfcbd7d6056",
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
            "payerName": "ADV Eight Nineteen ",
            "payerMobileNo": "8800000019",
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
                                        "fileStore": "ab09c39e-c5b0-487e-b50e-6de9801980c0",
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
                                    "addressDetails": {
                                        "pincode": "500089",
                                        "city": "Manikonda",
                                        "district": "Hyderabad",
                                        "coordinates": {
                                            "latitude": "17.41527225357707",
                                            "longitude": "78.36590233349611"}
                                        ,
                                        "locality": "1, 12, Janmabhoomi Colony, Pappulaguda",
                                        "state": "Telangana"
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
                                            "fileName": "AADHAR",
                                            "fileStore": "b7b06ce0-c41b-431c-8825-06f9f92fea3f",
                                            "documentName": "adhaar.jpg"
                                        }
                                    ],
                                    "individualId": litigentIndividualId,
                                   "userUuid": litigentuuid,
                                },
                                "mobileNumber": litigentuserinfo?.mobileNumber,
                                "otpNumber": "123456",
                                "isUserVerified": true
                            },
                            "firstName": firstName,
                            "lastName": lastName,
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
            "scrutiny": {},
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
            "scrutinyComment": "",
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
                                        "fileStore": "2e1c7855-e7bb-4243-ad73-2cffc502b0fe",
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
            "judge": {
                "isenabled": true,
                "data": {},
                "displayindex": 0
            }
        },
        "auditDetails": {
            "createdBy": citizenUserInfo?.uuid,
            "lastModifiedBy": judgeUserResponse?.UserRequest?.uuid,
            "createdTime": epochTime,
            "lastModifiedTime": epochTime
        },
        "advocateStatus": null,
        "poaHolders": null
    },
    "tenantId": tenantId, // Use tenantId from global config
    "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": judgeauthtoken, // Use judge auth token from global variables
        "userInfo": judgeUserResponse?.UserRequest ,
        "msgId": dynamicMsgId // Dynamic msgId
    }
};

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      // baseURL: 'https://dristi-kerala-uat.pucar.org',
      // Add any default headers or options here if needed
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('should return 200 for successful case registration', async () => {
    console.log('Running test: should return 200 for successful case registration');
    console.log('Using case ID:', caseId);
    console.log('Using filing number:', filingNumber);
    console.log('Using advocate ID:', advocateId);
    console.log('Using judge auth token:', judgeauthtoken ? '***' + judgeauthtoken.slice(-4) : 'Not set');
    console.log('Using judge user UUID:', judgeUserResponse?.UserRequest?.uuid);
    
    console.log('Request Body:', JSON.stringify(baseRequestBody, null, 2));
    console.log('Using Case ID:', caseId);
    console.log('Using Filing Number:', filingNumber);
    console.log('Using Advocate ID:', advocateId);
    console.log('Using Judge Auth Token:', judgeauthtoken);
    
    const response = await apiContext.post(apiUrl, {
      data: baseRequestBody,
    });

    console.log('Response Status:', response.status());
    const responseBody = await response.json();
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));

    expect(response.status()).toBe(200);
    expect(responseBody.ResponseInfo.status).toBe('successful');
    expect(Array.isArray(responseBody.cases)).toBe(true);

    // Store CNR number in global variables if registration is successful
    if (responseBody.cases && responseBody.cases.length > 0 && responseBody.cases[0].cnrNumber) {
      const updatedGlobalVars = {
        ...globalVars,
        cnrNumber: responseBody.cases[0].cnrNumber
      };
      
      // Write back to global-variables.json
      fs.writeFileSync(globalVarsPath, JSON.stringify(updatedGlobalVars, null, 2));
      console.log('Updated CNR Number in global variables:', responseBody.cases[0].cnrNumber);
    }
  });

  test('should return 401 for missing auth token', async () => {
    const requestBodyWithoutToken = {
      ...baseRequestBody,
      RequestInfo: {
        ...baseRequestBody.RequestInfo,
        authToken: undefined, // Explicitly set authToken to undefined
      },
    };

    const response = await apiContext.post(apiUrl, {
      data: requestBodyWithoutToken,
    });

    expect(response.status()).toBe(401);
    // Optional: Add more specific assertions based on the 401 response body if available
  });

  test('should return 403 for invalid auth token', async () => {
    const requestBodyWithInvalidToken = {
      ...baseRequestBody,
      RequestInfo: {
        ...baseRequestBody.RequestInfo,
        authToken: 'INVALID_AUTH_TOKEN', // Use an invalid auth token
      },
    };

    const response = await apiContext.post(apiUrl, {
      data: requestBodyWithInvalidToken,
    });

    expect(response.status()).toBe(401);
    // Optional: Add more specific assertions based on the 403 response body if available
  });

  
  test('should return 400 for bad request', async () => {
    // To simulate a bad request, we can send a request with a missing required field
    const badRequestBody = { ...baseRequestBody };
    // Assuming 'tenantId' is a required field, remove it for this test
    delete badRequestBody.tenantId;

    const response = await apiContext.post(apiUrl, {
      data: badRequestBody,
    });

    expect(response.status()).toBe(400);
    // Optional: Add more specific assertions based on the 400 response body if available (e.g., error message)
  });

  test('should return 400 for missing cases object', async () => {
    const requestBodyWithoutCases = {
      tenantId: baseRequestBody.tenantId,
      RequestInfo: baseRequestBody.RequestInfo,
      // 'cases' object is missing
    };

    const response = await apiContext.post(apiUrl, {
      data: requestBodyWithoutCases,
    });

    expect(response.status()).toBe(400);
    // Optional: Add more specific assertions for the 400 response body
  });

   test('should return 400 for invalid filingNumber', async () => {
    const requestBodyWithInvalidFilingNumber = {
      ...baseRequestBody,
      cases: {
        ...baseRequestBody.cases,
        filingNumber: 'invalid-filing-number',
      },
    };

    const response = await apiContext.post(apiUrl, {
      data: requestBodyWithInvalidFilingNumber,
    });

    expect(response.status()).toBe(400);
    // Optional: Add more specific assertions for the 400 response body
  });

 

  // Test cases will be added here
});
