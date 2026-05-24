# BIR Compliance Toolkit - Deployment Guide

## Prerequisites

Before you can deploy this toolkit, you need:

- Node.js installed (v14 or higher)
- Google account with access to Google Sheets and Drive
- Git installed
- Terminal/command line experience
- VS Code or your preferred code editor

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/Danncode10/bir-compliance-toolkit.git
cd bir-compliance-toolkit
```

---

## Step 2: Install clasp (Google Apps Script CLI)

```bash
npm install -g @google/clasp
```

Verify installation:
```bash
clasp --version
```

---

## Step 3: Login to Google via clasp

```bash
clasp login
```

This will:
1. Open a browser window
2. Ask you to login with your Google account
3. Request permission to access Google Apps Script
4. Create a `.clasprc.json` file in your home directory with auth tokens

---

## Step 4: Create a New Google Apps Script Project

```bash
clasp create --title "BIR Compliance Toolkit" --type sheets
```

This command:
- Creates a new Google Apps Script project
- Creates a linked Google Sheet
- Updates `.clasp.json` with your script ID
- Opens the project in your browser

**Important:** The script ID is automatically filled into `.clasp.json`. Do not commit this file to public repositories, as it contains sensitive information.

---

## Step 5: Push Your Code to Google Apps Script

```bash
clasp push
```

This uploads all `.gs` files from the `src/` folder to Google Apps Script.

Expected output:
```
? Overwrite project files on Google Apps Script? (y/n) y
└─ src/onOpen.gs
└─ src/generate2307.gs
└─ src/generate2317.gs
└─ src/generateSLSP.gs
└─ src/generateQAP.gs
└─ src/utils.gs
```

---

## Step 6: Set Project Settings (Optional but Recommended)

Open the project in the browser:
```bash
clasp open
```

In the Google Apps Script editor:
1. Click **Project Settings** (gear icon)
2. Note the script ID (you'll need this for `.clasp.json`)
3. Check that the runtime version is set to "V8"

---

## Step 7: Open and Configure the Google Sheet

After `clasp push`, go back to your browser and open the linked Google Sheet. You should see a **BIR Tools** menu appear in the menu bar once you refresh.

To find your Sheet:
1. Go to Google Drive
2. Look for a file named "BIR Compliance Toolkit" (created by clasp)
3. Open it

---

## Step 8: Test the Installation

In the Google Sheet:

1. Click **BIR Tools** in the menu bar
2. Select **Generate SLSP DAT File** (or any other option)
3. You should see a popup saying "Success: SLSP DAT generator is ready to be implemented."
4. This confirms the script is running

---

## Step 9: Share the Google Sheet with Your Team

1. Click the **Share** button (top right)
2. Add email addresses of FullSuite team members
3. Set permission to **Editor** so they can fill in data
4. Send them the link

---

## Development Workflow

After initial setup, here's how to develop and deploy changes:

### Local Development

1. Make changes to files in `src/` using your code editor
2. Test by pushing to Google Apps Script:

```bash
clasp push
```

3. Go to the Google Sheet and test the functionality

### Version Control

Push your changes to GitHub:

```bash
git add .
git commit -m "descriptive commit message"
git push origin main
```

### Pulling Changes from Google Apps Script

If you make changes directly in the Google Apps Script editor (not recommended), pull them back:

```bash
clasp pull
```

---

## Project Structure Reference

```
bir-compliance-toolkit/
├── .clasp.json              ← Script ID (do not commit to public repos)
├── appsscript.json          ← Google Apps Script config
├── src/
│   ├── onOpen.gs            ← Menu creation
│   ├── generate2307.gs      ← Form 2307 logic
│   ├── generate2317.gs      ← Form 2317 logic
│   ├── generateSLSP.gs      ← SLSP generator
│   ├── generateQAP.gs       ← QAP generator
│   └── utils.gs             ← Shared utilities
├── templates/
│   ├── sample-slsp.csv      ← Sample data for testing
│   └── sample-qap.csv       ← Sample data for testing
└── docs/
    ├── PROJECT_OVERVIEW.md  ← Technical docs
    ├── HOW_TO_USE.md        ← End user guide
    └── HOW_TO_DEPLOY.md     ← This file
```

---

## Troubleshooting

### "clasp login" fails with "Error: could not find credentials"
**Solution:** Make sure you completed the login flow in your browser and allowed the permissions.

### "clasp push" says "Error: Invalid API call"
**Solution:** Make sure your `.clasp.json` has a valid scriptId. Regenerate with `clasp create`.

### Google Sheet doesn't show "BIR Tools" menu
**Solution:** Reload the Google Sheet (refresh the page) after pushing code. The menu appears on load.

### "Permission denied" when trying to create files
**Solution:** Check that the Apps Script has Google Drive permission. This is configured in `appsscript.json` and set automatically.

### Getting "Script Error" when clicking a tool
**Solution:** 
1. Go to Google Apps Script (click **Extensions** → **Apps Script** in Google Sheets)
2. Look at the error logs in **Execution log**
3. Check console logs: Click **View** → **Logs**

---

## Security Considerations

### Do NOT commit `.clasp.json` to public repositories
Your script ID is sensitive. If using GitHub:
- Add `.clasp.json` to `.gitignore` (already done)
- If accidentally committed, rotate your script ID

### OAuth Scopes
The toolkit uses only two OAuth scopes:
- `https://www.googleapis.com/auth/spreadsheets` - Read Google Sheets
- `https://www.googleapis.com/auth/drive` - Write files to Google Drive

These are appropriate for the toolkit's functionality.

---

## Next Steps

1. Implement the 4 generators in `src/`:
   - `generate2307.gs`
   - `generate2317.gs`
   - `generateSLSP.gs`
   - `generateQAP.gs`

2. Test each generator with sample data from `templates/`

3. Share the Google Sheet with the FullSuite team

4. Provide the `HOW_TO_USE.md` guide to end users

---

## Support

For issues with clasp or Google Apps Script:
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [clasp GitHub Repository](https://github.com/google/clasp)

For issues with the BIR Compliance Toolkit:
- Check the technical overview in `docs/PROJECT_OVERVIEW.md`
- Review validation rules in `docs/HOW_TO_USE.md`
