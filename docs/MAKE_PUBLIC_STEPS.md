# DevTrail Public Release Steps

The repo is already public. Use these steps when updating a public release candidate or final release.

## Before You Start

1. Open `docs/PUBLIC_BETA_GO_NO_GO.md`.
2. Read the recommendation and manual review notes.
3. Run:

```bash
git status --short
```

4. Make sure no `.vsix`, `node_modules`, `out`, `.env`, or private files are staged.
5. Confirm the latest intended release is `v1.0.0-rc.0`.

## Confirm The Repo Is Public

1. Open GitHub.
2. Go to `landon-personal/devtrail`.
3. Open `Settings`.
4. Open `General`.
5. Confirm the repository visibility is public.
6. Do not change visibility unless Landon explicitly asks.

## Confirm The Release Download Works

1. Open:

```text
https://github.com/landon-personal/devtrail/releases/tag/v1.0.0-rc.0
```

2. Click `devtrail-1.0.0-rc.0.vsix`.
3. Confirm the file downloads.
4. Install it in VS Code:

```bash
code --install-extension ~/Downloads/devtrail-1.0.0-rc.0.vsix --force
```

5. Open VS Code.
6. Confirm setup opens automatically. You can also run `DevTrail: Open Setup Guide`.

If the download fails or shows a 404, stop and do not share the release-candidate link yet.

## Enable GitHub Pages If Desired

Only do this after the repo is public and the release download works.

1. Open `Settings` in the GitHub repo.
2. Open `Pages`.
3. Under `Build and deployment`, choose `Deploy from a branch`.
4. Choose branch `main`.
5. Choose folder `/docs`.
6. Click `Save`.
7. Wait for GitHub to show the Pages URL.
8. Open the Pages URL.
9. Confirm the buttons and release links work.
10. Confirm the page has no analytics, tracking, or external scripts.

If the page has broken links, stop and fix them before sharing.

## Share With Testers

1. Open `docs/TESTER_INVITE.md`.
2. Copy the message.
3. Add the release link:

```text
https://github.com/landon-personal/devtrail/releases/tag/v1.0.0-rc.0
```

4. Send it to 3-5 trusted testers.
5. Ask testers not to share API keys, `.env` values, private code, school/private data, or secrets.

## Stop Conditions

Do not share publicly if:

- the release download does not work
- the landing page has broken links
- the README says DevTrail is on the VS Code Marketplace
- a secret scan finds an unexpected key-shaped value
- the manual QA checklist has a major failure
