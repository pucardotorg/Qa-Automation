/**
 * run-all-flows.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Sequential runner for all 6 end-to-end flow spec files.
 *
 * Execution order:
 *   1 → 1-normaltest.spec.js
 *   2 → 1-normalFullCaseFlow.spec.js
 *   3 → 2-normalFullCaseFlowwith2acc.spec.js
 *   4 → 3-litigentfilecase.spec.js
 *   5 → 4-resubmitCaseFso.spec.js
 *   6 → 5-resubmitCaseFromJudge.spec.js
 *   7 → 6-witnessEvidenceJudgement.spec.js
 *
 * A 30-second pause is inserted between each spec file run.
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
// Extra flags to append to every playwright invocation (exclude bare --headed
// because we control headless via the HEADED env var; other flags pass through)
const EXTRA_FLAGS = RAW_ARGS.filter((a) => a !== '--headed').join(' ');

// Tell playwright.config.js to launch headed when requested
if (IS_HEADED) process.env.HEADED = '1';

/** Ordered list of spec files to run */
const FLOWS = [
    'tests/flows/1-normalFullCaseFlow.spec.js',
    'tests/flows/2-normalFullCaseFlowwith2acc.spec.js',
    'tests/flows/3-litigentfilecase.spec.js',
    'tests/flows/4-resubmitCaseFso.spec.js',
    'tests/flows/5-resubmitCaseFromJudge.spec.js',
    'tests/flows/6-witnessEvidenceJudgement.spec.js',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Pretty-print a separator banner to make console output easier to read.
 * @param {string} label
 */
function banner(label) {
    const line = '═'.repeat(70);
    console.log(`\n${line}`);
    console.log(`  ${label}`);
    console.log(`${line}\n`);
}

/**
 * Return a human-readable HH:MM:SS timestamp string.
 * @returns {string}
 */
function timestamp() {
    return new Date().toLocaleTimeString('en-IN', { hour12: false });
}

/**
 * Sleep for the given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run a single Playwright spec file via `npx playwright test`.
 * All environment variables from the parent process are forwarded so that
 * TEST_ENV, etc. are inherited automatically.
 *
 * @param {string} specRelPath   – relative path from PROJECT_ROOT to the spec
 * @param {number} index         – 1-based flow index (for display only)
 * @returns {{ success: boolean, durationSec: number }}
 */
function runSpec(specRelPath, index) {
    const label = `Flow ${index}/${FLOWS.length} → ${path.basename(specRelPath)}`;
    banner(`▶  ${label}`);
    console.log(`[${timestamp()}]  Starting: ${specRelPath}`);

    const start = Date.now();
    let success = true;

    try {
        const headedFlag = IS_HEADED ? '--headed' : '';
        execSync(
            `npx playwright test ${specRelPath} --reporter=list --retries=0 ${headedFlag} ${EXTRA_FLAGS}`.trimEnd(),
            {
                cwd: PROJECT_ROOT,
                stdio: 'inherit',   // pipe Playwright output directly to this terminal
                env: process.env,   // forward all env vars (TEST_ENV, HEADED, etc.)
            }
        );
    } catch {
        // execSync throws if the exit code is non-zero (i.e. some tests failed).
        // We catch here so the runner can continue with the next flow instead of
        // aborting the entire sequence.
        success = false;
    }

    const durationSec = ((Date.now() - start) / 1000).toFixed(1);
    const status = success ? '✅  PASSED' : '❌  FAILED (some tests may have failed)';
    console.log(`\n[${timestamp()}]  ${status} — completed in ${durationSec}s`);

    return { success, durationSec };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    banner('🚀  Sequential Flow Runner — All Flows (1 → 6)');
    console.log(`Project root : ${PROJECT_ROOT}`);
    console.log(`Environment  : ${process.env.TEST_ENV || 'default'}`);
    console.log(`Mode         : ${IS_HEADED ? '🖥️  Headed (browser visible)' : '🕶️  Headless'}`);
    console.log(`Break between flows : ${BREAK_MS / 1000}s`);
    console.log(`Total flows  : ${FLOWS.length}`);

    const results = [];

    for (let i = 0; i < FLOWS.length; i++) {
        const specPath = FLOWS[i];
        const flowNum = i + 1;

        const result = runSpec(specPath, flowNum);
        results.push({ specPath, ...result });

        // ── 30-second break between flows (skip after the last one) ──────────
        if (i < FLOWS.length - 1) {
            console.log(
                `\n⏳  [${timestamp()}]  Waiting ${BREAK_MS / 1000} seconds before next flow...\n`
            );
            await sleep(BREAK_MS);
        }
    }

    // ── Final summary ────────────────────────────────────────────────────────
    banner('📋  Run Summary');
    let allPassed = true;

    results.forEach(({ specPath, success, durationSec }, idx) => {
        const icon = success ? '✅' : '❌';
        const status = success ? 'PASSED' : 'FAILED';
        console.log(
            `  ${icon}  Flow ${idx + 1}: ${path.basename(specPath).padEnd(45)} ${status}  (${durationSec}s)`
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

    // Exit with non-zero code if any flow failed, so CI pipelines can detect it.
    process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
    console.error('\n[run-all-flows] Unexpected error:', err);
    process.exit(1);
});
