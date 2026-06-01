import OpenAI from "openai";
import * as vscode from "vscode";

const OPENAI_API_KEY_SECRET = "devtrail.openaiApiKey";

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}

export async function getOpenAIApiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
  return context.secrets.get(OPENAI_API_KEY_SECRET);
}

export async function setOpenAIApiKey(
  context: vscode.ExtensionContext,
  apiKey: string
): Promise<void> {
  await context.secrets.store(OPENAI_API_KEY_SECRET, apiKey);
}

export async function clearOpenAIApiKey(context: vscode.ExtensionContext): Promise<void> {
  await context.secrets.delete(OPENAI_API_KEY_SECRET);
}
