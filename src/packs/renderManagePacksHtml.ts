import { SuggestedPack } from "../project/analyzeProject";
import { PackWithInstallStatus } from "./packRegistry";

export interface ManagePacksModel {
  packs: PackWithInstallStatus[];
  suggestedPacks: SuggestedPack[];
  workspaceName?: string;
}

export function renderManagePacksHtml(model: ManagePacksModel, nonce: string): string {
  const suggestionsByPackId = new Map(model.suggestedPacks.map((pack) => [pack.id, pack.whySuggested]));

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
  </style>
</head>
<body>
  <h1>DevTrail Packs</h1>
  <p>Packs teach DevTrail about the languages, tools, and libraries your project uses. In v0.1, packs are bundled with the extension and install locally into DevTrail state.</p>
  <p class="muted">JavaScript Basics remains available as a safe fallback even after resetting installed packs.</p>

  <h2>Available packs</h2>
  ${model.workspaceName ? `<p class="muted">Suggestions are based on ${escapeHtml(model.workspaceName)}.</p>` : "<p class=\"muted\">Open a project with package.json to see project-specific suggestions.</p>"}
  ${renderPacks(model.packs, suggestionsByPackId)}

  <script nonce="${escapeHtml(nonce)}">
    const vscode = acquireVsCodeApi();

    document.querySelectorAll("[data-pack-action]").forEach((button) => {
      button.addEventListener("click", () => {
        vscode.postMessage({
          type: button.dataset.packAction,
          packId: button.dataset.packId
        });
      });
    });
  </script>
</body>
</html>`;
}

function renderPacks(
  packs: PackWithInstallStatus[],
  suggestionsByPackId: Map<string, string>
): string {
  if (packs.length === 0) {
    return "<p class=\"muted\">No bundled packs were found.</p>";
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
          <span class="status">${escapeHtml(pack.installStatus)}</span>
          <span class="muted">${escapeHtml(pack.category)} pack - ${escapeHtml(pack.version)} - ${escapeHtml(pack.status)}</span>
        </p>
        ${suggestedReason ? `<p><strong>Suggested for this project:</strong> ${escapeHtml(suggestedReason)}</p>` : ""}
      </section>
    `;
  }).join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
