import * as vscode from "vscode";
import {
  findNewDependencies,
  getLastKnownDependencies,
  saveProjectScanState,
  scanWorkspaceProject
} from "./scanProject";

const WATCH_DEBOUNCE_MS = 800;

export function registerProjectDependencyWatcher(context: vscode.ExtensionContext): void {
  const watcherDisposables = new Map<string, vscode.Disposable>();
  const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const registerWorkspaceFolder = (workspaceFolder: vscode.WorkspaceFolder): void => {
    const workspaceKey = workspaceFolder.uri.toString();

    if (watcherDisposables.has(workspaceKey)) {
      return;
    }

    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceFolder, "package.json")
    );
    const scheduleScan = () => {
      const existingTimer = debounceTimers.get(workspaceKey);

      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      debounceTimers.set(workspaceKey, setTimeout(() => {
        void checkForDependencyChanges(context, workspaceFolder);
      }, WATCH_DEBOUNCE_MS));
    };

    watcher.onDidCreate(scheduleScan);
    watcher.onDidChange(scheduleScan);

    watcherDisposables.set(workspaceKey, watcher);
    context.subscriptions.push(watcher);
  };

  vscode.workspace.workspaceFolders?.forEach(registerWorkspaceFolder);

  context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders((event) => {
    event.added.forEach(registerWorkspaceFolder);
    event.removed.forEach((workspaceFolder) => {
      const workspaceKey = workspaceFolder.uri.toString();
      const watcher = watcherDisposables.get(workspaceKey);
      const timer = debounceTimers.get(workspaceKey);

      watcher?.dispose();
      watcherDisposables.delete(workspaceKey);

      if (timer) {
        clearTimeout(timer);
        debounceTimers.delete(workspaceKey);
      }
    });
  }));
}

async function checkForDependencyChanges(
  context: vscode.ExtensionContext,
  workspaceFolder: vscode.WorkspaceFolder
): Promise<void> {
  const scanResult = await scanWorkspaceProject(context, workspaceFolder);

  if (scanResult.status !== "success") {
    return;
  }

  const previousDependencies = getLastKnownDependencies(context, workspaceFolder);
  await saveProjectScanState(context, workspaceFolder, scanResult.analysis);

  if (previousDependencies.length === 0) {
    return;
  }

  const newDependencies = findNewDependencies(previousDependencies, scanResult.dependencyNames);

  if (newDependencies.length === 0) {
    return;
  }

  const selectedAction = await vscode.window.showInformationMessage(
    `DevTrail noticed new project dependencies: ${formatDependencyList(newDependencies)}. Refresh suggested packs?`,
    "Refresh Packs"
  );

  if (selectedAction === "Refresh Packs") {
    await vscode.commands.executeCommand("devtrail.refreshProjectScan");
  }
}

function formatDependencyList(dependencies: string[]): string {
  if (dependencies.length <= 3) {
    return dependencies.join(", ");
  }

  return `${dependencies.slice(0, 3).join(", ")}, and ${dependencies.length - 3} more`;
}
