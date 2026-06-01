# DevTrail Tester Feedback Guide

Use this guide when asking release-candidate testers to try DevTrail.

## Who Should Test DevTrail

- Beginner JavaScript, TypeScript, or React learners
- Bootcamp students and self-taught developers
- Instructors, tutors, and mentors
- Developers who help juniors understand existing projects
- People comfortable installing a VS Code `.vsix`

## What To Test

- Open `DevTrail: Open Setup Guide` and choose an experience level.
- Confirm setup opens automatically on a fresh install.
- Try `DevTrail: Quick Start`, the `$(sparkle) DevTrail` status bar menu, keyboard shortcuts, and right-click `DevTrail: Explain Selection`.
- Install recommended packs in the setup guide or `DevTrail: Manage Packs`.
- Hover over known terms in `.js`, `.jsx`, `.ts`, and `.tsx` files.
- Select small JavaScript snippets and run `DevTrail: Explain Selection`.
- Select small React/JSX snippets with props, children, hooks, routes, loading states, or protected routes.
- Try Beginner, Learning, and Advanced explanation levels.
- Run `DevTrail: Explain Command` with `git status`, `git add .`, `npm install`, and `npm run dev`.
- Run `DevTrail: Analyze Project` in a project with `package.json`.
- Optional: enable AI, run `DevTrail: Test AI Formatting`, then test a safe small selection.

## Questions To Ask

- Did the setup guide explain what DevTrail does?
- Did the explanation level match your skill level?
- Were local explanations concrete enough to help you keep reading code?
- Which React/JSX explanation was most helpful?
- Which explanation was vague, wrong, or confusing?
- Did packs make sense as local learning add-ons?
- Did Manage Packs make installed and suggested status clear?
- Did optional AI feel clearly opt-in?
- Did error messages feel calm and easy to act on?
- Did DevTrail fall back locally when AI or packs were unavailable?
- What should DevTrail explain next?

## What Not To Share

Do not ask testers to paste or upload:

- API keys
- `.env` values
- access tokens
- passwords
- private source code
- full model output from private code
- school records, customer data, or personal data
- proprietary project files
- hidden config files or lockfiles

If a tester finds a bug in private code, ask for a tiny fake reproduction instead.

## Helpful Bug Report Shape

Ask testers to share:

- DevTrail version
- VS Code version
- Operating system
- Command they ran
- Explanation level selected
- Installed packs
- A tiny fake code sample if needed
- What they expected
- What happened instead
