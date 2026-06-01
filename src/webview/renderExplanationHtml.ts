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
  <ol>
    ${explanation.lineByLine.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
  </ol>

  <h2>Key vocabulary</h2>
  <ul>
    ${vocabularyItems}
  </ul>

  <h2>Common beginner confusion</h2>
  <ul>
    ${explanation.beginnerConfusions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ul>

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
    <p>This should only take a few seconds.</p>
    <p class="loading-note">If AI takes too long, DevTrail will fall back to a local explanation.</p>
  </section>

  <h2>Selected code</h2>
  <pre><code>${escapeHtml(selectedCode)}</code></pre>
</body>
</html>`;
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
  `;
}
