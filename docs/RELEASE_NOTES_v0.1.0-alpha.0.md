# DevTrail v0.1.0-alpha.0

DevTrail is a local-first VS Code extension that helps beginner developers understand selected code, terminal commands, and project setup in plain English.

## Alpha Notice

This is a public alpha. It is ready for early testing, but some explanations will be incomplete, too simple, or occasionally wrong. Please treat it as a learning helper, not as a source of guaranteed correctness.

## Included In This Alpha

- Setup guide for onboarding and recommended next steps
- Explain Selection for selected JavaScript, TypeScript, React, and JSX code
- Optional AI explanations with local fallback
- Explanation levels: Beginner, Learning, and Advanced
- Hover explanations in `.js`, `.jsx`, `.ts`, and `.tsx` files
- Explain Command for installed Git and npm command packs
- Analyze Project for `package.json` scripts, dependencies, tools, and suggested packs
- Refresh Project Scan for updated dependency recommendations
- Manage Packs for bundled local explanation packs
- Installable bundled packs for JavaScript, TypeScript, React, Next.js, Vite, Tailwind, Express, npm, Git, and VS Code extensions

## Privacy And Local-First Behavior

DevTrail runs locally by default. Local explanations, hover text, command explanations, project analysis, and bundled pack recommendations stay on your machine.

AI explanations are optional. DevTrail sends selected code to OpenAI only when AI is enabled, an API key is configured in VS Code SecretStorage, and the selected code passes local safety checks.

DevTrail does not include telemetry, analytics, accounts, cloud sync, payments, or remote pack downloads.

## Known Limitations

- Local explanations are pattern-based and intentionally small.
- React/JSX explanations cover common beginner patterns, not every production pattern.
- Project analysis supports `package.json` projects only.
- Packs are bundled/local only; there is no remote marketplace yet.
- AI explanations require a user-provided OpenAI API key and can be wrong.
- The `.vsix` is intended for manual alpha installation, not Marketplace distribution.

## Install From The .vsix

1. Download `devtrail-0.1.0-alpha.0.vsix` from this release.
2. Open VS Code.
3. Open the Command Palette.
4. Run `Extensions: Install from VSIX...`.
5. Select the downloaded `.vsix` file.
6. Reload VS Code if prompted.
7. Run `DevTrail: Open Setup Guide`.

Command-line install:

```sh
code --install-extension devtrail-0.1.0-alpha.0.vsix
```

## Feedback Requested

Please report:

- confusing or vague explanations
- terms that should have hover explanations
- commands DevTrail should explain locally
- project tools that should suggest packs
- setup guide wording that feels unclear
- any privacy or safety concern

Do not include API keys, `.env` values, private source code, or other secrets in feedback.
