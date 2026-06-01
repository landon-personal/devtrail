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

- Run `DevTrail: Open Setup Guide`.
- Choose each explanation level.
- Install a recommended pack from setup.
- Run `DevTrail: Manage Packs`.
- Install and uninstall React Basics.
- Use the Manage Packs reset flow.
- Open `App.jsx` and confirm hover explanations work.
- Run `DevTrail: Explain Selection` with AI disabled.
- Run `DevTrail: Test AI Formatting` if AI is configured.
- Test AI slow warning by lowering `devtrail.ai.slowWarningMs`.
- Test sensitive selection fallback with fake secret-looking text.
- Run `DevTrail: Explain Command` with `git status`.
- Run `DevTrail: Analyze Project`.
- Run `DevTrail: Refresh Project Scan`.

## Documentation Checks

- Check README install instructions.
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

