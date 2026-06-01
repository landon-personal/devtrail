# DevTrail Status When Landon Returns

## What Changed

- Bumped DevTrail to `1.0.0`.
- Added `docs/RELEASE_NOTES_v1.0.0.md`.
- Updated README and public docs from release-candidate wording to final v1.0.0 wording.
- Updated `docs/index.html` to point at the planned `v1.0.0` release.
- Updated QA, AI privacy, pack security, release checklist, tester feedback, public notes, and public release steps for v1.0.0.
- Kept `docs/V1_RELEASE_CANDIDATE.md` as a historical RC archive.

No major product features were added. AI remains optional and local fallback behavior is unchanged.

## Verification Results

- Final safety scan: no concerning secrets found.
- Secret-shaped scan: no key-shaped `sk-...` values found.
- `npm run compile`: passed.
- `npm run package`: passed.
- Generated VSIX: `devtrail-1.0.0.vsix`.
- VSIX path: `/Users/landon/devtrail/devtrail-1.0.0.vsix`.
- VSIX install: passed.

Installed with:

```sh
code --install-extension /Users/landon/devtrail/devtrail-1.0.0.vsix --force
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
8. Follow `docs/QA.md` before approving the `v1.0.0` GitHub release.

## Blockers

No blockers found during compile, package, safety scan, or install.

## Public Actions

The `v1.0.0` prep changes were committed and pushed to `main`.

No GitHub release, Marketplace publish, repo visibility change, or GitHub Pages change was performed before Landon's explicit release approval.

Current public state before the final release is created:

- Repo: `landon-personal/devtrail`
- Visibility: `PUBLIC`
- Current public prerelease: `v1.0.0-rc.0`
- Current public VSIX asset: `devtrail-1.0.0-rc.0.vsix`
- Repo URL: `https://github.com/landon-personal/devtrail`
- Current public release URL: `https://github.com/landon-personal/devtrail/releases/tag/v1.0.0-rc.0`
- Planned v1 release URL: `https://github.com/landon-personal/devtrail/releases/tag/v1.0.0`
- Pages URL: `https://landon-personal.github.io/devtrail/`
