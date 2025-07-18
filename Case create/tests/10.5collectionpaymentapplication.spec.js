const fs = require('fs');
const path = require('path');

// Read global variables
const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

const { test, expect } = require('@playwright/test');

// Import values from global config into variables
const baseURL = globalVars.baseURL;
const tenantId = globalVars.citizenUserInfo?.tenantId || 'kl';
const businessService = 'application-voluntary-submission';
const nayamitraAuthToken = globalVars.nayamitraAuthToken;
const billId = globalVars.billId; // Use the billId stored from the fetch bill step
const nayamitraUserInfo = globalVars.nayamitraUserResponse?.UserRequest;
const citizenUserInfo = globalVars.citizenUserInfo;

// Extract litigant individual details
const litigentIndividual = globalVars.litigentIndividualResponse?.Individual?.[0];
const firstName = litigentIndividual?.name?.givenName;
const lastName = litigentIndividual?.name?.familyName || '';
const litigentIndividualId = globalVars.litigentIndividualId;
const litigentuuid = globalVars.litigentuuid;

const BASE_URL_CREATE_PAYMENT = `${baseURL}collection-services/payments/_create`;

const billAmount = 20; // If you want to use a dynamic amount, fetch from globalVars or another source

test.describe('Collection Payment for Application API Tests', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    // Log configuration values being used
    console.log('=== Configuration Values Used ===');
    console.log('Base URL:', baseURL);
    console.log('Tenant ID:', tenantId);
    console.log('Business Service:', businessService);
    console.log('Bill ID:', billId);
    console.log('Nayamitra Auth Token:', nayamitraAuthToken ? '***' + nayamitraAuthToken.slice(-4) : 'Not set');
    console.log('Nayamitra User Info:', nayamitraUserInfo?.name);
    console.log('Citizen User Info:', citizenUserInfo?.name);
    console.log('Citizen Mobile Number:', citizenUserInfo?.mobileNumber);
    console.log('Litigant Name:', `${firstName} ${lastName}`);
    console.log('Litigant Individual ID:', litigentIndividualId);
    console.log('Litigant UUID:', litigentuuid);
    console.log('Bill Amount:', billAmount);
    console.log('================================');

    apiContext = await playwright.request.newContext();
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('should create payment for application billId', async () => {
    const timestamp = Date.now();
    const createPaymentRequestBody = {
      "Payment": {
        "paymentDetails": [
          {
            "businessService": businessService,
            "billId": billId,
            "totalDue": billAmount,
            "totalAmountPaid": billAmount
          }
        ],
        "tenantId": tenantId,
        "paymentMode": "STAMP",
        "paidBy": "PAY_BY_OWNER",
        "mobileNumber": citizenUserInfo?.mobileNumber,
        "payerName": `${firstName} ${lastName}`,
        "totalAmountPaid": billAmount,
        "instrumentNumber": "",
        "instrumentDate": timestamp
      },
      "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": nayamitraAuthToken,
        "userInfo": nayamitraUserInfo,
        "msgId": `${timestamp}|en_IN`,
        "plainAccessRequest": {}
      }
    };

    const createPaymentUrl = `${BASE_URL_CREATE_PAYMENT}?tenantId=${tenantId}&_=${timestamp}`;

    console.log('Create Payment Request URL:', createPaymentUrl);
    console.log('Create Payment Request Body:', JSON.stringify(createPaymentRequestBody, null, 2));
    console.log('Using Bill ID:', billId);
    console.log('Using Auth Token:', nayamitraAuthToken);
    console.log('Using Tenant ID:', tenantId);

    const response = await apiContext.post(createPaymentUrl, {
      data: createPaymentRequestBody,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('Response Status:', response.status());
    const responseBody = await response.json();
    console.log('Create Payment Response Body:', JSON.stringify(responseBody, null, 2));

    // Expect status code 200 for successful payment creation
    expect(response.status()).toBe(200);
    expect(responseBody.ResponseInfo).toBeDefined();
    expect(responseBody.ResponseInfo.status).toBe('200 OK');
    expect(responseBody.Payments).toBeInstanceOf(Array);
    expect(responseBody.Payments.length).toBeGreaterThan(0);
    expect(responseBody.Payments[0].paymentDetails[0].billId).toBe(billId);
    expect(responseBody.Payments[0].tenantId).toBe(tenantId);
    expect(responseBody.Payments[0].totalAmountPaid).toBe(billAmount);
    expect(responseBody.Payments[0].paymentDetails[0].receiptNumber).toBeDefined();
  });
});
