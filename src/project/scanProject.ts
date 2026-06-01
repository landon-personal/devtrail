import * as vscode from "vscode";
import { listAvailablePacks } from "../packs/packManager";
import { analyzeProjectPackage, ProjectAnalysisResult } from "./analyzeProject";

export const LAST_KNOWN_DEPENDENCIES_STATE_KEY = "devtrail.project.lastKnownDependencies";
export const LAST_SUGGESTED_PACK_IDS_STATE_KEY = "devtrail.project.lastSuggestedPackIds";

export type ProjectScanResult =
  | {
    status: "success";
    workspaceFolder: vscode.WorkspaceFolder;
    analysis: ProjectAnalysisResult;
    dependencyNames: string[];
    suggestedPackIds: string[];
  }
  | {
    status: "noPackageJson" | "invalidPackageJson";
    workspaceFolder: vscode.WorkspaceFolder;
  };

export async function scanWorkspaceProject(
  context: vscode.ExtensionContext,
  workspaceFolder: vscode.WorkspaceFolder
): Promise<ProjectScanResult> {
  const packageJsonUri = vscode.Uri.joinPath(workspaceFolder.uri, "package.json");
  const packageJsonBytes = await readWorkspaceFile(packageJsonUri);

  if (!packageJsonBytes) {
    return {
      status: "noPackageJson",
      workspaceFolder
    };
  }

  const packageJson = parsePackageJson(Buffer.from(packageJsonBytes).toString("utf8"));

  if (!packageJson) {
    return {
      status: "invalidPackageJson",
      workspaceFolder
    };
  }

  const registryPacks = await listAvailablePacks(context);
  const extraProjectSignals = await workspacePathExists(vscode.Uri.joinPath(workspaceFolder.uri, ".git"))
    ? ["git"]
    : [];
  const analysis = analyzeProjectPackage(packageJson, registryPacks, extraProjectSignals);

  return {
    status: "success",
    workspaceFolder,
    analysis,
    dependencyNames: getDependencyNames(analysis),
    suggestedPackIds: analysis.suggestedPacks.map((pack) => pack.id).sort()
  };
}

export function getLastKnownDependencies(
  context: vscode.ExtensionContext,
  workspaceFolder: vscode.WorkspaceFolder
): string[] {
  return context.workspaceState.get<string[]>(
    getWorkspaceStateKey(LAST_KNOWN_DEPENDENCIES_STATE_KEY, workspaceFolder),
    []
  );
}

export function findNewDependencies(previousDependencies: string[], currentDependencies: string[]): string[] {
  const previousDependencySet = new Set(previousDependencies);

  return currentDependencies.filter((dependencyName) => !previousDependencySet.has(dependencyName));
}

export async function saveProjectScanState(
  context: vscode.ExtensionContext,
  workspaceFolder: vscode.WorkspaceFolder,
  analysis: ProjectAnalysisResult
): Promise<void> {
  await Promise.all([
    context.workspaceState.update(
      getWorkspaceStateKey(LAST_KNOWN_DEPENDENCIES_STATE_KEY, workspaceFolder),
      getDependencyNames(analysis)
    ),
    context.workspaceState.update(
      getWorkspaceStateKey(LAST_SUGGESTED_PACK_IDS_STATE_KEY, workspaceFolder),
      analysis.suggestedPacks.map((pack) => pack.id).sort()
    )
  ]);
}

function getDependencyNames(analysis: ProjectAnalysisResult): string[] {
  return Array.from(new Set([
    ...Object.keys(analysis.dependencies),
    ...Object.keys(analysis.devDependencies)
  ])).sort();
}

function getWorkspaceStateKey(baseKey: string, workspaceFolder: vscode.WorkspaceFolder): string {
  return `${baseKey}:${workspaceFolder.uri.toString()}`;
}

async function readWorkspaceFile(uri: vscode.Uri): Promise<Uint8Array | undefined> {
  try {
    return await vscode.workspace.fs.readFile(uri);
  } catch {
    return undefined;
  }
}

async function workspacePathExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

function parsePackageJson(contents: string): unknown | undefined {
  try {
    return JSON.parse(contents) as unknown;
  } catch {
    return undefined;
  }
}
