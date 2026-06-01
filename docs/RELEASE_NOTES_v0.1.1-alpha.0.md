# DevTrail v0.1.1-alpha.0

DevTrail is a local-first VS Code extension that helps beginner developers understand selected code, terminal commands, and project setup in plain English.

## Alpha Notice

This is an alpha prerelease for early testing. Explanations can still be incomplete or imperfect, and DevTrail should be treated as a learning helper rather than a source of guaranteed correctness.

## What Changed

- AI explanations now use a soft slow-warning instead of a strict timeout fallback.
- The explanation webview opens immediately with a loading state while AI is working.
- If AI is slower than expected, users can choose `Keep waiting` or `Use local explanation`.
- Choosing `Keep waiting` keeps the same AI request running without starting another one.
- Choosing `Use local explanation` renders the local explanation immediately.
- Late AI responses are ignored if the user already switched to a local explanation.
- Closing the explanation webview cleans up pending AI state.

## Privacy And Local-First Behavior

DevTrail still runs locally by default. AI explanations remain optional and require the user to enable AI mode and store an OpenAI API key in VS Code SecretStorage.

DevTrail does not include telemetry, analytics, accounts, cloud sync, payments, or remote pack downloads.

## Install From The .vsix

1. Download `devtrail-0.1.1-alpha.0.vsix` from this prerelease.
2. Open VS Code.
3. Run `Extensions: Install from VSIX...`.
4. Select the downloaded `.vsix` file.
5. Reload VS Code if prompted.

Command-line install:

```sh
code --install-extension devtrail-0.1.1-alpha.0.vsix
```

## Feedback Requested

Please test AI explanation loading, the slow-warning choices, local fallback behavior, and normal local explanations. Do not include API keys, `.env` values, private source code, or other secrets in feedback.
