# 🇵🇭 BIR Compliance Toolkit
> A Google Apps Script project that automates the generation of BIR-compliant tax documents for Philippine businesses.

---

## 📌 What Is This?

Philippine businesses are required by the Bureau of Internal Revenue (BIR) to submit tax compliance documents every month and every quarter. Doing this manually is slow, error-prone, and painful.

**BIR Compliance Toolkit** solves this by turning a simple Google Sheet into a powerful compliance tool. Staff just fill in their data, click a button, and the correct BIR-formatted file downloads automatically — no accounting software, no manual encoding, no formatting errors.

---

## 🛠️ The 4 Tools

### 1. 📄 BIR Form 2307 Generator
**What:** Certificate of Creditable Tax Withheld at Source

**When used:** When a company pays a contractor or freelancer and withholds tax from the payment. The 2307 is given to the contractor as proof that tax was withheld.

**Example:**
- FullSuite pays a freelancer ₱50,000
- FullSuite withholds ₱5,000 (10% EWT)
- FullSuite generates a 2307 and gives it to the freelancer
- Freelancer uses it to claim a tax credit

**Input:** Form fields (Payor name, TIN, Payee name, TIN, amount, tax withheld)
**Output:** Filled PDF of BIR Form 2307

---

### 2. 📄 BIR Form 2317 Generator
**What:** Certificate of Compensation Payment / Tax Withheld

**When used:** Issued to regular employees at year end. Summarizes total compensation paid and taxes withheld for the whole year.

**Example:**
- FullSuite employee earns ₱30,000/month = ₱360,000/year
- FullSuite withheld ₱36,000 in taxes throughout the year
- FullSuite generates a 2317 for the employee
- Employee uses it when filing their annual ITR

**Input:** Form fields (Employer, Employee, TIN, total compensation, total tax withheld)
**Output:** Filled PDF of BIR Form 2317

---

### 3. 📊 SLSP DAT File Generator
**What:** Summary List of Sales and Purchases

**When used:** Required quarterly submission for all VAT-registered businesses. Lists all sales and purchase transactions. Submitted to BIR in .DAT format.

**Example:**
- A company made 500 sales transactions in Q1
- Must list all 500 in the SLSP with TIN, name, amount, VAT
- BIR uses this to cross-check VAT compliance
- Wrong format = rejected = penalties

**Input:** CSV file with columns: Type, TIN, Name, Nature, Gross Amount, VAT Amount
**Output:** BIR-compliant .DAT file ready to email to esubmission@bir.gov.ph

---

### 4. 📊 QAP DAT File Generator
**What:** Quarterly Alphalist of Payees

**When used:** Required attachment when filing BIR Form 1601-EQ every quarter. Lists all contractors and suppliers paid during the quarter and how much tax was withheld from each.

**Example:**
- A company paid 20 contractors in Q1
- Must list all 20 with their TIN, amount paid, tax rate, tax withheld
- Submitted as a .DAT file to BIR every quarter

**Input:** CSV file with columns: TIN, Name, ATC, Amount Paid, Tax Rate, Tax Withheld
**Output:** BIR-compliant .DAT file ready for submission

---

## 📁 Folder Structure

```
bir-compliance-toolkit/
│
├── README.md                  ← You are here
├── .clasp.json                ← Connects local code to Google Apps Script
├── appsscript.json            ← Google Apps Script project config
│
├── src/
│   ├── onOpen.gs              ← Creates the BIR Tools menu in Google Sheets
│   ├── generate2307.gs        ← Form 2307 PDF generator logic
│   ├── generate2317.gs        ← Form 2317 PDF generator logic
│   ├── generateSLSP.gs        ← SLSP DAT file generator logic
│   ├── generateQAP.gs         ← QAP DAT file generator logic
│   └── utils.gs               ← Shared helper functions
│
├── templates/
│   ├── sample-slsp.csv        ← Sample CSV for SLSP (for users to download)
│   └── sample-qap.csv         ← Sample CSV for QAP (for users to download)
│
└── docs/
    ├── PROJECT_OVERVIEW.md    ← Full technical overview of the project
    ├── HOW_TO_USE.md          ← Guide for end users (FullSuite staff)
    └── HOW_TO_DEPLOY.md       ← Guide for developers setting up clasp
```

---

## 📂 File Descriptions

### `src/onOpen.gs`
Runs automatically every time the Google Sheet is opened. Creates the **BIR Tools** custom menu in the menu bar with options for each of the 4 tools.

### `src/generate2307.gs`
Contains the logic for generating BIR Form 2307. Reads form field values from the sheet, validates them, and generates a filled PDF saved to Google Drive.

### `src/generate2317.gs`
Same as 2307 but for BIR Form 2317. Reads employee compensation data and generates the year-end tax certificate PDF.

### `src/generateSLSP.gs`
Reads transaction rows from the sheet, validates each row (TIN format, VAT calculation, nature codes), and builds the SLSP DAT file string in exact BIR format. Saves the DAT file to Google Drive.

### `src/generateQAP.gs`
Reads payee rows from the sheet, validates each row (ATC codes, tax rates, withheld amounts), and builds the QAP DAT file string in exact BIR format. Saves the DAT file to Google Drive.

