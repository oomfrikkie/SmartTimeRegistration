#!/bin/bash
set -o pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

ALL_PASSED=true

cd backend || { echo -e "${RED}Backend folder not found!${NC}"; exit 1; }

ensure_backend_dependencies() {
  if [ ! -d node_modules ] || [ ! -f node_modules/jest/bin/jest.js ] || [ ! -d node_modules/ts-jest ]; then
    echo -e "${YELLOW}Backend dependencies are missing. Installing with npm install...${NC}"
    npm install --no-audit --no-fund
    INSTALL_CODE=$?
    if [ $INSTALL_CODE -ne 0 ]; then
      echo -e "${RED}Dependency installation failed (exit code $INSTALL_CODE).${NC}"
      cd ..
      exit 1
    fi
  fi
}

ensure_backend_dependencies

JEST_BIN="./node_modules/jest/bin/jest.js"

if [ ! -f "$JEST_BIN" ]; then
  echo -e "${RED}Local Jest binary not found after install attempt.${NC}"
  cd ..
  exit 1
fi

if [ ! -d test ]; then
  echo -e "${RED}No test folder found in backend/${NC}"
  cd ..
  exit 1
fi

TEST_FILES=$(find test -name "*.e2e-spec.ts" | sort)

if [ -z "$TEST_FILES" ]; then
  echo -e "${RED}No e2e test files found.${NC}"
  cd ..
  exit 1
fi

echo ""
echo -e "${CYAN}Running all e2e files...${NC}"
echo ""

run_test_file() {
  TEST_FILE="$1"
  RESULT_JSON=".jest-result-$(echo "$TEST_FILE" | tr '/\\' '-').json"
  RESULT_LOG=".jest-log-$(echo "$TEST_FILE" | tr '/\\' '-').log"

  echo -e "${CYAN}File: $TEST_FILE${NC}"

  rm -f "$RESULT_JSON" "$RESULT_LOG"

  # Use local project Jest directly so we always run with local ts-jest and config.
  node "$JEST_BIN" --config ./jest-e2e.json "$TEST_FILE" --runInBand --forceExit --json --outputFile="$RESULT_JSON" --silent 2>&1 | tee "$RESULT_LOG"
  FILE_EXIT_CODE=${PIPESTATUS[0]}

  if [ ! -f "$RESULT_JSON" ]; then
    ALL_PASSED=false
    echo -e "${RED}  Could not read Jest JSON output for $TEST_FILE${NC}"
    if [ -f "$RESULT_LOG" ]; then
      echo -e "${YELLOW}  Last runner output:${NC}"
      sed -n '1,25p' "$RESULT_LOG" | sed 's/^/    /'
    fi
    echo -e "${YELLOW}  File exit status code: ${FILE_EXIT_CODE}${NC}"
    echo ""
    rm -f "$RESULT_LOG"
    return
  fi

  # Print each individual test result from the file.
  node - "$RESULT_JSON" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const suites = data.testResults || [];

for (const suite of suites) {
  const assertions = suite.assertionResults || [];
  for (const test of assertions) {
    const rawStatus = String(test.status || 'unknown').toLowerCase();
    const status = rawStatus.toUpperCase();
    const statusCodeMap = {
      passed: 0,
      failed: 1,
      pending: 2,
      todo: 3,
      unknown: 9,
    };
    const statusCode = statusCodeMap[rawStatus] ?? 9;
    const title = test.fullName || test.title || '(unnamed test)';
    console.log(`  [${status}] [code=${statusCode}] ${title}`);
  }
}
NODE

  if [ $FILE_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}  File result: PASS${NC}"
  else
    ALL_PASSED=false
    echo -e "${RED}  File result: FAIL${NC}"
  fi

  echo -e "${YELLOW}  File exit status code: ${FILE_EXIT_CODE}${NC}"
  echo ""

  rm -f "$RESULT_JSON"
  rm -f "$RESULT_LOG"
}

for TEST_FILE in $TEST_FILES; do
  run_test_file "$TEST_FILE"
done

echo -e "${YELLOW}-----------------------------------${NC}"

if [ "$ALL_PASSED" = true ]; then
  echo -e "${GREEN}ALL E2E TESTS PASSED${NC}"
  cd ..
  exit 0
else
  echo -e "${RED}Some e2e tests failed${NC}"
  cd ..
  exit 1
fi