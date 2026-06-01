# DevTrail v0.2.0-alpha.0

DevTrail is a local-first VS Code extension that helps beginner developers understand selected code, terminal commands, and project setup in plain English.

## Alpha Notice

This is an alpha prerelease for manual testing. DevTrail is still a learning helper, not a source of guaranteed correctness.

## What Changed

- Polishes the setup guide with clearer explanations of what DevTrail does, what packs are, what stays local, optional AI, explanation levels, recommended packs, and first actions to try.
- Improves local React/JSX explanations for components, props, children, hooks, custom hooks, conditional rendering, map rendering, JSX return blocks, React Router routes, wrapper components, loading states, protected routes, and page title effects.
- Strengthens starter content for JavaScript Basics, TypeScript Basics, React Basics, Vite Basics, Tailwind Basics, Git Basics, and npm Commands.
- Improves Manage Packs with clearer installed/not installed status, suggested packs, categories, empty states, reset flow, and beginner wording.
- Makes explanation levels more consistent across local explanations, optional AI prompts, setup guide selection, webview labels, and hover explanations where practical.
- Adds `docs/TESTER_FEEDBACK.md` with guidance for safe alpha feedback.
- Updates docs for v0.2 alpha testing and local-first/privacy expectations.

## Privacy And Local-First Behavior

DevTrail still runs locally by default. AI explanations remain optional and require the user to enable AI mode and configure an OpenAI API key.

DevTrail does not include telemetry, analytics, accounts, cloud sync, payments, tracking, or remote pack downloads.

Do not share API keys, `.env` values, private code, school/private data, or secrets in feedback.

## Install From The .vsix

1. Download `devtrail-0.2.0-alpha.0.vsix` from this prerelease.
2. Open VS Code.
3. Run `Extensions: Install from VSIX...`.
4. Select the downloaded `.vsix` file.
5. Reload VS Code if prompted.
6. Run `DevTrail: Open Setup Guide`.

Command-line install:

```sh
code --install-extension devtrail-0.2.0-alpha.0.vsix
```

## Known Limitations

- Local code explanation is still pattern-based.
- React/JSX local fallback covers common patterns, not every valid React structure.
- Pack installation only enables bundled JSON/content packs.
- There is no remote pack marketplace yet.
- Project analysis supports `package.json` projects only.
- Optional AI requires a user-provided OpenAI API key and network access.

## Feedback Requested

Please test setup, local React/JSX explanation quality, Manage Packs, explanation levels, hover explanations, Analyze Project, and optional AI fallback behavior. Use `docs/TESTER_FEEDBACK.md` for safe feedback guidance.

