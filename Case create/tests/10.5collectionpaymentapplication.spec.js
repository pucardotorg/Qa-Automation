const fs = require('fs');
const path = require('path');

// Read global variables
const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

const { test, expect } = require('@playwright/test');

const BASE_URL_CREATE_PAYMENT = `${globalVars.baseURL}collection-services/payments/_create`;
const tenantId = 'kl';
const businessService = 'application-voluntary-submission';
const AUTH_TOKEN = globalVars.nayamitraAuthToken;
const billId = globalVars.billId; // Use the billId stored from the fetch bill step
const userInfo = globalVars.nayamitraUserInfo;

const billAmount = 20; // If you want to use a dynamic amount, fetch from globalVars or another source

test.describe('Collection Payment for Application API Tests', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
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
        "mobileNumber": "8800000019",
        "payerName": "Rajesh Ch",
        "totalAmountPaid": billAmount,
        "instrumentNumber": "",
        "instrumentDate": timestamp
      },
      "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": AUTH_TOKEN,
        "userInfo": userInfo,
        "msgId": `${timestamp}|en_IN`,
        "plainAccessRequest": {}
      }
    };

    const createPaymentUrl = `${BASE_URL_CREATE_PAYMENT}?tenantId=${tenantId}&_=${timestamp}`;

    console.log('Create Payment Request URL:', createPaymentUrl);
    console.log('Create Payment Request Body:', JSON.stringify(createPaymentRequestBody, null, 2));

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
