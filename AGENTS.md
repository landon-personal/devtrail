# AGENTS.md

## Project
DevTrail is a beginner-friendly VS Code extension that explains selected code in plain English.

## Current MVP
- Build a small TypeScript VS Code extension.
- Register the command `devtrail.explainSelection` with the title `DevTrail: Explain Selection`.
- Explain selected code using local mock logic and JSON knowledge packs.
- Keep the implementation local-first. Do not call an AI API in v0.

## Product Rules
- Focus on understanding, not replacing learning.
- Keep explanations friendly, accurate, and beginner-safe.
- Do not send user code to external services unless a future setting clearly enables it.
- Prefer short, practical explanations over long lectures.

## Tech Stack
- TypeScript
- VS Code Extension API
- Local JSON knowledge packs under `packs/`

## Common Commands
- Install dependencies: `npm install`
- Compile: `npm run compile`
- Watch TypeScript: `npm run watch`
- Debug extension: press F5 in VS Code

## Code Style
- Keep files and functions small.
- Add concise comments where VS Code extension concepts may be confusing.
- Avoid dependencies unless they clearly simplify the MVP.
- Do not over-engineer the knowledge-pack system before the product needs it.