### `src/utils.gs`
Shared helper functions used by all tools:
- `formatTIN(tin)` — formats TIN to XXX-XXX-XXX-XXX
- `formatAmount(amount)` — formats to 2 decimal places
- `validateTIN(tin)` — checks if TIN is valid
- `validateAmount(amount)` — checks if amount is a positive number
- `downloadFile(content, filename)` — saves file to Google Drive
- `showError(message)` — displays error popup to user
- `showSuccess(message)` — displays success popup to user

### `.clasp.json`
Configuration file that links your local repo to your Google Apps Script project. Contains the script ID of your Apps Script project.

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "./src"
}
```

### `appsscript.json`
Google Apps Script project manifest. Defines the runtime version and required OAuth scopes (permissions the script needs).

```json
{
  "timeZone": "Asia/Manila",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
  ]
}
```

---

## 🚀 Setup Guide (For Developers)

### Prerequisites
- Node.js v14+, Git, a Google account

```bash
git clone https://github.com/Danncode10/bir-compliance-toolkit.git
cd bir-compliance-toolkit
npm install -g @google/clasp
```

### 1. Log in to Google
```bash
clasp login
```
A browser tab opens — sign in and click **Allow** on all permissions.

Then enable the Apps Script API (one-time): **https://script.google.com/home/usersettings** → toggle **Google Apps Script API** to On.

### 2. Link to a Google Apps Script project

**Path A — No Sheet yet (recommended)**
```bash
clasp create --title "BIR Compliance Toolkit" --type sheets
```
Creates the Sheet + Script and writes `.clasp.json` automatically. Skip to Step 3.

**Path B — Already have a Sheet**
Open it → **Extensions > Apps Script** → ⚙️ **Project Settings** → copy the Script ID → paste it into `.clasp.json`. Then go to Step 3. Do **not** run `clasp create`.

### 3. Push the code
```bash
clasp push
```

### 4. Open and verify
```bash
clasp open
```
Switch to the linked Google Sheet and reload — the **BIR Tools** menu appears.

For the full deployment guide see [`docs/HOW_TO_DEPLOY.md`](docs/HOW_TO_DEPLOY.md).

---

## 🔄 Development Workflow

```bash
# Edit code in src/
clasp push       # Upload to Apps Script
# Test in the Sheet
git add src/
git commit -m "your message"
```

---

## 📋 How Employees Use It (End User Guide)

### For SLSP and QAP (DAT File Tools):

1. Open the Google Sheet link shared by your admin
2. Go to the correct sheet tab (SLSP or QAP)
3. Fill in your company details at the top:
   - Company TIN
   - Year
   - Quarter
4. Fill in your transaction rows below the headers
5. Click **BIR Tools** in the menu bar
6. Click **Generate SLSP DAT File** (or QAP)
7. Wait a few seconds
8. A success message appears
9. Go to Google Drive — your DAT file is there
10. Email the DAT file to esubmission@bir.gov.ph

### For 2307 and 2317 (PDF Certificate Tools):

1. Open the Google Sheet link
2. Go to the 2307 or 2317 sheet tab
3. Fill in all the required fields
4. Click **BIR Tools → Generate 2307 PDF** (or 2317)
5. PDF saves to Google Drive
6. Download and print or send to payee/employee

---

## ✅ Validation Rules

The tool automatically checks your data before generating files:

| Field | Rule |
|-------|------|
| TIN | Must follow XXX-XXX-XXX or XXX-XXX-XXX-XXX format |
| Amount | Must be a positive number with max 2 decimal places |
| VAT Amount | Must equal exactly 12% of Gross Amount |
| Tax Withheld | Must equal Amount × Tax Rate |
| Nature Code | Must be valid BIR code (SI, OR, DR, etc.) |
| ATC Code | Must be valid BIR Alphanumeric Tax Code |
| Tax Rate | Must be valid EWT rate (1%, 2%, 5%, 10%, 15%) |

If any row has an error, the tool will show you exactly which rows are wrong and why — before generating any file.

---

## 📤 Output File Formats

### SLSP DAT Format
```
SLS|[TIN]|[YEAR]|[QUARTER]|
D|[BUYER TIN]|[BUYER NAME]|[NATURE]|[GROSS]|[VAT]|[EXEMPT]|[ZERO]|
SLP|[TIN]|[YEAR]|[QUARTER]|
D|[SELLER TIN]|[SELLER NAME]|[NATURE]|[GROSS]|[VAT]|[EXEMPT]|[ZERO]|
```

### QAP DAT Format
```
MAP|[TIN]|[YEAR]|[QUARTER]|
D|[PAYEE TIN]|[PAYEE NAME]|[ATC]|[AMOUNT]|[RATE]|[TAX WITHHELD]|
```

---

## 🧰 Tech Stack

| Tool | Purpose |
|------|---------|
| Google Apps Script | Runtime environment (JavaScript) |
| Google Sheets | User interface and data input |
| Google Drive | Output file storage |
| clasp | Sync local code with Google Apps Script |
| GitHub | Version control and portfolio |

---

## 👨‍💻 Author

**Lester Dann G. Lopez**
BSCS 3 — Robotics | Nueva Vizcaya State University
College of Information Technology and Engineering
OJT at FullSuite | 2026

---

## 📝 License
MIT License — free to use, modify, and distribute.