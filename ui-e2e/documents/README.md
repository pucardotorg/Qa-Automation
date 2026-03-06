# UI-E2E Upload Documents

Place the files your tests will upload in this folder. Defaults used by the POM:

- cheque.png — image of the cheque (used in Cheque Details)
- return-memo.png — cheque return memo document (used in Cheque Details)

You can override these via data files:

- `chequeImagePath`: absolute path or project-relative path (relative to `ui-e2e/`)
- `reasonFilePath`: absolute path or project-relative path (relative to `ui-e2e/`)

Examples (in `ui-e2e/data/global-variablesdemo.json`):
```json
{
  "chequeImagePath": "documents/cheque.png",
  "reasonFilePath": "documents/return-memo.png"
}
```

If the files are not found at runtime, the test will throw a clear error indicating which file is missing and where to place it.
