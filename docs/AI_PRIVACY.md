# DevTrail AI Privacy

DevTrail is local-first by default. Local explanations, hover explanations, command explanations, project analysis, setup guide recommendations, and pack registry checks run on your machine.

This privacy model applies to `v1.0.0`.

## What Stays Local

- Hovered terms and local pack lookups
- Terminal command explanations
- Project scans from `package.json`
- Suggested pack matching
- Dependency refresh checks
- Local Explain Selection fallback output
- OpenAI API keys stored in VS Code SecretStorage
- Bundled pack install state and level-specific pack content

DevTrail does not store API keys in `package.json`, VS Code settings JSON, source files, logs, or webviews.

The recommended general AI model default is `gpt-5-mini` because it balances explanation quality and speed. Users who prefer the fastest responses can set `devtrail.ai.speedMode` to `fast`, which uses `gpt-5-nano` unless they explicitly set `devtrail.ai.model`.

For structured explanation formatting, DevTrail uses Chat Completions structured parsing with `devtrail.ai.structuredModel` and a default of `gpt-4o-mini`. DevTrail sends the same selected code to this structured parsing model only when AI mode is enabled, an API key is configured, and the selected code passes safety checks.

## When Code May Be Sent To OpenAI

Selected code may be sent to OpenAI only when all of these are true:

1. `devtrail.ai.enabled` is `true`.
2. An OpenAI API key has been set with `DevTrail: Set OpenAI API Key`.
3. The selection passes DevTrail's local safety checks.
4. The user runs `DevTrail: Explain Selection`.

If any condition is not met, DevTrail uses local explanations instead.

DevTrail also keeps selected AI requests intentionally small. If the selection is longer than `devtrail.ai.maxSelectedCharacters` (default `6000`), DevTrail does not send it to AI and explains it locally.

AI explanations use `chat.completions.parse` with schema-constrained output first. If structured parsing fails, DevTrail may try one JSON-only `chat.completions.create` fallback request using the same structured model. If that also fails, DevTrail uses the local explanation.

## What Context May Be Sent

When `devtrail.ai.includeProjectContext` is `true`, DevTrail may include limited context:

- VS Code language ID, such as `javascriptreact`
- File extension, such as `.jsx`
- Detected project tools from `package.json`
- Suggested pack names from the local pack registry

DevTrail does not send full project files, environment variables, hidden config files, dependency lockfiles, or `node_modules`.

## Safety Fallbacks

DevTrail refuses to send selected code to AI when it detects obvious sensitive content, including:

- `OPENAI_API_KEY`
- `API_KEY`
- `SECRET`
- `TOKEN`
- `PASSWORD`
- `PRIVATE_KEY`
- `.env`-style assignments

DevTrail also blocks AI requests from `.env` files, common lockfiles, `node_modules`, and hidden secret/config-looking files.

When AI mode is enabled, DevTrail opens a loading view immediately so VS Code does not look frozen. If the request takes longer than `devtrail.ai.slowWarningMs` (default `5000`), DevTrail shows a friendly slow warning with two choices: keep waiting, or switch to a local explanation. DevTrail does not automatically send more code or start a second AI request.

If the user cancels the progress notification, chooses local explanation, formatting fails, or the AI request fails, DevTrail replaces the loading view with the local explanation.

## Reliability Notes

- If AI is enabled but no API key is configured, DevTrail offers to open the API key command and uses local explanations.
- If the selection is too large, DevTrail keeps it local and asks the user to select a smaller section for AI.
- If the selection looks like it may contain secrets, DevTrail keeps it local.
- If AI formatting or the AI request fails, DevTrail uses local explanations and does not show raw model output.
