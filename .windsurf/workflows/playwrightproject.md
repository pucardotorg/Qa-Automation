# Playwright with JavaScript — Page Object Model Template

## 📁 Project Structure

```
playwright-js-pom/
│
├── package.json
├── playwright.config.js
├── tests/
│   └── login.spec.js
└── pages/
    └── LoginPage.js
```

## 🧠 Description

This structure separates **test logic** (in `tests/`) from **page locators and actions** (in `pages/`), following the **Page Object Model (POM)** pattern.

---

## 🧱 Example Page Object — `LoginPage.js`

```js
exports.LoginPage = class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = '#username';
    this.passwordInput = '#password';
    this.loginButton = '#login';
    this.errorMessage = '.error';
  }

  async goto() {
    await this.page.goto('https://app.example.com/login');
  }

  async login(username, password) {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }

  async assertLoginSuccess() {
    await this.page.waitForSelector('#dashboard');
  }

  async assertLoginError() {
    await this.page.waitForSelector(this.errorMessage);
    const errorText = await this.page.textContent(this.errorMessage);
    if (errorText !== 'Invalid credentials') throw new Error('Error message mismatch');
  }
};
```

---

## 🧪 Example Test — `login.spec.js`

```js
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

test.describe('User Login Tests', () => {
  test('Valid user can log in successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('validUser', 'validPass');
    await loginPage.assertLoginSuccess();
  });

  test('Invalid user sees error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('validUser', 'wrongPass');
    await loginPage.assertLoginError();
  });
});
```

---

## ⚙️ Run Tests

```bash
npx playwright test
```

---

## 🛠️ Converting Your Existing Code Folder to This POM Architecture

Follow these steps to restructure your current automation folder into the new POM model:

### 1️⃣ Create Standard Folder Structure

```
playwright-js-pom/
│
├── tests/          → All *.spec.js test files
├── pages/          → Page Object files (one per screen/module)
├── data/           → Test data JSON files (optional)
└── utils/          → Reusable helper functions (optional)
```

### 2️⃣ Move Your Current Test Files

Take your existing long Playwright scripts and place them inside the **tests/** folder.

* Break each long script into multiple smaller test files if needed.
* Keep only testing logic inside these files.

### 3️⃣ Extract Page Locators & Actions into POM Classes

For each UI screen, create a matching Page Object file under **pages/**.
Example:

```
pages/
  ├── LoginPage.js
  ├── DashboardPage.js
  ├── FileCasePage.js
  └── SignProcessPage.js
```

In each POM file:

* Move repeated selectors
* Move repeated clicks, fills, and navigations
* Convert each major workflow into a simple method

### 4️⃣ Replace Script Actions With POM Methods

Inside **tests/**, update your test files to use:

```js
const pageObj = new FileCasePage(page);
await pageObj.startFiling();
await pageObj.uploadDocument();
```

This keeps test cases short and readable.

### 5️⃣ Create a `BasePage.js` (Optional but recommended)

If many pages share common actions (waitLoader, clickNext, verifyText):

```
pages/
  └── BasePage.js
```

Then extend it:

```js
class DashboardPage extends BasePage {}
```

### 6️⃣ Add Environment or Test Data Files

Use a folder like:

```
data/global-variables.json
```

Move your existing config JSON here.

### 7️⃣ Clean Up & Standardize Naming

* Keep POM filenames in PascalCase
* Use clear method names: `login()`, `submitForm()`, `verifyStatus()`
* Group related tests together

---

## ✅ Benefits

* Simpler syntax for JS-based teams
* Fast setup, zero TypeScript config
* Ideal for UI smoke/regression automation

## Conversion Prompt

Use the following prompt to convert your existing `UItests` folder into the new `tested-e2e` Page Object Model (POM) architecture defined in this MD file:

```
Using the architecture defined in this MD file, convert my current codebase located in the `UItests` folder into the new `tested-e2e` folder structure. Follow the guidelines, naming conventions, and file responsibilities documented above. Ensure all page objects, test specs, utilities, fixtures, and configs are migrated into their appropriate folders and refactored to match the recommended POM style.
```
