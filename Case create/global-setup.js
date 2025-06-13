const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function globalSetup() {
  console.log('Script running in directory:', __dirname);
  
  // Create empty global variables object
  const globalVariables = {
    citizenAuthToken: "",
    caseId: null
  };

  // Save to file
  try {
    fs.writeFileSync(
      path.join(__dirname, 'global-variables.json'),
      JSON.stringify(globalVariables, null, 2)
    );
    console.log('global-variables.json written to', path.join(__dirname, 'global-variables.json'));
  } catch (err) {
    console.error('Error writing global-variables.json:', err);
  }

  console.log('Reached end of script');
}

module.exports = globalSetup;

globalSetup(); 