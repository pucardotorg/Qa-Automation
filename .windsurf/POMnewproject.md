# 🎭 Playwright with JavaScript — **Enterprise POM Architecture (Updated & Stable)**

This document defines a **production‑ready, architectural Page Object Model (POM)** for Playwright + JavaScript.

It is designed to:

* Avoid locator‑not‑found issues
* Enforce separation of concerns
* Support large workflows (File Case, Accused, Judge, E‑Sign)
* Scale for multi‑sprint automation

---

## 📁 Recommended Folder Structure (Architectural)

```
 tested-e2e/
 │
 ├── playwright.config.js
 ├── package.json
 │
 ├── tests/                  # ONLY test orchestration & assertions
 │   ├── login.spec.js
 │   ├── fileCase.spec.js
 │   └── judgeFlow.spec.js
 │
 ├── pages/                  # Page Objects (UI behavior)
 │   ├── BasePage.js
 │   ├── LoginPage.js
 │   ├── FileCasePage.js
 │   ├── AccusedPage.js
 │   ├── SignProcessPage.js
 │   └── JudgePage.js
 │
 ├── locators/               # (Optional) Centralized selectors
 │   └── fileCase.locators.js
 │
 ├── data/                   # Test data only
 │   ├── users.json
 │   └── caseData.json
 │
 ├── utils/                  # Reusable helpers
 │   ├── waitUtils.js
 │   └── dateUtils.js
 │
 └── fixtures/               # Custom Playwright fixtures (optional)
     └── auth.fixture.js
```

---

## 🧠 Architectural Principles (Very Important)

### 1️⃣ Tests SHOULD NOT contain locators

Tests should only call **business actions**.

✅ GOOD:

```js
await fileCasePage.enterComplainantDetails(data);
```

❌ BAD:

```js
page.locator('#complainantName').fill('Rajesh');
```

---

### 2️⃣ Page Objects OWN selectors + UI behavior

Each page object represents **one screen or logical module**.

---

### 3️⃣ Use `page.locator()` — never raw selector strings

This ensures:

* Auto‑waiting
* Retry logic
* Better debugging

---

## 🧱 Base Page (Mandatory for Large Projects)

### `pages/BasePage.js`

```js
class BasePage {
  constructor(page) {
    this.page = page;
  }

  async waitForVisible(locator) {
    await locator.waitFor({ state: 'visible' });
  }

  async click(locator) {
    await this.waitForVisible(locator);
    await locator.click();
  }

  async fill(locator, value) {
    await this.waitForVisible(locator);
    await locator.fill(value);
  }
}

module.exports = { BasePage };
```

---

## 🧱 Example Page Object — LoginPage (Correct Way)

### `pages/LoginPage.js`

```js
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.username = page.locator('#username');
    this.password = page.locator('#password');
    this.loginBtn = page.locator('#login');
    this.dashboard = page.locator('#dashboard');
    this.errorMsg = page.locator('.error');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username, password) {
    await this.fill(this.username, username);
    await this.fill(this.password, password);
    await this.click(this.loginBtn);
  }

  async verifyLoginSuccess() {
    await expect(this.dashboard).toBeVisible();
  }

  async verifyLoginFailure() {
    await expect(this.errorMsg).toHaveText('Invalid credentials');
  }
}

module.exports = { LoginPage };
```

---

## 🧱 Example Complex Page — FileCasePage

### `pages/FileCasePage.js`

```js
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class FileCasePage extends BasePage {
  constructor(page) {
    super(page);

    this.caseNumber = page.locator('#caseNumber');
    this.complainantName = page.locator('#complainantName');
    this.complainantMobile = page.locator('#complainantMobile');
    this.nextBtn = page.locator('#nextBtn');
    this.submitBtn = page.locator('#submitCase');
    this.successMsg = page.locator('.success-message');
  }

  async enterCaseDetails(caseData) {
    await this.fill(this.caseNumber, caseData.caseNumber);
    await this.fill(this.complainantName, caseData.name);
    await this.fill(this.complainantMobile, caseData.mobile);
  }

  async goToAccusedSection() {
    await this.click(this.nextBtn);
  }

  async submitCase() {
    await this.click(this.submitBtn);
  }

  async verifyCaseSuccess() {
    await expect(this.successMsg).toContainText('Case filed successfully');
  }
}

module.exports = { FileCasePage };
```

---

## 🧪 Test File Structure (Thin Tests)

### `tests/fileCase.spec.js`

```js
const { test } = require('@playwright/test');
const { FileCasePage } = require('../pages/FileCasePage');
const caseData = require('../data/caseData.json');

test('File a case successfully', async ({ page }) => {
  const fileCase = new FileCasePage(page);

  await fileCase.enterCaseDetails(caseData);
  await fileCase.goToAccusedSection();
  await fileCase.submitCase();
  await fileCase.verifyCaseSuccess();
});
```

---

## 🧩 Handling Dynamic Sections (Accused 1 / Accused 2)

### Rule

> Dynamic repeating sections must be **parameterized**, never duplicated.

```js
getAccusedCard(index) {
  return this.page
    .locator('section')
    .filter({ hasText: `Accused ${index}` });
}
```

---

## 🔁 Migration Checklist (Use This While Converting)

* [ ] Replace selector strings with `page.locator()`
* [ ] Move UI logic from tests → POM
* [ ] One screen = one Page Object
* [ ] Assertions live inside POM
* [ ] Tests only describe flow

---

## 🚀 Outcome

By following this architecture:

* Your locators will be stable
* Scripts will execute reliably
* Refactoring becomes predictable
* Large judicial workflows remain manageable

---

## 🧠 Conversion Instruction Prompt

```
Using this architectural POM guide, convert my existing Playwright scripts into the `UI-e2e` structure. Ensure all selectors are moved into page objects, dynamic sections are parameterized, and tests remain thin orchestration layers only.
```
