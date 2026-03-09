/**
 * generate-excel.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time utility: Reads global-variablesdemo.json (or any env JSON) and
 * writes data/test-data.xlsx with one row per flow (7 rows total).
 *
 * All rows start with the same values as the JSON. You can then open the
 * Excel and customise per-flow test data (e.g. different usernames per flow).
 *
 * Usage (from ui-e2e/ directory):
 *   node helpers/generate-excel.js
 *   node helpers/generate-excel.js --env=qa
 *   node helpers/generate-excel.js --env=demo
 *
 * The generated Excel will be saved to:
 *   data/test-data.xlsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// ─── Config ─────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '..', 'data');
const EXCEL_FILE = path.join(DATA_DIR, 'test-data.xlsx');
const SHEET_NAME = 'TestData';

// Labels for each flow row (shown in column A as a read-only guide)
const FLOW_LABELS = [
    'Flow 1 – Normal Full Case (1 Complainant + 1 Advocate)',
    'Flow 2 – Normal Full Case (2 Complainants + 1 Accused Entity)',
    'Flow 3 – Litigant Case (2 Complainants + 2 Advocates)',
    'Flow 4 – FSO Resubmit Case',
    'Flow 5 – Judge Resubmit Case',
    'Flow 6 – Witness Evidence & Judgement',
    'Flow 7 – (Reserved / Extra)',
];

const FLOW_COUNT = 7;

// ─── CLI args ───────────────────────────────────────────────────────────────

const envArg = process.argv.find((a) => a.startsWith('--env='));
const envName = envArg
    ? envArg.replace('--env=', '').trim().toLowerCase()
    : (process.env.TEST_ENV || '').trim().toLowerCase() || 'demo';

// ─── Load source JSON ────────────────────────────────────────────────────────

const jsonFile = envName
    ? path.join(DATA_DIR, `global-variables${envName}.json`)
    : path.join(DATA_DIR, 'global-variables.json');

if (!fs.existsSync(jsonFile)) {
    console.error(`[generate-excel] JSON not found: ${jsonFile}`);
    process.exit(1);
}

const sourceData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
const columns = Object.keys(sourceData);

console.log(`[generate-excel] Source : ${jsonFile}`);
console.log(`[generate-excel] Columns: ${columns.length}`);
console.log(`[generate-excel] Rows   : ${FLOW_COUNT} (one per flow)`);

// ─── Build rows ──────────────────────────────────────────────────────────────

// Add a 'flowLabel' column as the very first column so the spreadsheet is
// self-documenting. It is informational-only and ignored by excel.js.
const rows = [];

for (let i = 0; i < FLOW_COUNT; i++) {
    const row = { flowLabel: FLOW_LABELS[i] || `Flow ${i + 1}` };

    for (const col of columns) {
        // Clear runtime-generated keys (they will be written by saveGlobalVariables)
        // so the per-flow slots start clean.
        if (['filingNumber', 'cmpNumber', 'accessCode', 'stNumber'].includes(col)) {
            row[col] = '';
        } else {
            row[col] = sourceData[col] ?? '';
        }
    }

    rows.push(row);
}

// ─── Write Excel ─────────────────────────────────────────────────────────────

const ws = XLSX.utils.json_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, SHEET_NAME);

// Column widths — make flowLabel wider, rest standard
const colWidths = [{ wch: 55 }, ...columns.map((c) => ({ wch: Math.max(c.length + 2, 20) }))];
ws['!cols'] = colWidths;

fs.mkdirSync(DATA_DIR, { recursive: true });
XLSX.writeFile(wb, EXCEL_FILE);

console.log(`[generate-excel] ✅  Written: ${EXCEL_FILE}`);
console.log(`[generate-excel]    Open it and customise each row's test data.`);
console.log(`[generate-excel]    Run 'node tests/flows/run-all-flows.js' to execute.`);
