import {test,expect,request} from '@playwright/test'
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();
const headers ={
  Authorization:'Basic ZWdvdi11c2VyLWNsaWVudDo=',
}

test('accusedauthtoken', async () => {
    const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
    let globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));

    const apiContext = await request.newContext();
    const accusedresponse = await apiContext.post(`${globalVars.baseURL}user/oauth/token?`,
        {
        headers : headers,
            form: 
            {
                username: process.env.Accused_USERNAME,
                password: process.env.Accused_PASSWORD, // Assuming this is the correct variable
            tenantId :"kl",
            userType:"accused",
            scope:"read",
            grant_type:"password"
            }
        } );
    const accusedresponsejson= await  accusedresponse.json();
    const accusedtoken= await accusedresponsejson.access_token;
    const accusedUserInfo = accusedresponsejson.UserRequest;
    
    // Read and update global variables
    globalVars.accusedAuthToken = accusedtoken;
    globalVars.accusedUserInfo = accusedUserInfo;
    fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
    
    console.log("full response", accusedresponsejson);
    console.log("accesstoken", accusedtoken);
    console.log("accusedUserInfo", accusedUserInfo);
   }   
);

test('Convert current date to epoch timestamp', async () => {
  // Step 1: Get the current date and time
  const currentDate = new Date();

  // Step 2: Convert to epoch time (in seconds)
 const epochTimeMillis = currentDate.getTime();

  // Step 3: Output
  console.log('Current Date (ISO):', currentDate.toISOString());
  console.log('Epoch Timestamp (ms):', epochTimeMillis);

  // Step 4: Write to global-variables.json
  const globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
  const globalVars = JSON.parse(fs.readFileSync(globalVarsPath, 'utf8'));
  globalVars.epochTime = epochTimeMillis;
  fs.writeFileSync(globalVarsPath, JSON.stringify(globalVars, null, 2));
}); 