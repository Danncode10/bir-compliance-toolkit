# HOW_TO_DEPLOY.md — Developer Setup Guide

Follow these steps in order. Each step has the exact command and what to expect.

---

## Prerequisites

- Node.js v14+ — check with `node --version`
- Git
- A Google account

---

## Step 1 — Install clasp

```bash
npm install -g @google/clasp
clasp --version   # should print 3.x.x
```

---

## Step 2 — Enable the Apps Script API

Visit: **https://script.google.com/home/usersettings**

Toggle **Google Apps Script API** to **On**.

> Do this before anything else. If you skip it, `clasp push` will fail with:
> `User has not enabled the Apps Script API`

---

## Step 3 — Log in to Google

```bash
clasp login
```

A browser tab opens. Sign in with the Google account that owns the Sheet. Click **Allow** on every permission listed.

---

## Step 4 — Link to the Google Apps Script project

Copy `.clasp.json.example` to create your local config:

```bash
cp .clasp.json.example .clasp.json
```

Then fill in both IDs:

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "parentId": "YOUR_SHEET_FILE_ID_HERE",
  "rootDir": "./src"
}
```

**How to get the Script ID:**
1. Open your Google Sheet
2. Click **Extensions > Apps Script**
3. Click ⚙️ **Project Settings**
4. Copy the **Script ID**

**How to get the Sheet file ID:**

It's in the Sheet's URL:
```
https://docs.google.com/spreadsheets/d/SHEET_FILE_ID_IS_HERE/edit
```

> Don't have a Sheet yet? Create one at **https://sheets.new**, then follow the steps above.

---

## Step 5 — Push the code

```bash
clasp push
```

When prompted `Manifest file has been updated. Do you want to push and overwrite?` — type **Yes**.

Expected output:
```
Pushed 7 files.
└─ src/appsscript.json
└─ src/generate2307.gs
└─ src/generate2317.gs
└─ src/generateQAP.gs
└─ src/generateSLSP.gs
└─ src/onOpen.gs
└─ src/utils.gs
```

---

## Step 6 — Open and verify

```bash
clasp open-container   # opens the linked Google Sheet
clasp open-script      # opens the Apps Script editor
```

Reload the Google Sheet — the **BIR Tools** menu should appear in the menu bar.

If the menu doesn't appear, go to **Extensions > Apps Script** and check the Execution log for errors.

---

## Step 7 — Authorize the script (first run only)

The first time you run any tool from the BIR Tools menu, Google will show two security screens. This is normal for unverified personal scripts.

**Screen 1 — "Google hasn't verified this app"**

Click **Advanced** → then **"Go to Untitled project (unsafe)"**.

**Screen 2 — Permissions request**

Click **Select all** → then **Continue**.

You only need to do this once. The script will proceed normally on all future runs.

---

## Step 8 — Set up the input sheets

For each generator, run its Setup function from the menu before trying to generate:

| Menu path | What it does |
|-----------|-------------|
| BIR Tools > Form 2307 > Setup Form 2307 Sheet | Creates the Form 2307 input tab |
| BIR Tools > Form 2317 > Setup Form 2317 Sheet | Creates the Form 2317 input tab |
| BIR Tools > SLSP > Setup SLSP Sheet | Creates the SLSP input tab |
| BIR Tools > QAP > Setup QAP Sheet | Creates the QAP input tab |

---

## Step 9 — Seed test data

Instead of filling in the sheets manually, use the Developer menu to load sample data in one click.

Run `./seed.sh` to open the Sheet automatically:

```bash
./seed.sh
```

Then in the Sheet click: **BIR Tools > Developer > Load All Sample Data**

This populates all 4 sheets (2307, 2317, SLSP, QAP) with valid test data. Individual options are also available under the Developer submenu if you only want to seed one form.

> Run each sheet's **Setup** function first (Step 8) before seeding — the seed functions write into existing sheets, they do not create them.

After seeding, run Generate from each submenu to verify end-to-end output.

---

## Daily workflow

```bash
# Edit files in src/
clasp push        # upload to Apps Script
# Test in the Sheet
git add src/
git commit -m "your message"
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `clasp: command not found` | Run `npm install -g @google/clasp` |
| `User has not enabled the Apps Script API` | Go to https://script.google.com/home/usersettings and turn the API on |
| `Manifest file has been updated. Overwrite?` | Type **Yes** — this is expected on the first push |
| `Project contents must include a manifest named appsscript` | `appsscript.json` must be inside `src/`, not the project root — it already is in this repo |
| `Error: Invalid API call` on push | Wrong or missing `scriptId` in `.clasp.json` — re-copy from Project Settings |
| `Parent ID not set, unable to open document` | Missing `parentId` in `.clasp.json` — add the Sheet file ID from the Sheet URL |
| `Unknown command "clasp open"` | Removed in v3 — use `clasp open-container` or `clasp open-script` |
| BIR Tools menu not showing | Reload the Google Sheet after `clasp push` |
| Script error when clicking a tool | Open **Extensions > Apps Script** → check the **Execution log** |
