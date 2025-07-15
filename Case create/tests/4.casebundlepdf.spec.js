import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

// Import global configuration
const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

// Log the configuration values being used
console.log('=== Configuration Values Used ===');
console.log('Base URL:', globalVars.baseURL);
console.log('Tenant ID: kl');
console.log('Case ID:', globalVars.caseId);
console.log('Filing Number:', globalVars.filingNumber);
console.log('Citizen Auth Token:', globalVars.citizenAuthToken ? '***' + globalVars.citizenAuthToken.slice(-4) : 'Not set');
console.log('================================');

// Extract configuration values
const baseURL = globalVars.baseURL;
const tenantId = 'kl';
const caseId = globalVars.caseId;
const filingNumber = globalVars.filingNumber;
const citizenAuthToken = globalVars.citizenAuthToken;
const citizenUserInfo = globalVars.citizenUserInfo;

test.describe('API Test for fetchCaseComplaintPdf endpoint', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Fetch Case Bundle PDF', async () => {
    const origin = baseURL.replace(/\/$/, '');
    const fetchPdfUrl = `${origin}/dristi-case-pdf/v1/fetchCaseComplaintPdf`;
    const referer = `${origin}/ui/citizen/dristi/home/file-case/case?caseId=${caseId}^&selected=reviewCaseFile`;

    // Prepare headers
    const headers = {
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'application/json;charset=utf-8',
      'Origin': origin,
      'Referer': referer,
      'Cookie': globalVars.cookie || '', // Set this in your global-variables.json if needed
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Priority': 'u=0',
      'TE': 'trailers'
    };

    // Prepare request body (replace with dynamic values from globalVars as needed)
    const requestBody = {
      // ... Paste your JSON payload here, replacing static values with globalVars where appropriate ...
      "cases": {
        "id": caseId,
        "tenantId": tenantId,
        "resolutionMechanism": "COURT",
        "caseTitle": "GURU vs Sgsg Sg",
        "isActive": true,
        "caseDescription": "Case description",
        "filingNumber": filingNumber,
        // ... rest of your payload ...
      },
      "RequestInfo": {
        "authToken": citizenAuthToken,
        "userInfo": globalVars.citizenUserInfo,
        "msgId": Date.now().toString() + '|en_IN',
        "apiId": "Rainmaker"
      }
    };

    // Make the API request
    const response = await apiContext.post(fetchPdfUrl, {
      headers,
      data: requestBody
    });

    // Assert the response status
    expect(response.status()).toBe(200);

    // Parse and log the response
    const buffer = await response.body();
    const pdfPath = path.join(__dirname, 'caseComplaintDetails.pdf');
    fs.writeFileSync(pdfPath, buffer);
    console.log('PDF saved to:', pdfPath);

    // Store the PDF path in global variables for the next test
    globalVars.fetchCaseBundlePdfResponse = { filePath: pdfPath };
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2), 'utf8');
  });
});

const pdfFilePath = globalVars.fetchCaseBundlePdfResponse?.filePath || 'caseComplaintDetails.pdf';

test.describe('Upload complainant PDF to filestore', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Upload PDF and store filestore ID', async () => {
    // Check file existence and size
    if (!fs.existsSync(pdfFilePath)) {
      throw new Error(`PDF file does not exist at path: ${pdfFilePath}`);
    }
    const stats = fs.statSync(pdfFilePath);
    if (stats.size === 0) {
      throw new Error(`PDF file at path ${pdfFilePath} is empty!`);
    }

    const origin = baseURL.replace(/\/$/, '');
    const filestoreUrl = `${origin}/filestore/v1/files`;
    const referer = `${origin}/ui/citizen/dristi/home/file-case/case?caseId=${caseId}^&selected=reviewCaseFile`;

    const response = await apiContext.post(filestoreUrl, {
      multipart: {
        file: {
          name: 'caseComplaintDetails.pdf',
          mimeType: 'application/pdf',
          buffer: fs.readFileSync(pdfFilePath)
        },
        tenantId: 'kl',
        module: 'DRISTI'
      },
      headers: {
        'auth-token': globalVars.citizenAuthToken,
        'Origin': origin,
        'Referer': referer,
        'Cookie': globalVars.cookie || '',
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'TE': 'trailers'
      }
    });

    console.log('Upload response status:', response.status());
    const responseText = await response.text();
    console.log('Upload response body:', responseText);

    expect(response.status()).toBe(201);

    const responseBody = JSON.parse(responseText);
    const filestoreId = responseBody.files?.[0]?.fileStoreId;
    expect(filestoreId).toBeTruthy();
    console.log('Filestore ID:', filestoreId);

    // Store the filestoreId in globalVars.UATfilestore["case.complaint.signed"]
    if (!globalVars.UATfilestore) {
      globalVars.UATfilestore = {};
    }
    globalVars.UATfilestore["case.complaint.signed"] = filestoreId;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2), 'utf8');
  });
});