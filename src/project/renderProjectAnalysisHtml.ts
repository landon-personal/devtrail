import { ProjectAnalysisResult } from "./analyzeProject";

export function renderProjectAnalysisHtml(analysis: ProjectAnalysisResult): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevTrail Project Analysis</title>
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

    code {
      font-family: var(--vscode-editor-font-family);
    }

    li {
      margin-bottom: 8px;
    }

    .muted {
      color: var(--vscode-descriptionForeground);
    }

    .status {
      border-radius: 4px;
      border: 1px solid var(--vscode-panel-border);
      display: inline-block;
      margin-top: 4px;
      padding: 1px 6px;
    }
  </style>
</head>
<body>
  <h1>DevTrail Project Analysis</h1>
  <p>DevTrail read this project's <code>package.json</code>. That file is the project's table of contents for scripts, packages, and tool setup.</p>

  <h2>Project</h2>
  <ul>
    <li><strong>Name:</strong> ${escapeHtml(analysis.packageName)}</li>
    <li><strong>Version:</strong> ${escapeHtml(analysis.version)}</li>
  </ul>

  <h2>Scripts</h2>
  <p class="muted">Scripts are shortcuts you can run with <code>npm run</code>. They usually start, check, build, or format the project.</p>
  ${renderScripts(analysis)}

  <h2>Dependencies</h2>
  <p class="muted">Dependencies are packages the app usually needs when it runs.</p>
  ${renderDependencyList(analysis.dependencies, "No runtime dependencies are listed.")}

  <h2>Dev dependencies</h2>
  <p class="muted">Dev dependencies are packages mostly used while building, checking, or developing the project.</p>
  ${renderDependencyList(analysis.devDependencies, "No development dependencies are listed.")}

  <h2>Detected tools</h2>
  ${renderDetectedTools(analysis)}

  <h2>Suggested Packs</h2>
  <p class="muted">Installing suggested packs improves DevTrail's local explanations for the languages, tools, and libraries this project uses.</p>
  ${renderSuggestedPacks(analysis)}
</body>
</html>`;
}

function renderScripts(analysis: ProjectAnalysisResult): string {
  if (analysis.scripts.length === 0) {
    return "<p class=\"muted\">No package scripts are listed.</p>";
  }

  return `<ul>
    ${analysis.scripts.map((script) => `
      <li>
        <strong><code>${escapeHtml(script.name)}</code></strong>
        <span>${escapeHtml(script.explanation)}</span>
        <br>
        <span class="muted"><code>${escapeHtml(script.command)}</code></span>
      </li>
    `).join("")}
  </ul>`;
}

function renderDependencyList(dependencies: Record<string, string>, emptyMessage: string): string {
  const entries = Object.entries(dependencies);

  if (entries.length === 0) {
    return `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
  }

  return `<ul>
    ${entries.map(([name, version]) => `
      <li><strong><code>${escapeHtml(name)}</code></strong> <span class="muted">${escapeHtml(version)}</span></li>
    `).join("")}
  </ul>`;
}

function renderDetectedTools(analysis: ProjectAnalysisResult): string {
  if (analysis.detectedTools.length === 0) {
    return "<p class=\"muted\">No known beginner tool matches were found yet.</p>";
  }

  return `<ul>
    ${analysis.detectedTools.map((tool) => `
      <li>
        <strong>${escapeHtml(tool.displayName)}</strong>
        <span class="muted">from <code>${escapeHtml(tool.packageName)}</code></span>
        <br>
        <strong>What it is:</strong> ${escapeHtml(tool.whatItIs)}
        <br>
        <strong>Why this project might use it:</strong> ${escapeHtml(tool.whyThisProjectMightUseIt)}
      </li>
    `).join("")}
  </ul>`;
}

function renderSuggestedPacks(analysis: ProjectAnalysisResult): string {
  if (analysis.suggestedPacks.length === 0) {
    return "<p class=\"muted\">No registry packs were suggested for this project yet.</p>";
  }

  return `<ul>
    ${analysis.suggestedPacks.map((pack) => `
      <li>
        <strong>${escapeHtml(pack.displayName)}</strong>
        <span class="muted"><code>${escapeHtml(pack.id)}</code></span>
        <br>
        ${escapeHtml(pack.description)}
        <br>
        <strong>Why suggested:</strong> ${escapeHtml(pack.whySuggested)}
        <br>
        <strong>Status:</strong> <span class="status">${escapeHtml(formatPackStatus(pack.installStatus))}</span>
        ${pack.installStatus === "Installed" ? "" : "<br><span class=\"muted\">Install this bundled pack to improve local explanations for this topic.</span>"}
      </li>
    `).join("")}
  </ul>`;
}

function formatPackStatus(status: string): string {
  return status === "Installed" ? "Installed" : "Not installed";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
