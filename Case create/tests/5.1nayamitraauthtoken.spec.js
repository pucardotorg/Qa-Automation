import {test, expect, request} from '@playwright/test'
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
const baseUrl = globalVars.baseURL;

const headers = {
  Authorization:'Basic ZWdvdi11c2VyLWNsaWVudDo=',
  // "gjudge:secret" (example)
}

test('nayamitraauthtoken', async() => {
    // Read global variables
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
    const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
    
    // Import values from global config into variables
    const baseURL = globalVars.baseURL;
    const tenantId = globalVars.citizenUserInfo?.tenantId || "kl";
    
    const apiContext = await request.newContext({ ignoreHTTPSErrors: true });
    const empresponse = await apiContext.post(`${baseURL}user/oauth/token?_=1748935894913`,
        {
            headers: headers,
            form: {
                username: process.env.NAYAMITRA_USERNAME,
                password: process.env.NAYAMITRA_PASSWORD,
                district: "KOLLAM",
                courtroom: "KLKM52",
                userType: "EMPLOYEE",
                tenantId: tenantId,
                scope: "read",
                grant_type: "password"
            }  
        });

    const empresponsejson = await empresponse.json();
    const nayamitratoken = empresponsejson.access_token;
    const NAYAMITRAuserinfo = empresponsejson.UserRequest;
    const nayamitrauuid = NAYAMITRAuserinfo?.uuid;
    
    // Read and update global variables
    globalVars.nayamitraAuthToken = nayamitratoken;
    globalVars.NAYAMITRAuserinfo = NAYAMITRAuserinfo;
    globalVars.nayamitrauuid = nayamitrauuid;
    globalVars.nayamitraUserResponse = empresponsejson;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    
    console.log("Full Response JSON:", empresponsejson);
    console.log("Nayamitra Access Token:", nayamitratoken);
    console.log("Nayamitra User Info:", NAYAMITRAuserinfo);
    console.log("Nayamitra UUID:", nayamitrauuid);
    console.log("Nayamitra User Response saved to global config");
});