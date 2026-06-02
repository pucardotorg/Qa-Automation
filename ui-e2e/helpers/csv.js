/**
 * csv.js — CSV-based test data loader (replaces excel.js)
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure Node.js, zero external dependencies.
 *
 * Reads one row from data/test-data.csv and writes it to
 * data/global-variables.json — the single canonical file all spec files read.
 *
 * The CSV has multiple environment sections identified by the Test_Env column.
 * run-all-flows.js filters rows matching the current TEST_ENV, then calls
 * loadRowFromCsv for each matching row before launching that spec file.
 *
 * CSV layout:
 *   Row 1  → column headers  (specFile, Test_Env, baseURL, citizenUsername, …)
 *   Rows 2+ → one row per flow per environment
 *
 * Usage (called from run-all-flows.js):
 *   const { loadRowFromCsv } = require('../../helpers/csv');
 *   loadRowFromCsv({ rowIndex: 17 });   // 0-based index from getAllRowsFromCsv
 *
 * After this call, data/global-variables.json contains that row's values
 * and the next Playwright test run will pick them up via loadGlobalVariables().
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Paths ──────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '..', 'data');
const CSV_FILE = path.join(DATA_DIR, 'test-data.csv');

// These columns control the runner — not written to the globals JSON
const SKIP_COLUMNS = new Set(['specFile', 'Test_Env']);

// ─── RFC-4180 CSV Parser ─────────────────────────────────────────────────────

/**
 * Parse a CSV string into an array of row-objects.
 * Handles:
 *   - Quoted fields (fields enclosed in double-quotes)
 *   - Embedded commas inside quotes
 *   - Embedded newlines inside quotes (multi-line fields)
 *   - Escaped double-quotes inside quoted fields ("")
 *
 * @param {string} text  Raw CSV content
 * @returns {object[]}   Array of {header: value} objects (header row auto-mapped)
 */
function parseCsv(text) {
    // Normalise line endings
    const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    let i = 0;

    const flush = () => { row.push(field); field = ''; };

    while (i < src.length) {
        const ch = src[i];
        const next = src[i + 1];

        if (inQuotes) {
            if (ch === '"' && next === '"') {
                // Escaped quote inside quoted field
                field += '"';
                i += 2;
            } else if (ch === '"') {
                // End of quoted field
                inQuotes = false;
                i++;
            } else {
                field += ch;
                i++;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
                i++;
            } else if (ch === ',') {
                flush();
                i++;
            } else if (ch === '\n') {
                flush();
                rows.push(row);
                row = [];
                i++;
            } else {
                field += ch;
                i++;
            }
        }
    }

    // Flush last field / row
    if (field || row.length > 0) {
        flush();
        rows.push(row);
    }

    // Remove trailing empty rows (trailing newline artefacts)
    while (rows.length && rows[rows.length - 1].every((f) => f === '')) {
        rows.pop();
    }

    if (rows.length < 2) return [];

    const headers = rows[0];
    return rows.slice(1).map((cells) => {
        const obj = {};
        headers.forEach((h, idx) => {
            obj[h] = cells[idx] ?? '';
        });
        return obj;
    });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns the canonical globals file path (always global-variables.json).
 * The `env` parameter is accepted but ignored — kept for call-site compatibility.
 *
 * @returns {string}
 */
function jsonPathForEnv(_env) {
    return path.join(DATA_DIR, 'global-variables.json');
}

/**
 * Converts M/D/YYYY or MM/DD/YYYY → YYYY-MM-DD so date values from the CSV
 * are valid for HTML <input type="date"> fields.
 * Any value that does not match the pattern is returned unchanged.
 *
 * @param {string} value
 * @returns {string}
 */
function normalizeDateValue(value) {
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
        const [, m, d, y] = match;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return value;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Reads one data row from data/test-data.csv and writes it to
 * data/global-variables.json (the single canonical file all tests read).
 *
 * The Test_Env column is used by the runner to filter rows — it is NOT
 * written to the JSON. Dynamic keys (filingNumber, cmpNumber, etc.) are
 * re-populated by saveGlobalVariables() as the flow progresses.
 *
 * @param {object} options
 * @param {number} options.rowIndex  0-based index into data rows (excluding header).
 *                                   Row 0 → Flow 1, Row 1 → Flow 2, …
 * @param {string} [options.env]     Ignored — kept for backwards-compat call sites.
 * @returns {object}                 The globals object written to disk.
 */
function loadRowFromCsv({ rowIndex, env: _env } = {}) {
    const outPath = path.join(DATA_DIR, 'global-variables.json');

    if (!fs.existsSync(CSV_FILE)) {
        throw new Error(
            `[csv.js] CSV file not found: ${CSV_FILE}\n` +
            `  Expected: ui-e2e/data/test-data.csv`
        );
    }

    const text = fs.readFileSync(CSV_FILE, 'utf8');
    const rows = parseCsv(text);

    if (rows.length === 0) {
        throw new Error(`[csv.js] No data rows found in ${CSV_FILE}.`);
    }

    if (rowIndex < 0 || rowIndex >= rows.length) {
        throw new Error(
            `[csv.js] rowIndex ${rowIndex} is out of range. ` +
            `CSV has ${rows.length} data row(s) (0 – ${rows.length - 1}).`
        );
    }

    const raw = rows[rowIndex];

    // Build globals — skip informational columns, normalise date formats
    const globals = {};
    for (const [key, value] of Object.entries(raw)) {
        if (SKIP_COLUMNS.has(key)) continue;
        globals[key] = normalizeDateValue((value ?? '').toString().trim());
    }

    // Write to disk
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(globals, null, 2), 'utf8');

    console.log(
        `[csv.js] ✅  Row ${rowIndex + 1} → ${path.relative(process.cwd(), outPath)} ` +
        `(${Object.keys(globals).length} keys)`
    );

    return globals;
}

/**
 * Returns all data rows from the CSV as objects (without writing to disk).
 * @returns {object[]}
 */
function getAllRowsFromCsv() {
    if (!fs.existsSync(CSV_FILE)) {
        throw new Error(`[csv.js] CSV file not found: ${CSV_FILE}`);
    }
    return parseCsv(fs.readFileSync(CSV_FILE, 'utf8'));
}

module.exports = { loadRowFromCsv, getAllRowsFromCsv, jsonPathForEnv };
