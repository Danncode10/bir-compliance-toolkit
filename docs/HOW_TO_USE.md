# BIR Compliance Toolkit - User Guide

## Getting Started

Your IT admin has shared a Google Sheet that contains the BIR Compliance Toolkit. All you need to do is fill in data and click a button to generate BIR-compliant files.

---

## Using the DAT File Generators (SLSP & QAP)

### SLSP DAT File (Summary List of Sales and Purchases)

**When to use:** Every quarter, you need to submit all your sales and purchase transactions to the BIR.

**Steps:**

1. If this is your first time, click **BIR Tools → SLSP → Setup SLSP Sheet** to create the input tab
2. Go to the **SLSP** tab and fill in your company information at the top (cells C2, C3, C4):
   - Company TIN (C2)
   - Year (C3)
   - Quarter 1–4 (C4)
3. Add your transaction rows below row 7 with:
   - Type (SLS for sales, SLP for purchases)
   - Buyer/Seller TIN
   - Buyer/Seller name
   - Nature code (SI, OR, DR, CN, DM, or CD)
   - Gross amount
   - VAT amount (must be exactly 12% of gross)
   - Exempt amount (0 if none)
   - Zero-rated amount (0 if none)
4. Delete the sample row (row 8) before generating
5. Click **BIR Tools → SLSP → Generate SLSP DAT File**
6. Wait for the success message
7. Go to Google Drive and find your DAT file (named `SLSP_[TIN]_[YEAR]_Q[QTR].DAT`)
8. Email it to **esubmission@bir.gov.ph**

**Important:**
- Make sure your VAT amount is exactly 12% of the gross amount, or the file will be rejected
- All TIN numbers must follow the XXX-XXX-XXX or XXX-XXX-XXX-XXX format

---

### QAP DAT File (Quarterly Alphalist of Payees)

**When to use:** Every quarter when filing BIR Form 1601-EQ, you must submit details of contractors and suppliers you paid and taxes you withheld.

**Steps:**

1. If this is your first time, click **BIR Tools → QAP → Setup QAP Sheet** to create the input tab
2. Go to the **QAP** tab and fill in your company information at the top (cells C2, C3, C4):
   - Company TIN (C2)
   - Year (C3)
   - Quarter 1–4 (C4)
3. Add your payee rows below row 7 with:
   - Payee TIN
   - Payee name
   - ATC code (e.g. WC010, WC158, WC120)
   - Amount paid
   - EWT rate (1%, 2%, 5%, 10%, or 15%)
   - Tax withheld (must equal Amount × Rate)
4. Delete the sample row (row 8) before generating
5. Click **BIR Tools → QAP → Generate QAP DAT File**
6. Wait for the success message
7. Go to Google Drive and find your DAT file (named `QAP_[TIN]_[YEAR]_Q[QTR].DAT`)
8. Attach it to your BIR Form 1601-EQ submission

**Important:**
- Tax withheld must equal exactly Amount × EWT Rate (±₱0.02 rounding tolerance)
- Valid EWT rates are: 1%, 2%, 5%, 10%, 15%
- All TIN numbers must follow the XXX-XXX-XXX or XXX-XXX-XXX-XXX format

---

## Using the PDF Generators (2307 & 2317)

### Form 2307 (Certificate of Creditable Tax Withheld at Source)

**When to use:** When you pay contractors or freelancers and withhold tax, you give them a 2307 as proof for their own tax filings.

**Steps:**

1. If this is your first time, click **BIR Tools → Form 2307 → Setup Form 2307 Sheet** to create the input tab
2. Go to the **Form 2307** tab and fill in all required fields:
   - Period From and Period To (MM/YYYY format, e.g. `01/2026`)
   - Payor TIN (C5), Name (C6), Address (C7), ZIP (C8)
   - Payee TIN (C11), Name (C12), Address (C13), ZIP (C14)
   - Income entries starting at row 18: Nature of income, ATC code, and quarterly amounts/EWT
3. Click **BIR Tools → Form 2307 → Generate 2307 PDF**
4. Check Google Drive for the PDF
5. Download, print, and give to the payee

---

### Form 2317 (Certificate of Compensation Payment / Tax Withheld)

**When to use:** At year-end, give employees a 2317 summarizing their total compensation and taxes withheld for the year.

**Steps:**

1. If this is your first time, click **BIR Tools → Form 2317 → Setup Form 2317 Sheet** to create the input tab
2. Go to the **Form 2317** tab and fill in all required fields:
   - Year (C2)
   - Employer TIN (C5), Name (C6), Address (C7), ZIP (C8)
   - Employee TIN (C11), Name (C12), Address (C13), ZIP (C14)
   - Compensation breakdown: Basic Salary (C17, required), plus optional Holiday Pay, Overtime, Night Diff, etc.
   - Non-taxable amounts: 13th Month cap max ₱90,000 (C28), De Minimis (C29), SSS/PHIC/Pag-IBIG (C30)
   - Monthly breakdown: rows 38–49, columns C (compensation) and D (tax withheld)
3. Click **BIR Tools → Form 2317 → Generate 2317 PDF**
4. Check Google Drive for the PDF
5. Download, print, and give to the employee

---

## Validation Rules

The tool automatically checks your data **before** generating any file. If something is wrong, you'll get a clear error message saying exactly which rows are invalid and why.

| Field | Must Be |
|-------|---------|
| TIN | 12 digits in format XXX-XXX-XXX-XXX or 9 digits in XXX-XXX-XXX |
| Amount | A positive number with up to 2 decimal places |
| VAT Amount (SLSP) | Exactly 12% of Gross Amount |
| Tax Withheld | Exactly equal to Amount × Tax Rate |
| Nature Code | Valid BIR code (SI, OR, DR, etc.) |
| ATC Code (QAP) | Valid BIR code (DST, PFC, etc.) |
| Tax Rate | One of: 1%, 2%, 5%, 10%, 15% |

---

## Troubleshooting

### "Error: Invalid TIN Format"
- Check that TIN is 9 or 12 digits
- Make sure it follows XXX-XXX-XXX or XXX-XXX-XXX-XXX format (with or without dashes)

### "Error: Invalid Amount"
- Amounts must be positive numbers
- Use only numbers and decimal point (no peso signs or commas)
- Example: 10000.50 (not 10,000.50)

### "Error: VAT Must Equal 12% of Gross"
- For SLSP, VAT is always 12%
- Gross × 0.12 = VAT
- Example: If Gross is 10,000, VAT must be 1,200.00

### "Error: Tax Withheld Mismatch"
- For QAP, Tax Withheld must equal exactly: Amount Paid × Tax Rate
- Example: If Amount is 50,000 and Rate is 5%, Tax Withheld must be 2,500.00

### File not appearing in Google Drive
- Wait a few seconds after clicking Generate
- Refresh your Google Drive page
- Check if you have permission to create files in the shared drive

---

## FAQ

**Q: Can I edit the files after they're generated?**
A: The DAT files are plain text, but you should not edit them as BIR systems are very strict about format. PDFs can be printed and the printout is official.

**Q: What if I made a mistake after generating a file?**
A: Delete the file from Google Drive, fix the data in the sheet, and generate again.

**Q: How many transactions can I add?**
A: As many as you need. The tool handles thousands of rows.

**Q: Is my data private?**
A: Yes. This is a private Google Sheet shared only with your team. No data leaves your organization.

---

## Need Help?

Contact your IT admin or refer to the technical documentation for developers.
