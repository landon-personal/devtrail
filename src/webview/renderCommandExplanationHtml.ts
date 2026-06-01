import { CommandExplanationResult } from "../explain/explainCommand";

export function renderCommandExplanationHtml(explanation: CommandExplanationResult): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevTrail Command Explanation</title>
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
  </style>
</head>
<body>
  <h1>DevTrail Command Explanation</h1>

  <h2>Command</h2>
  <pre><code>${escapeHtml(explanation.enteredCommand)}</code></pre>

  <h2>What the command does</h2>
  <p>${escapeHtml(explanation.whatItDoes)}</p>

  <h2>Breakdown of each part</h2>
  <ul>
    ${explanation.parts.map((part) => `
      <li>
        <strong><code>${escapeHtml(part.part)}</code></strong>
        <span>${escapeHtml(part.explanation)}</span>
      </li>
    `).join("")}
  </ul>

  <h2>When you would use it</h2>
  <p>${escapeHtml(explanation.whenToUse)}</p>

  <h2>Common beginner mistake</h2>
  <p>${escapeHtml(explanation.commonMistake)}</p>

  ${renderSuggestedExamples(explanation)}
</body>
</html>`;
}

function renderSuggestedExamples(explanation: CommandExplanationResult): string {
  if (explanation.suggestedExamples.length === 0) {
    return "";
  }

  return `<h2>Try a supported example</h2>
  <ul>
    ${explanation.suggestedExamples.map((example) => `<li><code>${escapeHtml(example)}</code></li>`).join("")}
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
