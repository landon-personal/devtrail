# AGENTS.md

## Project: DevTrail

DevTrail is a beginner-friendly VS Code extension that helps people understand code, terminal commands, project setup, dependencies, and libraries while they learn.

Core idea:

> DevTrail is subtitles for programming.

DevTrail is not primarily an AI code-writing assistant. Its main job is to explain what existing code and commands mean in clear, beginner-friendly language.

## Current status

DevTrail has reached v1.0.0 and is public.

Public links:

- Site: https://landon-personal.github.io/devtrail/
- Repo: https://github.com/landon-personal/devtrail
- Stable release: https://github.com/landon-personal/devtrail/releases/tag/v1.0.0

## Product principles

- Beginner-first explanations.
- Local-first behavior by default.
- AI is optional, never required.
- Local fallback must always work.
- Do not send selected code to AI unless AI is enabled and an API key is configured.
- Never log API keys, selected project code, .env values, secrets, or full AI outputs.
- Prefer clear, short explanations over long walls of text.
- Make manual steps stupid-simple for Landon.
- Avoid vague handoffs like “test this.” If something requires manual verification, write exact click-by-click steps.

## Hard safety rules

Never add any of these unless Landon explicitly asks:

- telemetry
- analytics
- accounts
- cloud sync
- payments
- tracking
- external scripts on the landing page
- marketplace publishing
- automatic public-release actions
- remote pack downloads
- code execution from packs

Never commit or stage:

- node_modules/
- out/
- .env
- .vsix files unless explicitly requested
- API keys or secrets
- private project/source files outside this repo

Before release-related work, scan for risky strings:

- OPENAI_API_KEY
- API_KEY
- SECRET
- TOKEN
- PASSWORD
- PRIVATE_KEY
- sk-

Do not print secret values if found. Only report filenames and whether action is needed.

## Main verification commands

Use these commands for verification:

npm run compile
npm run package

If parser tests exist, run them too:

node out/ai/parseAIExplanation.test.js

Install a generated VSIX automatically when possible:

code --install-extension /Users/landon/devtrail/devtrail-<version>.vsix --force

If the code command fails, write exact manual instructions instead:

1. Open VS Code.
2. Press Cmd + Shift + P.
3. Run Extensions: Install from VSIX...
4. Choose the generated VSIX file from /Users/landon/devtrail/.
5. Press Cmd + Shift + P again.
6. Run Developer: Reload Window.

## Important DevTrail features

Major commands/features include:

- DevTrail: Quick Start
- DevTrail: Open Setup Guide
- DevTrail: Explain Selection
- DevTrail: Explain Command
- DevTrail: Analyze Project
- DevTrail: Refresh Project Scan
- DevTrail: Manage Packs
- DevTrail: Change Explanation Level
- DevTrail: Test AI Formatting
- DevTrail: Enable AI Explanations
- DevTrail: Disable AI Explanations
- DevTrail: Set OpenAI API Key
- DevTrail: Clear OpenAI API Key

Important UX features:

- Setup guide should open automatically on first install.
- Setup should not reopen repeatedly after completion.
- Status bar quick actions should remain available.
- Keyboard shortcuts should remain documented.
- Right-click Explain Selection should remain available.
- AI formatting should render clean sections.
- Local fallback should work even if AI fails.

## AI behavior

AI explanations are optional.

Expected behavior:

- API keys are stored using VS Code SecretStorage.
- API keys are never logged or written to files.
- AI only runs when enabled and an API key exists.
- Sensitive-looking selections fall back locally.
- Oversized selections fall back locally.
- AI failures fall back locally.
- Explanation webviews clearly label the source:
  - Source: AI explanation
  - Source: Local DevTrail packs

AI formatting should be verified with:

DevTrail: Test AI Formatting

Expected result:

- no formatting failure message
- clean sections
- no raw JSON
- no Markdown code fences
- no leaked diagnostics

## Pack rules

Packs are local JSON/content only.

Do not execute pack code.
Do not add remote pack downloading before a signed/checksummed security model exists.
Do not add a real pack marketplace unless Landon explicitly asks.

Important pack-related docs:

- docs/PACK_SECURITY.md
- docs/SHORTCUTS.md
- docs/QA.md

## Docs to keep current

When changing behavior, update relevant docs:

- README.md
- docs/index.html
- docs/QA.md
- docs/AI_PRIVACY.md
- docs/PACK_SECURITY.md
- docs/SHORTCUTS.md
- docs/RELEASE_CHECKLIST.md
- docs/STATUS_WHEN_LANDON_RETURNS.md

If release notes are needed, create a versioned file like:

docs/RELEASE_NOTES_v<version>.md

## Release workflow

For release work:

1. Update version in package.json.
2. Update package-lock.json.
3. Create release notes.
4. Run safety scan.
5. Run npm run compile.
6. Run parser tests if available.
7. Run npm run package.
8. Install the VSIX automatically if possible.
9. Update docs/status.
10. Stop before GitHub release unless Landon explicitly approves.

Never publish to the VS Code Marketplace unless Landon explicitly asks.

## Git workflow

Before committing:

git status --short

Confirm ignored/generated files are not staged.

Safe commit pattern:

git add <specific safe files>
git status --short
git commit -m "Clear commit message"
git push origin main

Do not use blind git add . if generated files might be present.

## Status handoff

At the end of substantial work, update:

docs/STATUS_WHEN_LANDON_RETURNS.md

Include:

- what changed
- compile result
- package result
- generated VSIX filename if any
- install result
- release/public status if relevant
- exact next command or click sequence for Landon
- blockers

## Current post-v1 direction

DevTrail v1.0.0 is released. Future work should be careful, feedback-driven, and not rushed.

Good next areas:

- collect feedback from more beginner testers
- polish explanation quality
- improve packs gradually
- improve first-run experience if users get confused
- consider VS Code Marketplace publishing only after another safety/release review

Do not jump into large new systems unless Landon asks.
