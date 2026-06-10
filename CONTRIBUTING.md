# Contributing Guide

Welcome to the BIR Compliance Toolkit. This guide explains how to work on this project as a team.

---

## Prerequisites

Before you start, make sure you have:
- Git installed
- Node.js v20+
- clasp installed (`npm install -g @google/clasp`)
- Access to the team Google account for clasp login

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/Danncode10/bir-compliance-toolkit.git
cd bir-compliance-toolkit

# 2. Install dependencies
npm install

# 3. Set up clasp
cp .clasp.json.example .clasp.json
# Fill in your Script ID — ask DevOps for the dev script ID
clasp login
```

---

## Branch Strategy

We follow GitFlow. Never commit directly to `main` or `develop`.

```
main       ← stable production code only
develop    ← integration branch, all features merge here
feature/*  ← your working branch
bugfix/*   ← bug fixes
docs/*     ← documentation changes
```

### Branch Naming

```bash
git checkout -b feature/OJT-12-slsp-export    # new feature
git checkout -b bugfix/OJT-15-tin-validation  # bug fix
git checkout -b docs/contributing-guide        # docs only
```

Always branch off `develop`, not `main`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/OJT-xx-your-feature
```

---

## Making Changes

```bash
# Edit files in src/
clasp push          # upload to Apps Script to test in the Sheet
# Test your changes in the linked Google Sheet
git add src/your-file.gs
git commit -m "feat(slsp): add VAT computation"
git push origin feature/OJT-xx-your-feature
```

---

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <short description>
```

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change with no behavior change |
| `test` | Adding or updating tests |
| `chore` | Dependency updates, config changes |
| `ci` | CI/CD workflow changes |

**Good examples:**
```
feat(slsp): add quarterly header validation
fix(utils): handle null TIN in formatTIN()
docs(readme): update clasp setup steps
chore: add husky pre-commit hooks
```

**Bad examples:**
```
fixed stuff
update
WIP
```

---

## Opening a Pull Request

1. Push your branch to GitHub
2. Go to the repo → click **"Compare & pull request"**
3. Fill out the PR template completely
4. Set base branch to `develop` (not `main`)
5. Request review from **@your-devops-username**
6. Wait for CI to pass (green checkmarks)
7. Do not merge your own PR

---

## Code Review Process

- DevOps reviews all PRs within 24 hours
- Address all comments before re-requesting review
- Once approved + CI passes, DevOps merges

---

## Testing Your Changes

Before pushing, always test in the linked Google Sheet:

```bash
clasp push
# Open the Sheet: clasp open-container
# Click BIR Tools menu → run your tool
# Verify output is correct
```

---

## Need Help?

- Open a GitHub Issue with the `question` label
- Tag `@claude` in any issue or PR comment for AI assistance
- Ask DevOps directly during standup
