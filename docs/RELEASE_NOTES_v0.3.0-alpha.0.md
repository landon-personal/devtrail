# DevTrail v0.3.0-alpha.0

DevTrail is a local-first VS Code extension that helps beginner developers understand selected code, terminal commands, and project setup in plain English.

## Alpha Notice

This is an alpha prerelease for manual testing. DevTrail is still a learning helper, not a source of guaranteed correctness.

## What Changed

- Adds a public-alpha landing page at `docs/index.html`.
- Polishes README wording for new testers who have never seen DevTrail before.
- Adds GitHub issue templates for bug reports, feature requests, and explanation feedback.
- Adds `docs/RELEASE_CHECKLIST.md` for repeatable compile, package, local install, QA, secret scan, and prerelease checks.
- Adds `docs/WEBSITE.md` for previewing the static landing page and enabling GitHub Pages later only after approval.
- Adds `docs/SCREENSHOTS.md` with safe screenshot and GIF guidance.
- Updates tester-ready docs and feedback guidance.

## Privacy And Local-First Behavior

DevTrail still runs locally by default. AI explanations remain optional and require the user to enable AI mode and configure an OpenAI API key.

DevTrail does not include telemetry, analytics, accounts, cloud sync, payments, tracking, or remote pack downloads.

Do not share API keys, `.env` values, private code, school/private data, or secrets in feedback.

## Install From The .vsix

1. Download `devtrail-0.3.0-alpha.0.vsix` from this prerelease.
2. Open VS Code.
3. Run `Extensions: Install from VSIX...`.
4. Select the downloaded `.vsix` file.
5. Reload VS Code if prompted.
6. Run `DevTrail: Open Setup Guide`.

Command-line install:

```sh
code --install-extension devtrail-0.3.0-alpha.0.vsix
```

## Known Limitations

- Local code explanation is still pattern-based.
- React/JSX local fallback covers common patterns, not every valid React structure.
- Pack installation only enables bundled JSON/content packs.
- There is no remote pack marketplace yet.
- Project analysis supports `package.json` projects only.
- Optional AI requires a user-provided OpenAI API key and network access.
- GitHub Pages is not enabled yet.
- The repo should remain private until public launch approval.

## Feedback Requested

Please test the landing page copy, README setup flow, issue templates, setup guide, Manage Packs, explanation levels, hover explanations, Analyze Project, and optional AI fallback behavior.

