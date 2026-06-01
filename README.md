# DevTrail

DevTrail is a beginner-friendly, local-first VS Code extension that explains selected code, terminal commands, and project setup in plain English.

It is built for people learning JavaScript, TypeScript, React, Git, npm, and modern web tooling. DevTrail helps beginners understand the project already in front of them without sending code anywhere by default.

## Who It Is For

- Beginners learning JavaScript, TypeScript, or React
- Students working through an unfamiliar codebase
- Bootcamp learners and self-taught developers
- Instructors, tutors, and mentors helping people read code
- Developers who want local, short explanations inside VS Code

## Current Beta Features

- `DevTrail: Open Setup Guide`: guided onboarding for experience level, project scan, suggested packs, and first steps.
- `DevTrail: Explain Selection`: explains selected JavaScript, TypeScript, React, or JSX code.
- Local React/JSX explanations for components, props, children, hooks, routes, loading states, protected routes, wrapper components, and JSX list rendering.
- Hover explanations in `.js`, `.jsx`, `.ts`, and `.tsx` files.
- `DevTrail: Explain Command`: explains common Git and npm commands.
- `DevTrail: Analyze Project`: reads `package.json` and explains scripts, dependencies, tools, and suggested packs.
- `DevTrail: Refresh Project Scan`: reruns project analysis after dependencies change.
- `DevTrail: Manage Packs`: installs, uninstalls, and resets bundled local explanation packs.
- `DevTrail: Change Explanation Level`: switches between Beginner, Learning, and Advanced explanation depth.
- Optional AI explanations: disabled by default, user-enabled only, with API keys stored in VS Code SecretStorage.

## Install From VSIX

DevTrail is not on the VS Code Marketplace yet. Beta testers install it from a `.vsix` file.

1. Download the latest DevTrail `.vsix` from GitHub Releases.
2. Open VS Code.
3. Open the Command Palette.
4. Run `Extensions: Install from VSIX...`.
5. Choose the downloaded `.vsix`.
6. Reload VS Code if prompted.
7. Run `DevTrail: Open Setup Guide`.

Command-line install:

```sh
code --install-extension devtrail-0.4.0-beta.0.vsix
```

## First Run

After installing:

1. Run `DevTrail: Open Setup Guide`.
2. Choose your experience level.
3. Scan your project if a workspace is open.
4. Install recommended packs.
5. Try hovering over code terms.
6. Highlight a small code block and run `DevTrail: Explain Selection`.
7. Try `DevTrail: Explain Command` with `git status`.

## Explanation Levels

DevTrail adjusts explanation depth for local explanations and optional AI explanations.

- `beginner`: very simple explanations, minimal jargon, and basic concepts explained.
- `learning`: balanced explanations with important technical terms defined briefly.
- `advanced`: concise explanations with more technical detail and less hand-holding.

Run `DevTrail: Change Explanation Level` to switch levels. The setup guide maps experience choices to this setting:

- Brand new -> `beginner`
- Know the basics -> `learning`
- Comfortable but learning tools/libraries -> `advanced`

Explanation webviews show the current level next to the source label.

## Optional AI Setup

DevTrail is local-first by default. AI explanations are off unless you enable them.

Commands:

- `DevTrail: Enable AI Explanations`
- `DevTrail: Disable AI Explanations`
- `DevTrail: Set OpenAI API Key`
- `DevTrail: Clear OpenAI API Key`
- `DevTrail: Test AI Formatting`

Settings:

- `devtrail.ai.enabled`: default `false`
- `devtrail.explanationLevel`: default `beginner`
- `devtrail.ai.model`: default `gpt-5-mini`
- `devtrail.ai.structuredModel`: default `gpt-4o-mini`; used for structured AI explanation formatting
- `devtrail.ai.speedMode`: `balanced` or `fast`
- `devtrail.ai.slowWarningMs`: default `5000`; shows Keep waiting and Use local explanation choices when AI is slow
- `devtrail.ai.maxSelectedCharacters`: default `6000`
- `devtrail.ai.includeProjectContext`: default `true`

API keys are stored with VS Code SecretStorage. DevTrail does not store API keys in source files, package files, settings JSON, docs, logs, or webviews.

Selected code may be sent to OpenAI only when AI is enabled, an API key is configured, the selection passes safety checks, and the user runs `DevTrail: Explain Selection`.

## What Stays Local

By default, DevTrail runs locally:

- Local code explanations
- Hover explanations
- Command explanations
- Project analysis from `package.json`
- Pack recommendations
- Bundled pack install state
- Explanation level selection

DevTrail does not include telemetry, analytics, accounts, cloud sync, payments, tracking, or remote pack downloads.

## Bundled Packs

Packs teach DevTrail about languages, tools, and libraries. In this beta, packs are bundled with the extension and installed into local VS Code extension state.

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

Run `DevTrail: Manage Packs` to install, uninstall, or reset bundled packs. JavaScript Basics remains available as a safe local fallback.

See [docs/PACK_SECURITY.md](docs/PACK_SECURITY.md) for pack security rules.

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

## Current Limitations

- This is a beta. Expect some rough edges while tester feedback is still being collected.
- Local code explanations are pattern-based, not full program analysis.
- React/JSX local explanations cover common patterns, not every valid React structure.
- Pack installation only enables bundled JSON/content packs.
- There is no real pack marketplace or remote download flow yet.
- Project analysis supports `package.json` projects only.
- Optional AI explanations require a user-provided OpenAI API key and network access.
- AI can be wrong; local fallback remains available.

## Roadmap

- Improve local JavaScript, TypeScript, and React explanation quality.
- Expand bundled packs with more framework-specific beginner patterns.
- Add focused automated tests around explanation and pack logic.
- Add safer remote pack distribution later with schema validation, checksums, signatures, and trust metadata.
- Prepare public beta screenshots and demo GIFs.
- Consider Marketplace publishing after beta feedback.

## Report Issues

When the repo is public, please use the GitHub issue templates:

- Bug report
- Feature request
- Explanation feedback

Useful reports include:

- DevTrail version
- VS Code version
- Operating system
- Command you ran
- Explanation level
- Installed packs
- What you expected
- What happened instead

Do not include API keys, `.env` values, private source code, school/private data, access tokens, passwords, or other secrets. Use a tiny fake code example whenever possible.

See [docs/TESTER_FEEDBACK.md](docs/TESTER_FEEDBACK.md) for safe beta feedback guidance.
