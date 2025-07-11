const fs = require('fs');
const path = require('path');

// Read global variables
const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

// Import values from global config into variables
const baseURL = globalVars.baseURL;
const tenantId = globalVars.citizenUserInfo?.tenantId || 'kl';
const filingNumber = globalVars.filingNumber;
const nayamitraAuthToken = globalVars.nayamitraAuthToken;
const nayamitraUserResponse = globalVars.nayamitraUserResponse;
const citizenUserInfo = globalVars.citizenUserInfo;

const { test, expect } = require('@playwright/test');

// Endpoint URLs
const BASE_URL_FETCH_BILL = `${baseURL}billing-service/bill/v2/_fetchbill`;
const BASE_URL_CREATE_PAYMENT = `${baseURL}collection-services/payments/_create`;

// Constants for requests
// NOTE: This consumerCode needs to exist for a successful fetch bill request
const consumerCodeForBillFetch = filingNumber + '_CASE_FILING'; // Example consumer code for fetching bill
const serviceForBillFetch = 'case-default'; // Service parameter for fetching bill

// Use a valid auth token for both requests
const AUTH_TOKEN = nayamitraAuthToken; // Example auth token

// Variables to store extracted data
let fetchedBillId = null;
let billAmount = null; // Variable to store the extracted bill amount

test.describe('API Test for Fetch Bill and Create Payment Flow', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();

    // --- Step 1: Fetch the Bill to get the Bill ID and Amount ---
    const fetchBillRequestBody = {
      "RequestInfo": {
          "apiId": "Rainmaker",
          "authToken": AUTH_TOKEN,
          "userInfo": nayamitraUserResponse, 
          "msgId": `test-${Date.now()}`,
          "plainAccessRequest": {}
      }
    };

    const fetchBillUrl = `${BASE_URL_FETCH_BILL}?tenantId=${tenantId}&businessService=${serviceForBillFetch}&consumerCode=${consumerCodeForBillFetch}&_=${Date.now()}`;
    
    console.log('Request URL:', fetchBillUrl);
    console.log('Request Body:', JSON.stringify(fetchBillRequestBody, null, 2));
    console.log('Using Auth Token:', AUTH_TOKEN);
    console.log('Using Consumer Code:', consumerCodeForBillFetch);
    console.log('Using Filing Number:', filingNumber);

    try {
      const response = await apiContext.post(fetchBillUrl, { data: fetchBillRequestBody });

      console.log('Response Status:', response.status());
      console.log('Response Headers:', await response.headers());

      const responseBody = await response.json();
      console.log('Full Response Body:', JSON.stringify(responseBody, null, 2));

      // Expect status code 201 for successful bill fetch
      expect(response.status()).toBe(201);

      // Assertions based on the provided successful fetch bill response structure
      expect(responseBody.Bill).toBeInstanceOf(Array);
      
      if (responseBody.Bill.length === 0) {
        console.log('Warning: Bill array is empty. This might indicate:');
        console.log('1. No bills exist for this consumer code');
        console.log('2. Permission issues with the current auth token');
        console.log('3. Incorrect consumer code format');
        throw new Error('No bills found for the given consumer code');
      }

      expect(responseBody.Bill[0].billDetails).toBeInstanceOf(Array);
      expect(responseBody.Bill[0].billDetails.length).toBeGreaterThan(0);

      // Extract and store the billId and amount
      fetchedBillId = responseBody.Bill[0].id;
      billAmount = responseBody.Bill[0].billDetails[0].amount;

      expect(fetchedBillId).toBeDefined();
      expect(billAmount).toBeDefined();
      console.log(`Obtained Bill ID: ${fetchedBillId}`);
      console.log(`Obtained Bill Amount: ${billAmount}`);

    } catch (error) {
        console.error(`Error during bill fetch in beforeAll: ${error}`);
        throw new Error(`Failed to fetch bill in beforeAll hook: ${error.message}`);
    }
    // --- End Step 1 ---
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // Test case for creating a payment using the fetched billId and amount
  test('should successfully create a payment using the fetched billId and amount', async () => {
    // Ensure billId and amount were obtained in the beforeAll hook
    expect(fetchedBillId).not.toBeNull();
    expect(billAmount).not.toBeNull();
    console.log(`Using fetched Bill ID for payment creation: ${fetchedBillId}`);
    console.log(`Using fetched Bill Amount for payment creation: ${billAmount}`);

    const createPaymentRequestBody = {
        "Payment": {
            "paymentDetails": [
                {
                    "businessService": serviceForBillFetch, // Use the same service as bill fetch
                    "billId": fetchedBillId, // Use the billId obtained from fetch bill
                    "totalDue": billAmount, // Use the fetched bill amount
                    "totalAmountPaid": billAmount // Use the fetched bill amount
                }
            ],
            "tenantId": tenantId,
            "paymentMode": "STAMP", // Example payment mode
            "paidBy": "PAY_BY_OWNER",
            "mobileNumber": citizenUserInfo?.mobileNumber, // Use citizen mobile from global config
            "payerName": citizenUserInfo?.name, // Use citizen name from global config
            "totalAmountPaid": billAmount, // Use the fetched bill amount here too
            "instrumentNumber": "", // Example instrument number
            "instrumentDate": Date.now() // Dynamic instrument date
        },
        "RequestInfo": {
            "apiId": "Rainmaker",
            "authToken": AUTH_TOKEN,
            "userInfo": nayamitraUserResponse ,
            "msgId": `test-${Date.now()}`, // Dynamic message ID
            "plainAccessRequest": {}
        }
    };

    // Construct the URL with query parameter for create payment
    const createPaymentUrl = `${BASE_URL_CREATE_PAYMENT}?tenantId=${tenantId}&_=${Date.now()}`;

    const response = await apiContext.post(createPaymentUrl, { data: createPaymentRequestBody });

    // Expect status code 200 for successful payment creation, as per the provided response
    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    // Print the response body for debugging
    console.log("Create Payment Response Body:", responseBody);

    // Assertions based on the provided successful create payment response structure
    expect(responseBody.ResponseInfo).toBeDefined();
    expect(responseBody.ResponseInfo.status).toBe('200 OK');
    expect(responseBody.Payments).toBeInstanceOf(Array);
    expect(responseBody.Payments.length).toBeGreaterThan(0);

    // Extract and store the payment ID
    const createdPaymentId = responseBody.Payments[0].id;
    expect(createdPaymentId).toBeDefined();
    console.log(`Created Payment ID: ${createdPaymentId}`);

    // Optional: Assert other fields in the response if needed
    expect(responseBody.Payments[0].tenantId).toBe(tenantId);
    expect(responseBody.Payments[0].totalAmountPaid).toBe(createPaymentRequestBody.Payment.totalAmountPaid);
    expect(responseBody.Payments[0].transactionNumber).toBeDefined();
    expect(responseBody.Payments[0].paymentDetails).toBeInstanceOf(Array);
    expect(responseBody.Payments[0].paymentDetails.length).toBeGreaterThan(0);
    expect(responseBody.Payments[0].paymentDetails[0].billId).toBe(fetchedBillId); // Assert the billId matches the one sent in the request
    expect(responseBody.Payments[0].paymentDetails[0].receiptNumber).toBeDefined();
  });

  // You can add more test cases here for specific error scenarios for the payment creation endpoint if needed,
  // similar to the ones in the collectionsService.spec.js code I provided earlier.
});