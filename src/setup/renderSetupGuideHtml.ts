import { SetupGuideModel } from "./buildSetupGuideModel";

export function renderSetupGuideHtml(model: SetupGuideModel, nonce: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevTrail Setup Guide</title>
  <style>
    body {
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
      font-family: var(--vscode-font-family);
      line-height: 1.5;
      padding: 20px;
    }

    h1 {
      font-size: 1.35rem;
      margin: 0 0 18px;
    }

    h2 {
      border-bottom: 1px solid var(--vscode-panel-border);
      font-size: 1rem;
      margin-top: 24px;
      padding-bottom: 6px;
    }

    h3 {
      font-size: 0.95rem;
      margin: 0 0 4px;
    }

    code {
      font-family: var(--vscode-editor-font-family);
    }

    li {
      margin-bottom: 8px;
    }

    button {
      background: var(--vscode-button-secondaryBackground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      color: var(--vscode-button-secondaryForeground);
      cursor: pointer;
      font: inherit;
      padding: 10px;
      text-align: left;
      width: 100%;
    }

    button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    button.selected {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    button.primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      font-weight: 700;
      text-align: center;
    }

    .grid {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    }

    .card {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 12px;
    }

    .muted {
      color: var(--vscode-descriptionForeground);
    }

    .status {
      border-radius: 4px;
      border: 1px solid var(--vscode-panel-border);
      display: inline-block;
      margin-top: 6px;
      padding: 1px 6px;
    }

    .callout {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      margin: 12px 0;
      padding: 12px;
    }

    .finish {
      margin-top: 18px;
      max-width: 320px;
    }
  </style>
</head>
<body>
  <h1>DevTrail Setup Guide</h1>

  <h2>Welcome</h2>
  <p>DevTrail helps you understand code as you learn. It explains selected code, common terminal commands, hover terms, and project setup in beginner-friendly language.</p>
  <p class="muted">You can use DevTrail locally without AI. AI is optional and only runs after you turn it on and add your own API key.</p>
  <div class="grid">
    <div class="card">
      <h3>Local-first by default</h3>
      <p>Hovers, local explanations, project scans, command explanations, and pack recommendations run on this machine.</p>
    </div>
    <div class="card">
      <h3>What packs are</h3>
      <p>Packs teach DevTrail about the languages, tools, and libraries your project uses. In this beta, packs are bundled and install locally.</p>
    </div>
    <div class="card">
      <h3>AI is optional</h3>
      <p>DevTrail uses local packs unless you enable AI, set an API key, and choose code to explain.</p>
    </div>
    <div class="card">
      <h3>What to try first</h3>
      <p>Start with hover explanations, then try explaining a small code selection or the command <code>git status</code>.</p>
    </div>
    <div class="card">
      <h3>Easy access</h3>
      <p>Use the DevTrail status bar item, keyboard shortcuts, or the editor right-click menu so you do not have to hunt through the Command Palette.</p>
    </div>
  </div>

  <h2>Choose experience level</h2>
  <p class="muted">Choose how much detail you want. DevTrail uses this for local explanations, hovers where possible, and optional AI prompts.</p>
  <div class="grid" id="experience-levels">
    ${model.experienceLevels.map((level) => `
      <button
        type="button"
        class="${model.selectedExperienceLevel === level.id ? "selected" : ""}"
        data-level-id="${escapeHtml(level.id)}"
        aria-pressed="${model.selectedExperienceLevel === level.id ? "true" : "false"}"
      >
        <strong>${escapeHtml(level.label)}</strong>
        <br>
        <span>${escapeHtml(level.description)}</span>
      </button>
    `).join("")}
  </div>
  <p class="muted" id="saved-level">${renderSavedLevelText(model)}</p>

  <h2>Scan project</h2>
  ${renderProjectScan(model)}
  <p class="muted">DevTrail watches this workspace's <code>package.json</code> and can refresh recommended packs when project dependencies change.</p>

  <h2>Recommended packs</h2>
  <p class="muted">Packs teach DevTrail about the languages, tools, and libraries your project uses. In this beta, packs are bundled with DevTrail and install locally.</p>
  <div class="callout">
    Install the packs that match your project first. You can change them later with <code>DevTrail: Manage Packs</code>.
  </div>
  ${renderSuggestedPacks(model)}

  <h2>Enable learning features</h2>
  <div class="grid">
    <div class="card">
      <h3>Hover explanations</h3>
      <p>Hover over terms like <code>const</code>, <code>map</code>, <code>useEffect</code>, or <code>props</code> to see short explanations.</p>
    </div>
    <div class="card">
      <h3>Explain Selection</h3>
      <p>Highlight code and press <code>Cmd+Alt+E</code> on Mac or <code>Ctrl+Alt+E</code> on Windows/Linux to get a beginner-friendly breakdown.</p>
    </div>
    <div class="card">
      <h3>Explain Command</h3>
      <p>Run <code>DevTrail: Explain Command</code> to understand common Git and npm commands.</p>
    </div>
    <div class="card">
      <h3>Analyze Project</h3>
      <p>Run <code>DevTrail: Analyze Project</code> anytime to review scripts, dependencies, tools, and suggested packs.</p>
    </div>
    <div class="card">
      <h3>Status bar quick actions</h3>
      <p>Click <code>$(sparkle) DevTrail</code> in the status bar to open common actions like Explain Selection, Manage Packs, and Change Explanation Level.</p>
    </div>
  </div>

  <h2>Keyboard shortcuts</h2>
  <div class="grid">
    <div class="card">
      <h3>Explain Selection</h3>
      <p><code>Cmd+Alt+E</code> on Mac<br><code>Ctrl+Alt+E</code> on Windows/Linux</p>
    </div>
    <div class="card">
      <h3>Explain Command</h3>
      <p><code>Cmd+Alt+C</code> on Mac<br><code>Ctrl+Alt+C</code> on Windows/Linux</p>
    </div>
    <div class="card">
      <h3>Open Setup Guide</h3>
      <p><code>Cmd+Alt+D</code> on Mac<br><code>Ctrl+Alt+D</code> on Windows/Linux</p>
    </div>
    <div class="card">
      <h3>Manage Packs</h3>
      <p><code>Cmd+Alt+P</code> on Mac<br><code>Ctrl+Alt+P</code> on Windows/Linux</p>
    </div>
    <div class="card">
      <h3>Change Level</h3>
      <p><code>Cmd+Alt+L</code> on Mac<br><code>Ctrl+Alt+L</code> on Windows/Linux</p>
    </div>
  </div>

  <h2>You're ready to go</h2>
  <div class="callout">
    <strong>Try this first:</strong>
    <ol>
      <li>Open any code file.</li>
      <li>Highlight a few lines.</li>
      <li>Press <code>Cmd+Alt+E</code> on Mac or <code>Ctrl+Alt+E</code> on Windows/Linux.</li>
      <li>Or right-click the selection and choose <code>DevTrail: Explain Selection</code>.</li>
    </ol>
  </div>
  <ul>
    <li>Open a code file and hover over a term.</li>
    <li>Highlight code and run <code>DevTrail: Explain Selection</code>.</li>
    <li>Try <code>DevTrail: Explain Command</code> with <code>git status</code>.</li>
    <li>Install a recommended pack if DevTrail suggests one for your project.</li>
    <li>Run <code>DevTrail: Analyze Project</code> anytime.</li>
  </ul>
  <div class="finish">
    <button type="button" class="primary" id="finish-setup">Finish Setup</button>
  </div>

  <script nonce="${escapeHtml(nonce)}">
    const vscode = acquireVsCodeApi();
    const buttons = Array.from(document.querySelectorAll("[data-level-id]"));
    const savedLevel = document.getElementById("saved-level");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const levelId = button.dataset.levelId;

        buttons.forEach((otherButton) => {
          otherButton.classList.remove("selected");
          otherButton.setAttribute("aria-pressed", "false");
        });

        button.classList.add("selected");
        button.setAttribute("aria-pressed", "true");

        if (savedLevel) {
          savedLevel.textContent = "Saved. DevTrail will use this level to choose how simple or technical explanations should be.";
        }

        vscode.postMessage({
          type: "setExperienceLevel",
          levelId
        });
      });
    });

    document.querySelectorAll("[data-pack-action]").forEach((button) => {
      button.addEventListener("click", () => {
        vscode.postMessage({
          type: button.dataset.packAction,
          packId: button.dataset.packId
        });
      });
    });

    document.getElementById("finish-setup")?.addEventListener("click", () => {
      vscode.postMessage({
        type: "finishSetup"
      });
    });
  </script>
