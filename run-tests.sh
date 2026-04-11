#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

ALL_PASSED=true

run_test() {
  TEST_NAME=$1
  TEST_FILE=$2

  echo -e "${CYAN}Running $TEST_NAME...${NC}"

  OUTPUT=$(npm run test:e2e -- "$TEST_FILE" --silent 2>&1)
  STATUS=$?

  if [ $STATUS -eq 0 ]; then
    echo -e "${GREEN}✔ All tests passed in $TEST_NAME${NC}"

    PASSED_TESTS=$(echo "$OUTPUT" | grep -E "✓")
    if [ -n "$PASSED_TESTS" ]; then
      echo "$PASSED_TESTS" | sed 's/^/  - /'
    fi

    echo ""
  else
    ALL_PASSED=false
    echo -e "${RED}✖ Some tests failed in $TEST_NAME${NC}"

    FAILED_TESTS=$(echo "$OUTPUT" | grep -E "● ")
    if [ -n "$FAILED_TESTS" ]; then
      echo -e "${YELLOW}Failed tests:${NC}"
      echo "$FAILED_TESTS" | sed 's/^/  - /'
    fi

    PASSED_TESTS=$(echo "$OUTPUT" | grep -E "✓")
    if [ -n "$PASSED_TESTS" ]; then
      echo -e "${GREEN}Passed tests:${NC}"
      echo "$PASSED_TESTS" | sed 's/^/  - /'
    fi

    echo ""
  fi
}

cd backend || { echo -e "${RED}Backend folder not found!${NC}"; exit 1; }

clear
echo ""

run_test "Auth Test" "test/auth.e2e-spec.ts"
sleep 1

run_test "Microsoft Auth Test" "test/microsoftAuth.e2e-spec.ts"
sleep 1

run_test "Project/Invite Test" "test/project-invite.e2e-spec.ts"
sleep 1

run_test "Password Reset Test" "test/passwordReset.e2e-spec.ts"

echo ""
echo -e "${YELLOW}-----------------------------------${NC}"

if [ "$ALL_PASSED" = true ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
  echo -e "${GREEN}Everything is working perfectly.${NC}"
else
  echo -e "${RED}❌ Some tests failed. Check the failed test list above.${NC}"
fi

echo -e "${YELLOW}-----------------------------------${NC}"

cd ..