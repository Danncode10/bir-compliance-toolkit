---
description: Scaffolds a new BIR form generator following the established 3-function pattern (setup sheet, main generator, HTML/DAT builder). Creates the .gs file and wires the submenu in onOpen.gs. Pass the BIR form number or name.
argument-hint: <form-name e.g. QAP, 1601-EQ, 2316>
---

Scaffold a new BIR generator for: **$ARGUMENTS**

## Step 1 — Clarify the form

Parse `$ARGUMENTS` for the BIR form name/number. Then ask the user (one message, all questions at once) if any of these are unknown:

1. **Full BIR title** — e.g. "Quarterly Alphalist of Payees"
2. **Output type** — PDF (like 2307/2317) or DAT file (like SLSP/QAP)?
3. **Submission frequency** — monthly / quarterly / annual / on-demand?
4. **Key input fields** — what data does the user fill in? (TIN, Year, Quarter, Payee rows, etc.)
5. **Special validation rules** — any BIR-specific rules beyond TIN format and positive amounts?

If the form is QAP — skip the questions, all info is already in `README.md` and `templates/sample-qap.csv`.

## Step 2 — Read existing generators as reference

Read `src/generate2307.gs` (PDF pattern) OR `src/generateSLSP.gs` (DAT pattern) depending on output type. Extract the exact 3-function pattern to replicate:

- How the setup function structures the sheet (column widths, header rows, data rows)
- How the main function reads cells, validates, computes totals, saves to Drive
- How the builder function structures its output

This is the reference implementation. The new generator must follow the same structure.

Also read `src/utils.gs` to know which helpers are available.

## Step 3 — Design the sheet layout

Based on the form fields, design the input sheet:

- **Header block** (rows 1–N): company/employer TIN, year, period, etc. — fixed cells (C2, C3, C4...)
- **Data rows** (row N+1 onward): one row per transaction/payee/entry — labeled column headers

Present the sheet layout as a table before writing code:

```
Row 2: Company TIN         → C2
Row 3: Year                → C3
...
Row 7: [Data row headers]  → cols A, B, C, D...
Row 8+: [User data]
```

Ask for confirmation if anything is ambiguous.

## Step 4 — Scaffold the generator file

Create `src/generate[FormName].gs` with the 3-function pattern:

```javascript
// BIR Form [Name] Generator
// [Full BIR title]

// Expected sheet layout (sheet name: "[FormName]"):
//   [cell-by-cell layout as comments]

function generate[FormName]() {
  // 1. Find sheet or show setup error
  // 2. Read all fields
  // 3. Validate — collect all errors, show at once
  // 4. Compute any derived values
  // 5. Build output (call builder)
  // 6. Save to Drive
  // 7. showSuccess() with filename
}

function setup[FormName]Sheet() {
  // Check if sheet exists, prompt overwrite
  // Create sheet with correct column widths
  // Set header labels in fixed cells
  // Set data row column headers
  // Apply bold/background formatting
  // showSuccess()
}

function build[FormName][Html|Dat](d) {
  // Pure builder — no side effects
  // Return HTML string or DAT string
}
```

Follow these rules from `CLAUDE.md`:
- Private helpers use trailing underscore
- Sheet name matches the form name exactly
- All validation errors collected into `errors[]` before any `showError()` call
- Call `validateTIN()`, `validateAmount()`, `formatTIN()`, `formatAmount()` from utils — never re-implement them
- Output filename: `BIR_[FormName]_[TIN]_[Year]_[Period].pdf` or `.DAT`

## Step 5 — Wire the menu

Read `src/onOpen.gs`. Add a new submenu following the existing pattern:

```javascript
.addSubMenu(ui.createMenu('Form [Name]')
  .addItem('Setup [FormName] Sheet', 'setup[FormName]Sheet')
  .addItem('Generate [FormName] [PDF|DAT File]', 'generate[FormName]'))
```

Insert it in the logical position (after existing forms, before the closing `.addToUi()`).

## Step 6 — Show the plan and confirm

```
📋 New generator: [FormName]

Form: BIR [Number] — [Full Title]
Output: [PDF | DAT file]
Sheet name: "[SheetName]"
Header cells: C2–C[N] ([field names])
Data rows: row [N]+ with [N] columns

Will create:
  + src/generate[FormName].gs

Will update:
  ~ src/onOpen.gs  (add [FormName] submenu)

Sheet layout:
  [table from Step 3]

Proceed? (y/n)
```

Skip confirmation only if user wrote "go", "yes", or "just do it".

## Step 7 — Apply and report

Write the `.gs` file, then apply the `onOpen.gs` edit.

```
✅ Generator scaffolded: [FormName]

Files created:
  + src/generate[FormName].gs

Files updated:
  ~ src/onOpen.gs

Next steps:
  1. clasp push  → upload to Google Apps Script
  2. Open the linked Google Sheet and reload → test "BIR Tools → [FormName] → Setup Sheet"
  3. Fill in data and run "Generate [FormName]"
  4. Run /gen-user-docs [FormName]  → write user guide
  5. Run /gen-dev-docs [FormName]   → write developer docs

Suggested commit: feat: scaffold BIR [FormName] generator
```

## Constraints

- Always follow the 3-function pattern: setup, generate, builder. No exceptions.
- Always call `validateTIN()` and `validateAmount()` from utils — never write custom TIN/amount logic.
- Never put HTML/DAT building logic inside the main `generate` function — it goes in the builder.
- Never write the QAP generator if `src/generateQAP.gs` already contains a real implementation (check for `// TODO` stub first).
- Always confirm the sheet layout before writing code — a wrong layout means unusable sheets.
