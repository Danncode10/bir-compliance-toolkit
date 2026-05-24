# Custom Slash Commands — BIR Compliance Toolkit

Drop `.md` files here to add custom slash commands. Each file becomes `/filename` in Claude Code.

## Commands

| Command | Argument | Purpose |
|---------|----------|---------|
| `/make-command` | `<description>` | Creates a new custom slash command from plain English, checks for conflicts, updates this README and guide.sh |
| `/new-generator` | `<form-name>` | Scaffolds a new BIR form generator following the 3-function pattern, then wires it into `onOpen.gs` |
| `/validate-bir` | `2307\|2317\|SLSP\|QAP\|all` | Audits a generator against BIR compliance rules — missing validations, DAT format gaps, edge cases |
| `/gen-user-docs` | `2307\|2317\|SLSP\|QAP` | Reads a generator's source and writes/updates its step-by-step user guide section in `docs/HOW_TO_USE.md` |
| `/gen-dev-docs` | `2307\|2317\|SLSP\|QAP` | Reads a generator's source and writes/updates its technical section in `docs/PROJECT_OVERVIEW.md` |

## File format

```markdown
---
description: One-line summary (used for routing).
argument-hint: <args> (shown in help)
---

Prompt body. Use $ARGUMENTS where the user's input goes.
```

## Workflow

```
Implement generator  →  /validate-bir <name>  →  fix issues
                     →  /gen-user-docs <name>  →  user guide updated
                     →  /gen-dev-docs <name>   →  dev docs updated
                     →  git commit
```

New generator from scratch:
```
/new-generator <form-name>  →  scaffold .gs + wire menu
                            →  /validate-bir <name>
                            →  /gen-user-docs <name>
                            →  /gen-dev-docs <name>
```
