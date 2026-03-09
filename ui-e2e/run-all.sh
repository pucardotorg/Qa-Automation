#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# run-all.sh — Convenience wrapper for the sequential flow runner
#
# Usage (from ui-e2e/ directory):
#   ./run-all.sh               → runs all 6 flows, demo env, headless
#   ./run-all.sh --env=qa      → runs on QA environment
#   ./run-all.sh --headed      → opens browser (local debugging)
#   ./run-all.sh --env=demo --headed
#
# The script:
#   1. Stays inside ui-e2e/ (no need to cd manually)
#   2. Passes TEST_ENV through to both the Excel loader and Playwright
#   3. Streams live output to the terminal
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Parse args ────────────────────────────────────────────────────────────────
ENV="demo"
EXTRA_ARGS=""

for arg in "$@"; do
  case "$arg" in
    --env=*)  ENV="${arg#--env=}" ;;
    --headed) EXTRA_ARGS="$EXTRA_ARGS --headed" ;;
    *)        EXTRA_ARGS="$EXTRA_ARGS $arg" ;;
  esac
done

# ── Run ───────────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  run-all.sh  |  env=$ENV"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Always execute from the ui-e2e/ directory so relative paths are correct
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TEST_ENV="$ENV" node "$SCRIPT_DIR/tests/flows/run-all-flows.js" $EXTRA_ARGS
