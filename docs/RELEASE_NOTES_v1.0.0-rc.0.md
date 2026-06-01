# DevTrail v1.0.0-rc.0

This is the release candidate for DevTrail v1. It is intended for final testing before `v1.0.0`.

## Included

- First-install setup guide auto-launch.
- `Finish Setup` flow for completing onboarding.
- `DevTrail: Quick Start` for common first actions.
- Keyboard shortcuts for common DevTrail commands.
- Status bar quick actions.
- Right-click `DevTrail: Explain Selection`.
- Local explanations for JavaScript, TypeScript, React, and JSX beginner patterns.
- Hover explanations in `.js`, `.jsx`, `.ts`, and `.tsx`.
- Explain Command for common Git and npm commands.
- Analyze Project and Refresh Project Scan for `package.json` projects.
- Manage Packs for bundled local learning packs.
- Beginner, Learning, and Advanced explanation levels.
- Optional AI explanations with structured formatting checks.
- Local fallback when AI is disabled, unavailable, canceled, unsafe, oversized, or fails.

## Privacy And Local-First Behavior

- DevTrail works locally by default.
- AI is optional and disabled by default.
- API keys are stored with VS Code SecretStorage.
- DevTrail blocks obvious sensitive selections from AI requests.
- DevTrail does not include telemetry, analytics, accounts, cloud sync, payments, tracking, or external scripts.
- Bundled packs are JSON/content only and do not execute code.

## Install

1. Download `devtrail-1.0.0-rc.0.vsix` from this prerelease.
2. Open VS Code.
3. Run `Extensions: Install from VSIX...`.
4. Select the downloaded file.
5. Reload VS Code if prompted.
6. The setup guide should open automatically on first activation.

Command-line install:

```sh
code --install-extension devtrail-1.0.0-rc.0.vsix
```

## Release Candidate Notes

- This is not a Marketplace release.
- No major new features should be added before v1 unless a serious bug appears.
- Testers should focus on install flow, setup, shortcuts, status bar access, local explanations, optional AI fallback behavior, docs, and broken links.
