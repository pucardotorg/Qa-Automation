import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
const BASE_URL = 'https://dristi-kerala-uat.pucar.org';
const ENDPOINT_PATH = `/advocate/v1/_search?tenantId=kl&_=${Date.now()}`;
let apiContext;
const authToken = globalVars.citizenAuthToken;

test.describe('Advocate ID API Tests', () => {
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      }
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('should search advocate by individualId and store advocateId', async () => {
    const requestBody = {
      criteria: [
        {
          individualId: globalVars.advocateIndividualId || 'IND-2024-11-19-000893'
        }
      ],
      tenantId: 'kl',
      RequestInfo: {
        apiId: 'Rainmaker',
        authToken: authToken,
        userInfo: {
          id: 1181,
          uuid: '5ba50f9a-56eb-4bee-8ae3-ee90dfb59c0f',
          userName: '6303338642',
          name: 'Maruthi  ch',
          mobileNumber: '6303338642',
          emailId: 'marruthi@gmail.com',
          locale: null,
          type: 'CITIZEN',
          roles: [
            { name: 'USER_REGISTER', code: 'USER_REGISTER', tenantId: 'kl' },
            { name: 'CASE_VIEWER', code: 'CASE_VIEWER', tenantId: 'kl' },
            { name: 'HEARING_VIEWER', code: 'HEARING_VIEWER', tenantId: 'kl' },
            { name: 'Citizen', code: 'CITIZEN', tenantId: 'kl' },
            { name: 'ADVOCATE_ROLE', code: 'ADVOCATE_ROLE', tenantId: 'kl' },
            { name: 'APPLICATION_CREATOR', code: 'APPLICATION_CREATOR', tenantId: 'kl' },
            { name: 'EVIDENCE_CREATOR', code: 'EVIDENCE_CREATOR', tenantId: 'kl' },
            { name: 'EVIDENCE_EDITOR', code: 'EVIDENCE_EDITOR', tenantId: 'kl' },
            { name: 'SUBMISSION_DELETE', code: 'SUBMISSION_DELETE', tenantId: 'kl' },
            { name: 'HEARING_ACCEPTOR', code: 'HEARING_ACCEPTOR', tenantId: 'kl' },
            { name: 'ORDER_VIEWER', code: 'ORDER_VIEWER', tenantId: 'kl' },
            { name: 'SUBMISSION_RESPONDER', code: 'SUBMISSION_RESPONDER', tenantId: 'kl' },
            { name: 'CASE_EDITOR', code: 'CASE_EDITOR', tenantId: 'kl' },
            { name: 'EVIDENCE_VIEWER', code: 'EVIDENCE_VIEWER', tenantId: 'kl' },
            { name: 'ADVOCATE_VIEWER', code: 'ADVOCATE_VIEWER', tenantId: 'kl' },
            { name: 'APPLICATION_VIEWER', code: 'APPLICATION_VIEWER', tenantId: 'kl' },
            { name: 'SUBMISSION_CREATOR', code: 'SUBMISSION_CREATOR', tenantId: 'kl' },
            { name: 'TASK_VIEWER', code: 'TASK_VIEWER', tenantId: 'kl' },
            { name: 'ADVOCATE_APPLICATION_VIEWER', code: 'ADVOCATE_APPLICATION_VIEWER', tenantId: 'kl' },
            { name: 'CASE_CREATOR', code: 'CASE_CREATOR', tenantId: 'kl' },
            { name: 'PENDING_TASK_CREATOR', code: 'PENDING_TASK_CREATOR', tenantId: 'kl' }
          ],
          active: true,
          tenantId: 'kl',
          permanentCity: null
        },
        msgId: `${Date.now()}|en_IN`,
        plainAccessRequest: {}
      }
    };

    const response = await apiContext.post(ENDPOINT_PATH, {
      data: requestBody
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.responseInfo.status).toBe('successful');
    expect(Array.isArray(body.advocates)).toBe(true);
    expect(body.advocates.length).toBeGreaterThan(0);
    const advocateId = body.advocates[0].responseList[0].id;
    // Store in global-variables.json
    globalVars.advocateId = advocateId;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    console.log('Stored advocateId:', advocateId);
  });
}); 