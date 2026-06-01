import * as fs from "fs/promises";
import * as path from "path";
import * as vscode from "vscode";

export type PackCategory = "language" | "framework" | "tool" | "library" | "course";
export type PackInstallStatus = "Installed" | "Not installed";
export type PackAvailabilityStatus = "bundled";

export interface PackRegistryEntry {
  id: string;
  displayName: string;
  description: string;
  category: PackCategory;
  localPath: string;
  relatedPackages: string[];
  version: string;
  status: PackAvailabilityStatus;
  tags: string[];
}

export interface PackWithInstallStatus extends PackRegistryEntry {
  installStatus: PackInstallStatus;
}

interface PackRegistryFile {
  packs: PackRegistryEntry[];
}

export async function loadPackRegistry(
  context: vscode.ExtensionContext
): Promise<PackRegistryEntry[]> {
  const registryPath = context.asAbsolutePath(path.join("packs", "registry.json"));
  const contents = await fs.readFile(registryPath, "utf8");
  const registry = JSON.parse(contents) as PackRegistryFile;

  return registry.packs ?? [];
}

export async function bundledPackExists(
  context: vscode.ExtensionContext,
  pack: PackRegistryEntry
): Promise<boolean> {
  try {
    await fs.access(context.asAbsolutePath(pack.localPath));
    return true;
  } catch {
    return false;
  }
}
