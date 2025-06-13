import {test,expect,request} from '@playwright/test'
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();
const headers ={
  Authorization:'Basic ZWdvdi11c2VyLWNsaWVudDo=',
}

test('citizenauthtoken', async () =>
{
    const apiContext = await request.newContext();
    const citizenresponse = await apiContext.post("https://dristi-kerala-uat.pucar.org/user/oauth/token?",
        {
        headers : headers,
            form: 
            {
                username: process.env.CITIZEN_USERNAME,
                password: process.env.CITIZEN_PASSWORD,
            tenantId :"kl",
            userType:"citizen",
            scope:"read",
            grant_type:"password"
            }
        } );
    const citizenresponsejson= await  citizenresponse.json();
    const citizentoken= await citizenresponsejson.access_token;
    
    // Read and update global variables
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
    const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
    globalVars.citizenAuthToken = citizentoken;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    
    console.log("full response", citizenresponsejson);
    console.log("accesstoken", citizentoken);
}   
);
