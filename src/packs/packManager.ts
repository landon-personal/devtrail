import * as fs from "fs/promises";
import * as vscode from "vscode";
import { KnowledgeTerm } from "../explain/detectTerms";
import { ProjectAnalysisResult, SuggestedPack } from "../project/analyzeProject";
import {
  addInstalledPackId,
  getInstalledPackIds,
  removeInstalledPackId,
  resetInstalledPackIds
} from "./installedPacks";
import {
  bundledPackExists,
  loadPackRegistry,
  PackRegistryEntry,
  PackWithInstallStatus
} from "./packRegistry";

const CORE_FALLBACK_PACK_ID = "javascript-basics";

interface KnowledgePackFile {
  terms?: KnowledgeTerm[];
}

export async function listAvailablePacks(context: vscode.ExtensionContext): Promise<PackWithInstallStatus[]> {
  const registryPacks = await safeLoadPackRegistry(context);
  const installedPackIds = new Set(getInstalledPackIds(context));

  return registryPacks.map((pack) => ({
    ...pack,
    installStatus: installedPackIds.has(pack.id) ? "Installed" : "Not installed"
  }));
}

export async function listInstalledPacks(context: vscode.ExtensionContext): Promise<PackWithInstallStatus[]> {
  const availablePacks = await listAvailablePacks(context);

  return availablePacks.filter((pack) => pack.installStatus === "Installed");
}

export function isPackInstalled(context: vscode.ExtensionContext, packId: string): boolean {
  return getInstalledPackIds(context).includes(packId);
}

export async function installPack(context: vscode.ExtensionContext, packId: string): Promise<boolean> {
  const pack = await findAvailablePack(context, packId);

  if (!pack || !(await bundledPackExists(context, pack))) {
    return false;
  }

  await addInstalledPackId(context, packId);
  return true;
}

export async function uninstallPack(context: vscode.ExtensionContext, packId: string): Promise<void> {
  await removeInstalledPackId(context, packId);
}

export async function resetInstalledPacks(context: vscode.ExtensionContext): Promise<void> {
  await resetInstalledPackIds(context);
}

export async function getSuggestedPacksForProject(
  context: vscode.ExtensionContext,
  projectAnalysis: ProjectAnalysisResult
): Promise<SuggestedPack[]> {
  const availablePacksById = new Map(
    (await listAvailablePacks(context)).map((pack) => [pack.id, pack])
  );

  return projectAnalysis.suggestedPacks.flatMap((suggestedPack) => {
    const currentPack = availablePacksById.get(suggestedPack.id);

    if (!currentPack) {
      return [];
    }

    return [{
      ...suggestedPack,
      installStatus: currentPack.installStatus
    }];
  });
}

export async function getEnabledKnowledgeEntries(context: vscode.ExtensionContext): Promise<KnowledgeTerm[]> {
  const availablePacks = await listAvailablePacks(context);
  const packsToLoad = availablePacks.filter((pack) =>
    pack.id === CORE_FALLBACK_PACK_ID || pack.installStatus === "Installed"
  );
  const packTerms = await Promise.all(packsToLoad.map((pack) => loadKnowledgeTermsFromPack(context, pack)));

  return dedupeKnowledgeTerms(packTerms.flat());
}

async function findAvailablePack(
  context: vscode.ExtensionContext,
  packId: string
): Promise<PackRegistryEntry | undefined> {
  const availablePacks = await safeLoadPackRegistry(context);

  return availablePacks.find((pack) => pack.id === packId);
}

async function safeLoadPackRegistry(context: vscode.ExtensionContext): Promise<PackRegistryEntry[]> {
  try {
    return await loadPackRegistry(context);
  } catch {
    console.warn("DevTrail pack registry could not be loaded.");
    return [];
  }
}

async function loadKnowledgeTermsFromPack(
  context: vscode.ExtensionContext,
  pack: PackRegistryEntry
): Promise<KnowledgeTerm[]> {
  try {
    const contents = await fs.readFile(context.asAbsolutePath(pack.localPath), "utf8");
    const parsed = JSON.parse(contents) as KnowledgePackFile;

    return Array.isArray(parsed.terms) ? parsed.terms : [];
  } catch {
    return [];
  }
}

function dedupeKnowledgeTerms(terms: KnowledgeTerm[]): KnowledgeTerm[] {
  const termsByName = new Map<string, KnowledgeTerm>();

  for (const term of terms) {
    if (!termsByName.has(term.term)) {
      termsByName.set(term.term, term);
    }
  }

  return Array.from(termsByName.values());
}
