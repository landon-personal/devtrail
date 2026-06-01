# Contributing To DevTrail

DevTrail is a local-first VS Code extension for beginner-friendly code, command, and project explanations.

## Setup

Install dependencies:

```sh
npm install
```

Compile:

```sh
npm run compile
```

Run the extension locally:

1. Open this repository in VS Code.
2. Press F5.
3. Use the Extension Development Host window for manual testing.

## Manual Testing

Use [docs/QA.md](docs/QA.md) before opening a release PR or preparing a `.vsix`.

At minimum, test:

- `DevTrail: Open Setup Guide`
- `DevTrail: Explain Selection`
- Hover explanations in `.js`, `.jsx`, `.ts`, and `.tsx`
- `DevTrail: Explain Command`
- `DevTrail: Analyze Project`
- `DevTrail: Manage Packs`
- Optional AI disabled fallback

## Coding Style

- Keep TypeScript simple and readable.
- Prefer small helpers over large command handlers.
- Keep comments short and useful, especially around VS Code extension concepts.
- Keep local-first behavior as the default.
- Do not add telemetry, accounts, cloud sync, payments, or analytics.
- Run `npm run compile` before submitting changes.

## Pack Contributions

Packs must be JSON/content only. DevTrail must not execute code from packs.

For bundled pack changes:

- Update `packs/registry.json` if adding a pack.
- Include `id`, `displayName`, `description`, `category`, `localPath`, `relatedPackages`, `version`, `status`, and `tags`.
- Keep beginner explanations short and concrete.
- Include common mistakes where useful.
- Do not include private project code, secrets, copied proprietary docs, or large generated content.

Remote pack downloads are not part of v0.1 alpha. Future remote packs should require schema validation, checksums, signatures, and trust metadata before public release.

## Secrets

Do not commit secrets.

Never commit:

- `.env` files
- API keys
- access tokens
- passwords
- private keys
- private customer or project code

Use fake example values only when documentation needs an example, and make sure they are clearly fake.
