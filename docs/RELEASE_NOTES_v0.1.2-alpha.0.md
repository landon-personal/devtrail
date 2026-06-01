# DevTrail v0.1.2-alpha.0

DevTrail is a local-first VS Code extension that helps beginner developers understand selected code, terminal commands, and project setup in plain English.

## Alpha Notice

This is an alpha prerelease for early testing. Explanations can still be incomplete or imperfect, and DevTrail should be treated as a learning helper rather than a source of guaranteed correctness.

## What Changed

- AI explanations now use OpenAI structured outputs with schema validation.
- Normal AI responses should hit fewer `AI formatting failed` local fallbacks.
- AI explanation sections should render with cleaner, more consistent formatting.
- DevTrail still falls back to local explanations if AI output cannot be parsed safely.
- API keys are not logged, printed, or stored in project files. They remain in VS Code SecretStorage.

## Privacy And Local-First Behavior

DevTrail still runs locally by default. AI explanations remain optional and require the user to enable AI mode and configure an OpenAI API key.

DevTrail does not include telemetry, analytics, accounts, cloud sync, payments, or remote pack downloads.

## Install From The .vsix

1. Download `devtrail-0.1.2-alpha.0.vsix` from this prerelease.
2. Open VS Code.
3. Run `Extensions: Install from VSIX...`.
4. Select the downloaded `.vsix` file.
5. Reload VS Code if prompted.

Command-line install:

```sh
code --install-extension devtrail-0.1.2-alpha.0.vsix
```

## Feedback Requested

Please test AI explanations on JavaScript, TypeScript, React, and JSX selections. Report any formatting failures, vague explanations, or local fallback behavior that feels confusing. Do not include API keys, `.env` values, private source code, or other secrets in feedback.
