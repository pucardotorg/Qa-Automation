#!/bin/bash

echo "Running Application Create Test..."
npx playwright test tests/10.1applicationcreate.spec.js --headed

echo "Running Application Update Test..."
npx playwright test tests/10.2applicationupdate.spec.js --headed

echo "Running Create Demand Test..."
npx playwright test tests/10.3createdemandforapplication.spec.js --headed 