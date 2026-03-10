/**
 * run-all-flows.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Dynamic sequential runner — reads test-data.csv to decide WHICH spec files
 * to run and in WHAT ORDER.
 *
 * How to control execution from test-data.csv:
 *   • Each data row must have a `specFile` column (first column).
 *   • The runner executes ONLY the rows present in the CSV, in the order they appear.
 *   • To SKIP a flow  → delete (or comment out) its row from test-data.csv
 *   • To RUN only 1 & 5 → keep only those two rows in test-data.csv
 *   • To REORDER flows  → reorder the rows in test-data.csv
 *
 * Supported specFile values (relative to ui-e2e/):
 *   tests/flows/1-normalFullCaseFlow.spec.js
 *   tests/flows/2-normalFullCaseFlowwith2acc.spec.js
 *   tests/flows/3-litigentfilecase.spec.js
 *   tests/flows/4-resubmitCaseFso.spec.js
 *   tests/flows/5-resubmitCaseFromJudge.spec.js
 *   tests/flows/6-witnessEvidenceJudgement.spec.js
 *
 * Usage (run from the ui-e2e/ folder OR the repo root):
 *   cd ui-e2e && node tests/flows/run-all-flows.js
 *   -- OR --
 *   node ui-e2e/tests/flows/run-all-flows.js          (from repo root)
 *
 * Optional env vars (passed through to Playwright):
 *   TEST_ENV=qa    → uses data/global-variablesqa.json
 *   TEST_ENV=demo  → uses data/global-variablesdemo.json
 *   (default)      → uses data/global-variables.json
 *
 * npm shortcuts (from ui-e2e/ folder):
 *   npm run run:all-flows
 *   npm run run:all-flows:qa
 *   npm run run:all-flows:demo
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const { loadRowFromCsv, getAllRowsFromCsv } = require('../../helpers/csv');

// ─── Configuration ─────────────────────────────────────────────────────────

/** Delay between each spec file (milliseconds) */
const BREAK_MS = 60_000;

/**
 * Root of the ui-e2e project.
 * __dirname = <repo>/ui-e2e/tests/flows
 * ../..     = <repo>/ui-e2e   ← where playwright.config.js lives
 */
const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * CLI flags — collect any extra flags to forward to `npx playwright test`.
 * Supported flags:
 *   --headed   → run browser in headed (visible) mode
 *   --workers=N / --workers N  → override worker count
 */
const RAW_ARGS = process.argv.slice(2);   // everything after: node run-all-flows.js
const IS_HEADED = RAW_ARGS.includes('--headed');
const EXTRA_FLAGS = RAW_ARGS.filter((a) => a !== '--headed').join(' ');

// Tell playwright.config.js to launch headed when requested
if (IS_HEADED) process.env.HEADED = '1';

// ─── Read flows dynamically from CSV ────────────────────────────────────────

/**
 * Reads all rows from test-data.csv and builds the FLOWS array dynamically.
 * Each row MUST have a `specFile` column — rows missing it are skipped with
 * a warning so a bad CSV never silently swallows flows.
 *
 * @returns {{ spec: string, rowIndex: number }[]}
 */
