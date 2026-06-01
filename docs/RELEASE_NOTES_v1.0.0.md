# DevTrail v1.0.0

DevTrail v1.0.0 is the first stable release of DevTrail, a beginner-friendly VS Code extension for understanding code, terminal commands, and project setup.

## Highlights

- Beginner-friendly setup guide.
- First-install setup flow that opens automatically.
- `DevTrail: Quick Start` for common first actions.
- Keyboard shortcuts for everyday DevTrail commands.
- `$(sparkle) DevTrail` status bar quick actions.
- Right-click `DevTrail: Explain Selection`.
- `DevTrail: Explain Selection` for selected JavaScript, TypeScript, React, and JSX code.
- Hover explanations in `.js`, `.jsx`, `.ts`, and `.tsx`.
- `DevTrail: Explain Command` for common Git and npm commands.
- `DevTrail: Analyze Project` for `package.json` projects.
- `DevTrail: Manage Packs` for bundled local learning packs.
- Beginner, Learning, and Advanced explanation levels.
- Optional AI explanations with structured formatting reliability checks.
- Local fallback explanations when AI is disabled, unavailable, canceled, unsafe, oversized, or fails.

## Privacy And Local-First Design

- DevTrail works locally by default.
- AI explanations are optional and disabled by default.
- API keys are stored with VS Code SecretStorage.
- DevTrail blocks obvious sensitive selections from AI requests.
- DevTrail does not include telemetry, analytics, accounts, cloud sync, payments, tracking, or external scripts.
- Bundled packs are JSON/content only and do not execute code.

## Install

1. Download `devtrail-1.0.0.vsix` from this release.
2. Open VS Code.
3. Run `Extensions: Install from VSIX...`.
4. Select the downloaded file.
5. Reload VS Code if prompted.
6. The setup guide should open automatically on first activation.

Command-line install:

```sh
code --install-extension devtrail-1.0.0.vsix
```

## Notes

- DevTrail is not published to the VS Code Marketplace yet.
- Local explanations are pattern-based and can still be incomplete or imperfect.
- Optional AI can be wrong; local fallback remains available.
- Remote pack downloads and a pack marketplace are not included in v1.0.0.
