import { SuggestedPack } from "../project/analyzeProject";
import { PackWithInstallStatus } from "./packRegistry";

export interface ManagePacksModel {
  packs: PackWithInstallStatus[];
  suggestedPacks: SuggestedPack[];
  workspaceName?: string;
}

export function renderManagePacksHtml(model: ManagePacksModel, nonce: string): string {
  const suggestionsByPackId = new Map(model.suggestedPacks.map((pack) => [pack.id, pack.whySuggested]));
  const installedCount = model.packs.filter((pack) => pack.installStatus === "Installed").length;
  const suggestedCount = model.suggestedPacks.length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevTrail Packs</title>
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
      font-size: 1rem;
      margin: 0;
    }

    button {
      background: var(--vscode-button-background);
      border: 0;
      border-radius: 6px;
      color: var(--vscode-button-foreground);
      cursor: pointer;
      font: inherit;
      padding: 6px 10px;
    }

    button.secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    button:hover {
      background: var(--vscode-button-hoverBackground);
    }

    button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .pack {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      margin-bottom: 10px;
      padding: 12px;
    }

    .pack-header {
      align-items: center;
      display: flex;
      gap: 10px;
      justify-content: space-between;
    }

    .muted {
      color: var(--vscode-descriptionForeground);
    }

    .status {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      display: inline-block;
      margin-right: 6px;
      padding: 1px 6px;
    }

    .status.installed {
      color: var(--vscode-testing-iconPassed);
    }

    .toolbar {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 12px 0;
    }

    .empty {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 12px;
    }
  </style>
</head>
<body>
  <h1>DevTrail Packs</h1>
  <p>Packs teach DevTrail about the languages, tools, and libraries your project uses.</p>
  <p class="muted">In v0.2 alpha, packs are bundled with the extension and install locally into DevTrail state. JavaScript Basics remains available as a safe fallback even after resetting installed packs.</p>
  <div class="toolbar">
    <span class="status installed">${installedCount} installed</span>
    <span class="status">${model.packs.length - installedCount} not installed</span>
    <span class="status">${suggestedCount} suggested</span>
    <button type="button" class="secondary" data-pack-action="resetInstalledPacks">Reset installed packs</button>
  </div>

  <h2>Suggested packs</h2>
  ${model.workspaceName ? `<p class="muted">Suggestions are based on ${escapeHtml(model.workspaceName)}.</p>` : "<p class=\"muted\">Open a project with package.json to see project-specific suggestions.</p>"}
  ${renderSuggestedPacks(model.packs, suggestionsByPackId)}

  <h2>All bundled packs</h2>
  ${renderPacks(model.packs, suggestionsByPackId)}

  <script nonce="${escapeHtml(nonce)}">
    const vscode = acquireVsCodeApi();

    document.querySelectorAll("[data-pack-action]").forEach((button) => {
      button.addEventListener("click", () => {
        vscode.postMessage({
          type: button.dataset.packAction,
          packId: button.dataset.packId || ""
        });
      });
    });
  </script>
</body>
</html>`;
}

function renderSuggestedPacks(
  packs: PackWithInstallStatus[],
  suggestionsByPackId: Map<string, string>
): string {
  const suggestedPacks = packs.filter((pack) => suggestionsByPackId.has(pack.id));

  if (suggestedPacks.length === 0) {
    return "<div class=\"empty\"><p>No project-specific packs were suggested yet.</p><p class=\"muted\">DevTrail still works with JavaScript Basics, selected code, hovers, terminal command explanations, and any packs you install manually.</p></div>";
  }

  return renderPacks(suggestedPacks, suggestionsByPackId);
}

function renderPacks(
  packs: PackWithInstallStatus[],
  suggestionsByPackId: Map<string, string>
): string {
  if (packs.length === 0) {
    return "<div class=\"empty\"><p>No bundled packs were found.</p></div>";
  }

  return packs.map((pack) => {
    const isInstalled = pack.installStatus === "Installed";
    const suggestedReason = suggestionsByPackId.get(pack.id);

    return `
      <section class="pack">
        <div class="pack-header">
          <h3>${escapeHtml(pack.displayName)}</h3>
          <button
            type="button"
            class="${isInstalled ? "secondary" : ""}"
            data-pack-action="${isInstalled ? "uninstallPack" : "installPack"}"
            data-pack-id="${escapeHtml(pack.id)}"
          >
            ${isInstalled ? "Uninstall" : "Install"}
          </button>
        </div>
        <p>${escapeHtml(pack.description)}</p>
        <p>
          <span class="status ${isInstalled ? "installed" : ""}">${isInstalled ? "Installed" : "Not installed"}</span>
          <span class="status">${escapeHtml(formatCategory(pack.category))}</span>
          <span class="muted">Version ${escapeHtml(pack.version)} - ${escapeHtml(pack.status)}</span>
        </p>
        ${suggestedReason ? `<p><strong>Suggested for this project:</strong> ${escapeHtml(suggestedReason)}</p>` : "<p class=\"muted\">Not specifically suggested for this project, but you can install it anytime.</p>"}
      </section>
    `;
  }).join("");
}

function formatCategory(category: PackWithInstallStatus["category"]): string {
  return `${category.charAt(0).toUpperCase()}${category.slice(1)} pack`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
