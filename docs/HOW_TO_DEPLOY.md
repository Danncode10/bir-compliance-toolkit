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

### 3. Create the Google Sheet + Apps Script project

```bash
clasp create --title "BIR Compliance Toolkit" --type sheets
```

This does three things at once:
- Creates a new Google Sheet
- Creates a linked Apps Script project
- Writes your `.clasp.json` with the real Script ID automatically — no copy-pasting needed

> **Already have a Sheet?** Open it → **Extensions > Apps Script** → ⚙️ **Project Settings** → copy the Script ID → paste it into `.clasp.json` (`scriptId` field).

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
clasp open
```

This opens the Apps Script editor. Switch to the linked Google Sheet, reload the page — the **BIR Tools** menu should appear in the menu bar.

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
| `Error: Invalid API call` on push | Your `.clasp.json` has a wrong or missing Script ID — re-run `clasp create` or paste the correct ID |
| BIR Tools menu not showing | Reload the Google Sheet after `clasp push` |
| `Permission denied` on file creation | Check `appsscript.json` has the Drive OAuth scope (it does by default) |
| Script error when clicking a tool | Open **Extensions > Apps Script → Execution log** to see the stack trace |

---

## Security

`.clasp.json` is in `.gitignore` — it never gets committed. If you need to share setup with a teammate, they run `clasp create` themselves (or copy the Script ID from the Sheet's Apps Script settings).
