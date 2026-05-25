# BIR Compliance Toolkit - Technical Overview

## Project Scope

The BIR Compliance Toolkit is a Google Apps Script-based solution that automates the generation of BIR-compliant tax documents and data files for Philippine businesses.

## Four Core Modules

### 1. Form 2307 (Certificate of Creditable Tax Withheld at Source)
- **Purpose:** Proof of tax withheld from contractor/freelancer payments
- **Data Input:** Payor info, Payee info, amount paid, tax rate
- **Output:** PDF document ready for printing/distribution
- **Validation:** TIN format, amount range

### 2. Form 2317 (Certificate of Compensation Payment / Tax Withheld)
- **Purpose:** Year-end tax certificate for regular employees
- **Data Input:** Employee info, total compensation, total tax withheld
- **Output:** PDF document ready for distribution
- **Validation:** TIN format, amount consistency

### 3. SLSP DAT File (Summary List of Sales and Purchases)
- **Purpose:** Quarterly VAT compliance submission to BIR
- **Data Input:** CSV file with transaction details
- **Output:** BIR-formatted .DAT file for esubmission@bir.gov.ph
- **Validation:** TIN format, VAT calculations (12%), nature codes

### 4. QAP DAT File (Quarterly Alphalist of Payees)
- **Purpose:** Quarterly payee withholding information for BIR Form 1601-EQ
- **Data Input:** CSV file with payee details and withheld amounts
- **Output:** BIR-formatted .DAT file for submission
- **Validation:** ATC codes, tax rates, withheld amounts

## Technical Architecture

### Technology Stack
- **Runtime:** Google Apps Script (JavaScript based)
- **UI:** Google Sheets
- **Storage:** Google Drive
- **Sync Tool:** clasp (Command Line Apps Script)
- **Version Control:** Git/GitHub

### File Organization

```
src/
  ├── onOpen.gs          → Menu creation and orchestration
  ├── generate2307.gs    → Form 2307 logic
  ├── generate2317.gs    → Form 2317 logic
  ├── generateSLSP.gs    → SLSP DAT generation
  ├── generateQAP.gs     → QAP DAT generation
  ├── seed.gs            → loadSample*Data() helpers for dev/test seeding
  └── utils.gs           → Shared validation and utility functions
```

### Validation Framework

Each module implements validation for:
- **TIN Validation:** Must be XXX-XXX-XXX or XXX-XXX-XXX-XXX format
- **Amount Validation:** Positive numbers, max 2 decimal places
- **VAT Validation:** 12% of gross amount for SLSP
- **Tax Calculation:** Withheld = Amount × Rate
- **Code Validation:** Nature codes, ATC codes, tax rates

### Error Handling

- Pre-generation validation prevents malformed data
- Row-by-row error reporting (which rows are invalid and why)
- User-friendly error messages

## Development Workflow

1. Make code changes in VS Code
2. Push to Google Apps Script with `clasp push`
3. Test in the linked Google Sheet
4. Commit and push to GitHub

## Deployment Checklist

- [ ] Set script ID in `.clasp.json`
- [ ] Verify OAuth scopes in `appsscript.json`
- [ ] Test each of the 4 generators
- [ ] Share Google Sheet with team
- [ ] Create documentation for end users

## Future Enhancements

- Support for additional BIR forms
- Batch processing for multiple quarters
- Email integration for automatic submission
- Audit logging for compliance tracking
