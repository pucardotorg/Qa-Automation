const fs = require('fs');
const path = require('path');

class GlobalVariables {
  constructor() {
    this.variables = {};
    this.filePath = path.join(__dirname, '..', 'global-variables.json');
    this.loadVariables();
  }

  loadVariables() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        this.variables = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading global variables:', error);
      this.variables = {};
    }
  }

  saveVariables() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.variables, null, 2));
    } catch (error) {
      console.error('Error saving global variables:', error);
    }
  }

  get(key) {
    return this.variables[key];
  }

  set(key, value) {
    this.variables[key] = value;
    this.saveVariables();
  }
}

module.exports = new GlobalVariables(); 
module.exports = {
    citizenAuthToken: ''
  };
  