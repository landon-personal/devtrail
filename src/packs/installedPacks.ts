import * as vscode from "vscode";

export const INSTALLED_PACK_IDS_STATE_KEY = "devtrail.packs.installedPackIds";

export function getInstalledPackIds(context: vscode.ExtensionContext): string[] {
  return context.globalState.get<string[]>(INSTALLED_PACK_IDS_STATE_KEY, []);
}

export async function saveInstalledPackIds(
  context: vscode.ExtensionContext,
  packIds: string[]
): Promise<void> {
  await context.globalState.update(
    INSTALLED_PACK_IDS_STATE_KEY,
    Array.from(new Set(packIds)).sort()
  );
}

export async function addInstalledPackId(
  context: vscode.ExtensionContext,
  packId: string
): Promise<void> {
  await saveInstalledPackIds(context, [...getInstalledPackIds(context), packId]);
}

export async function removeInstalledPackId(
  context: vscode.ExtensionContext,
  packId: string
): Promise<void> {
  await saveInstalledPackIds(
    context,
    getInstalledPackIds(context).filter((installedPackId) => installedPackId !== packId)
  );
}

export async function resetInstalledPackIds(context: vscode.ExtensionContext): Promise<void> {
  await context.globalState.update(INSTALLED_PACK_IDS_STATE_KEY, []);
}
