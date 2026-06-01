# DevTrail Website Notes

`docs/index.html` is a simple static landing page for the public alpha.

## Preview Locally

From the repo root:

```sh
open docs/index.html
```

Or use VS Code's built-in browser preview if preferred.

The page must not use analytics, tracking, external scripts, account widgets, or remote embeds.

## Before Going Public

Check these links:

- GitHub repo: `https://github.com/landon-personal/devtrail`
- Latest release: `https://github.com/landon-personal/devtrail/releases/latest`
- Direct `.vsix` download for the current release
- Issue links after issues are enabled
- Screenshot/demo references after real images are added

Confirm the repo visibility and release visibility are intentional before sharing the page.

## Enable GitHub Pages Later

Do not enable GitHub Pages until Landon explicitly approves it.

When approved:

1. Open the GitHub repo settings.
2. Go to Pages.
3. Select the branch and `/docs` folder as the source.
4. Save.
5. Visit the generated Pages URL.
6. Confirm the page renders without external scripts.
7. Confirm all links work.

## Updating Download Links

For each new alpha:

1. Update the direct `.vsix` link in `docs/index.html`.
2. Keep the latest release button pointed at:

   ```text
   https://github.com/landon-personal/devtrail/releases/latest
   ```

3. Run through `docs/RELEASE_CHECKLIST.md`.
4. Do not enable Pages or make the repo public without explicit approval.

