# DevTrail v0.5.0-beta.0

This beta focuses on making DevTrail easier to start using immediately after installation.

## What's New

- First-install setup guide auto-launch.
- Clear `Finish Setup` flow that stores setup completion.
- Default keyboard shortcuts for Explain Selection, Explain Command, Open Setup Guide, Manage Packs, and Change Explanation Level.
- Editor right-click menu actions for explaining selected code, changing explanation level, and opening setup.
- `$(sparkle) DevTrail` status bar quick access menu.
- New `DevTrail: Quick Start` command for common first actions.
- Setup guide wording now explains local mode, optional AI, packs, shortcuts, the status bar, and what to try first.
- Shortcut documentation in `docs/SHORTCUTS.md`.

## Privacy And Safety

- AI remains optional and disabled by default.
- Local fallback still works.
- API keys are still stored with VS Code SecretStorage.
- No telemetry, analytics, accounts, cloud sync, payments, tracking, or external scripts were added.

## Install

1. Download `devtrail-0.5.0-beta.0.vsix` from the GitHub prerelease when available.
2. Open VS Code.
3. Run `Extensions: Install from VSIX...`.
4. Select the downloaded file.
5. Reload VS Code if prompted.
6. The setup guide should open automatically on first activation.

Command-line install:

```sh
code --install-extension devtrail-0.5.0-beta.0.vsix
```

## Known Notes

- First-run auto-open uses VS Code globalState and only runs once per user profile unless state is reset.
- Existing users who already saw the older welcome prompt may need to run `DevTrail: Open Setup Guide` manually.
- Shortcuts can be changed in VS Code Keyboard Shortcuts if they conflict with another extension.
