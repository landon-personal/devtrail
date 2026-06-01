# DevTrail Screenshot Guidance

Do not auto-generate screenshots for the beta. Capture them manually so private code, API keys, `.env` values, school/private data, and secrets are not visible.

Use fake or sample code when possible.

## Screenshots To Capture

### Setup Guide

- Show the Welcome section.
- Show experience level choices.
- Show recommended packs with install status.
- Avoid showing private workspace names if needed.

### Explain Selection

- Use a small fake JavaScript or React snippet.
- Show source and explanation level labels.
- Show the four explanation sections.
- Keep selected code short and non-private.

### AI Explanation

- Use `DevTrail: Test AI Formatting` or a tiny fake snippet.
- Show `Source: AI explanation`.
- Do not show API keys, prompts, diagnostics with private code, or full model output from private projects.

### Hover Explanation

- Use a simple `.jsx` or `.tsx` sample.
- Hover over `useEffect`, `props`, `children`, `map`, or `const`.
- Crop out unrelated private files.

### Manage Packs

- Show installed/not installed counts.
- Show suggested packs.
- Show React Basics installed.
- Show the reset installed packs button.

### Analyze Project

- Use a safe demo project.
- Show scripts, detected tools, and suggested packs.
- Avoid private package names if the project is not public.

## GIF Ideas

- Open Setup Guide, choose a level, install a pack.
- Highlight React code and run `DevTrail: Explain Selection`.
- Hover over `useEffect` in `App.jsx`.
- Open Manage Packs and install React Basics.

## Before Publishing Images

- Check there are no secrets.
- Check no `.env` content is visible.
- Check no private source code is visible.
- Check no private school, customer, or personal data is visible.
- Check no API key status dialogs show actual keys.