function buildFlowsFromCsv() {
    let allRows;
    try {
        allRows = getAllRowsFromCsv();
    } catch (err) {
        console.error(`[run-all-flows] ❌  Could not read test-data.csv:\n  ${err.message}`);
        process.exit(1);
    }

    if (allRows.length === 0) {
        console.error('[run-all-flows] ❌  test-data.csv has no data rows. Nothing to run.');
        process.exit(1);
    }

    const flows = [];

    allRows.forEach((row, idx) => {
        const specFile = (row.specFile || '').trim();

        if (!specFile) {
            console.warn(
                `[run-all-flows] ⚠️   Row ${idx + 1} ` +
                `has no specFile value — skipping.`
            );
            return;
        }

        flows.push({ spec: specFile, rowIndex: idx });
    });

    if (flows.length === 0) {
        console.error(
            '[run-all-flows] ❌  No valid rows with a specFile column found in test-data.csv.\n' +
            '  Make sure the first column is "specFile" and each row has a spec path.'
        );
        process.exit(1);
    }

    return flows;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function banner(label) {
    const line = '═'.repeat(70);
    console.log(`\n${line}`);
    console.log(`  ${label}`);
    console.log(`${line}\n`);
}

function timestamp() {
    return new Date().toLocaleTimeString('en-IN', { hour12: false });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Load CSV data for a flow's row then run its Playwright spec file.
 *
 * @param {{ spec: string, rowIndex: number }} flow
 * @param {number} index          – 1-based display number
 * @param {number} totalFlows     – total flows being run (for display)
 * @returns {{ success: boolean, durationSec: string }}
 */
function runSpec(flow, index, totalFlows) {
    const { spec: specRelPath, rowIndex } = flow;
    const label = `Flow ${index}/${totalFlows} → ${path.basename(specRelPath)}`;
    banner(`▶  ${label}`);

    // ── Load this flow's test data row from CSV into the env JSON ──────────
    try {
        console.log(`[⚓  CSV]  Loading row ${rowIndex + 1} for this flow...`);
        loadRowFromCsv({ rowIndex, env: process.env.TEST_ENV });
    } catch (err) {
        console.warn(
            `[csv.js] Could not load row ${rowIndex} from CSV — ` +
            `falling back to existing JSON.\n  ${err.message}`
        );
    }

    console.log(`[${timestamp()}]  Starting: ${specRelPath}`);

    const start = Date.now();
    let success = true;

    try {
        const headedFlag = IS_HEADED ? '--headed' : '';
        execSync(
            `npx playwright test ${specRelPath} --reporter=list --retries=0 ${headedFlag} ${EXTRA_FLAGS}`.trimEnd(),
            {
                cwd: PROJECT_ROOT,
                stdio: 'inherit',
                env: process.env,
            }
        );
    } catch {
        success = false;
    }

    const durationSec = ((Date.now() - start) / 1000).toFixed(1);
    const status = success ? '✅  PASSED' : '❌  FAILED (some tests may have failed)';
    console.log(`\n[${timestamp()}]  ${status} — completed in ${durationSec}s`);

    return { success, durationSec };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    // Build dynamic flow list from CSV BEFORE printing the banner
    const FLOWS = buildFlowsFromCsv();

    banner('🚀  Sequential Flow Runner — CSV-Driven');
    console.log(`Project root  : ${PROJECT_ROOT}`);
    console.log(`Environment   : ${process.env.TEST_ENV || 'default'}`);
    console.log(`Mode          : ${IS_HEADED ? '🖥️  Headed (browser visible)' : '🕶️  Headless'}`);
    console.log(`Break between : ${BREAK_MS / 1000}s`);
    console.log(`Total flows   : ${FLOWS.length}  (read from data/test-data.csv)`);
    console.log('');
    console.log('  Flows to run (in order):');
    FLOWS.forEach((f, i) => {
        console.log(`    ${i + 1}. Row ${f.rowIndex + 1}  →  ${path.basename(f.spec)}`);
    });

    const results = [];

    for (let i = 0; i < FLOWS.length; i++) {
        const flow = FLOWS[i];
        const flowNum = i + 1;

        const result = runSpec(flow, flowNum, FLOWS.length);
        results.push({ spec: flow.spec, ...result });

        if (i < FLOWS.length - 1) {
            console.log(
                `\n⏳  [${timestamp()}]  Waiting ${BREAK_MS / 1000} seconds before next flow...\n`
            );
            await sleep(BREAK_MS);
        }
    }

    // ── Final summary ───────────────────────────────────────────────────
    banner('📋  Run Summary');
    let allPassed = true;

    results.forEach(({ spec, success, durationSec }, idx) => {
        const icon = success ? '✅' : '❌';
        const status = success ? 'PASSED' : 'FAILED';
        console.log(
            `  ${icon}  Flow ${idx + 1}: ${path.basename(spec).padEnd(45)} ${status}  (${durationSec}s)`
        );
        if (!success) allPassed = false;
    });

    console.log('');
    if (allPassed) {
        console.log('🎉  All flows completed successfully!');
    } else {
        console.log('⚠️   One or more flows had failures. Check the output above for details.');
    }
    console.log('');

    process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
    console.error('\n[run-all-flows] Unexpected error:', err);
    process.exit(1);
});
