import * as vscode from "vscode";
import { KnowledgeTerm } from "../explain/detectTerms";
import { normalizeExplanationLevel } from "../explain/explanationLevel";
import { tuneKnowledgeTermForLevel } from "../explain/explainSelection";
import { loadJavaScriptKnowledgePack } from "../explain/knowledgePackLoader";

const SUPPORTED_LANGUAGES: vscode.DocumentSelector = [
  { language: "javascript", scheme: "file" },
  { language: "javascriptreact", scheme: "file" },
  { language: "typescript", scheme: "file" },
  { language: "typescriptreact", scheme: "file" },
  { language: "javascript", scheme: "untitled" },
  { language: "javascriptreact", scheme: "untitled" },
  { language: "typescript", scheme: "untitled" },
  { language: "typescriptreact", scheme: "untitled" }
];

export function registerHoverProvider(context: vscode.ExtensionContext): void {
  // Hover providers let extensions add content to VS Code's normal hover popup.
  const provider = vscode.languages.registerHoverProvider(SUPPORTED_LANGUAGES, {
    async provideHover(document, position) {
      if (!areDevTrailHoversEnabled()) {
        return undefined;
      }

      const wordRange = document.getWordRangeAtPosition(position);

      if (!wordRange) {
        return undefined;
      }

      const hoveredWord = document.getText(wordRange);
      const matchedTerm = await findKnowledgeTerm(context, hoveredWord);

      if (!matchedTerm) {
        return undefined;
      }

      return new vscode.Hover(renderHoverMarkdown(matchedTerm), wordRange);
    }
  });

  context.subscriptions.push(provider);
}

function areDevTrailHoversEnabled(): boolean {
  return vscode.workspace
    .getConfiguration("devtrail")
    .get<boolean>("hovers.enabled", true);
}

async function findKnowledgeTerm(
  context: vscode.ExtensionContext,
  hoveredWord: string
): Promise<KnowledgeTerm | undefined> {
  try {
    const terms = await loadJavaScriptKnowledgePack(context);
    const explanationLevel = normalizeExplanationLevel(
      vscode.workspace.getConfiguration("devtrail").get<string>("explanationLevel", "beginner")
    );
    const matchedTerm = terms.find((entry) => entry.term === hoveredWord);

    return matchedTerm ? tuneKnowledgeTermForLevel(matchedTerm, explanationLevel) : undefined;
  } catch {
    return undefined;
  }
}

function renderHoverMarkdown(term: KnowledgeTerm): vscode.MarkdownString {
  const markdown = new vscode.MarkdownString();

  markdown.appendMarkdown(`**DevTrail: \`${term.term}\`**\n\n`);
  markdown.appendText(term.plainEnglish);

  if (term.confusion.trim().length > 0) {
    markdown.appendMarkdown("\n\n**Common mistake:** ");
    markdown.appendText(term.confusion);
  }

  return markdown;
}
