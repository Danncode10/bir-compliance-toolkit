---
description: Reads a generator's .gs file and rewrites its technical section in docs/PROJECT_OVERVIEW.md — architecture, function signatures, sheet layout, validation logic, output format, and edge cases for developers.
argument-hint: <2307|2317|SLSP|QAP>
---

Generate or update the developer documentation for: **$ARGUMENTS**

## Step 1 — Identify the target

Parse `$ARGUMENTS`. Accepted values: `2307`, `2317`, `SLSP`, `QAP` (case-insensitive).
Map to files:
- `2307` → `src/generate2307.gs`
- `2317` → `src/generate2317.gs`
- `SLSP` → `src/generateSLSP.gs`
- `QAP`  → `src/generateQAP.gs`

If no argument given, ask which generator.

## Step 2 — Read the source deeply

Read the full generator `.gs` file. For each of the three functions, extract:

**setup function (`setup<Form>Sheet`)**
- Every column width set
- Every `setValue(...)` call — row, column, label, whether it's a header or input cell
- Background colors and font weights applied (which cells are highlighted for user input)
- The `showSuccess()` message at the end

**main generator function (`generate<Form>`)**
- Sheet name it looks for
- Every `getRange(...)` — cell address and what value it reads
- Full validation logic — every `if` block that pushes to `errors[]`
- Exact error message strings
- How totals/computed values are derived
- Output filename pattern
- How the file is saved to Drive

**builder function (`build<Form>Html` or `build<Form>Dat`)**
- Parameters it receives
- HTML/DAT structure it outputs
- Any formatting helpers called

Also read `src/utils.gs` to note which shared functions this generator depends on.

## Step 3 — Draft the developer docs section

Write a technical section using this structure:

```markdown
## [Form Name] Generator

**File:** `src/generate[Form].gs`
**BIR purpose:** [one sentence]

### Functions

#### `generate[Form]()`
Entry point. Called from the BIR Tools menu.

**Reads from sheet:** `"[SheetName]"`

| Cell | Variable | Required | Validation |
|------|----------|----------|------------|
| C2   | year     | Yes      | 4-digit number |
| ...  | ...      | ...      | ... |

**Data rows** (if applicable):
| Column | Field | Validation |
|--------|-------|------------|
| A | Type | Must be X or Y |

**Computed values:**
- `[variable]` = [formula or logic]

**Output file:** `[filename pattern]`

---

#### `setup[Form]Sheet()`
Scaffolds the `"[SheetName]"` tab. Safe to re-run (prompts before overwriting).

**Creates:** [N] labeled input cells, [N] data column headers starting at row [N]

---

#### `build[Form]Html(d)` / `build[Form]Dat(d)`
Pure builder — no side effects, no Sheet/Drive calls.

**Parameters:** `d` object with keys: [list all keys]

**Returns:** HTML string (for PDF) / pipe-delimited DAT string

**Output format:**
[exact format or structure]

### Dependencies (from utils.gs)
- `validateTIN(tin)` — used for [which fields]
- `validateAmount(amt)` — used for [which fields]
- `formatTIN(tin)` — used for [where]
- `formatAmount(amt)` — used for [where]

### Known edge cases
- [any non-obvious behavior — blank rows skipped, rounding tolerance, etc.]

### Extend this generator
To add a new field: [brief guidance based on the pattern in this file]
```

Tone: technical, precise, for a developer who will maintain or extend this code. Include exact cell references and variable names from the source.

## Step 4 — Update docs/PROJECT_OVERVIEW.md

Read `docs/PROJECT_OVERVIEW.md`. Find the existing section for this generator.

- If it exists → replace it with the new draft (surgical `Edit`, not full rewrite).
- If it does not exist → insert it under the `## Four Core Modules` section, after any existing module entries.

## Step 5 — Report

```
✅ Developer docs updated: docs/PROJECT_OVERVIEW.md

Section: [Form Name] Generator
Functions documented: <N>
Input cells documented: <N>
Edge cases noted: <N>

Suggested commit: docs: update PROJECT_OVERVIEW.md developer docs for [Form Name]
```

## Constraints

- Source is authoritative. If a field is in the code but not in docs, add it. If it's in docs but not in code, remove it.
- Never edit `.gs` source files — documentation only.
- Never document a stub (`// TODO` functions) as if it were implemented. Flag it as "Not yet implemented."
- Do not simplify or abstract the actual implementation — document what the code *actually does*, not what it should ideally do.
- Keep cross-references accurate: if the section mentions `utils.gs` helpers, only list the ones actually called in the source.
