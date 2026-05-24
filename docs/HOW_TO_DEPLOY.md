# HOW_TO_DEPLOY.md — Developer Setup Guide

## Prerequisites

- Node.js v14+
- Git
- A Google account (the one that owns the target Google Sheet)

---

## First-time setup

### 1. Clone and install clasp

```bash
git clone https://github.com/Danncode10/bir-compliance-toolkit.git
cd bir-compliance-toolkit
npm install -g @google/clasp
```

### 2. Log in to Google

```bash
clasp login
```

A browser tab opens. Sign in and click **Allow** on all permissions.

### 2a. Enable the Apps Script API

Visit **https://script.google.com/home/usersettings** and toggle **Google Apps Script API** to **On**.

This is a one-time step per Google account. `clasp push` will fail with "User has not enabled the Apps Script API" if skipped.

### 3. Link to a Google Apps Script project

**Pick one path — do not do both.**

---

**Path A — No Sheet yet (recommended)**

```bash
clasp create --title "BIR Compliance Toolkit" --type sheets
```

Creates a new Google Sheet + linked Apps Script project and writes `.clasp.json` automatically. Skip to Step 4.

---

**Path B — You already have a Sheet**

1. Open the Sheet → **Extensions > Apps Script**
2. Click ⚙️ **Project Settings** → copy the **Script ID**
3. Paste it into `.clasp.json`:

```json
{
  "scriptId": "PASTE_YOUR_SCRIPT_ID_HERE",
  "rootDir": "./src"
}
```

Then go to Step 4. Do **not** run `clasp create` — that would create a second project and disconnect your Sheet.

### 4. Push the code

```bash
clasp push
```

Expected output:
```
└─ src/onOpen.gs
└─ src/generate2307.gs
└─ src/generate2317.gs
└─ src/generateSLSP.gs
└─ src/generateQAP.gs
└─ src/utils.gs
```

### 5. Open and verify

```bash
clasp open-script    # opens the Apps Script editor
clasp open-container # opens the linked Google Sheet
```

Reload the Google Sheet — the **BIR Tools** menu should appear in the menu bar.

---

## Daily workflow

```bash
# Edit code in src/
clasp push          # Upload to Apps Script
# Test in the Sheet
git add src/
git commit -m "your message"
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `clasp: command not found` | Run `npm install -g @google/clasp` |
| `User has not enabled the Apps Script API` | Visit https://script.google.com/home/usersettings and turn on **Google Apps Script API** |
| `Error: Invalid API call` on push | Your `.clasp.json` has a wrong or missing Script ID — re-run `clasp create` or paste the correct ID |
| BIR Tools menu not showing | Reload the Google Sheet after `clasp push` |
| `Permission denied` on file creation | Check `appsscript.json` has the Drive OAuth scope (it does by default) |
| Script error when clicking a tool | Open **Extensions > Apps Script → Execution log** to see the stack trace |

---

## Security

`.clasp.json` is in `.gitignore` — it never gets committed. If you need to share setup with a teammate, they run `clasp create` themselves (or copy the Script ID from the Sheet's Apps Script settings).
