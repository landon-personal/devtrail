# DevTrail Manual QA

Use this checklist before a v0.1 alpha build.

## Setup Guide

1. Press F5 from the DevTrail repo.
2. In the Extension Development Host, run `DevTrail: Open Setup Guide`.
3. Confirm the guide opens and shows Welcome, Choose experience level, Scan project, Recommended packs, Enable learning features, and You're ready to go.
4. Choose each experience level and confirm the selected state updates.
5. Confirm Brand new maps to `devtrail.explanationLevel: beginner`.
6. Confirm Know the basics maps to `devtrail.explanationLevel: learning`.
7. Confirm Comfortable but learning tools/libraries maps to `devtrail.explanationLevel: advanced`.
8. If recommended packs appear, click Install on one pack and confirm it changes to Installed.
9. Close and reopen the guide. Confirm the selected level is still shown.

## Explanation Levels

1. Run `DevTrail: Change Explanation Level`.
2. Choose Beginner.
3. Select code that includes `const` and run `DevTrail: Explain Selection`.
4. Confirm the webview shows `Level: Beginner` and uses simple wording such as a named value that you usually do not reassign.
5. Run `DevTrail: Change Explanation Level`.
6. Choose Learning.
7. Explain the same selection.
8. Confirm the webview shows `Level: Learning` and uses balanced wording such as block-scoped variable binding.
9. Run `DevTrail: Change Explanation Level`.
10. Choose Advanced.
11. Explain the same selection.
12. Confirm the webview shows `Level: Advanced` and uses concise technical wording such as immutable binding.
13. Install `React Basics`, open React code with `useEffect`, and repeat Beginner and Advanced checks.
14. Confirm Beginner says `useEffect` runs code after the screen updates.
15. Confirm Advanced says `useEffect` schedules post-render side effects based on its dependency array.

## Manage Packs

1. Run `DevTrail: Manage Packs`.
2. Confirm available bundled packs are shown with category, description, status, and install buttons.
3. Click Install for `React Basics`.
4. Confirm the panel refreshes and shows `React Basics` as Installed.
5. Click Uninstall for `React Basics`.
6. Confirm the panel refreshes and shows `React Basics` as Not installed.
7. Run `DevTrail: Reset Installed Packs`.
8. Reopen `DevTrail: Manage Packs` and confirm installed statuses are cleared.
9. Open the setup guide in a project with suggested packs and confirm Install buttons work there too.

## Explain Selected JavaScript

1. Open a `.js` or `.ts` file.
2. Select:

   ```js
   const numbers = [1, 2, 3];

   const doubled = numbers.map((number) => {
     return number * 2;
   });

   console.log(doubled);
   ```

3. Run `DevTrail: Explain Selection`.
4. Confirm blank lines are not explained.
5. Confirm DevTrail explains `numbers`, `map`, `number`, `return number * 2`, `doubled`, and `console.log`.

## Hover Known Terms

1. Open a `.js` file.
2. Hover over `const`, `let`, `function`, `async`, `await`, `map`, `filter`, `reduce`, and `fetch`.
3. Confirm DevTrail shows a short explanation and common mistake.
4. Open `App.jsx` or another `.jsx` file.
5. Run `DevTrail: Show Current Language Mode` and confirm it reports `javascriptreact`.
6. Hover over known terms in the `.jsx` file and confirm DevTrail hover text appears.
7. Open a `.tsx` file.
8. Run `DevTrail: Show Current Language Mode` and confirm it reports `typescriptreact`.
9. Hover over known terms in the `.tsx` file and confirm DevTrail hover text appears.
10. Run `DevTrail: Manage Packs` and install `React Basics`.
11. Open a React file and hover over `useState`, `useEffect`, `props`, `component`, `JSX`, or `children`.
12. Confirm DevTrail shows explanations from the installed React pack.
13. Run `DevTrail: Reset Installed Packs`.
14. Confirm core JavaScript hovers such as `const` and `map` still work.
15. Select a small JavaScript snippet and run `DevTrail: Explain Selection`.
16. Confirm DevTrail still explains JavaScript basics with no packs installed.
17. Set `devtrail.hovers.enabled` to `false`.
18. Confirm DevTrail hover text no longer appears.

## Explain Commands

1. Run `DevTrail: Manage Packs`.
2. Install `Git Basics` and `npm Commands`.
3. Run `DevTrail: Explain Command`.
4. Enter `git status`.
5. Confirm the webview explains what it does, each command part, when to use it, and a common beginner mistake.
6. Repeat with `git add .`, `npm install`, and `npm run dev`.
7. Enter an unsupported command and confirm DevTrail says it does not have a local explanation yet and suggests supported examples.

## Optional AI Explanations