</body>
</html>`;
}

function renderSavedLevelText(model: SetupGuideModel): string {
  if (!model.selectedExperienceLevel) {
    return "Choose the level that best matches how you want DevTrail to explain things.";
  }

  const selectedLevel = model.experienceLevels.find((level) => level.id === model.selectedExperienceLevel);

  return selectedLevel
    ? `Saved level: ${escapeHtml(selectedLevel.label)}. This controls how simple or technical DevTrail explanations should be.`
    : "Choose the level that best matches how you want DevTrail to explain things.";
}

function renderProjectScan(model: SetupGuideModel): string {
  if (!model.hasWorkspace) {
    return `<p>${escapeHtml(model.fallbackMessage ?? "Open a workspace folder when you want DevTrail to scan a project.")}</p>`;
  }

  if (!model.hasPackageJson || !model.projectAnalysis) {
    return `<p><strong>${escapeHtml(model.workspaceName ?? "Current workspace")}</strong>: ${escapeHtml(model.fallbackMessage ?? "No package.json was found.")}</p>`;
  }

  const tools = model.projectAnalysis.detectedTools.length > 0
    ? model.projectAnalysis.detectedTools.map((tool) => `
        <li>
          <strong>${escapeHtml(tool.displayName)}</strong>
          <span class="muted">from <code>${escapeHtml(tool.packageName)}</code></span>
          <br>
          ${escapeHtml(tool.whyThisProjectMightUseIt)}
        </li>
      `).join("")
    : "<li>No known beginner tool matches were found yet.</li>";

  return `
    <p><strong>${escapeHtml(model.projectAnalysis.packageName)}</strong> was found in this workspace.</p>
    <ul>${tools}</ul>
  `;
}

function renderSuggestedPacks(model: SetupGuideModel): string {
  if (model.suggestedPacks.length === 0) {
    return "<p class=\"muted\">No packs were suggested yet. DevTrail will still work with selected code, hovers, and command explanations.</p>";
  }

  return `<div class="grid">
    ${model.suggestedPacks.map((pack) => `
      <div class="card">
        <h3>${escapeHtml(pack.displayName)}</h3>
        <p>${escapeHtml(pack.description)}</p>
        <p><strong>Why suggested:</strong> ${escapeHtml(pack.whySuggested)}</p>
        ${
          pack.installStatus === "Installed"
            ? "<span class=\"status\">Installed</span>"
            : `<p><span class="status">Not installed</span></p><button type="button" data-pack-action="installPack" data-pack-id="${escapeHtml(pack.id)}">Install locally</button>`
        }
      </div>
    `).join("")}
  </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
