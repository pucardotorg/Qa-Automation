#!/bin/bash

set -euo pipefail

# Respect external TEST_ENV if set; otherwise default to qa
TEST_ENV=${TEST_ENV:-qa}
export TEST_ENV
echo "[run-all-tests] Using TEST_ENV=$TEST_ENV"

# Array of test files in order
tests=(
    "tests/0.citizenauthtoken.spec.js"
    "tests/0.litigentauthtoken.spec.js"
    "tests/0.litigentusersearch.spec.js"
    "tests/1.advocateusersearch.spec.js"
    "tests/1.advocatevindividual.spec.js"
    "tests/1.advocatevuserid.spec.js"
    "tests/1.casecreate.spec.js"
    "tests/1.caselitigantupdate.spec.js"
    "tests/2.caseupdatefromdraft.spec.js"
    "tests/3.caseupdatesign.spec.js"
    "tests/4.1caseupdatesigned.spec.js"
    "tests/4.2.createdemand.spec.js"
    "tests/5.1nayamitraauthtoken.spec.js"
    "tests/5.fetchbill.spec.js"   
    "tests/6.collectionservicewithsearchbill.spec.js"
    "tests/7.1fsoauthtoken.spec.js"
    "tests/7.FSOcasesubmit.spec.js"
    "tests/8.1judgeauthtoken.spec.js"
    "tests/8.2judgeregistercase.spec.js"
    "tests/8.3casesearch.spec.js"
    "tests/9.1createorder.spec.js"
    "tests/9.1ordersearch.spec.js"
    "tests/9.2updateorderhearing.spec.js"
    "tests/9.3hearingsearch.spec.js"
    "tests/10.1applicationcreate.spec.js"
    "tests/10.2applicationupdate.spec.js"
    "tests/10.3createdemandforapplication.spec.js"
    "tests/10.4fetchbillapplication.spec.js"
    "tests/10.5collectionpaymentapplication.spec.js"
    "tests/evidence1.spec.js"
    "tests/evidence2.spec.js"
    "tests/evidence3.spec.js"
    "tests/evidence4.spec.js"
    "tests/evidence5.spec.js"
    "tests/evidence6.spec.js"
    "tests/11.1evidencesearch.spec.js"
)

# Run each test with a 1-second gap
for test in "${tests[@]}"; do
    echo "Running test: $test"
    # Forward any CLI args (e.g., --workers=1) to Playwright to ensure flags are honored
    npx playwright test -c ../playwright.config.js "$test" --headed "$@"
    echo "Waiting 1 second before next test..."
    sleep 1
done

echo "All tests completed!" 