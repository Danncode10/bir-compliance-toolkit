#!/bin/bash

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

# ─── ASCII Header ─────────────────────────────────────────────────────────────
show_header() {
    clear
    echo -e "${BLUE}${BOLD}"
    cat << "EOF"
  ____  ___ ____     ____                      _ _
 | __ )|_ _|  _ \   / ___|___  _ __ ___  _ __ | (_) __ _ _ __   ___ ___
 |  _ \ | || |_) | | |   / _ \| '_ ` _ \| '_ \| | |/ _` | '_ \ / __/ _ \
 | |_) || ||  _ <  | |__| (_) | | | | | | |_) | | | (_| | | | | (_|  __/
 |____/___|_| \_\   \____\___/|_| |_| |_| .__/|_|_|\__,_|_| |_|\___\___|
                                         |_|
  T o o l k i t
EOF
    echo -e "${NC}"
    echo -e "${CYAN}Google Apps Script · Philippine BIR Tax Automation${NC}"
    echo -e "${MAGENTA}OJT Project — FullSuite · Lester Dann G. Lopez · 2026${NC}\n"
}

# ─── Footer helper ────────────────────────────────────────────────────────────
step_footer() {
    # Skip interactive prompt when output is not a terminal (piped/redirected)
    [ ! -t 1 ] && return
    echo ""
    echo -e "  Press ${YELLOW}Enter${NC} to return to main menu…"
    read -r < /dev/tty
    show_main
}

# ─── Interactive Main Menu ─────────────────────────────────────────────────────
show_main() {
    local labels=(
        "Step 1: Install clasp & login to Google"
        "Step 2: Configure .clasp.json (link to Google Apps Script)"
        "Step 3: Push source files to Google Apps Script"
        "Step 4: Test generators in Google Sheets"
        "Step 5: Understand the BIR validation rules"
    )
    local count=${#labels[@]}
    local selected=0

    while true; do
        show_header
        echo -e "${BOLD}Setup Guide${NC}"
        echo -e "Use ${CYAN}↑ ↓${NC} to navigate  ${GREEN}Enter${NC} to open  ${YELLOW}q${NC} to quit\n"

        for i in "${!labels[@]}"; do
            if [ "$i" -eq "$selected" ]; then
                echo -e "  ${GREEN}${BOLD}› ${labels[$i]}${NC}"
            else
                echo -e "    ${labels[$i]}"
            fi
        done

        echo ""
        echo -e "Other commands:"
        echo -e "  ${CYAN}./guide.sh commands${NC}      — List all Claude slash commands"
        echo -e "  ${CYAN}./guide.sh workflow${NC}      — Show the BIR dev loop"
        echo -e "  ${CYAN}./guide.sh generators${NC}    — Check implementation status of all generators"
        echo -e "  ${CYAN}./guide.sh vibe-check${NC}    — Quick project health check"
        echo -e "  ${CYAN}clasp push${NC}               — Upload src/ to Google Apps Script"

        IFS= read -rsn1 key < /dev/tty
        if [[ "$key" == $'\x1b' ]]; then
            read -rsn2 key < /dev/tty
            case "$key" in
                '[A') ((selected--)); [ "$selected" -lt 0 ] && selected=$((count - 1)) ;;
                '[B') ((selected++)); [ "$selected" -ge "$count" ] && selected=0 ;;
            esac
        elif [[ "$key" == '' ]]; then
            case "$selected" in
                0) show_clasp ;;
                1) show_config ;;
                2) show_push ;;
                3) show_test ;;
                4) show_bir_rules ;;
            esac
        elif [[ "$key" == 'q' || "$key" == 'Q' ]]; then
            clear; break
        fi
    done
}

# ─── Step 1: Install clasp ────────────────────────────────────────────────────
show_clasp() {
    show_header
    echo -e "${BOLD}Step 1 — Install clasp & Login to Google${NC}\n"

    echo -e "${BOLD}1. Install Node.js (if not installed)${NC}"
    echo -e "   Download from ${CYAN}https://nodejs.org${NC}\n"

    echo -e "${BOLD}2. Install clasp globally${NC}"
    echo -e "   ${CYAN}npm install -g @google/clasp${NC}\n"

    echo -e "${BOLD}3. Verify installation${NC}"
    echo -e "   ${CYAN}clasp --version${NC}\n"

    echo -e "${BOLD}4. Login to your Google account${NC}"
    echo -e "   ${CYAN}clasp login${NC}"
    echo -e "   This opens a browser window. Log in and allow permissions.\n"

    if command -v clasp &>/dev/null; then
        local ver
        ver=$(clasp --version 2>/dev/null)
        echo -e "  ${GREEN}✅ clasp is already installed:${NC} ${CYAN}${ver}${NC}\n"
    else
        echo -e "  ${YELLOW}⚠️  clasp not found — run: ${CYAN}npm install -g @google/clasp${NC}\n"
    fi

    step_footer
}

# ─── Step 2: Configure .clasp.json ───────────────────────────────────────────
show_config() {
    show_header
    echo -e "${BOLD}Step 2 — Configure .clasp.json${NC}\n"

    echo -e "The ${CYAN}.clasp.json${NC} file links this local repo to your Google Apps Script project."
    echo -e "It is ${RED}git-ignored${NC} — never commit it. Use ${CYAN}.clasp.json.example${NC} as the template.\n"

    echo -e "${BOLD}Option A — Create a brand-new Google Apps Script project:${NC}"
    echo -e "   ${CYAN}clasp create --title \"BIR Compliance Toolkit\" --type sheets${NC}"
    echo -e "   This creates a new Sheet + Script and writes .clasp.json automatically.\n"

    echo -e "${BOLD}Option B — Link to an existing project:${NC}"
    echo -e "   1. Copy the template:  ${CYAN}cp .clasp.json.example .clasp.json${NC}"
    echo -e "   2. Open the Apps Script project in the browser"
    echo -e "   3. Go to ${YELLOW}Project Settings → Script ID${NC}"
    echo -e "   4. Paste the Script ID into .clasp.json:\n"
    echo -e "   ${CYAN}{\"scriptId\": \"YOUR_SCRIPT_ID_HERE\", \"rootDir\": \"./src\"}${NC}\n"

    if [ -f .clasp.json ]; then
        echo -e "  ${GREEN}✅ .clasp.json exists${NC}"
        local sid
        sid=$(python3 -c "import json,sys; d=json.load(open('.clasp.json')); print(d.get('scriptId',''))" 2>/dev/null)
        if [ "$sid" = "YOUR_SCRIPT_ID_HERE" ] || [ -z "$sid" ]; then
            echo -e "  ${YELLOW}⚠️  Script ID not set yet — update the scriptId field${NC}\n"
        else
            echo -e "  ${GREEN}✅ Script ID: ${CYAN}${sid:0:20}…${NC}\n"
        fi
    else
        echo -e "  ${YELLOW}⚠️  .clasp.json not found — run Option A or B above${NC}\n"
    fi

    step_footer
}

# ─── Step 3: Push to Google Apps Script ──────────────────────────────────────
show_push() {
    show_header
    echo -e "${BOLD}Step 3 — Push to Google Apps Script${NC}\n"

    echo -e "${BOLD}Upload all src/ files to Google Apps Script:${NC}"
    echo -e "   ${CYAN}clasp push${NC}\n"

    echo -e "Expected output:"
    echo -e "   ${GREEN}└─ src/onOpen.gs${NC}"
    echo -e "   ${GREEN}└─ src/generate2307.gs${NC}"
    echo -e "   ${GREEN}└─ src/generate2317.gs${NC}"
    echo -e "   ${GREEN}└─ src/generateSLSP.gs${NC}"
    echo -e "   ${GREEN}└─ src/generateQAP.gs${NC}"
    echo -e "   ${GREEN}└─ src/utils.gs${NC}\n"

    echo -e "${BOLD}Open the linked Google Sheet:${NC}"
    echo -e "   ${CYAN}clasp open-container${NC}\n"

    echo -e "${BOLD}Open the Apps Script editor:${NC}"
    echo -e "   ${CYAN}clasp open-script${NC}\n"

    echo -e "${BOLD}Pull changes from Apps Script back to local:${NC}"
    echo -e "   ${CYAN}clasp pull${NC}\n"

    echo -e "${BOLD}Every time you edit code:${NC}"
    echo -e "   ${CYAN}clasp push${NC}  → test in Sheet  → ${CYAN}git commit${NC}\n"

    local gs_count
    gs_count=$(find src -name "*.gs" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  ${GREEN}✅ Source files in src/:${NC} ${CYAN}${gs_count} .gs files${NC}\n"

    step_footer
}

# ─── Step 4: Test in Google Sheets ───────────────────────────────────────────
show_test() {
    show_header
    echo -e "${BOLD}Step 4 — Test Generators in Google Sheets${NC}\n"

    echo -e "${BOLD}After ${CYAN}clasp push${NC}, open the linked Google Sheet and reload it.${NC}\n"

    echo -e "${BOLD}Testing each generator:${NC}"
    echo ""
    echo -e "  ${CYAN}Form 2307${NC} (Certificate of Creditable Tax Withheld)"
    echo -e "    1. BIR Tools → Form 2307 → Setup Form 2307 Sheet"
    echo -e "    2. Fill in Payor/Payee info and at least one income row"
    echo -e "    3. BIR Tools → Form 2307 → Generate 2307 PDF"
    echo -e "    4. Check Google Drive for the PDF\n"

    echo -e "  ${CYAN}Form 2317${NC} (Certificate of Compensation Payment)"
    echo -e "    1. BIR Tools → Form 2317 → Setup Form 2317 Sheet"
    echo -e "    2. Fill in Employer/Employee info and compensation fields"
    echo -e "    3. BIR Tools → Form 2317 → Generate 2317 PDF"
    echo -e "    4. Check Google Drive for the PDF\n"

    echo -e "  ${CYAN}SLSP${NC} (Summary List of Sales and Purchases)"
    echo -e "    1. BIR Tools → SLSP → Setup SLSP Sheet"
    echo -e "    2. Fill in Company TIN, Year, Quarter, and transaction rows"
    echo -e "    3. BIR Tools → SLSP → Generate SLSP DAT File"
    echo -e "    4. Check Google Drive for the .DAT file\n"

    echo -e "  ${CYAN}QAP${NC} (Quarterly Alphalist of Payees)"
    echo -e "    1. BIR Tools → QAP → Setup QAP Sheet"
    echo -e "    2. Fill in Company TIN, Year, Quarter, and payee rows"
    echo -e "    3. BIR Tools → QAP → Generate QAP DAT File"
    echo -e "    4. Check Google Drive for the .DAT file\n"

    echo -e "${BOLD}Sample data:${NC}"
    echo -e "   ${CYAN}templates/sample-slsp.csv${NC} — SLSP test data"
    echo -e "   ${CYAN}templates/sample-qap.csv${NC}  — QAP test data\n"

    step_footer
}

# ─── Step 5: BIR Validation Rules ─────────────────────────────────────────────
show_bir_rules() {
    show_header
    echo -e "${BOLD}Step 5 — BIR Validation Rules${NC}\n"

    echo -e "${BOLD}Field Rules${NC} (enforced by every generator before output):\n"
    printf "  %-35s %s\n" "Field" "Rule"
    printf "  %-35s %s\n" "─────────────────────────────────" "──────────────────────────────────────"
    printf "  ${CYAN}%-35s${NC} %s\n" "TIN" "9 or 12 digits · XXX-XXX-XXX or XXX-XXX-XXX-XXX"
    printf "  ${CYAN}%-35s${NC} %s\n" "Amount" "Positive number · max 2 decimal places"
    printf "  ${CYAN}%-35s${NC} %s\n" "VAT Amount (SLSP)" "Exactly 12% of VATable gross (±₱0.02)"
    printf "  ${CYAN}%-35s${NC} %s\n" "Tax Withheld (QAP)" "Amount × EWT Rate (±₱0.02 tolerance)"
    printf "  ${CYAN}%-35s${NC} %s\n" "Non-taxable 13th Month (2317)" "Cannot exceed ₱90,000"
    printf "  ${CYAN}%-35s${NC} %s\n" "Nature Code (SLSP)" "SI · OR · DR · CN · DM · CD"
    printf "  ${CYAN}%-35s${NC} %s\n" "EWT Rate (QAP)" "1% · 2% · 5% · 10% · 15%"

    echo ""
    echo -e "${BOLD}DAT Output Format${NC}\n"
    echo -e "  ${CYAN}SLSP:${NC}"
    echo -e "    SLS|[TIN]|[YEAR]|[QTR]|"
    echo -e "    D|[BUYER_TIN]|[NAME]|[NATURE]|[GROSS]|[VAT]|[EXEMPT]|[ZERO]|"
    echo -e "    SLP|[TIN]|[YEAR]|[QTR]|"
    echo -e "    D|[SELLER_TIN]|[NAME]|[NATURE]|[GROSS]|[VAT]|[EXEMPT]|[ZERO]|\n"
    echo -e "  ${CYAN}QAP:${NC}"
    echo -e "    MAP|[TIN]|[YEAR]|[QTR]|"
    echo -e "    D|[PAYEE_TIN]|[NAME]|[ATC]|[AMOUNT]|[RATE]|[TAX_WITHHELD]|\n"
    echo -e "  Note: TINs in DAT files are ${YELLOW}digits only${NC} (dashes stripped)\n"

    echo -e "📖 Full rules in ${BLUE}CLAUDE.md${NC} and ${BLUE}docs/PROJECT_OVERVIEW.md${NC}"

    step_footer
}

# ─── Commands Browser ─────────────────────────────────────────────────────────
show_commands() {
    show_header
    echo -e "${BOLD}🤖 Claude Code Slash Commands${NC}\n"

    local commands_dir=".claude/commands"
    if [ ! -d "$commands_dir" ]; then
        echo -e "${RED}No .claude/commands/ directory found.${NC}\n"
        echo -e "Run ${CYAN}mkdir -p .claude/commands${NC} and add command .md files.\n"
        step_footer
        return
    fi

    # Category assignment for each command name
    get_category() {
        case "$1" in
            make-command)                        echo "1|🚀 Developer Tools" ;;
            new-generator)                       echo "2|🧱 Scaffolding" ;;
            validate-bir)                        echo "3|🛡️  BIR Compliance" ;;
            gen-user-docs|gen-dev-docs)          echo "4|📚 Documentation" ;;
            *)                                   echo "9|📦 Other" ;;
        esac
    }

    # Terminal width — capped 80–140
    local term_width
    term_width=$(tput cols 2>/dev/null || echo 100)
    [ "$term_width" -lt 80 ]  && term_width=80
    [ "$term_width" -gt 140 ] && term_width=140

    local lw=30
    local rw=$(( term_width - lw - 7 ))
    local total_inner=$(( lw + rw + 3 ))

    # Build box-drawing lines
    local h_top h_mid h_bot h_split
    h_top="┌$(printf '─%.0s' $(seq 1 $((lw+2))))┬$(printf '─%.0s' $(seq 1 $((rw+2))))┐"
    h_mid="├$(printf '─%.0s' $(seq 1 $((lw+2))))┼$(printf '─%.0s' $(seq 1 $((rw+2))))┤"
    h_bot="└$(printf '─%.0s' $(seq 1 $((lw+2))))┴$(printf '─%.0s' $(seq 1 $((rw+2))))┘"
    h_split="├$(printf '─%.0s' $(seq 1 $((total_inner+2))))┤"

    wrap_text()  { echo "$1" | fold -s -w "$2"; }
    pad_right()  { printf "%-${2}s" "$1"; }

    print_row() {
        local left="$1" right="$2"
        local left_lines=() right_lines=()
        while IFS= read -r line; do left_lines+=("$line"); done < <(wrap_text "$left" "$lw")
        while IFS= read -r line; do right_lines+=("$line"); done < <(wrap_text "$right" "$rw")
        local max=$(( ${#left_lines[@]} > ${#right_lines[@]} ? ${#left_lines[@]} : ${#right_lines[@]} ))
        for (( i=0; i<max; i++ )); do
            local l="${left_lines[$i]:-}" r="${right_lines[$i]:-}"
            local pl pr
            pl=$(pad_right "$l" "$lw")
            pr=$(pad_right "$r" "$rw")
            if [ "$i" -eq 0 ] && [ -n "$l" ]; then
                echo -e "${CYAN}│${NC} ${CYAN}${BOLD}${pl}${NC} ${CYAN}│${NC} ${pr} ${CYAN}│${NC}"
            else
                echo -e "${CYAN}│${NC} ${CYAN}${pl}${NC} ${CYAN}│${NC} ${pr} ${CYAN}│${NC}"
            fi
        done
    }

    print_section_header() {
        local label padded
        padded=$(pad_right " $1" "$total_inner")
        echo -e "${CYAN}│${NC}${BOLD}${padded}${NC}${CYAN}│${NC}"
    }

    # Collect all commands from .md files
    local cmd_list="" total_count=0
    for file in "$commands_dir"/*.md; do
        [ -e "$file" ] || continue
        local name
        name=$(basename "$file" .md)
        [ "$name" = "README" ] && continue

        local description argument_hint
        description=$(awk '/^---$/{f=!f;next} f && /^description:/{sub(/^description:[ ]*/,"");print;exit}' "$file")
        argument_hint=$(awk '/^---$/{f=!f;next} f && /^argument-hint:/{sub(/^argument-hint:[ ]*/,"");print;exit}' "$file")

        local cat_full sort_key cat_label
        cat_full=$(get_category "$name")
        sort_key="${cat_full%%|*}"
        cat_label="${cat_full#*|}"

        cmd_list="${cmd_list}${sort_key}|${cat_label}|${name}|${description}|${argument_hint}"$'\n'
        total_count=$((total_count + 1))
    done

    local sorted
    sorted=$(echo "$cmd_list" | sort -t'|' -k1,1n -k3,3)

    # Render grouped tables
    local prev_cat="" pending_rows="" pending_label=""

    flush_table() {
        [ -z "$pending_label" ] && return
        echo -e "${CYAN}${h_top}${NC}"
        print_section_header "$pending_label"
        echo -e "${CYAN}${h_mid}${NC}"
        local first=1
        while IFS=$'\x1f' read -r left right; do
            [ -z "$left$right" ] && continue
            [ "$first" -eq 0 ] && echo -e "${CYAN}${h_mid}${NC}"
            print_row "$left" "$right"
            first=0
        done <<< "$pending_rows"
        echo -e "${CYAN}${h_bot}${NC}"
        echo ""
        pending_rows=""
        pending_label=""
    }

    while IFS='|' read -r sort_key cat_label name description argument_hint _; do
        [ -z "$name" ] && continue
        if [ "$cat_label" != "$prev_cat" ]; then
            flush_table
            prev_cat="$cat_label"
            pending_label="$cat_label"
        fi
        local display_name="/$name"
        [ -n "$argument_hint" ] && display_name="/$name $argument_hint"
        local desc_with_hint="$description"
        pending_rows="${pending_rows}${display_name}"$'\x1f'"${desc_with_hint}"$'\n'
    done <<< "$sorted"
    flush_table

    echo -e "  ${CYAN}${total_count}${NC} command(s) found in ${CYAN}.claude/commands/${NC}\n"
    echo -e "  Usage in Claude Code: type ${CYAN}/<command-name>${NC} and press Enter."
    echo -e "  Use ${CYAN}/make-command <description>${NC} to create new commands.\n"

    step_footer
}

# ─── Workflow ─────────────────────────────────────────────────────────────────
show_workflow() {
    show_header
    echo -e "${BOLD}🔄 BIR Dev Loop${NC}\n"

    echo -e "${BOLD}Start each Claude session with:${NC}"
    echo -e "${CYAN}──────────────────────────────────────────────────${NC}"
    echo -e "Read CLAUDE.md before doing anything. Then show"
    echo -e "me the status of all four BIR generators."
    echo -e "${CYAN}──────────────────────────────────────────────────${NC}\n"

    echo -e "${BOLD}Implement a generator:${NC}"
    echo -e "  1. ${CYAN}Implement${NC} → write the 3 functions in src/generate<Form>.gs"
    echo -e "  2. ${CYAN}clasp push${NC} → upload to Google Apps Script"
    echo -e "  3. Test in Google Sheets manually"
    echo -e "  4. ${CYAN}/validate-bir <name>${NC} → audit BIR compliance rules"
    echo -e "  5. ${CYAN}/gen-user-docs <name>${NC} → write/update user guide"
    echo -e "  6. ${CYAN}/gen-dev-docs <name>${NC} → write/update developer docs"
    echo -e "  7. ${CYAN}git commit${NC}\n"

    echo -e "${BOLD}Create a new generator from scratch:${NC}"
    echo -e "  ${CYAN}/new-generator <form-name>${NC} → scaffold + wire menu"
    echo -e "  → /validate-bir → /gen-user-docs → /gen-dev-docs → git commit\n"

    echo -e "${BOLD}Add a new Claude command:${NC}"
    echo -e "  ${CYAN}/make-command <description of what it should do>${NC}\n"

    echo -e "${BOLD}Commands quick reference:${NC}"
    echo -e "  ${CYAN}/new-generator${NC}    → scaffold a new BIR form generator"
    echo -e "  ${CYAN}/validate-bir${NC}     → audit BIR compliance rules"
    echo -e "  ${CYAN}/gen-user-docs${NC}    → write/update docs/HOW_TO_USE.md section"
    echo -e "  ${CYAN}/gen-dev-docs${NC}     → write/update docs/PROJECT_OVERVIEW.md section"
    echo -e "  ${CYAN}/make-command${NC}     → create a new Claude slash command\n"

    echo -e "📖 Full reference: ${BLUE}CLAUDE.md${NC} and ${BLUE}.claude/commands/README.md${NC}"
    step_footer
}

# ─── Generator Status ─────────────────────────────────────────────────────────
show_generators() {
    show_header
    echo -e "${BOLD}📋 BIR Generator Status${NC}\n"

    check_generator() {
        local name="$1" file="$2"
        if [ ! -f "$file" ]; then
            echo -e "  ${RED}❌ $name${NC} — file not found: ${CYAN}$file${NC}"
            return
        fi

        # Check for stub (file contains TODO)
        if grep -q "// TODO" "$file"; then
            echo -e "  ${YELLOW}⚠️  $name${NC} — stub (not yet implemented)"
            return
        fi

        # Count functions defined
        local fn_count
        fn_count=$(grep -c "^function " "$file" 2>/dev/null || echo 0)

        # Check for the 3 required functions
        local has_generate has_setup has_builder
        has_generate=$(grep -c "^function generate" "$file" 2>/dev/null || echo 0)
        has_setup=$(grep -c "^function setup" "$file" 2>/dev/null || echo 0)
        has_builder=$(grep -cE "^function build" "$file" 2>/dev/null || echo 0)

        if [ "$has_generate" -ge 1 ] && [ "$has_setup" -ge 1 ] && [ "$has_builder" -ge 1 ]; then
            echo -e "  ${GREEN}✅ $name${NC} — implemented (${fn_count} functions · generate + setup + builder)"
        else
            echo -e "  ${YELLOW}⚠️  $name${NC} — incomplete (missing required functions)"
            [ "$has_generate" -eq 0 ] && echo -e "       ${RED}missing: generate<Form>()${NC}"
            [ "$has_setup" -eq 0 ]    && echo -e "       ${RED}missing: setup<Form>Sheet()${NC}"
            [ "$has_builder" -eq 0 ]  && echo -e "       ${RED}missing: build<Form>Html/Dat()${NC}"
        fi
    }

    check_generator "Form 2307 (Certificate of Creditable Tax Withheld)"  "src/generate2307.gs"
    check_generator "Form 2317 (Certificate of Compensation / Tax Withheld)" "src/generate2317.gs"
    check_generator "SLSP DAT  (Summary List of Sales and Purchases)"     "src/generateSLSP.gs"
    check_generator "QAP  DAT  (Quarterly Alphalist of Payees)"           "src/generateQAP.gs"

    echo ""
    echo -e "${BOLD}Menu wiring (src/onOpen.gs):${NC}"
    if [ -f src/onOpen.gs ]; then
        local menu_count
        menu_count=$(grep -c "addSubMenu\|addItem" src/onOpen.gs 2>/dev/null || echo 0)
        echo -e "  ${GREEN}✅ onOpen.gs${NC} found — ${CYAN}${menu_count}${NC} menu entries"
    else
        echo -e "  ${RED}❌ src/onOpen.gs not found${NC}"
    fi

    echo ""
    echo -e "${BOLD}Utilities (src/utils.gs):${NC}"
    if [ -f src/utils.gs ]; then
        local util_count
        util_count=$(grep -c "^function " src/utils.gs 2>/dev/null || echo 0)
        echo -e "  ${GREEN}✅ utils.gs${NC} found — ${CYAN}${util_count}${NC} shared functions"
    else
        echo -e "  ${RED}❌ src/utils.gs not found${NC}"
    fi

    echo ""
    echo -e "  Run ${CYAN}/validate-bir all${NC} in Claude Code for a deep BIR compliance audit."
    step_footer
}

# ─── Vibe Check ───────────────────────────────────────────────────────────────
show_vibe_check() {
    show_header
    echo -e "${BOLD}🔍 Project Health Check${NC}\n"

    local all_good=1

    # clasp installed?
    if command -v clasp &>/dev/null; then
        echo -e "  ${GREEN}✅ clasp${NC} installed: $(clasp --version 2>/dev/null)"
    else
        echo -e "  ${RED}❌ clasp not installed${NC} — run: ${CYAN}npm install -g @google/clasp${NC}"
        all_good=0
    fi

    # .clasp.json exists and has real scriptId
    if [ -f .clasp.json ]; then
        local sid
        sid=$(python3 -c "import json; d=json.load(open('.clasp.json')); print(d.get('scriptId',''))" 2>/dev/null)
        if [ "$sid" = "YOUR_SCRIPT_ID_HERE" ] || [ -z "$sid" ]; then
            echo -e "  ${YELLOW}⚠️  .clasp.json${NC} found but Script ID not set"
            all_good=0
        else
            echo -e "  ${GREEN}✅ .clasp.json${NC} configured (Script ID set)"
        fi
    else
        echo -e "  ${YELLOW}⚠️  .clasp.json not found${NC} — run ${CYAN}clasp create${NC} or copy from .clasp.json.example"
        all_good=0
    fi

    # appsscript.json exists?
    if [ -f appsscript.json ]; then
        echo -e "  ${GREEN}✅ appsscript.json${NC} present"
    else
        echo -e "  ${RED}❌ appsscript.json missing${NC}"
        all_good=0
    fi

    # All 6 src files exist?
    local src_files=("onOpen.gs" "generate2307.gs" "generate2317.gs" "generateSLSP.gs" "generateQAP.gs" "utils.gs")
    local missing_src=0
    for f in "${src_files[@]}"; do
        [ ! -f "src/$f" ] && missing_src=$((missing_src+1))
    done
    if [ "$missing_src" -eq 0 ]; then
        echo -e "  ${GREEN}✅ src/$(NC) — all 6 source files present"
    else
        echo -e "  ${YELLOW}⚠️  src/${NC} — ${missing_src} source file(s) missing"
        all_good=0
    fi

    # Any TODO stubs?
    local stub_count=0
    for f in src/*.gs; do
        [ -f "$f" ] && grep -q "// TODO" "$f" && stub_count=$((stub_count+1))
    done
    if [ "$stub_count" -eq 0 ]; then
        echo -e "  ${GREEN}✅ No stub generators${NC} — all generators implemented"
    else
        echo -e "  ${YELLOW}⚠️  ${stub_count} stub generator(s)${NC} still have // TODO"
        all_good=0
    fi

    # Claude commands present?
    local cmd_count=0
    if [ -d .claude/commands ]; then
        cmd_count=$(find .claude/commands -name "*.md" ! -name "README.md" | wc -l | tr -d ' ')
    fi
    if [ "$cmd_count" -gt 0 ]; then
        echo -e "  ${GREEN}✅ Claude commands${NC} — ${CYAN}${cmd_count}${NC} commands in .claude/commands/"
    else
        echo -e "  ${YELLOW}⚠️  No Claude commands found${NC} in .claude/commands/"
        all_good=0
    fi

    # CLAUDE.md present?
    if [ -f CLAUDE.md ]; then
        echo -e "  ${GREEN}✅ CLAUDE.md${NC} present"
    else
        echo -e "  ${YELLOW}⚠️  CLAUDE.md missing${NC} — project brain not set up"
        all_good=0
    fi

    # Git status
    if [ -d .git ]; then
        local branch dirty
        branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
        dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
        if [ "$dirty" -eq 0 ]; then
            echo -e "  ${GREEN}✅ Git${NC} — clean on branch ${CYAN}${branch}${NC}"
        else
            echo -e "  ${YELLOW}⚠️  Git${NC} — ${dirty} uncommitted change(s) on ${CYAN}${branch}${NC}"
        fi
    else
        echo -e "  ${RED}❌ Not a git repository${NC}"
        all_good=0
    fi

    echo ""
    if [ "$all_good" -eq 1 ]; then
        echo -e "  ${GREEN}${BOLD}All checks passed.${NC} Ready to push and test.\n"
    else
        echo -e "  ${YELLOW}Some checks need attention.${NC} See items above.\n"
    fi

    step_footer
}

# ─── Routing ──────────────────────────────────────────────────────────────────
case "$1" in
    commands|cmds)              show_commands ;;
    workflow)                   show_workflow ;;
    generators|status)          show_generators ;;
    vibe-check|vibecheck|check) show_vibe_check ;;
    setup|1)                    show_clasp ;;
    config|2)                   show_config ;;
    push|3)                     show_push ;;
    test|4)                     show_test ;;
    rules|bir|5)                show_bir_rules ;;
    *)                          show_main ;;
esac
