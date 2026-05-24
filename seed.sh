#!/bin/bash

# Opens the linked Google Sheet and instructs the developer to seed from the menu.
# BIR Tools > Developer > Load All Sample Data

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "BIR Compliance Toolkit — Seed Test Data"
echo "────────────────────────────────────────"
echo ""
echo -e "  Opening the Google Sheet..."
clasp open-container 2>/dev/null || echo -e "  ${YELLOW}Could not open automatically — open the Sheet manually.${NC}"
echo ""
echo -e "  ${CYAN}In the Sheet, click:${NC}"
echo -e "  ${GREEN}BIR Tools > Developer > Load All Sample Data${NC}"
echo ""
echo -e "  This seeds all 4 sheets (2307, 2317, SLSP, QAP) at once."
echo -e "  Then run Generate from each submenu to test end-to-end output."
echo ""
