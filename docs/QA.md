# DevTrail Manual QA

Use this checklist before a v0.5 beta build.

## Setup Guide

1. Press F5 from the DevTrail repo.
2. In a fresh Extension Development Host profile, confirm DevTrail opens the setup guide automatically on first activation.
3. Reload the Extension Development Host and confirm setup does not reopen repeatedly.
4. Run `DevTrail: Open Setup Guide` manually and confirm setup can still be opened anytime.
5. Confirm the guide opens and shows Welcome, Choose experience level, Scan project, Recommended packs, Enable learning features, Keyboard shortcuts, and You're ready to go.
6. Confirm the guide explains local mode, optional AI, packs, keyboard shortcuts, the status bar, and what to try first.
7. Confirm the `Try this first` section tells users to highlight code and press `Cmd+Alt+E` or `Ctrl+Alt+E`.
8. Confirm the final button says `Finish Setup`.
9. Click `Finish Setup` and confirm DevTrail shows: `DevTrail is ready. Try highlighting code and pressing the Explain shortcut.`
10. Reload VS Code and confirm setup does not auto-open after completion.
11. Choose each experience level and confirm the selected state updates.
12. Confirm Brand new maps to `devtrail.explanationLevel: beginner`.
13. Confirm Know the basics maps to `devtrail.explanationLevel: learning`.
14. Confirm Comfortable but learning tools/libraries maps to `devtrail.explanationLevel: advanced`.
15. If recommended packs appear, click Install on one pack and confirm it changes to Installed.
16. Close and reopen the guide. Confirm the selected level is still shown.

## Quick Access And Shortcuts

1. Confirm the VS Code status bar shows `$(sparkle) DevTrail`.
2. Click the status bar item.
3. Confirm the quick pick shows Explain Selection, Explain Command, Open Setup Guide, Manage Packs, Change Explanation Level, Analyze Project, and Test AI Formatting.
4. Run `DevTrail: Quick Start` from the Command Palette and confirm it opens the same quick pick.
5. Select `Open Setup Guide` from the quick pick and confirm the setup guide opens.
6. Select code in an editor, press `Cmd+Alt+E` on Mac or `Ctrl+Alt+E` on Windows/Linux, and confirm Explain Selection runs.
7. Press `Cmd+Alt+C` on Mac or `Ctrl+Alt+C` on Windows/Linux and confirm Explain Command prompts for a terminal command.
8. Press `Cmd+Alt+D` on Mac or `Ctrl+Alt+D` on Windows/Linux and confirm Open Setup Guide runs.
9. Press `Cmd+Alt+P` on Mac or `Ctrl+Alt+P` on Windows/Linux and confirm Manage Packs opens.
10. Press `Cmd+Alt+L` on Mac or `Ctrl+Alt+L` on Windows/Linux and confirm Change Explanation Level opens.
11. Open VS Code Keyboard Shortcuts, search for `DevTrail`, and confirm the shortcuts are editable.
12. Right-click selected code and confirm `DevTrail: Explain Selection` appears.
13. Right-click in an editor and confirm `DevTrail: Change Explanation Level` and `DevTrail: Open Setup Guide` appear.

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
3. Confirm the top copy says: `Packs teach DevTrail about the languages, tools, and libraries your project uses.`
4. Confirm installed, not installed, and suggested counts are visible.
5. Confirm suggested packs appear in their own section when a `package.json` project is open.
6. Click Install for `React Basics`.
7. Confirm the panel refreshes and shows `React Basics` as Installed.
8. Click Uninstall for `React Basics`.
9. Confirm the panel refreshes and shows `React Basics` as Not installed.
10. Click `Reset installed packs` in the Manage Packs panel.
11. Confirm installed statuses are cleared and JavaScript basics still work.
12. Open the setup guide in a project with suggested packs and confirm Install locally buttons work there too.

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

## Explain React And JSX Locally

1. Disable AI with `DevTrail: Disable AI Explanations`.
2. Run `DevTrail: Manage Packs` and install `React Basics`.
3. Open a `.jsx` or `.tsx` file.
4. Select a component that uses destructured props, such as `const Layout = ({ children }) => {`.
5. Run `DevTrail: Explain Selection`.
6. Confirm DevTrail explains the component, props, and `children` as nested content.
7. Select code with `useState` and a loading state.
8. Confirm DevTrail explains state, setter functions, and early loading returns.
9. Select code with `useEffect(() => { document.title = ... }, [...])`.
10. Confirm DevTrail explains the effect and browser tab title update.
11. Select code with `.map((item) => <Card ... />)`.
12. Confirm DevTrail explains JSX list rendering and the current item variable.
13. Select code with `<Route ... />`, `<Routes>`, or `<Navigate ... />`.
14. Confirm DevTrail explains React Router route mapping or redirect behavior.
15. Select a protected-route style line such as `if (!isPremium) return <Navigate to="/upgrade" />;`.
16. Confirm DevTrail explains that the page is gated and redirects some users.

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

## Friendly Error And Fallback Paths

