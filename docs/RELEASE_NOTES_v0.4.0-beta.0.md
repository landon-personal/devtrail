# DevTrail v0.4.0-beta.0

DevTrail is a local-first VS Code extension that helps beginner developers understand selected code, terminal commands, and project setup in plain English.

## Beta Notice

This beta is intended for tester feedback before a wider public launch. DevTrail is still a learning helper, not a source of guaranteed correctness.

## What Changed

- Reliability pass across all Command Palette commands.
- Confirmed command titles and command IDs are consistent between `package.json` and extension registration.
- Friendlier handling for no workspace, no active editor, no selected text, unsupported command explanations, missing `package.json`, invalid `package.json`, oversized AI selections, sensitive-looking selections, AI failures, and AI formatting issues.
- Safer pack registry and command pack loading so missing or malformed bundled JSON does not break core local fallback behavior.
- Improved wording in explanation webviews, Manage Packs, AI formatting diagnostics, and user-facing messages.
- Documentation accuracy pass for README, QA, AI privacy, pack security, public tester notes, release checklist, and tester feedback guidance.
- Beta preparation updates for versioning, release notes, and tester status docs.

## Privacy And Local-First Behavior

DevTrail still runs locally by default. AI explanations remain optional and require the user to enable AI mode and configure an OpenAI API key.

DevTrail does not include telemetry, analytics, accounts, cloud sync, payments, tracking, remote pack downloads, or Marketplace publishing in this beta.

Do not share API keys, `.env` values, private code, school/private data, or secrets in feedback.

## Install From The .vsix

1. Download `devtrail-0.4.0-beta.0.vsix` from this prerelease.
2. Open VS Code.
3. Run `Extensions: Install from VSIX...`.
4. Select the downloaded `.vsix` file.
5. Reload VS Code if prompted.
6. Run `DevTrail: Open Setup Guide`.

Command-line install:

```sh
code --install-extension devtrail-0.4.0-beta.0.vsix
```

## Known Limitations

- Local code explanation is still pattern-based.
- React/JSX local fallback covers common patterns, not every valid React structure.
- Pack installation only enables bundled JSON/content packs.
- There is no remote pack marketplace yet.
- Project analysis supports `package.json` projects only.
- Optional AI requires a user-provided OpenAI API key and network access.
- The repo should remain private until public launch approval.

## Feedback Requested

Please test command reliability, friendly fallback paths, local explanations, optional AI fallback behavior, Manage Packs, Analyze Project, and the setup guide.

