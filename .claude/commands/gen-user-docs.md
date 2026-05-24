---
description: Reads a generator's .gs file and rewrites its section in docs/HOW_TO_USE.md — step-by-step user guide, sheet layout, validation rules, and troubleshooting tips. Pass the generator name (2307, 2317, SLSP, or QAP).
argument-hint: <2307|2317|SLSP|QAP>
---

Generate or update the end-user guide section for: **$ARGUMENTS**

## Step 1 — Identify the target

Parse `$ARGUMENTS`. Accepted values: `2307`, `2317`, `SLSP`, `QAP` (case-insensitive).
Map to files:
- `2307` → `src/generate2307.gs`
- `2317` → `src/generate2317.gs`
- `SLSP` → `src/generateSLSP.gs`
- `QAP`  → `src/generateQAP.gs`

If no argument given, list the four generators and ask which one.

## Step 2 — Read the source

Read the generator `.gs` file fully. Extract:
- The setup sheet function — every `setValue(...)` call tells you the sheet layout (row, column, label)
- The main generator function — every validation error message reveals what fields are required and what the rules are
- The output section — the filename pattern and `showSuccess()` message tells you what the user gets back
- Any hardcoded constants (valid codes, max values, etc.)

This is the source of truth. Do NOT invent fields — derive everything from the actual code.

## Step 3 — Reconstruct the sheet layout

From the setup function, build a table of every input cell:

| Cell | Field | Required? | Rule |
|------|-------|-----------|------|
| C2   | ...   | Yes/No    | ...  |

For data-row generators (SLSP, QAP), list the column headers starting at the data row.

## Step 4 — Draft the user guide section

Write a guide section for this generator using this structure:

```markdown
## [Form Name] — [Full BIR Description]

**When to use:** [one sentence — who uses it, when, why]

### Step-by-step

1. Click **BIR Tools → [Form Name] → Setup [Form] Sheet** (first time only).
2. Fill in [header cell block — TIN, Year, etc.].
3. [Any data-row instructions].
4. Click **BIR Tools → [Form Name] → Generate [Form]**.
5. Check Google Drive for **[filename pattern]**.
6. [What to do with the output — email, print, attach].

### Sheet layout

[Table from Step 3]

### Validation rules

[Table of every field with its rule — derived from the error messages in the code]

### Troubleshooting

[One entry per distinct error message in the code — "Error: X" → what caused it → how to fix it]
```

Tone: plain English, no jargon. Written for a non-developer FullSuite staff member who fills in data and clicks buttons. Short sentences. Active voice.

## Step 5 — Update docs/HOW_TO_USE.md

Read `docs/HOW_TO_USE.md`. Find the existing section for this generator (search for the form name as a heading). 

- If the section exists → replace it entirely with the new draft.
- If it does not exist → append it before the `## FAQ` section (or at the end if no FAQ).

Use surgical `Edit` to replace only the relevant section. Do not rewrite the whole file.

## Step 6 — Report

```
✅ User docs updated: docs/HOW_TO_USE.md

Section: [Form Name]
Cells documented: <N>
Validation rules documented: <N>
Troubleshooting entries: <N>

Suggested commit: docs: update HOW_TO_USE.md user guide for [Form Name]
```

## Constraints

- Derive everything from the `.gs` source. Never invent fields or rules that aren't in the code.
- Never edit `src/` files — this command is documentation-only.
- Never rewrite sections for generators other than the one specified.
- Keep tone consistent with the existing HOW_TO_USE.md style.
- If the generator file has a `// TODO` stub (not yet implemented), output a warning: "Generator not yet implemented — user docs skipped." Do not write docs for stubs.
