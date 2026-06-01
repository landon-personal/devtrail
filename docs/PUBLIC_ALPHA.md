# DevTrail v0.1 Public Alpha

## What Alpha Means

DevTrail v0.1 alpha is an early build for manual testing and feedback. It is useful enough to try, but it is not a polished marketplace release yet.

Expect:

- simple local explanations
- customizable Beginner, Learning, and Advanced explanation levels
- rough edges in real-world code
- limited bundled pack content
- manual `.vsix` installation
- no remote pack downloads

## Recommended Testers

Good alpha testers include:

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
- Did anything feel unsafe, confusing, or surprising?

Do not ask testers to share API keys, `.env` files, private source code, or secrets.

## Install The .vsix

1. Download the `.vsix` from the GitHub release.
2. Open VS Code.
3. Open the Command Palette.
4. Run `Extensions: Install from VSIX...`.
5. Select the downloaded file.
6. Reload VS Code if prompted.
7. Run `DevTrail: Open Setup Guide`.

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
