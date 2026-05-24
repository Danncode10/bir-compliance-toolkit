---
description: Creates a new custom slash command from a plain-English description. Auto-updates .claude/commands/README.md and checks for conflicts with existing commands and CLAUDE.md guardrails.
argument-hint: <plain-English description of what the new command should do>
---

The user wants a new custom command: **$ARGUMENTS**

## Step 1 — Understand the request

Parse `$ARGUMENTS` to figure out:
- **What the command should do** (the action)
- **Whether it takes arguments** (e.g. "for a specific generator" → takes `<2307|2317|SLSP|QAP>`)
- **Which category it fits** — match one of the four BIR Toolkit categories:
  - `🚀 Developer Tools` — commands that help build or manage the toolkit itself
  - `🧱 Scaffolding` — commands that generate new .gs files or sheet structures
  - `🛡️ BIR Compliance` — commands that audit, validate, or enforce BIR rules
  - `📚 Documentation` — commands that write or update docs/ files

If the request is too vague, ask ONE clarifying question before proceeding.

## Step 2 — Pick a name

Generate a short kebab-case name. Rules:
- 1–3 words, ≤20 chars
- Verb-led: matches the voice of existing commands (`gen-user-docs`, `validate-bir`, `new-generator`)
- Must not collide with an existing file in `.claude/commands/`
- Must not shadow a built-in Claude Code slash command (`/review`, `/help`, etc.)

## Step 3 — Check for conflicts

List `.claude/commands/*.md` and read each frontmatter `description:`. Check for:

- **Duplicate scope** — does an existing command already do this? If yes, suggest editing the existing one instead. Show both descriptions side by side.
- **Overlapping responsibility** — e.g. user wants `/check-tin` but `/validate-bir` already covers TIN validation. Propose clarifying the boundary or merging.
- **CLAUDE.md guardrail collision** — does the new command contradict a rule? (e.g. a command that rewrites multiple generators at once violates the "one file per generator" rule). Flag loudly and ask before proceeding.

Key guardrails from `CLAUDE.md` to cross-check:
- Never combine generators into one file
- Always call `validateTIN()` and `validateAmount()` from utils — never re-implement
- Validate-before-generate: collect all errors first
- Documentation commands must derive content from source code, not invent it

## Step 4 — Draft the command file

Use this exact structure:

```markdown
---
description: <one-line summary — specific enough to distinguish from other commands>
argument-hint: <args if applicable, omit field if no args>
---

<One sentence: what this command does and on what target.>

## Step 1 — [First action]
...

## Step N — Report

\`\`\`
✅ [Summary of what was done]

Files changed:
  [list]

Suggested commit: <type>: <description>
\`\`\`

## Constraints
- <hard rules — what the command must never do>
```

Body rules:
- Match the voice of existing commands — direct, imperative, no fluff
- Specify the **exact output format**
- Reference actual file paths and function names from this project (`src/generate2307.gs`, `docs/HOW_TO_USE.md`, `src/utils.gs`, etc.)
- Include a **Constraints** section with at least: "Never edit [file] — this command is X-only" if applicable

## Step 5 — Identify what else needs updating

1. **`.claude/commands/README.md`** — ALWAYS update. Add the new command to the Commands table with its argument and purpose.

2. **`CLAUDE.md`** — update ONLY IF the new command introduces a workflow or guardrail not already documented (e.g. adding a `/bir-export` command → add an "Export" section to CLAUDE.md).

3. **`guide.sh`** — update ONLY IF the new command belongs in a new category. The `get_category()` function in `show_commands()` maps command names to display categories. Add a new `case` entry if needed.

4. **Other command files** — update ONLY IF the new command overlaps or supersedes an existing one. Narrow the other command's scope or note the relationship.

## Step 6 — Show the plan and confirm

```
📋 Proposed new command: /<name>

Description: <one-liner>
Arguments:   <args or "none">
Category:    <category emoji + label>

Will create:
  + .claude/commands/<name>.md

Will update:
  📝 .claude/commands/README.md
     — Add /<name> to Commands table

  [conditional — only show if relevant]
  📝 CLAUDE.md
     — <change>
  📝 guide.sh
     — Add "<name>" case to get_category()
  📝 .claude/commands/<other>.md
     — <reason>

Conflicts detected: <none or description>

Proceed? (y/n)
```

Skip confirmation only if the user wrote "go", "yes", or "just do it".

## Step 7 — Apply changes

Write the new command file. Then apply each ripple-effect edit using surgical `Edit` (not full-file rewrites).

## Step 8 — Report

```
✅ Command created: /<name>

Files changed:
  + .claude/commands/<name>.md
  ~ .claude/commands/README.md
  [any other files]

Try it now:
  /<name> <example-args>

Run ./guide.sh commands to see it in the commands table.

Suggested commit: feat(claude): add /<name> command for <purpose>
```

## Constraints

- Never create a command that violates a non-negotiable guardrail in `CLAUDE.md` without explicit user override
- Never overwrite an existing command file silently — always show the plan first
- Never `git add` or `git commit` — leave that for the user
- Never create a command that writes to `src/*.gs` files without a confirm-before-write step inside the command body
- Always add the new command to `.claude/commands/README.md` — the README is the source of truth for `./guide.sh commands`
