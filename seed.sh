#!/bin/bash

# Seed all BIR Toolkit sheets with sample test data.
# Usage:
#   ./seed.sh          — seed all 4 sheets
#   ./seed.sh 2307     — seed only Form 2307
#   ./seed.sh 2317     — seed only Form 2317
#   ./seed.sh slsp     — seed only SLSP
#   ./seed.sh qap      — seed only QAP

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Read parentId from .clasp.json
PARENT_ID=$(python3 -c "import json; d=json.load(open('.clasp.json')); print(d['parentId'])" 2>/dev/null)

if [ -z "$PARENT_ID" ]; then
  echo -e "${RED}Error: parentId not set in .clasp.json${NC}"
  echo -e "Add your Sheet file ID to .clasp.json as \"parentId\"."
  exit 1
fi

echo ""
echo "BIR Compliance Toolkit — Seed Test Data"
echo "────────────────────────────────────────"

# Pass the spreadsheet ID to the script before running any seed function
echo -n "  Initializing config... "
clasp run-function initConfig --params "[\"${PARENT_ID}\"]"
echo -e "${GREEN}done${NC}"

run_seed() {
  local fn=$1
  local label=$2
  echo -n "  Seeding ${label}... "
  if clasp run-function "$fn"; then
    echo -e "${GREEN}done${NC}"
  else
    echo -e "${RED}failed${NC}"
    echo -e "  ${YELLOW}Tip: Make sure the '${label}' sheet exists. Run its Setup function first from BIR Tools menu.${NC}"
    return 1
  fi
}

TARGET=${1:-all}

case "$TARGET" in
  2307) run_seed loadSample2307Data "Form 2307" ;;
  2317) run_seed loadSample2317Data "Form 2317" ;;
  slsp|SLSP) run_seed loadSampleSLSPData "SLSP" ;;
  qap|QAP)   run_seed loadSampleQAPData  "QAP"  ;;
  all)
    run_seed loadSample2307Data "Form 2307"
    run_seed loadSample2317Data "Form 2317"
    run_seed loadSampleSLSPData "SLSP"
    run_seed loadSampleQAPData  "QAP"
    ;;
  *)
    echo "Unknown target: $TARGET"
    echo "Usage: ./seed.sh [2307|2317|slsp|qap|all]"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}Done. Open the Google Sheet and run Generate to test.${NC}"
echo ""
