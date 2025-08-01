import {test, expect, request} from '@playwright/test'
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();
const globalVarsPath = path.join(__dirname,  '../../global-variables.json');
const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
const baseUrl = globalVars.baseURL;

const headers = {
  Authorization:'Basic ZWdvdi11c2VyLWNsaWVudDo=',
  // "gjudge:secret" (example)
}

test('fsoauthtoken', async() => {
    // Read global variables
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
    const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
    
    // Import values from global config into variables
    const baseURL = globalVars.baseURL;
    const tenantId = globalVars.citizenUserInfo?.tenantId || "kl";
    
    const apiContext = await request.newContext();
    const empresponse = await apiContext.post(`${baseURL}user/oauth/token?_=1748935894913`,
        {
            headers: headers,
            form: {
                username: process.env.FSO_USERNAME,
                password: process.env.FSO_PASSWORD,
                district: "KOLLAM",
                courtroom: "KLKM52",
                userType: "EMPLOYEE",
                tenantId: tenantId,
                scope: "read",
                grant_type: "password"
            }  
        });

    const empresponsejson = await empresponse.json();
    const fsoauthtoken = empresponsejson.access_token;
    const FSOuserinfo = empresponsejson.UserRequest;
    const fsouuid = FSOuserinfo?.uuid;
    
    // Read and update global variables
    globalVars.fsoauthtoken = fsoauthtoken;
    globalVars.FSOuserinfo = FSOuserinfo;
    globalVars.fsouuid = fsouuid;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    
    console.log("Full Response JSON:", empresponsejson);
    console.log("Nayamitra Access Token:", fsoauthtoken);
    console.log("FSO User Info:", FSOuserinfo);
    console.log("FSO UUID:", fsouuid);
    globalVars.fsoUserResponse = empresponsejson;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    
    console.log("Full Response JSON:", empresponsejson);
    console.log("FSO Access Token:", fsoauthtoken);
    console.log("FSO User Response saved to global config");
});