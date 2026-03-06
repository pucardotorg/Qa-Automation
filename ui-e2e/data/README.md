# 🌍 Environment Configuration

This folder contains environment-specific test data files.

## Available Environments

| `TEST_ENV` value | Config file loaded            | Target URL                              |
|-----------------|-------------------------------|-----------------------------------------|
| *(empty)*       | `global-variables.json`       | Default / local                         |
| `qa`            | `global-variablesqa.json`     | https://dristi-kerala-qa.pucar.org/     |
| `demo`          | `global-variablesdemo.json`   | https://demo.pucar.org/                 |

---

## How to Run Tests for a Specific Environment

### Linux / macOS

```bash
# QA environment
TEST_ENV=qa npx playwright test --headed --workers=1

# Demo environment
TEST_ENV=demo npx playwright test --headed --workers=1

# Default environment (global-variables.json)
npx playwright test --headed --workers=1
```

### Windows (Command Prompt)

```cmd
set TEST_ENV=qa && npx playwright test --headed --workers=1
set TEST_ENV=demo && npx playwright test --headed --workers=1
```

### Windows (PowerShell)

```powershell
$env:TEST_ENV="qa"; npx playwright test --headed --workers=1
$env:TEST_ENV="demo"; npx playwright test --headed --workers=1
```

### Run a Specific Flow File

```bash
# Run flow 1 on QA
TEST_ENV=qa npx playwright test tests/flows/1-normalFullCaseFlow.spec.js --headed --workers=1

# Run flow 3 on Demo
TEST_ENV=demo npx playwright test tests/flows/3-litigentfilecase.spec.js --headed --workers=1
```

---

## File Structure

```
data/
├── global-variables.json         ← Default / local environment
├── global-variablesqa.json       ← QA environment  (TEST_ENV=qa)
└── global-variablesdemo.json     ← Demo environment (TEST_ENV=demo)
```

## Adding a New Environment

1. Create `data/global-variables<envname>.json`
2. Copy the structure from an existing file and update the values
3. Run with `TEST_ENV=<envname> npx playwright test`

---

## Key Variables per Environment

| Variable           | QA                                    | Demo                     |
|--------------------|---------------------------------------|--------------------------|
| `baseURL`          | https://dristi-kerala-qa.pucar.org/   | https://demo.pucar.org/  |
| `judgeUsername`    | michaelGeorgeJudge                    | gJudge                   |
| `litigantUsername` | 9914590000                            | 9032273758               |

> **Note:** `filingNumber`, `cmpNumber`, `stNumber`, and `accessCode` are automatically
> updated in the config file as tests run (via `saveGlobalVariables`).
