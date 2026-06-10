# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- `CONTRIBUTING.md` — intern workflow and contribution guide
- GitHub PR template, issue templates (bug report, feature request)
- `CODEOWNERS` — auto-assign DevOps as reviewer
- CI pipeline (`ci.yml`) — lint, typecheck, build on every PR
- Claude AI review bot (`claude-review.yml`) — `@claude` in any PR/issue
- `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`

---

## [v0.1.0] - 2026-06-10

### Added
- BIR Form 2307 PDF Generator (`src/generate2307.gs`)
- BIR Form 2317 PDF Generator (`src/generate2317.gs`)
- SLSP DAT File Generator (`src/generateSLSP.gs`)
- QAP DAT File Generator (`src/generateQAP.gs`)
- Shared utility functions (`src/utils.gs`)
- Custom BIR Tools menu in Google Sheets (`src/onOpen.gs`)
- Sample CSV templates for SLSP and QAP
- Full documentation (`docs/`)
- clasp configuration and setup guide

---

<!-- 
How to update this file on each release:

1. Move items from [Unreleased] to a new version section
2. Add the release date
3. Use these categories:
   - Added: new features
   - Changed: changes to existing features
   - Deprecated: features that will be removed
   - Removed: removed features
   - Fixed: bug fixes
   - Security: security fixes
-->
