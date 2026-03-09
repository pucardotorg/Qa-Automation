/**
 * generate-csv.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time utility: Reads global-variables<env>.json and writes
 * data/test-data.csv with one row per flow (7 rows total).
 *
 * All rows start with the same values from the JSON. Open the CSV in any
 * spreadsheet app (Excel, Google Sheets, LibreOffice) and customise each
 * row's test data independently per flow.
 *
 * Zero dependencies — uses only Node.js built-ins.
 *
 * Usage (from ui-e2e/ directory):
 *   node helpers/generate-csv.js                → uses demo env
 *   node helpers/generate-csv.js --env=qa
 *   node helpers/generate-csv.js --env=demo
 *
 * Output: data/test-data.csv
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Config ─────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '..', 'data');
const CSV_FILE = path.join(DATA_DIR, 'test-data.csv');
const FLOW_COUNT = 7;

const FLOW_LABELS = [
    'Flow 1 – Normal Full Case (1 Complainant + 1 Advocate)',
    'Flow 2 – Normal Full Case (2 Complainants + 1 Accused Entity)',
    'Flow 3 – Litigant Case (2 Complainants + 2 Advocates)',
    'Flow 4 – FSO Resubmit Case',
    'Flow 5 – Judge Resubmit Case',
    'Flow 6 – Witness Evidence & Judgement',
    'Flow 7 – (Reserved / Extra)',
];

// Keys that are runtime-generated and should start empty in the CSV
const RUNTIME_KEYS = new Set(['filingNumber', 'cmpNumber', 'accessCode', 'stNumber']);

// ─── CLI args ────────────────────────────────────────────────────────────────

const envArg = process.argv.find((a) => a.startsWith('--env='));
const envName = envArg
    ? envArg.replace('--env=', '').trim().toLowerCase()
    : (process.env.TEST_ENV || '').trim().toLowerCase() || 'demo';

// ─── CSV helpers ─────────────────────────────────────────────────────────────

/**
 * Escape a single value for CSV output (RFC 4180).
 * - Wraps the value in double-quotes if it contains commas, quotes, or newlines.
 * - Doubles any internal double-quote characters.
 */
function csvEscape(val) {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
        return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
}

/**
 * Build one CSV row from an ordered array of values.
 * @param {any[]} values
 * @returns {string}
 */
function buildRow(values) {
    return values.map(csvEscape).join(',');
}

// ─── Load source JSON ────────────────────────────────────────────────────────

const jsonFile = envName
    ? path.join(DATA_DIR, `global-variables${envName}.json`)
    : path.join(DATA_DIR, 'global-variables.json');

if (!fs.existsSync(jsonFile)) {
    console.error(`[generate-csv] JSON not found: ${jsonFile}`);
    process.exit(1);
}

const sourceData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
const columns = Object.keys(sourceData);

console.log(`[generate-csv] Source  : ${jsonFile}`);
console.log(`[generate-csv] Columns : ${columns.length} (+ flowLabel)`);
console.log(`[generate-csv] Rows    : ${FLOW_COUNT} (one per flow)`);

// ─── Build CSV content ───────────────────────────────────────────────────────

const lines = [];

// Header row: flowLabel first, then all JSON keys
lines.push(buildRow(['flowLabel', ...columns]));

// Data rows
for (let i = 0; i < FLOW_COUNT; i++) {
    const values = [FLOW_LABELS[i] || `Flow ${i + 1}`];

    for (const col of columns) {
        if (RUNTIME_KEYS.has(col)) {
            values.push('');   // start empty — filled at runtime by saveGlobalVariables()
        } else {
            values.push(sourceData[col] ?? '');
        }
    }

    lines.push(buildRow(values));
}

// ─── Write file ──────────────────────────────────────────────────────────────

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(CSV_FILE, lines.join('\n') + '\n', 'utf8');

console.log(`[generate-csv] ✅  Written: ${CSV_FILE}`);
console.log(`[generate-csv]    Open in any spreadsheet app to customise per-flow data.`);
console.log(`[generate-csv]    Then run: node tests/flows/run-all-flows.js`);
