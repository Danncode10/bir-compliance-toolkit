# CLAUDE.md — BIR Compliance Toolkit

> Start here. Read this before touching any file in this project.

## What is this?

A Google Apps Script project that automates BIR-compliant tax document generation for Philippine businesses. Runs entirely inside Google Sheets — no backend, no database, no build step.

## Tech stack

| Layer | Tool |
|-------|------|
| Runtime | Google Apps Script (ES5-compatible JavaScript, V8 engine) |
| UI | Google Sheets (menu bar + sheet tabs as input forms) |
| Output storage | Google Drive |
| Local sync | clasp (`@google/clasp`) |
| Version control | Git / GitHub |

## Project structure

```
src/
  onOpen.gs         → BIR Tools menu (submenus per generator)
  generate2307.gs   → Form 2307 PDF + setup2307Sheet()
  generate2317.gs   → Form 2317 PDF + setup2317Sheet()
  generateSLSP.gs   → SLSP .DAT file + setupSLSPSheet()
  generateQAP.gs    → QAP .DAT file + setupQAPSheet()
  seed.gs           → loadSample*Data() helpers for one-command test seeding
  utils.gs          → validateTIN(), validateAmount(), formatTIN(), formatAmount(),
                      downloadFile(), showError(), showSuccess()

templates/
  sample-slsp.csv   → Sample data for SLSP testing
  sample-qap.csv    → Sample data for QAP testing

docs/
  PROJECT_OVERVIEW.md  → Technical architecture (for developers)
  HOW_TO_USE.md        → End-user guide (for FullSuite staff)
  HOW_TO_DEPLOY.md     → Setup + clasp deploy guide (for developers)
```

## Architectural guardrails (non-negotiable)

1. **One file per generator** — each BIR form lives in its own `.gs` file. Do not combine generators.
2. **Three functions per generator** — every generator file has exactly:
   - `generate<Form>()` — main entry point called from the menu
   - `setup<Form>Sheet()` — scaffolds the input sheet with labeled cells
   - `build<Form>Html()` or `build<Form>Dat()` — pure builder, no side effects
3. **Validate before generating** — collect ALL errors into an array first, then show them all at once with `showError()`. Never generate a partial output.
4. **utils.gs is shared** — never duplicate `validateTIN`, `formatTIN`, `validateAmount`, `formatAmount` in a generator file. Always call from utils.
5. **No external dependencies** — Google Apps Script has no npm. All code must be vanilla GAS/JS.

## Google Apps Script conventions

- Use `SpreadsheetApp`, `DriveApp`, `Utilities`, `DocumentApp` — never assume Node.js APIs exist.
- `var` is fine (GAS is ES5-adjacent), but `const`/`let` work with V8 runtime.
- Private helpers inside a file use a trailing underscore: `columnLetterToIndex_()`.
- Sheet names are the source of truth — always `ss.getSheetByName('Form 2307')`, never by index.
- Dates: format as strings. GAS date handling is quirky — prefer text like `'01/2026'`.

## BIR validation rules (enforced in every generator)

| Field | Rule |
|-------|------|
| TIN | 9 or 12 digits, formatted XXX-XXX-XXX or XXX-XXX-XXX-XXX |
| Amount | Positive number, max 2 decimal places |
| VAT Amount (SLSP) | Exactly 12% of VATable gross (±₱0.02 rounding tolerance) |
| Tax Withheld (QAP) | Equals Amount × Rate |
| Non-taxable 13th Month (2317) | Cannot exceed ₱90,000 |
| Nature Code (SLSP) | Must be one of: SI, OR, DR, CN, DM, CD |
| ATC Code (QAP) | Must be a valid BIR Alphanumeric Tax Code |
| EWT Rate (QAP) | Must be one of: 1%, 2%, 5%, 10%, 15% |

## DAT file format rules

### SLSP
```
SLS|[TIN_NO_DASHES]|[YEAR]|[QTR]|
D|[BUYER_TIN]|[NAME]|[NATURE]|[GROSS]|[VAT]|[EXEMPT]|[ZERO]|
SLP|[TIN_NO_DASHES]|[YEAR]|[QTR]|
D|[SELLER_TIN]|[NAME]|[NATURE]|[GROSS]|[VAT]|[EXEMPT]|[ZERO]|
```

### QAP
```
MAP|[TIN_NO_DASHES]|[YEAR]|[QTR]|
D|[PAYEE_TIN]|[NAME]|[ATC]|[AMOUNT]|[RATE]|[TAX_WITHHELD]|
```

- TINs in DAT files are always stripped of dashes (digits only)
- Amounts always 2 decimal places (`formatAmount()`)

## Custom commands

See `.claude/commands/` for available slash commands:

| Command | Purpose |
|---------|---------|
| `/gen-user-docs [generator]` | Writes/updates the user guide section for a generator in `docs/HOW_TO_USE.md` |
| `/gen-dev-docs [generator]` | Writes/updates the technical section for a generator in `docs/PROJECT_OVERVIEW.md` |
| `/new-generator [form-name]` | Scaffolds a new BIR generator following the established 3-function pattern |
| `/validate-bir [generator]` | Audits a generator against BIR rules — missing validations, format gaps, edge cases |

If unsure which command to use, describe your intent in plain English and Claude will route you.

## Development workflow

```bash
# Edit code locally in VS Code
clasp push          # Upload to Google Apps Script
# Test in the linked Google Sheet
git add src/        # Stage changes
git commit          # Commit with conventional message
```

## End-to-end output checklist

Before marking any generator as "done":
- [ ] `setup<Form>Sheet()` creates a usable, labeled input sheet
- [ ] All required fields validated with clear cell references in error messages
- [ ] All errors shown at once (not one at a time)
- [ ] Output file saved to Google Drive with a descriptive filename
- [ ] `showSuccess()` message includes the filename
- [ ] User docs updated in `docs/HOW_TO_USE.md`
- [ ] Developer docs updated in `docs/PROJECT_OVERVIEW.md`
- [ ] Menu wired in `src/onOpen.gs` as a submenu (Setup + Generate)

## Author

Lester Dann G. Lopez — BSCS 3, OJT at FullSuite (2026)
