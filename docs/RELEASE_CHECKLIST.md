# DevTrail Release Checklist

Use this before creating a GitHub prerelease. Do not publish to the VS Code Marketplace from this checklist.

## Local Build

- Run `npm install` if dependencies changed.
- Run `npm run compile`.
- Run `npm run package`.
- Confirm the expected `.vsix` exists.
- Install the VSIX locally:

  ```sh
  code --install-extension /Users/landon/devtrail/devtrail-VERSION.vsix --force
  ```

## Manual VS Code QA

- Test in a clean VS Code profile if possible.
- Confirm first-install setup opens automatically.
- Click `Finish Setup` and confirm setup does not reopen repeatedly.
- Run `DevTrail: Quick Start`.
- Click the `$(sparkle) DevTrail` status bar item.
- Test default keyboard shortcuts from `docs/SHORTCUTS.md`.
- Right-click selected code and run `DevTrail: Explain Selection`.
- Run `DevTrail: Open Setup Guide`.
- Choose each explanation level.
- Install a recommended pack from setup.
- Run `DevTrail: Manage Packs`.
- Install and uninstall React Basics.
- Use the Manage Packs reset flow.
- Open `App.jsx` and confirm hover explanations work.
- Run `DevTrail: Explain Selection` with AI disabled.
- Test no active editor and no selected text messages.
- Test unsupported command explanation.
- Run `DevTrail: Test AI Formatting` if AI is configured.
- Test AI slow warning by lowering `devtrail.ai.slowWarningMs`.
- Test AI enabled with no API key.
- Test sensitive selection fallback with fake secret-looking text.
- Test oversized selection fallback.
- Run `DevTrail: Explain Command` with `git status`.
- Run `DevTrail: Analyze Project`.
- Test no workspace, no `package.json`, and invalid `package.json` paths.
- Run `DevTrail: Refresh Project Scan`.
- Confirm Manage Packs still opens when no suggested packs are available.

## Documentation Checks

- Check README install instructions.
- Check `docs/V1_RELEASE_CANDIDATE.md`.
- Check README optional AI instructions.
- Check `docs/index.html` links.
- Check `docs/WEBSITE.md`.
- Check `docs/TESTER_FEEDBACK.md`.
- Check release notes for the new version.
- Check screenshot guidance in `docs/SCREENSHOTS.md`.

## Safety Checks

- Confirm `.gitignore` ignores `node_modules/`, `out/`, `*.vsix`, `.env`, and `.DS_Store`.
- Run a simple secret scan:

  ```sh
  rg -n "OPENAI_API_KEY|API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY" .
  ```

- Confirm any matches are fake examples or safety docs.
- Do not commit API keys, `.env` values, private source code, school/private data, or secrets.
- Confirm `.github/**`, `docs/**`, and `*.vsix` are not packaged into the VSIX unless intentionally changed.

## GitHub Prerelease

- Commit release prep changes.
- Push `main`.
- Create the GitHub prerelease with the VSIX attached.
- Confirm the release is marked prerelease.
- Download the VSIX from the release page.
- Install the downloaded VSIX in VS Code.
- Run `DevTrail: Open Setup Guide` from the downloaded install.

## Public Actions

Only after explicit approval:

- Make the repo public.
- Enable GitHub Pages.
- Share the landing page.
