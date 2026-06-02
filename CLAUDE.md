# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

End-to-end Playwright test automation for the DRISTI court case management system (Kerala). Tests simulate the full lifecycle of a Section 138 NI Act cheque-bounce case: citizen files → Nayamitra payment → FSO review → Judge registers → notices/summons/warrants → witness/evidence → judgment.

## Repo Structure

Four independent test suites live side-by-side:

| Directory | Purpose | Config |
|-----------|---------|--------|
| `Case create/` | API-level tests (auth tokens, case CRUD, orders, hearings) | own `global-setup.js` + `global-variables.overrides.{env}.json` |
| `UI Tests/` | Browser flows organized by scenario folder (`1-Normal/`, `2-TwoComp/`, etc.) | `global-variables{env}.json` merged by `ui-global-setup-fn.js` |
| `tested-e2e/` | POM-based refactor of UI Tests; `tests/normal/` numbered 00–16 | `data/global-variables{env}.json` |
| `ui-e2e/` | Standalone POM suite (most active); `tests/flows/` + `pages/` + `helpers/` | `data/global-variables{env}.json` |

Root `playwright.config.js` aggregates all three into Playwright projects (`case-create`, `ui-tests`, `tested-e2e`) and calls `combined-global-setup.js` to merge env-specific configs before any tests run.

`ui-e2e/` is standalone — run from its own directory with its own `package.json`.

## Running Tests

### Root-level (all three projects)
```bash
npm install
TEST_ENV=qa npx playwright test                          # all suites
TEST_ENV=qa npx playwright test -p case-create           # API tests only
TEST_ENV=qa npx playwright test -p ui-tests              # UI Tests only
TEST_ENV=qa npx playwright test -p tested-e2e            # tested-e2e only
```

### ui-e2e (standalone — most commonly used)
```bash
cd ui-e2e && npm install
npm run test:qa                                          # all flows, QA, headless
npm run test:qa:headed                                   # headed (visible browser)
npm run test:flow1                                       # single flow on QA
TEST_ENV=qa npx playwright test tests/flows/1-normalFullCaseFlow.spec.js --headed --workers=1
./run-all.sh --env=qa                                    # sequential flow runner
```

### tested-e2e (run via root config)
```bash
# From repo root:
TEST_ENV=qa npx playwright test -p tested-e2e tests/normal/00-normal-cycle.spec.js
# Or using tested-e2e scripts (proxies to root config):
cd tested-e2e && npm run normal:cycle:qa
```

### Case create (API tests, sequential ordering matters)
```bash
# Run via root project or directly with the suite's run script:
cd "Case create" && TEST_ENV=qa bash run-all-tests.sh
```

### View reports
```bash
npx playwright show-report                               # root
cd ui-e2e && npm run report                              # ui-e2e
```

## Environment Configuration

`TEST_ENV` controls which JSON config is loaded. Valid values: `qa`, `uat`, `demo`, `dev`.

**ui-e2e:** `data/global-variables{env}.json` (e.g. `data/global-variablesqa.json`)  
**Case create:** `global-variables.json` base + `global-variables.overrides.{env}.json`  
**UI Tests / tested-e2e:** `global-variables{env}.json` in their own directories

The global setup **mutates** `global-variables.json` at runtime by merging the env-specific overrides into it. Tests that run later in a sequence read state (e.g. `filingNumber`, `cmpNumber`, `stNumber`, `accessCode`) that earlier tests wrote back via `saveGlobalVariables()`. This is intentional — tests are stateful and must run in order.

To add a new environment: create `data/global-variables<envname>.json` modeled on an existing one, then run with `TEST_ENV=<envname>`.

## Architecture Patterns

### Page Object Model (ui-e2e and tested-e2e)

All page interactions go through classes in `pages/`. Structure:
- `pages/common/` — `BasePage.js`, `LoginPage.js`, `EmployeeLoginPage.js`, `PaymentPage.js`
- `pages/normal/` — citizen-side pages (`FileCasePage`, `JoinCasePage`, `NoticePage`, etc.)
- `pages/employee/` — court staff pages (`FSOPage`, `JudgePage`, `CourtStaffPage`, etc.)

`BasePage` provides `goto()`, `clickContinue()`, `upload()`, `fillOtpSixOnes()` and other shared helpers. All page classes accept `(page, globals)` in their constructor.

### Test State Sharing

Tests pass data between steps using `saveGlobalVariables()` / `loadGlobalVariables()` from `helpers/env.js`. Keys like `filingNumber` or `stNumber` are written by an earlier test and read by the next. Always reload globals at the start of each test block:
```js
globals = loadGlobalVariables();
```

### Serial Ordering

All suites run with `workers: 1`. Flow specs use `test.describe.serial(...)`. Numbered filenames (`01-fileCase.spec.js`, `02-paymentNm.spec.js`) enforce execution order.

### Excel-Based Data (ui-e2e only)

Set `USE_EXCEL_DATA=true` to drive tests from `data/test-data.xlsx` instead of JSON. Helpers in `helpers/` (`excelHelper.js`, `generate-csv.js`, `runAllExcelRows.js`) manage this.

## Key Files to Know

- [playwright.config.js](playwright.config.js) — root config, aggregates all three projects
- [combined-global-setup.js](combined-global-setup.js) — merges env configs before test run
- [ui-e2e/helpers/env.js](ui-e2e/helpers/env.js) — `loadGlobalVariables` / `saveGlobalVariables`
- [ui-e2e/pages/common/BasePage.js](ui-e2e/pages/common/BasePage.js) — base class for all page objects
- [ui-e2e/tests/flows/run-all-flows.js](ui-e2e/tests/flows/run-all-flows.js) — sequential runner for all 6 flows
