# Code of Conduct

## Our Standards

As a team of OJT interns working on a professional project, we hold each other to these standards:

### Expected Behavior

- Communicate respectfully in issues, PRs, and code reviews
- Give constructive feedback — critique the code, not the person
- Ask questions openly — no question is too basic
- Help teammates who are stuck
- Respond to review comments and standup updates promptly

### Unacceptable Behavior

- Dismissive or disrespectful comments in code reviews or issues
- Committing or pushing real company data (TINs, names, financial records) to the repository
- Sharing repository credentials, API keys, or `.clasp.json` script IDs publicly
- Bypassing CI checks or branch protection without DevOps approval
- Committing directly to `main` or `develop`

---

## Data Compliance Rules

This project handles BIR-related data structures. Follow these rules strictly:

1. **No real TINs** in source code, test files, or sample data — use `000-000-000-000`
2. **No real company names** — use `Sample Company Inc.`
3. **No real employee or contractor names** — use `Juan Dela Cruz`
4. **No real amounts from actual transactions** — use round numbers like `10000.00`
5. **Never commit `.clasp.json`** with a real Script ID — it stays in `.gitignore`
6. **Never commit `.clasprc.json`** — this contains your Google login credentials

Violations may expose the company to data compliance issues. When in doubt, ask DevOps.

---

## Reporting Issues

If you see a violation of this code of conduct or a data compliance concern, report it directly to the DevOps lead or the supervising senior developer — do not post it as a public GitHub issue.

---

*Adapted from the [Contributor Covenant](https://www.contributor-covenant.org/)*
