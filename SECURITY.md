# Security Policy

## Scope

This project is a Google Apps Script tool that generates BIR compliance documents. It runs inside Google Sheets and has access to Google Drive. Security concerns include:

- Unauthorized access to the linked Google Sheet or Drive files
- Exposure of TINs or financial data through output files
- Compromised clasp credentials or Google OAuth tokens
- Secrets or credentials accidentally committed to the repository

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

If you discover a security issue:

1. Email the DevOps lead directly: **Lesterdannlopez7@gmail.com**
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)
3. You will receive a response within 48 hours
4. Do not disclose the issue publicly until it has been resolved

## What Counts as a Security Issue

- A way to read or export another user's BIR data
- A committed `.clasp.json` with a real Script ID
- A committed `.clasprc.json` (Google OAuth token)
- A committed `.env` file with API keys
- An Apps Script function that exposes data to unauthorized users
- A CI workflow that leaks secrets in logs

## Keeping Secrets Safe

| File | Should be in `.gitignore`? |
|------|---------------------------|
| `.clasp.json` | Yes — contains Script ID |
| `.clasprc.json` | Yes — contains OAuth token |
| `.env` | Yes — any environment variables |
| `appsscript.json` | No — safe to commit |
| `src/*.gs` | No — source code, commit this |

If you accidentally committed a secret, notify DevOps immediately. Do not try to hide it with another commit — the fix requires rewriting git history.
