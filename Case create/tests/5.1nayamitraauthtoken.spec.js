import {test, expect, request} from '@playwright/test'
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const headers = {
  Authorization:'Basic ZWdvdi11c2VyLWNsaWVudDo=',
  // "gjudge:secret" (example)
}

test('nayamitraauthtoken', async() => {
    const apiContext = await request.newContext();
    const empresponse = await apiContext.post("https://dristi-kerala-uat.pucar.org/user/oauth/token?_=1748935894913",
        {
            headers: headers,
            form: {
                username: process.env.NAYAMITRA_USERNAME,
                password: process.env.NAYAMITRA_PASSWORD,
                district: "KOLLAM",
                courtroom: "KLKM52",
                userType: "EMPLOYEE",
                tenantId: "kl",
                scope: "read",
                grant_type: "password"
            }  
        });

    const empresponsejson = await empresponse.json();
    const nayamitratoken = empresponsejson.access_token;
    
    // Read and update global variables
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
    const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
    globalVars.nayamitraAuthToken = nayamitratoken;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    
    console.log("Full Response JSON:", empresponsejson);
    console.log("Nayamitra Access Token:", nayamitratoken);
});