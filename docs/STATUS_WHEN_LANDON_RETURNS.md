# DevTrail Status When Landon Returns

## What Changed

- Bumped DevTrail to `1.0.0-rc.0`.
- Added `docs/V1_RELEASE_CANDIDATE.md` with the feature-freeze guidance.
- Added `docs/RELEASE_NOTES_v1.0.0-rc.0.md`.
- Updated README and public docs for release-candidate wording.
- Updated `docs/index.html` to point at the planned `v1.0.0-rc.0` release.
- Updated QA, AI privacy, pack security, release checklist, tester feedback, and public release steps for RC testing.
- Reordered contributed command list so `DevTrail: Quick Start` and `DevTrail: Open Setup Guide` appear first.

No major product features were added. AI remains optional and local fallback behavior is unchanged.

## Verification Results

- Command registration audit: passed.
- AI safety audit: passed.
- Secret-shaped scan: no key-shaped `sk-...` values found.
- `npm run compile`: passed.
- `npm run package`: passed.
- Generated VSIX: `devtrail-1.0.0-rc.0.vsix`.
- VSIX path: `/Users/landon/devtrail/devtrail-1.0.0-rc.0.vsix`.
- Automatic VSIX install: not completed because the `code` command was not available in this shell, and the standard macOS VS Code CLI path was not present.

## Manual Install Steps

1. Open VS Code.
2. Open the Command Palette.
3. Run `Extensions: Install from VSIX...`.
4. Select:

   ```text
   /Users/landon/devtrail/devtrail-1.0.0-rc.0.vsix
   ```

5. Reload VS Code if prompted.

If the `code` command is available later, this command should work:

```sh
code --install-extension /Users/landon/devtrail/devtrail-1.0.0-rc.0.vsix --force
```

## Exact First Command To Run In VS Code

Run:

```text
DevTrail: Open Setup Guide
```

For a true fresh-install test, use a clean VS Code profile so globalState is empty. Existing installs may not auto-open setup if older DevTrail state is already present.

## Manual QA To Run Next

1. Confirm setup auto-opens on first install in a clean profile.
2. Click `Finish Setup` and confirm setup does not reopen repeatedly after reload.
3. Run `DevTrail: Quick Start`.
4. Click the `$(sparkle) DevTrail` status bar item.
5. Confirm shortcuts from `docs/SHORTCUTS.md`.
6. Right-click selected code and run `DevTrail: Explain Selection`.
7. Run `DevTrail: Test AI Formatting` if AI is configured.
8. Follow `docs/QA.md` before any `v1.0.0-rc.0` GitHub prerelease.

## Blockers

- No compile or package blockers.
- Manual VSIX install is needed unless the VS Code `code` command is added to PATH.

## Public Actions

No commit, push, GitHub release, Marketplace publish, repo visibility change, or GitHub Pages change was performed during the `v1.0.0-rc.0` prep pass.

Current public state before this RC is released:

- Repo: `landon-personal/devtrail`
- Visibility: `PUBLIC`
- Current public prerelease: `v0.5.0-beta.0`
- Current public VSIX asset: `devtrail-0.5.0-beta.0.vsix`
- Repo URL: `https://github.com/landon-personal/devtrail`
- Current public release URL: `https://github.com/landon-personal/devtrail/releases/tag/v0.5.0-beta.0`
- Planned RC release URL: `https://github.com/landon-personal/devtrail/releases/tag/v1.0.0-rc.0`
- Pages URL: `https://landon-personal.github.io/devtrail/`
