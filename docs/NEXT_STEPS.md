# DevTrail Next Steps

## What Currently Works

- Setup guide with learning level selection
- Local Explain Selection for beginner JavaScript and expanded React/JSX patterns
- Hover explanations for `.js`, `.jsx`, `.ts`, and `.tsx`
- Explain Command for common Git and npm commands
- Project Analysis for `package.json` scripts, dependencies, tools, and suggested packs
- Refresh Project Scan and `package.json` dependency watcher
- Local bundled pack registry with richer starter content and install/uninstall/reset state stored in VS Code global state
- Manage Packs and Install Suggested Packs commands
- Optional AI explanations with SecretStorage API key handling and local fallback

## Known Limitations

- Local code explanation is pattern-based, not a full JavaScript parser.
- React/JSX fallback covers more common patterns, but it is still not a full React parser.
- Pack installation only enables bundled JSON/content packs.
- There is no real internet download, marketplace, checksum, signature, or trust review flow.
- Project analysis supports `package.json` projects only.
- AI explanations require a user-provided OpenAI API key and network access.

## What Should Be Tested Manually Next

- Hover behavior in `App.jsx` and `.tsx` files
- `DevTrail: Show Current Language Mode` in `.js`, `.jsx`, `.ts`, and `.tsx`
- Explain Selection with AI disabled
- AI enabled with no API key configured
- Sensitive selection fallback
- AI success path with a safe selection and configured API key
- Dependency watcher after installing a new package
- Manage Packs install, uninstall, and reset flows
- Setup guide recommended pack install buttons
- Analyze Project suggested pack status before and after `DevTrail: Install Suggested Packs`
- Hover and Explain Selection behavior after installing React, TypeScript, Tailwind, Vite, Git, or npm packs
- Beginner, Learning, and Advanced wording for local explanations and hovers
- Core JavaScript fallback after resetting installed packs
- No workspace and no `package.json` warning paths

## Wait Until After v0.2 Alpha

- Real pack marketplace or download system
- Remote pack checksum and signature verification
- Pack trust/review policy for any future public pack source
- Accounts, cloud sync, telemetry, payments, or analytics
- Full AST-based JavaScript/TypeScript analysis
- Multi-file AI project context
- Sending hidden config files, environment files, lockfiles, or full project files to any AI provider
- Automated test suite expansion beyond the current manual QA checklist
