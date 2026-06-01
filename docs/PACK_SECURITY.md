# DevTrail Pack Security

DevTrail v1.0 packs are bundled with the extension and loaded from local JSON/content files. There is no internet pack download flow yet.

## Current Rules

- Packs are JSON/content only.
- DevTrail does not execute code from packs.
- Installing a pack means DevTrail marks the bundled pack ID as installed in VS Code global extension state.
- Uninstalling a pack disables that pack for DevTrail lookups. It does not delete bundled extension files.
- Pack content is used for beginner explanations, hover text, command explanations, and project recommendations.
- Pack content may include level-specific wording and small examples, but it is still text data only.

## Not Built Yet

Remote pack downloads are intentionally out of scope for v1. Before public remote packs exist, DevTrail should add:

- Checksums for downloaded pack files
- Signatures or another publisher verification system
- A clear trust and review policy
- Strict schema validation before a pack can be enabled
- A user-visible source and version history for installed packs

Until then, packs should remain local, bundled, and content-only.
