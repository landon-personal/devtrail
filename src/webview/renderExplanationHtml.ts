import { getExplanationLevelLabel, ExplanationLevel } from "../explain/explanationLevel";
import { ExplanationResult } from "../explain/explainSelection";

export function renderExplanationHtml(explanation: ExplanationResult, selectedCode: string): string {
  const vocabularyItems = explanation.vocabulary.length > 0
    ? explanation.vocabulary.map((entry) => `
        <li>
          <strong>${escapeHtml(entry.term)}</strong>
          <span>${escapeHtml(entry.plainEnglish)}</span>
        </li>
      `).join("")
    : "<li>No beginner vocabulary terms were detected in this selection.</li>";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevTrail Explanation</title>
  <style>
    ${renderBaseStyles()}
  </style>
</head>
<body>
  <h1>DevTrail Explanation</h1>
  <p><strong>Source:</strong> ${escapeHtml(renderSourceLabel(explanation.source))}</p>
  <p><strong>Level:</strong> ${escapeHtml(getExplanationLevelLabel(explanation.explanationLevel))}</p>
  ${renderNotice(explanation)}

  <h2>What this code does</h2>
  <p>${escapeHtml(explanation.summary)}</p>

  <h2>Line-by-line explanation</h2>
  ${renderOrderedList(explanation.lineByLine, "DevTrail did not find specific line patterns here yet. Try selecting a smaller block or installing a related pack.")}

  <h2>Key vocabulary</h2>
  <ul>
    ${vocabularyItems}
  </ul>

  <h2>Common beginner confusion</h2>
  ${renderUnorderedList(explanation.beginnerConfusions, "No common beginner confusion was detected for this selection.")}

  <h2>Selected code</h2>
  <pre><code>${escapeHtml(selectedCode)}</code></pre>
</body>
</html>`;
}

export function renderExplanationLoadingHtml(selectedCode: string, explanationLevel: ExplanationLevel): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevTrail Explanation</title>
  <style>
    ${renderBaseStyles()}

    .loading-panel {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 14px;
    }

    .loading-panel p {
      margin: 6px 0;
    }

    .loading-note {
      color: var(--vscode-descriptionForeground);
    }
  </style>
</head>
<body>
  <h1>DevTrail Explanation</h1>
  <p><strong>Level:</strong> ${escapeHtml(getExplanationLevelLabel(explanationLevel))}</p>
  <section class="loading-panel" aria-live="polite">
    <p><strong>DevTrail is reading this code...</strong></p>
    <p>Using AI explanation...</p>
    <p class="loading-note">This may take a few seconds.</p>
  </section>

  <h2>Selected code</h2>
  <pre><code>${escapeHtml(selectedCode)}</code></pre>
</body>
</html>`;
}

export function renderExplanationSlowWarningHtml(
  selectedCode: string,
  explanationLevel: ExplanationLevel,
  nonce: string
): string {
  return renderLoadingStateHtml({
    selectedCode,
    explanationLevel,
    title: "AI is taking longer than expected.",
    lines: [
      "You can keep waiting or switch to a local explanation."
    ],
    actions: true,
    nonce
  });
}

export function renderExplanationStillWaitingHtml(
  selectedCode: string,
  explanationLevel: ExplanationLevel
): string {
  return renderLoadingStateHtml({
    selectedCode,
    explanationLevel,
    title: "Still waiting for the AI explanation...",
    lines: [
      "DevTrail will show it here as soon as it returns."
    ],
    actions: false
  });
}

function renderSourceLabel(source: ExplanationResult["source"]): string {
  return source === "ai" ? "AI explanation" : "Local DevTrail packs";
}

function renderNotice(explanation: ExplanationResult): string {
  if (!explanation.notice) {
    return "";
  }

  return `<p class="notice">${escapeHtml(explanation.notice)}</p>`;
}

function renderOrderedList(items: string[], emptyMessage: string): string {
  if (items.length === 0) {
    return `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
  }

  return `<ol>
    ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ol>`;
}

function renderUnorderedList(items: string[], emptyMessage: string): string {
  if (items.length === 0) {
    return `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
  }

  return `<ul>
    ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ul>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderBaseStyles(): string {
  return `
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

    pre {
      background: var(--vscode-textCodeBlock-background);
      border-radius: 6px;
      overflow: auto;
      padding: 12px;
    }

    code {
      font-family: var(--vscode-editor-font-family);
    }

    li {
      margin-bottom: 8px;
    }

    .notice {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      color: var(--vscode-descriptionForeground);
      padding: 10px;
    }

    .muted {
      color: var(--vscode-descriptionForeground);
    }
  `;
}

function renderLoadingStateHtml(options: {
  selectedCode: string;
  explanationLevel: ExplanationLevel;
  title: string;
  lines: string[];
  actions: boolean;
  nonce?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevTrail Explanation</title>
  <style>
    ${renderBaseStyles()}

    .loading-panel {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 14px;
    }

    .loading-panel p {
      margin: 6px 0;
    }

    .loading-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    button {
      background: var(--vscode-button-background);
      border: 0;
      border-radius: 6px;
      color: var(--vscode-button-foreground);
      cursor: pointer;
      font: inherit;
      padding: 7px 10px;
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
  </style>
</head>
<body>
  <h1>DevTrail Explanation</h1>
  <p><strong>Level:</strong> ${escapeHtml(getExplanationLevelLabel(options.explanationLevel))}</p>
  <section class="loading-panel" aria-live="polite">
    <p><strong>${escapeHtml(options.title)}</strong></p>
    ${options.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    ${renderLoadingActions(options.actions)}
  </section>

  <h2>Selected code</h2>
  <pre><code>${escapeHtml(options.selectedCode)}</code></pre>
  ${renderLoadingScript(options.actions, options.nonce)}
</body>
</html>`;
}

function renderLoadingActions(hasActions: boolean): string {
  if (!hasActions) {
    return "";
  }

  return `<div class="loading-actions">
    <button type="button" data-action="keepWaiting">Keep waiting</button>
    <button type="button" class="secondary" data-action="useLocalExplanation">Use local explanation</button>
  </div>`;
}

function renderLoadingScript(hasActions: boolean, nonce: string | undefined): string {
  if (!hasActions || !nonce) {
    return "";
  }

  return `<script nonce="${escapeHtml(nonce)}">
    const vscode = acquireVsCodeApi();

    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        vscode.postMessage({
          type: button.dataset.action
        });
      });
    });
  </script>`;
}
