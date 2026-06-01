# DevTrail v1.0 Public Notes

Note: this file keeps its original alpha-era filename for continuity, but the current guidance is for `v1.0.0`.

## What v1.0 Means

DevTrail `v1.0.0` is the first stable release. It is useful enough to share with learners, but explanations can still be incomplete or imperfect.

Expect:

- improved local explanations for common JavaScript and React/JSX patterns
- setup that opens automatically on first install
- keyboard shortcuts, right-click actions, status bar quick actions, and `DevTrail: Quick Start`
- friendlier fallback and error handling
- customizable Beginner, Learning, and Advanced explanation levels
- rough edges in real-world code
- richer starter pack content
- manual `.vsix` installation
- no remote pack downloads

After v1.0, keep feedback focused on reliability, wording, docs, install flow, privacy, and the explanation quality beginners actually see.

## Recommended Testers

Good testers include:

- beginner JavaScript and React learners
- bootcamp students
- instructors helping beginners read projects
- developers who mentor juniors
- people comfortable installing a VS Code `.vsix`

## Known Limitations

- Local explanations are pattern-based.
- Explanation levels guide the wording, but local patterns are still intentionally small.
- Project analysis only supports `package.json`.
- Packs are bundled/local only.
- Optional AI requires a user-provided OpenAI API key.
- DevTrail does not have telemetry, so feedback must be reported manually.
- There is no public pack marketplace yet.

## Feedback To Collect

Ask testers:

- Did the setup guide make sense?
- Did Explain Selection help you understand selected code?
- Did Beginner, Learning, and Advanced levels feel meaningfully different?
- Which explanation level matched your current skill level best?
- Which explanations were too vague or wrong?
- Did hover explanations appear in `.js`, `.jsx`, `.ts`, and `.tsx` files?
- Were pack recommendations understandable?
- Did optional AI behavior feel clearly opt-in?
- Did Manage Packs make it clear what is installed and what is suggested?
- Did local React/JSX explanations help with components, props, hooks, routes, and loading/protected states?
- Did anything feel unsafe, confusing, or surprising?

Do not ask testers to share API keys, `.env` files, private source code, or secrets.

Use `docs/TESTER_FEEDBACK.md` when collecting feedback so testers know what to try and what not to share.

## Install The .vsix

1. Download the `.vsix` from the GitHub release.
2. Open VS Code.
3. Open the Command Palette.
4. Run `Extensions: Install from VSIX...`.
5. Select the downloaded file.
6. Reload VS Code if prompted.
7. The setup guide should open automatically on first activation. You can also run `DevTrail: Open Setup Guide`.

## Uninstall

1. Open the Extensions view in VS Code.
2. Find DevTrail.
3. Choose Uninstall.
4. Reload VS Code if prompted.

## Before A Wider Release

- Complete the manual QA checklist.
- Verify `.vsix` packaging on a clean machine.
- Confirm no secrets are committed.
- Confirm all docs match the actual commands and settings.
- Decide how public issues should be triaged.
