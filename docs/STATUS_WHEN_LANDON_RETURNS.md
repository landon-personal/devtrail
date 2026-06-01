# DevTrail Status When Landon Returns

## What Changed

- Bumped DevTrail to `0.3.0-alpha.0`.
- Polished the public alpha landing page at `docs/index.html`.
- Updated README so a new tester can understand what DevTrail is, how to install from VSIX, how to run the setup guide, how optional AI works, what stays local, limitations, roadmap, and issue reporting.
- Added website maintenance docs in `docs/WEBSITE.md`.
- Added GitHub issue templates:
  - `.github/ISSUE_TEMPLATE/bug_report.md`
  - `.github/ISSUE_TEMPLATE/feature_request.md`
  - `.github/ISSUE_TEMPLATE/explanation_feedback.md`
- Added `docs/RELEASE_CHECKLIST.md`.
- Added `docs/SCREENSHOTS.md`.
- Added `docs/RELEASE_NOTES_v0.3.0-alpha.0.md`.
- Updated `.vscodeignore` so `.github/**` does not ship in the VSIX.

## Verification Results

- `npm run compile`: passed.
- `npm run package`: passed.
- Generated VSIX: `devtrail-0.3.0-alpha.0.vsix`.
- VSIX install: passed.

Installed with:

```sh
code --install-extension /Users/landon/devtrail/devtrail-0.3.0-alpha.0.vsix --force
```

## Exact Next Manual Steps

After final verification, manually test in VS Code:

1. Run `DevTrail: Open Setup Guide`.
2. Run `DevTrail: Manage Packs`.
3. Open `App.jsx` and test hover explanations.
4. Run `DevTrail: Explain Selection` with AI disabled.
5. If AI is configured, run `DevTrail: Test AI Formatting`.
6. Preview `docs/index.html` locally.
7. Check links listed in `docs/WEBSITE.md`.
8. Capture screenshots listed in `docs/SCREENSHOTS.md`.
9. Follow `docs/RELEASE_CHECKLIST.md` before any GitHub prerelease.

## Repo Visibility

No repo visibility change was performed. GitHub CLI reported `landon-personal/devtrail` visibility as `PRIVATE`.

## Public Actions

No commit, push, GitHub release, GitHub Pages enablement, marketplace publish, or repo visibility change was performed during the v0.3 local prep pass.
