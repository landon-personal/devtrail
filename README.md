# DevTrail

DevTrail is a beginner-friendly, local-first VS Code extension that explains selected code, terminal commands, and project setup in plain English.

It is for people learning JavaScript, TypeScript, React, Git, npm, and modern web tooling. The goal is to help beginners understand the project already in front of them without sending code anywhere by default.

## Features

- `DevTrail: Open Setup Guide`: guided onboarding for experience level, project scan, suggested packs, and next steps.
- `DevTrail: Explain Selection`: explains selected JavaScript, TypeScript, React, or JSX code.
- Hover explanations: short explanations for known terms in `.js`, `.jsx`, `.ts`, and `.tsx` files.
- `DevTrail: Explain Command`: explains installed Git and npm command packs.
- `DevTrail: Analyze Project`: reads `package.json` and explains scripts, dependencies, tools, and suggested packs.
- `DevTrail: Refresh Project Scan`: reruns project analysis after dependencies change.
- `DevTrail: Manage Packs`: installs or uninstalls bundled local explanation packs.
- `DevTrail: Install Suggested Packs`: installs packs recommended for the current project.
- `DevTrail: Change Explanation Level`: switches between Beginner, Learning, and Advanced explanation depth.
- Optional AI explanations: disabled by default, user-enabled only, with API keys stored in VS Code SecretStorage.

## Install From A .vsix

For the public alpha, DevTrail can be installed from a local `.vsix` file.

1. Download the DevTrail `.vsix` file from the GitHub release.
2. In VS Code, open the Command Palette.
3. Run `Extensions: Install from VSIX...`.
4. Choose the downloaded `.vsix`.
5. Reload VS Code if prompted.
6. Run `DevTrail: Open Setup Guide`.

To uninstall, open the Extensions view, find DevTrail, and choose Uninstall.

## Development Setup

Install dependencies:

```sh
npm install
```

Compile:

```sh
npm run compile
```

Package a local `.vsix` without publishing:

```sh
npm run package
```

Run in VS Code:

1. Open this folder in VS Code.
2. Press F5.
3. In the Extension Development Host window, open a JavaScript or TypeScript project.
4. Run DevTrail commands from the Command Palette.

## Explanation Levels

DevTrail can adjust explanation depth for both local explanations and optional AI explanations.

- `beginner`: very simple explanations, minimal jargon, and basic concepts explained.
- `learning`: balanced explanations with important technical terms defined briefly.
- `advanced`: concise explanations with more technical detail and less hand-holding.

Run `DevTrail: Change Explanation Level` to switch levels. The setup guide also maps experience choices to this setting:

- Brand new -> `beginner`
- Know the basics -> `learning`
- Comfortable but learning tools/libraries -> `advanced`

Explanation webviews show the current level next to the source label.

## Optional AI Setup

DevTrail is local-first by default. AI explanations are off unless the user enables them.

Commands:

- `DevTrail: Enable AI Explanations`
- `DevTrail: Disable AI Explanations`
- `DevTrail: Set OpenAI API Key`
- `DevTrail: Clear OpenAI API Key`

Settings:

- `devtrail.ai.enabled`: default `false`
- `devtrail.explanationLevel`: default `beginner`
- `devtrail.ai.model`: default `gpt-5-mini`
- `devtrail.ai.speedMode`: `balanced` or `fast`
- `devtrail.ai.slowWarningMs`: default `5000`; shows Keep waiting and Use local explanation choices when AI is slow
- `devtrail.ai.maxSelectedCharacters`: default `6000`
- `devtrail.ai.includeProjectContext`: default `true`

API keys are stored with VS Code SecretStorage. DevTrail does not store API keys in source files, package files, settings JSON, docs, logs, or webviews.

## Local-First Privacy

By default, DevTrail runs locally:

- Local code explanations
- Hover explanations
- Command explanations
- Project analysis
- Pack recommendations
- Bundled pack install state

Selected code may be sent to OpenAI only when AI is enabled, an API key is configured, the selection passes safety checks, and the user runs `DevTrail: Explain Selection`.

DevTrail does not include telemetry, analytics, accounts, cloud sync, payments, or remote pack downloads.

## Bundled Packs

Packs teach DevTrail about languages, tools, and libraries. In v0.1 alpha, packs are bundled with the extension and installed into local VS Code extension state.

Current bundled packs:

- JavaScript Basics
- TypeScript Basics
- React Basics
- Next.js Basics
- Vite Basics
- Tailwind Basics
- Express Basics
- npm Commands
- Git Basics
- VS Code Extension Basics

See [docs/PACK_SECURITY.md](docs/PACK_SECURITY.md) for pack security rules.

## Current Limitations

- This is an alpha. Expect rough edges.
- Local code explanations are pattern-based, not full program analysis.
- Pack installation only enables bundled JSON/content packs.
- There is no real pack marketplace or remote download flow yet.
- Project analysis supports `package.json` projects only.
- Optional AI explanations require a user-provided OpenAI API key and network access.
- AI can be wrong; local fallback remains available.

## Roadmap

- Improve local JavaScript, TypeScript, and React explanation quality.
- Expand bundled packs with more beginner terms and patterns.
- Add focused automated tests around explanation and pack logic.
- Add safer remote pack distribution later with schema validation, checksums, signatures, and trust metadata.
- Prepare public documentation and a simple download page after the GitHub alpha is stable.

## Report Issues

Please report issues in the GitHub repository after it is public. Useful reports include:

- VS Code version
- Operating system
- DevTrail version
- Steps to reproduce
- What you expected to happen
- What happened instead

Do not include API keys, `.env` values, private source code, or other secrets in issues.
