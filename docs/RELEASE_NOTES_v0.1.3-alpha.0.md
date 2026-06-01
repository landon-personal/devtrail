# DevTrail v0.1.3-alpha.0

DevTrail is a local-first VS Code extension that helps beginner developers understand selected code, terminal commands, and project setup in plain English.

## Alpha Notice

This is an alpha prerelease for early testing. Explanations can still be incomplete or imperfect, and DevTrail should be treated as a learning helper rather than a source of guaranteed correctness.

## What Changed

- Fixes the AI formatting failure that could still appear in `v0.1.2-alpha.0`.
- Switches structured AI formatting to Chat Completions parsing.
- Uses `zodResponseFormat` for schema-constrained AI explanation output.
- Uses `gpt-4o-mini` as the default structured formatting model through `devtrail.ai.structuredModel`.
- Keeps one JSON-only fallback AI request if structured parsing cannot be parsed.
- Keeps local fallback if AI output is missing, refused, invalid, or cannot be parsed safely.
- Adds `DevTrail: Test AI Formatting`, which sends only a tiny hardcoded JavaScript sample to verify structured parsing.
- Shows safe diagnostic details when the formatting test fails, without logging API keys, project code, or full model output.
- AI remains optional and must be explicitly enabled by the user.
- API keys and selected project code are not logged, printed, or stored in project files. API keys remain in VS Code SecretStorage.

## Privacy And Local-First Behavior

DevTrail still runs locally by default. AI explanations remain optional and require the user to enable AI mode and configure an OpenAI API key.

DevTrail does not include telemetry, analytics, accounts, cloud sync, payments, or remote pack downloads.

## Install From The .vsix

1. Download `devtrail-0.1.3-alpha.0.vsix` from this prerelease.
2. Open VS Code.
3. Run `Extensions: Install from VSIX...`.
4. Select the downloaded `.vsix` file.
5. Reload VS Code if prompted.

Command-line install:

```sh
code --install-extension devtrail-0.1.3-alpha.0.vsix
```

## Feedback Requested

Please test `DevTrail: Test AI Formatting`, AI explanations on React/JSX selections, and local fallback behavior. Do not include API keys, `.env` values, private source code, full model output, or other secrets in feedback.
