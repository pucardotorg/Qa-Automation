import { request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

class CitizenAuthPage {
  constructor() {
    this.globalVarsPath = path.join(__dirname, '..', 'global-variables.json');
    this.headers = {
      Authorization: 'Basic ZWdvdi11c2VyLWNsaWVudDo=',
    };
  }

  async getAuthToken() {
    let globalVars = JSON.parse(fs.readFileSync(this.globalVarsPath, 'utf8'));
    const apiContext = await request.newContext();
   // const response = await apiContext.post('${globalVars.baseURL}user/oauth/token?',
   //  {
      const response = await apiContext.post("https://dristi-kerala-uat.pucar.org/user/oauth/token?",
        {
      headers: this.headers,
      form: {
        //username: process.env.CITIZEN_USERNAME,
        //password: process.env.CITIZEN_PASSWORD,
        username: "6303338642",
        password: "123456",
        tenantId: "kl",
        userType: "citizen",
        scope: "read",
        grant_type: "password",
      },
    });
    const responseJson = await response.json();
    console.log("testfor response");
    console.log(responseJson);
    return responseJson.access_token;
  }
}

export default new CitizenAuthPage();