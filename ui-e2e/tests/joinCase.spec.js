const { test } = require('@playwright/test');
const { JoinCasePage } = require('../pages/normal/JoinCasePage');
const { loadGlobalVariables } = require('../helpers/env');

test('Advocate joins case on behalf of accused', async ({ page }) => {
  test.setTimeout(180000);
  
  const globals = loadGlobalVariables();
  const joinCase = new JoinCasePage(page, globals);

  // Open and join case
  await joinCase.open();
  await joinCase.joinCaseFlow(
    globals.accusedADV,
    globals.filingNumber,
    globals.accessCode,
    globals.respondentFirstName,
    globals.accusedLitigant,
    globals.noOfAdvocates
  );
});