1. Close active editors and run `DevTrail: Explain Selection`.
2. Confirm DevTrail asks you to open a code file first.
3. Open a code file, select nothing, and run `DevTrail: Explain Selection`.
4. Confirm DevTrail asks you to highlight a small piece of code.
5. Run `DevTrail: Show Current Language Mode` with no active editor.
6. Confirm DevTrail asks you to open a file first.
7. Run `DevTrail: Explain Command`, submit an empty command, and confirm DevTrail asks for a terminal command.
8. Enter an unsupported command and confirm the webview suggests supported examples.
9. Run `DevTrail: Analyze Project` with no workspace and confirm the message says to open a project folder first.
10. Open a folder without `package.json`, run `DevTrail: Analyze Project`, and confirm DevTrail explains that hovers, Explain Selection, and Explain Command still work.
11. Temporarily break `package.json` in a test project, run `DevTrail: Analyze Project`, and confirm DevTrail asks you to fix JSON and scan again.
12. Confirm Manage Packs still opens even if no project-specific suggestions are available.

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
10. Confirm `devtrail.ai.structuredModel` is unset or set to `gpt-4o-mini`.
11. Run `DevTrail: Test AI Formatting`.
12. Confirm it sends only the built-in tiny JavaScript sample and opens a normal DevTrail explanation webview when structured parsing succeeds.
13. Confirm the test webview says `Source: AI explanation`.
14. Confirm diagnostics, if shown, list request method `chat.completions.parse` for the strict structured attempt and actual structured model `gpt-4o-mini` unless overridden.
15. If strict structured output fails but JSON fallback succeeds, confirm the explanation still opens and shows `Structured parsing failed, but DevTrail recovered with JSON fallback.`
16. Confirm the test does not show raw model output or private code.
17. If the formatting test fails, read the diagnostics panel and note only the safe category DevTrail shows: SDK method unsupported, API rejected schema, parsed output missing, JSON parse failed, validation failed, model refused or empty output, or unknown AI formatting failure.
18. Diagnostic details are safe only for the hardcoded test sample: SDK version, configured normal model, configured structured model, actual structured model, AI enabled, whether an API key exists, request method, `message.parsed`/`message.content` presence, finish reason, refusal presence, and a short `message.content` preview for the hardcoded sample if JSON fallback runs.
19. Do not test AI explanations on real project code yet if `DevTrail: Test AI Formatting` fails.
20. Do not copy selected code, API keys, full model output, project source, or secrets into a bug report.
21. Select safe React/JSX code and run `DevTrail: Explain Selection`.
22. Confirm the webview opens immediately and says `DevTrail is reading this code...`.
23. Confirm the VS Code progress notification says `DevTrail is generating an AI explanation...`.
24. Confirm the final webview says `Source: AI explanation`.
25. Confirm the output shows the current explanation level.
26. Confirm the output has clean formatting: summary paragraph, line-by-line ordered list, vocabulary bullets, confusion bullets, and no raw Markdown code fences or strange backtick-heavy text.
27. Open `App.jsx`, select a small JSX return block, and run `DevTrail: Explain Selection`.
28. Confirm the webview does not show `AI formatting failed` for normal React/JSX code.
29. Confirm the React/JSX output sections render cleanly without raw JSON, Markdown fences, or unusual backtick formatting.
28. Set `devtrail.ai.slowWarningMs` to `60000`.
29. Run AI Explain Selection again and confirm normal AI success renders before any slow warning appears.
30. Set `devtrail.explanationLevel` to `advanced` or run `DevTrail: Change Explanation Level`.
31. Run AI Explain Selection again and confirm the output is more concise and technical than Beginner.
32. Set `devtrail.ai.slowWarningMs` to `1000`.
33. Run `DevTrail: Explain Selection` on safe code.
34. If AI is still running after the delay, confirm the webview says `AI is taking longer than expected.` and shows `Keep waiting` and `Use local explanation`.
35. Click `Keep waiting`.
36. Confirm the webview says `Still waiting for the AI explanation...` and no second AI request starts.
37. Run `DevTrail: Explain Selection` again on safe code.
38. When the slow warning appears, click `Use local explanation`.
39. Confirm DevTrail renders local output and shows `You switched to a local explanation while AI was still running.`
40. Confirm a later AI response does not overwrite the local output.
41. Reset `devtrail.ai.slowWarningMs` to `5000`.
42. Run `DevTrail: Explain Selection` again and click Cancel in the progress notification.
43. Confirm DevTrail falls back locally and shows `AI explanation was canceled, so DevTrail used the local explanation instead.`
44. Set `devtrail.ai.maxSelectedCharacters` to `20`.
45. Select more than 20 characters and run `DevTrail: Explain Selection`.
46. Confirm DevTrail warns that the selection is large and uses the local explanation.
47. Reset `devtrail.ai.maxSelectedCharacters` to `6000`.
48. Set `devtrail.ai.speedMode` to `fast` and remove any explicit `devtrail.ai.model` override.
49. Run `DevTrail: Explain Selection` and confirm the AI path still works. This mode uses `gpt-5-nano` for the fastest responses.
50. Set `devtrail.ai.speedMode` back to `balanced`.
51. Select text that looks like a secret, such as `OPENAI_API_KEY=abc123456789`.
52. Run `DevTrail: Explain Selection`.
53. Confirm DevTrail refuses to send it to AI and falls back locally immediately.
54. Run `DevTrail: Clear OpenAI API Key`.
55. Run `DevTrail: Disable AI Explanations`.

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
