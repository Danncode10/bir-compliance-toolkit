---
description: Audits a generator's .gs file against BIR compliance rules — checks for missing validations, incorrect DAT field order, VAT calculation tolerance, TIN stripping, amount formatting, and edge cases that would cause BIR rejection. Pass generator name or "all".
argument-hint: <2307|2317|SLSP|QAP|all>
---

Audit BIR compliance for: **$ARGUMENTS**

## Step 1 — Determine scope

Parse `$ARGUMENTS`:
- `2307` → audit `src/generate2307.gs` only
- `2317` → audit `src/generate2317.gs` only
- `SLSP` → audit `src/generateSLSP.gs` only
- `QAP`  → audit `src/generateQAP.gs` only
- `all`  → audit all four in parallel, merge results

If no argument, default to `all`.

## Step 2 — Read sources

Read the target generator file(s) and `src/utils.gs`. These are the only sources of truth.

## Step 3 — Run the compliance checklist

For each generator, check every rule below. Mark each as ✅ Pass, ⚠️ Warning, or ❌ Fail.

### Universal rules (all generators)

| # | Rule | How to check |
|---|------|-------------|
| U1 | TIN validated with `validateTIN()` before use | Look for `validateTIN(` call for every TIN field read |
| U2 | Amount validated with `validateAmount()` before use | Look for `validateAmount(` call for every amount field |
| U3 | `formatTIN()` applied before outputting TIN to PDF/DAT | Check builder function for `formatTIN(` on every TIN output |
| U4 | `formatAmount()` applied before outputting amounts | Check builder for `formatAmount(` on every amount output |
| U5 | All errors collected into `errors[]` before any `showError()` | Check that `errors.push(...)` is used and `showError(errors.join('\n'))` is called once |
| U6 | Sheet existence checked at top, with helpful error message pointing to the setup command | Look for `ss.getSheetByName(...)` null check |
| U7 | Output saved via `DriveApp.getRootFolder().createFile(...)` | Look for this pattern |
| U8 | `showSuccess()` called with filename after saving | Check post-save section |

### PDF generators (2307, 2317)

| # | Rule | How to check |
|---|------|-------------|
| P1 | Output exported as PDF via `blob.getAs('application/pdf')` | Check builder caller |
| P2 | Filename includes form name + payee/employee name + period | Check filename string |
| P3 | Signature block present in HTML output | Search `build*Html` for "signatory" or "signature" content |
| P4 | Peso symbol (₱ / `&#8369;`) used for amounts in PDF, not bare numbers | Check HTML builder |

### Form 2317 specific

| # | Rule | How to check |
|---|------|-------------|
| T1 | Non-taxable 13th month capped at ₱90,000 | Look for `> 90000` check |
| T2 | Taxable compensation = Gross − NonTaxable (floored at 0) | Look for `Math.max(0, ...)` |
| T3 | Monthly breakdown (Jan–Dec) rows exist in sheet layout | Check setup function for 12 month rows |
| T4 | Previous employer fields are optional (no required-field error if blank) | Check validation — these should only validate *if* a value is present |

### SLSP specific

| # | Rule | How to check |
|---|------|-------------|
| S1 | TINs stripped to digits only in DAT output (no dashes) | Check `tin.replace(/[^\d]/g, '')` in DAT builder |
| S2 | VAT = 12% of (Gross − Exempt − Zero-rated), with ±₱0.02 tolerance | Look for the tolerance check: `Math.abs(expected - actual) > 0.02` |
| S3 | Nature code validated against the allowed list (SI, OR, DR, CN, DM, CD) | Look for `SLSP_NATURE_CODES_` or inline array check |
| S4 | Quarter validated as 1, 2, 3, or 4 only | Look for quarter range check |
| S5 | SLS section only emitted if sales rows exist; SLP section only if purchase rows exist | Look for `if (salesRows.length > 0)` guards |
| S6 | DAT line ends with `|` (trailing pipe) | Read the DAT builder string concatenation |

### QAP specific (once implemented)

| # | Rule | How to check |
|---|------|-------------|
| Q1 | Tax withheld = Amount × Rate (with ±₱0.02 tolerance) | Look for withheld cross-check |
| Q2 | EWT rate validated against allowed list: 1%, 2%, 5%, 10%, 15% | Look for rate array check |
| Q3 | ATC code validated (not empty, preferably against a known-codes list) | Look for ATC validation |
| Q4 | TINs stripped to digits in DAT output | Check `replace(/[^\d]/g, '')` in builder |
| Q5 | MAP header line present before detail rows | Check DAT builder for `MAP|` prefix |

## Step 4 — Generate the audit report

```
📋 BIR Compliance Audit — [Generator Name(s)]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[GENERATOR NAME] — src/generate[Name].gs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Universal rules:
  ✅ U1 — TIN validated with validateTIN()
  ✅ U2 — Amounts validated with validateAmount()
  ⚠️ U3 — formatTIN() not applied to payee TIN in builder (line ~N)
  ❌ U5 — Errors shown one at a time, not collected — user sees only the first error

[Form-specific rules:]
  ✅ S1 — TINs stripped of dashes in DAT output
  ❌ S2 — VAT = 12% check missing tolerance (will fail on ₱0.01 rounding differences)
  ✅ S3 — Nature codes validated against allowed list

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pass:    <N> rules
⚠️ Warning: <N> rules (won't break BIR submission but may confuse users)
❌ Fail:    <N> rules (will cause BIR rejection or broken output)

[If any Fail]:
Top priority fixes:
  1. [Fail item] in src/generate[Name].gs — [one-line explanation of the fix]
  2. ...

Suggested commit (after fixing): fix: correct BIR compliance issues in [Name] generator
```

## Step 5 — Offer to fix

After showing the report, ask:
> "Would you like me to fix the ❌ Fail items now? (y/n)"

If yes, fix only the failing items using surgical `Edit` calls. Show each edit as a diff before applying. Do not restructure or refactor surrounding code.

## Constraints

- Read-only by default. Only apply fixes after explicit user confirmation.
- Never rewrite a whole function to fix one rule — use targeted `Edit`.
- Never add validations that aren't in the BIR rules above — don't over-engineer.
- If a generator is a stub (`// TODO`), report: "Not yet implemented — audit skipped."
- Reference exact line numbers or approximate positions when reporting issues so the user can find them quickly.
