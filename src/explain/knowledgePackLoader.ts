import * as vscode from "vscode";
import { KnowledgeTerm } from "./detectTerms";
import { getEnabledKnowledgeEntries } from "../packs/packManager";

export async function loadJavaScriptKnowledgePack(
  context: vscode.ExtensionContext
): Promise<KnowledgeTerm[]> {
  // Installed packs can change while VS Code is open, so callers should load
  // knowledge entries when they need them instead of caching them forever.
  return getEnabledKnowledgeEntries(context);
}