1. Make sure `devtrail.ai.enabled` is `false`.
2. Select code and run `DevTrail: Explain Selection`.
3. Confirm the webview says `Source: Local DevTrail packs` and shows the current explanation level.
4. Confirm local mode does not show the AI loading state.
5. Run `DevTrail: Enable AI Explanations`, but do not set an API key.
6. Select code and run `DevTrail: Explain Selection`.
7. Confirm DevTrail explains that AI is enabled but no key is configured, then falls back locally.
8. Run `DevTrail: Set OpenAI API Key` and enter a valid key.
9. Confirm `devtrail.ai.model` is unset or set to `gpt-5-mini`.
10. Select safe React/JSX code and run `DevTrail: Explain Selection`.
11. Confirm the webview opens immediately and says `DevTrail is reading this code...`.
12. Confirm the VS Code progress notification says `DevTrail is generating an AI explanation...`.
13. Confirm the final webview says `Source: AI explanation`.
14. Confirm the output shows the current explanation level.
15. Confirm the output has clean formatting: summary paragraph, line-by-line ordered list, vocabulary bullets, confusion bullets, and no raw Markdown code fences or strange backtick-heavy text.
16. Open `App.jsx`, select a normal React component or JSX return block, and run `DevTrail: Explain Selection`.
17. Confirm the webview does not show `AI formatting failed` for normal React/JSX code.
18. Confirm the React/JSX output sections render cleanly without raw JSON, Markdown fences, or unusual backtick formatting.
19. Set `devtrail.ai.slowWarningMs` to `60000`.
20. Run AI Explain Selection again and confirm normal AI success renders before any slow warning appears.
21. Set `devtrail.explanationLevel` to `advanced` or run `DevTrail: Change Explanation Level`.
22. Run AI Explain Selection again and confirm the output is more concise and technical than Beginner.
23. Set `devtrail.ai.slowWarningMs` to `1000`.
24. Run `DevTrail: Explain Selection` on safe code.
25. If AI is still running after the delay, confirm the webview says `AI is taking longer than expected.` and shows `Keep waiting` and `Use local explanation`.
26. Click `Keep waiting`.
27. Confirm the webview says `Still waiting for the AI explanation...` and no second AI request starts.
28. Run `DevTrail: Explain Selection` again on safe code.
29. When the slow warning appears, click `Use local explanation`.
30. Confirm DevTrail renders local output and shows `You switched to a local explanation while AI was still running.`
31. Confirm a later AI response does not overwrite the local output.
32. Reset `devtrail.ai.slowWarningMs` to `5000`.
33. Run `DevTrail: Explain Selection` again and click Cancel in the progress notification.
34. Confirm DevTrail falls back locally and shows `AI explanation was canceled, so DevTrail used the local explanation instead.`
35. Set `devtrail.ai.maxSelectedCharacters` to `20`.
36. Select more than 20 characters and run `DevTrail: Explain Selection`.
37. Confirm DevTrail warns that the selection is pretty large and uses the local explanation.
38. Reset `devtrail.ai.maxSelectedCharacters` to `6000`.
39. Set `devtrail.ai.speedMode` to `fast` and remove any explicit `devtrail.ai.model` override.
40. Run `DevTrail: Explain Selection` and confirm the AI path still works. This mode uses `gpt-5-nano` for the fastest responses.
41. Set `devtrail.ai.speedMode` back to `balanced`.
42. Select text that looks like a secret, such as `OPENAI_API_KEY=abc123456789`.
43. Run `DevTrail: Explain Selection`.
44. Confirm DevTrail refuses to send it to AI and falls back locally immediately.
45. Run `DevTrail: Clear OpenAI API Key`.
46. Run `DevTrail: Disable AI Explanations`.

## Analyze A Project

1. Open a workspace that has `package.json`.
2. Run `DevTrail: Analyze Project`.
3. Confirm DevTrail explains package name, version, scripts, dependencies, dev dependencies, detected tools, and suggested packs.
4. Confirm suggested packs show Installed or Not installed.
5. Open the GradeGuard project if available and confirm React, Vite, TypeScript, Tailwind, Git, and npm packs are suggested when those tools are present.
6. Run `DevTrail: Install Suggested Packs`.
7. Confirm the updated Project Analysis shows the suggested packs as Installed.

## Refresh Project Scan

1. In a `package.json` project, run `DevTrail: Refresh Project Scan`.
2. Confirm the Project Analysis webview opens with fresh suggested packs.

## Dependency Watcher

1. Run `DevTrail: Open Setup Guide` or `DevTrail: Analyze Project` once to seed the baseline.
2. Install a new package, for example:

   ```sh
   npm install axios
   ```

3. Confirm DevTrail notices the new dependency and asks whether to refresh suggested packs.
4. Click `Refresh Packs`.
5. Confirm `DevTrail: Refresh Project Scan` opens updated Project Analysis.
6. Save `package.json` again without adding a new dependency.
7. Confirm DevTrail does not show another notification.

## No Workspace Or No package.json

1. Run `DevTrail: Analyze Project` with no workspace folder open.
2. Confirm DevTrail shows a friendly error.
3. Open a folder without `package.json`.
4. Run `DevTrail: Analyze Project`.
5. Confirm DevTrail shows a friendly warning.
6. Run `DevTrail: Open Setup Guide`.
7. Confirm the guide explains that DevTrail can still help with selected code, hovers, and terminal commands.
