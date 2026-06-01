import * as fs from "fs/promises";
import * as vscode from "vscode";
import { listInstalledPacks } from "../packs/packManager";
import { CommandPackEntry } from "./explainCommand";

interface CommandPackFile {
  tool: string;
  commands: CommandPackEntry[];
}

export async function loadCommandPacks(
  context: vscode.ExtensionContext
): Promise<CommandPackEntry[]> {
  const packPaths = (await listInstalledPacks(context))
    .map((pack) => pack.localPath)
    .filter((localPath) => localPath.endsWith("commands.json"));

  const packs = await Promise.all(packPaths.map((packPath) => loadCommandPack(context, packPath)));

  return packs.flatMap((pack) => pack.commands);
}

async function loadCommandPack(
  context: vscode.ExtensionContext,
  relativePackPath: string
): Promise<CommandPackFile> {
  // Like code knowledge packs, command packs are local JSON files shipped with the extension.
  const packPath = context.asAbsolutePath(relativePackPath);
  const contents = await fs.readFile(packPath, "utf8");

  return JSON.parse(contents) as CommandPackFile;
}
