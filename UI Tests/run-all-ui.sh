#!/bin/bash
#set -euo pipefail

# Usage examples:
#   ./run-all-ui.sh                                  # uses TEST_ENV if set, else qa; runs all flows 1..7
#   TEST_ENV=dev ./run-all-ui.sh --headed --workers=1  # merges from global-variablesdev.json then runs all flows

# Resolve environment (case-insensitive) from TEST_ENV only
ENV_RAW=${TEST_ENV:-qa}
ENV_LC=$(echo "$ENV_RAW" | tr '[:upper:]' '[:lower:]')

# Defaults
PLAYWRIGHT_FLAGS=("$@")

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR"

echo "[run-all-ui] Using TEST_ENV=$ENV_RAW (resolved: $ENV_LC)"

# Export normalized TEST_ENV for child processes (ui-global-setup and Playwright)
export TEST_ENV="$ENV_LC"

# Merge env-specific overrides into global-variables.json
node ui-global-setup.js || { echo "[run-all-ui] ui-global-setup failed"; exit 1; }

# Define the ordered list of folders to run sequentially
FOLDERS=(
  "tests/1-Normal"
  "tests/2-TwoComp"
  "tests/3-TwoCompTwoAdv"
  "tests/4-FiledFromLit"
  "tests/6-ResubmitCaseFSO"
  "tests/7-JudgeReSubmitCase"
)

echo "[run-all-ui] Running folders in sequence:"
printf ' - %s\n' "${FOLDERS[@]}"

# Run each folder sequentially with provided Playwright flags
for folder in "${FOLDERS[@]}"; do
  if [ ! -d "$folder" ]; then
    echo "[run-all-ui] Skipping missing folder: $folder"
    continue
  fi
   echo "[run-all-ui] Running folder: $folder"
npx playwright test "$folder" "${PLAYWRIGHT_FLAGS[@]}" --workers=1 --max-failures=1
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "[run-all-ui] ❌ Tests failed in folder: $folder"
  echo "[run-all-ui] ➜ Stopping further tests inside this folder"
  echo "[run-all-ui] ➜ Moving to next folder"
  continue
fi

echo "[run-all-ui] ✅ Completed folder: $folder"
echo "[run-all-ui] Waiting 1 second before next folder..."
sleep 1

done

echo "[run-all-ui] All UI test folders completed."
