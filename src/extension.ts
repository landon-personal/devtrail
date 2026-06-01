import * as vscode from "vscode";
import { clearOpenAIApiKey, getOpenAIApiKey, setOpenAIApiKey } from "./ai/openaiClient";
import { canSendSelectionToAI } from "./ai/safety";
import { AIExplanationFormatError, explainSelectionWithAI } from "./ai/explainWithAI";
import { explainCommand } from "./explain/explainCommand";
import {
  ExplanationLevel,
  getExplanationLevelDescription,
  getExplanationLevelLabel,
  normalizeExplanationLevel
} from "./explain/explanationLevel";
import { ExplanationResult, explainSelection } from "./explain/explainSelection";
import { loadCommandPacks } from "./explain/commandPackLoader";
import { loadJavaScriptKnowledgePack } from "./explain/knowledgePackLoader";
import { registerHoverProvider } from "./hover/registerHoverProvider";
import {
  getSuggestedPacksForProject,
  installPack,
  listAvailablePacks,
  resetInstalledPacks,
  uninstallPack
} from "./packs/packManager";
import { renderManagePacksHtml } from "./packs/renderManagePacksHtml";
import { registerProjectDependencyWatcher } from "./project/registerProjectDependencyWatcher";
import { ProjectAnalysisResult } from "./project/analyzeProject";
import { renderProjectAnalysisHtml } from "./project/renderProjectAnalysisHtml";
import { saveProjectScanState, scanWorkspaceProject } from "./project/scanProject";
import {
  buildSetupGuideModel,
  EXPERIENCE_LEVEL_STATE_KEY,
  ExperienceLevelId
} from "./setup/buildSetupGuideModel";
import { renderSetupGuideHtml } from "./setup/renderSetupGuideHtml";
import { renderCommandExplanationHtml } from "./webview/renderCommandExplanationHtml";
import { renderExplanationHtml, renderExplanationLoadingHtml } from "./webview/renderExplanationHtml";

const WELCOME_PROMPT_STATE_KEY = "devtrail.welcomePromptShown";
const DEFAULT_AI_MODEL = "gpt-5-mini";
const FAST_AI_MODEL = "gpt-5-nano";
const DEFAULT_AI_TIMEOUT_MS = 8000;
const DEFAULT_AI_MAX_SELECTED_CHARACTERS = 6000;

type AISpeedMode = "balanced" | "fast";

interface AISettings {
  enabled: boolean;
  model: string;
  includeProjectContext: boolean;
  timeoutMs: number;
  maxSelectedCharacters: number;
  speedMode: AISpeedMode;
  hasExplicitModelOverride: boolean;
  explanationLevel: ExplanationLevel;
}

type AIExplanationOutcome =
  | { status: "success"; explanation: ExplanationResult }
  | { status: "canceled" }
  | { status: "timeout" }
  | { status: "error"; error: unknown };

interface PackActionMessage {
  type: "installPack" | "uninstallPack";
  packId: string;
}

export function activate(context: vscode.ExtensionContext): void {
  registerHoverProvider(context);
  registerProjectDependencyWatcher(context);

  // Commands are the entry points users run from the Command Palette.
  const explainSelectionCommand = vscode.commands.registerCommand("devtrail.explainSelection", async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage("DevTrail needs an open code file before it can explain a selection.");
      return;
    }

    const selectedCode = editor.document.getText(editor.selection);

    if (selectedCode.trim().length === 0) {
      vscode.window.showWarningMessage("Select some code first, then run DevTrail: Explain Selection.");
      return;
    }

    // A webview is a custom VS Code panel where extensions can render HTML.
    const panel = vscode.window.createWebviewPanel(
      "devtrailExplanation",
      "DevTrail Explanation",
      vscode.ViewColumn.Beside,
      {
        enableScripts: false
      }
    );

    const aiSettings = getAISettings();
    const resolvedKnowledgeTerms = await loadJavaScriptKnowledgePack(context);

    if (aiSettings.enabled) {
      panel.webview.html = renderExplanationLoadingHtml(selectedCode, aiSettings.explanationLevel);
    }

    const explanation = await explainSelectedCode(
      context,
      editor.document,
      selectedCode,
      resolvedKnowledgeTerms,
      aiSettings
    );

    panel.webview.html = renderExplanationHtml(explanation, selectedCode);
  });

  const explainTerminalCommand = vscode.commands.registerCommand("devtrail.explainCommand", async () => {
    const enteredCommand = await vscode.window.showInputBox({
      title: "DevTrail: Explain Command",
      prompt: "Enter a terminal command for DevTrail to explain locally.",
      placeHolder: "git status"
    });

    if (enteredCommand === undefined) {
      return;
    }

    if (enteredCommand.trim().length === 0) {
      vscode.window.showWarningMessage("Type a terminal command first, then DevTrail can explain it.");
      return;
    }

    const explanation = explainCommand(enteredCommand, await loadCommandPacks(context));

    const panel = vscode.window.createWebviewPanel(
      "devtrailCommandExplanation",
      "DevTrail Command Explanation",
      vscode.ViewColumn.Beside,
      {
        enableScripts: false
      }
    );

    panel.webview.html = renderCommandExplanationHtml(explanation);
  });

  const analyzeProjectCommand = vscode.commands.registerCommand("devtrail.analyzeProject", async () => {
    const workspaceFolder = getCurrentWorkspaceFolder();

    if (!workspaceFolder) {
      vscode.window.showErrorMessage("Open a project folder before asking DevTrail to analyze it.");
      return;
    }

    const scanResult = await scanWorkspaceProject(context, workspaceFolder);

    if (scanResult.status !== "success") {
      showProjectScanProblem(scanResult.status);
      return;
    }

    await saveProjectScanState(context, workspaceFolder, scanResult.analysis);
    openProjectAnalysisPanel(scanResult.analysis);
  });

  const refreshProjectScanCommand = vscode.commands.registerCommand("devtrail.refreshProjectScan", async () => {
    const workspaceFolder = getCurrentWorkspaceFolder();

    if (!workspaceFolder) {
      vscode.window.showErrorMessage("Open a project folder before asking DevTrail to refresh recommendations.");
      return;
    }

    const scanResult = await scanWorkspaceProject(context, workspaceFolder);

    if (scanResult.status !== "success") {
      showProjectScanProblem(scanResult.status);
      return;
    }

    await saveProjectScanState(context, workspaceFolder, scanResult.analysis);
    openProjectAnalysisPanel(scanResult.analysis);
  });

  const showLanguageModeCommand = vscode.commands.registerCommand("devtrail.showLanguageMode", () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showInformationMessage("DevTrail does not see an active editor right now.");
      return;
    }

    vscode.window.showInformationMessage(`DevTrail sees this file as language mode: ${editor.document.languageId}`);
  });

  const changeExplanationLevelCommand = vscode.commands.registerCommand("devtrail.changeExplanationLevel", async () => {
    const selectedLevel = await vscode.window.showQuickPick(
      [
        {
          label: "Beginner",
          description: "explain everything simply",
          detail: getExplanationLevelDescription("beginner"),
          level: "beginner" as const
        },
        {
          label: "Learning",
          description: "balanced explanations",
          detail: getExplanationLevelDescription("learning"),
          level: "learning" as const
        },
        {
          label: "Advanced",
          description: "concise technical explanations",
          detail: getExplanationLevelDescription("advanced"),
          level: "advanced" as const
        }
      ],
      {
        title: "DevTrail: Change Explanation Level",
        placeHolder: "Choose how much detail DevTrail should use."
      }
    );

    if (!selectedLevel) {
      return;
    }

    await updateExplanationLevel(context, selectedLevel.level);
    vscode.window.showInformationMessage(
      `DevTrail explanation level set to ${getExplanationLevelLabel(selectedLevel.level)}.`
    );
  });

  const enableAICommand = vscode.commands.registerCommand("devtrail.enableAI", async () => {
    await vscode.workspace.getConfiguration("devtrail").update("ai.enabled", true, vscode.ConfigurationTarget.Global);
    const selectedAction = await vscode.window.showInformationMessage(
      "DevTrail AI explanations are enabled. DevTrail will only send selected code when you run Explain Selection.",
      "Set OpenAI API Key"
    );

    if (selectedAction === "Set OpenAI API Key") {
      await vscode.commands.executeCommand("devtrail.setOpenAIApiKey");
    }
  });

  const disableAICommand = vscode.commands.registerCommand("devtrail.disableAI", async () => {
    await vscode.workspace.getConfiguration("devtrail").update("ai.enabled", false, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage("DevTrail AI explanations are disabled. Local explanations will be used.");
  });

  const setOpenAIApiKeyCommand = vscode.commands.registerCommand("devtrail.setOpenAIApiKey", async () => {
    const apiKey = await vscode.window.showInputBox({
      title: "DevTrail: Set OpenAI API Key",
      prompt: "Paste your OpenAI API key. DevTrail stores it securely with VS Code SecretStorage.",
      password: true,
      ignoreFocusOut: true
    });

    if (apiKey === undefined) {
      return;
    }

    if (apiKey.trim().length === 0) {
      vscode.window.showWarningMessage("DevTrail did not save an empty API key.");
      return;
    }

    await setOpenAIApiKey(context, apiKey.trim());
    vscode.window.showInformationMessage("DevTrail saved the OpenAI API key securely.");
  });

  const clearOpenAIApiKeyCommand = vscode.commands.registerCommand("devtrail.clearOpenAIApiKey", async () => {
    await clearOpenAIApiKey(context);
    vscode.window.showInformationMessage("DevTrail cleared the stored OpenAI API key.");
  });

  const managePacksCommand = vscode.commands.registerCommand("devtrail.managePacks", async () => {
    const panel = vscode.window.createWebviewPanel(
      "devtrailManagePacks",
      "DevTrail Packs",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true
      }
    );

    const refreshPanel = async () => {
      panel.webview.html = renderManagePacksHtml(await buildManagePacksModel(context), createNonce());
    };

    await refreshPanel();

    panel.webview.onDidReceiveMessage(async (message: unknown) => {
      if (!isPackActionMessage(message)) {
        return;
      }

      await applyPackAction(context, message);
      await refreshPanel();
    });
  });

  const installSuggestedPacksCommand = vscode.commands.registerCommand("devtrail.installSuggestedPacks", async () => {
    const workspaceFolder = getCurrentWorkspaceFolder();

    if (!workspaceFolder) {
      vscode.window.showErrorMessage("Open a project folder before asking DevTrail to install suggested packs.");
      return;
    }

    const scanResult = await scanWorkspaceProject(context, workspaceFolder);

    if (scanResult.status !== "success") {
      showProjectScanProblem(scanResult.status);
      return;
    }

    const packsToInstall = scanResult.analysis.suggestedPacks.filter((pack) => pack.installStatus !== "Installed");

    await Promise.all(packsToInstall.map((pack) => installPack(context, pack.id)));

    const refreshedScanResult = await scanWorkspaceProject(context, workspaceFolder);

    if (refreshedScanResult.status === "success") {
      await saveProjectScanState(context, workspaceFolder, refreshedScanResult.analysis);
      openProjectAnalysisPanel(refreshedScanResult.analysis);
    }

    vscode.window.showInformationMessage(
      packsToInstall.length === 0
        ? "DevTrail suggested packs are already installed for this project."
        : `DevTrail installed ${packsToInstall.length} suggested pack${packsToInstall.length === 1 ? "" : "s"}.`
    );
  });

  const resetInstalledPacksCommand = vscode.commands.registerCommand("devtrail.resetInstalledPacks", async () => {
    await resetInstalledPacks(context);
    vscode.window.showInformationMessage("DevTrail reset installed packs. JavaScript basics still work as a safe fallback.");
  });

  const openSetupGuideCommand = vscode.commands.registerCommand("devtrail.openSetupGuide", async () => {
    const workspaceFolder = getCurrentWorkspaceFolder();
    const registryPacks = await listAvailablePacks(context);
    const model = await buildSetupGuideModel(context, registryPacks, workspaceFolder);

    if (workspaceFolder && model.projectAnalysis) {
      await saveProjectScanState(context, workspaceFolder, model.projectAnalysis);
    }

    const panel = vscode.window.createWebviewPanel(
      "devtrailSetupGuide",
      "DevTrail Setup Guide",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true
      }
    );

    panel.webview.html = renderSetupGuideHtml(model, createNonce());

    const refreshPanel = async () => {
      const freshRegistryPacks = await listAvailablePacks(context);
      const freshModel = await buildSetupGuideModel(context, freshRegistryPacks, workspaceFolder);

      panel.webview.html = renderSetupGuideHtml(freshModel, createNonce());
    };

    panel.webview.onDidReceiveMessage(async (message: unknown) => {
      if (isSetExperienceLevelMessage(message)) {
        await context.globalState.update(EXPERIENCE_LEVEL_STATE_KEY, message.levelId);
        await updateExplanationLevel(context, explanationLevelForExperienceLevel(message.levelId));
        return;
      }

      if (isPackActionMessage(message)) {
        await applyPackAction(context, message);
        await refreshPanel();
      }
    });
  });

  context.subscriptions.push(
    explainSelectionCommand,
    explainTerminalCommand,
    analyzeProjectCommand,
    refreshProjectScanCommand,
    showLanguageModeCommand,
    changeExplanationLevelCommand,
    enableAICommand,
    disableAICommand,
    setOpenAIApiKeyCommand,
    clearOpenAIApiKeyCommand,
    managePacksCommand,
    installSuggestedPacksCommand,
    resetInstalledPacksCommand,
    openSetupGuideCommand
  );

  void showWelcomePromptOnce(context);
}

export function deactivate(): void {
  // VS Code calls this when the extension is shut down. No cleanup is needed yet.
}

function getCurrentWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
  const activeEditorUri = vscode.window.activeTextEditor?.document.uri;

  if (activeEditorUri) {
    const activeWorkspaceFolder = vscode.workspace.getWorkspaceFolder(activeEditorUri);

    if (activeWorkspaceFolder) {
      return activeWorkspaceFolder;
    }
  }

  return vscode.workspace.workspaceFolders?.[0];
}

function createNonce(): string {
  const possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";

  for (let index = 0; index < 32; index += 1) {
    nonce += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
  }

  return nonce;
}

function openProjectAnalysisPanel(analysis: ProjectAnalysisResult): void {
  const panel = vscode.window.createWebviewPanel(
    "devtrailProjectAnalysis",
    "DevTrail Project Analysis",
    vscode.ViewColumn.Beside,
    {
      enableScripts: false
    }
  );

  panel.webview.html = renderProjectAnalysisHtml(analysis);
}

async function buildManagePacksModel(context: vscode.ExtensionContext): Promise<{
  packs: Awaited<ReturnType<typeof listAvailablePacks>>;
  suggestedPacks: ProjectAnalysisResult["suggestedPacks"];
  workspaceName?: string;
}> {
  const packs = await listAvailablePacks(context);
  const workspaceFolder = getCurrentWorkspaceFolder();

  if (!workspaceFolder) {
    return {
      packs,
      suggestedPacks: []
    };
  }

  const scanResult = await scanWorkspaceProject(context, workspaceFolder);

  if (scanResult.status !== "success") {
    return {
      packs,
      suggestedPacks: [],
      workspaceName: workspaceFolder.name
    };
  }

  return {
    packs,
    suggestedPacks: await getSuggestedPacksForProject(context, scanResult.analysis),
    workspaceName: workspaceFolder.name
  };
}

async function applyPackAction(context: vscode.ExtensionContext, message: PackActionMessage): Promise<void> {
  if (message.type === "installPack") {
    const wasInstalled = await installPack(context, message.packId);

    if (!wasInstalled) {
      vscode.window.showWarningMessage("DevTrail could not install that bundled pack.");
    }

    return;
  }

  await uninstallPack(context, message.packId);
}

async function explainSelectedCode(
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  selectedCode: string,
  knowledgeTerms: Awaited<ReturnType<typeof loadJavaScriptKnowledgePack>>,
  aiSettings: AISettings
): Promise<ExplanationResult> {
  const localExplanation = (notice?: string): ExplanationResult => {
    const explanation = explainSelection(selectedCode, knowledgeTerms, aiSettings.explanationLevel);

    return notice ? { ...explanation, notice } : explanation;
  };

  if (!aiSettings.enabled) {
    return localExplanation();
  }

  if (selectedCode.length > aiSettings.maxSelectedCharacters) {
    vscode.window.showWarningMessage(
      "This selection is pretty large. DevTrail will explain it locally for now. Try selecting a smaller section for AI."
    );
    return localExplanation("This selection was larger than the AI size limit, so DevTrail used the local explanation instead.");
  }

  const safetyCheck = canSendSelectionToAI(document, selectedCode);

  if (!safetyCheck.allowed) {
    vscode.window.showWarningMessage(
      "This selection may contain secrets. DevTrail will not send it to AI. Try selecting only the code you want explained."
    );
    return localExplanation("This selection may contain secrets, so DevTrail used the local explanation instead.");
  }

  const apiKey = await getOpenAIApiKey(context);

  if (!apiKey) {
    const selectedAction = await vscode.window.showInformationMessage(
      "DevTrail AI explanations are enabled, but no OpenAI API key is configured. Local explanations will be used for now.",
      "Set OpenAI API Key"
    );

    if (selectedAction === "Set OpenAI API Key") {
      await vscode.commands.executeCommand("devtrail.setOpenAIApiKey");
    }

    return localExplanation("AI is enabled, but no API key is configured, so DevTrail used the local explanation instead.");
  }

  const outcome = await requestAIExplanationWithProgress(
    context,
    document,
    selectedCode,
    apiKey,
    aiSettings
  );

  if (outcome.status === "success") {
    return outcome.explanation;
  }

  if (outcome.status === "canceled") {
    return localExplanation("AI explanation was canceled, so DevTrail used the local explanation instead.");
  }

  if (outcome.status === "timeout") {
    return localExplanation("AI took too long, so DevTrail used the local explanation instead.");
  }

  if (outcome.error instanceof AIExplanationFormatError) {
    return localExplanation("AI formatting failed, so DevTrail used the local explanation instead.");
  }

  if (!isAbortLikeError(outcome.error)) {
    vscode.window.showWarningMessage("DevTrail could not get an AI explanation right now, so it used the local explanation instead.");
  }

  return localExplanation();
}

async function requestAIExplanationWithProgress(
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  selectedCode: string,
  apiKey: string,
  aiSettings: AISettings
): Promise<AIExplanationOutcome> {
  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "DevTrail is generating an AI explanation...",
      cancellable: true
    },
    async (_progress, token): Promise<AIExplanationOutcome> => {
      const abortController = new AbortController();
      let timedOut = false;
      let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
      let cancellationSubscription: vscode.Disposable | undefined;

      const timeoutPromise = new Promise<AIExplanationOutcome>((resolve) => {
        timeoutHandle = setTimeout(() => {
          timedOut = true;
          abortController.abort();
          resolve({ status: "timeout" });
        }, aiSettings.timeoutMs);
      });

      const cancellationPromise = new Promise<AIExplanationOutcome>((resolve) => {
        cancellationSubscription = token.onCancellationRequested(() => {
          abortController.abort();
          resolve({ status: "canceled" });
        });
      });

      const aiPromise = explainSelectionWithAI(selectedCode, {
        extensionContext: context,
        document,
        apiKey,
        model: resolveAIModel(aiSettings),
        includeProjectContext: aiSettings.includeProjectContext,
        explanationLevel: aiSettings.explanationLevel,
        signal: abortController.signal
      }).then(
        (explanation): AIExplanationOutcome => ({ status: "success", explanation }),
        (error: unknown): AIExplanationOutcome => {
          if (token.isCancellationRequested) {
            return { status: "canceled" };
          }

          if (timedOut) {
            return { status: "timeout" };
          }

          return { status: "error", error };
        }
      );

      try {
        return await Promise.race([aiPromise, timeoutPromise, cancellationPromise]);
      } finally {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }

        cancellationSubscription?.dispose();
      }
    }
  );
}

function getAISettings(): AISettings {
  const configuration = vscode.workspace.getConfiguration("devtrail");
  const speedMode = readSpeedMode(configuration.get<string>("ai.speedMode", "balanced"));
  const model = configuration.get<string>("ai.model", DEFAULT_AI_MODEL).trim() || DEFAULT_AI_MODEL;

  return {
    enabled: configuration.get<boolean>("ai.enabled", false),
    model,
    includeProjectContext: configuration.get<boolean>("ai.includeProjectContext", true),
    timeoutMs: readPositiveNumberSetting(configuration, "ai.timeoutMs", DEFAULT_AI_TIMEOUT_MS),
    maxSelectedCharacters: readPositiveNumberSetting(
      configuration,
      "ai.maxSelectedCharacters",
      DEFAULT_AI_MAX_SELECTED_CHARACTERS
    ),
    speedMode,
    hasExplicitModelOverride: hasExplicitModelOverride(configuration),
    explanationLevel: normalizeExplanationLevel(configuration.get<string>("explanationLevel", "beginner"))
  };
}

async function updateExplanationLevel(
  context: vscode.ExtensionContext,
  explanationLevel: ExplanationLevel
): Promise<void> {
  await vscode.workspace
    .getConfiguration("devtrail")
    .update("explanationLevel", explanationLevel, vscode.ConfigurationTarget.Global);
  await context.globalState.update(
    EXPERIENCE_LEVEL_STATE_KEY,
    experienceLevelForExplanationLevel(explanationLevel)
  );
}

function explanationLevelForExperienceLevel(experienceLevel: ExperienceLevelId): ExplanationLevel {
  if (experienceLevel === "basics") {
    return "learning";
  }

  if (experienceLevel === "comfortable") {
    return "advanced";
  }

  return "beginner";
}

function experienceLevelForExplanationLevel(explanationLevel: ExplanationLevel): ExperienceLevelId {
  if (explanationLevel === "learning") {
    return "basics";
  }

  if (explanationLevel === "advanced") {
    return "comfortable";
  }

  return "brand-new";
}

function readSpeedMode(value: string): AISpeedMode {
  return value === "fast" ? "fast" : "balanced";
}

function readPositiveNumberSetting(
  configuration: vscode.WorkspaceConfiguration,
  section: string,
  fallback: number
): number {
  const value = configuration.get<number>(section, fallback);

  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function hasExplicitModelOverride(configuration: vscode.WorkspaceConfiguration): boolean {
  const inspectedModel = configuration.inspect<string>("ai.model");

  return inspectedModel?.globalValue !== undefined ||
    inspectedModel?.workspaceValue !== undefined ||
    inspectedModel?.workspaceFolderValue !== undefined ||
    inspectedModel?.globalLanguageValue !== undefined ||
    inspectedModel?.workspaceLanguageValue !== undefined ||
    inspectedModel?.workspaceFolderLanguageValue !== undefined;
}

function resolveAIModel(aiSettings: AISettings): string {
  if (aiSettings.speedMode === "fast" && !aiSettings.hasExplicitModelOverride) {
    return FAST_AI_MODEL;
  }

  return aiSettings.model;
}

function isAbortLikeError(error: unknown): boolean {
  return error instanceof Error && /abort|cancel/i.test(error.name);
}

function isPackActionMessage(message: unknown): message is PackActionMessage {
  if (!message || typeof message !== "object") {
    return false;
  }

  const maybeMessage = message as { type?: unknown; packId?: unknown };

  return (maybeMessage.type === "installPack" || maybeMessage.type === "uninstallPack") &&
    typeof maybeMessage.packId === "string";
}

function showProjectScanProblem(status: "noPackageJson" | "invalidPackageJson"): void {
  if (status === "noPackageJson") {
    vscode.window.showWarningMessage("DevTrail could not find package.json in this project folder yet.");
    return;
  }

  vscode.window.showErrorMessage("DevTrail found package.json, but the file is not valid JSON right now.");
}

async function showWelcomePromptOnce(context: vscode.ExtensionContext): Promise<void> {
  const hasShownWelcome = context.globalState.get<boolean>(WELCOME_PROMPT_STATE_KEY, false);

  if (hasShownWelcome) {
    return;
  }

  await context.globalState.update(WELCOME_PROMPT_STATE_KEY, true);

  const selectedAction = await vscode.window.showInformationMessage(
    "Welcome to DevTrail! Want to open the setup guide?",
    "Open Setup Guide",
    "Not Now"
  );

  if (selectedAction === "Open Setup Guide") {
    await vscode.commands.executeCommand("devtrail.openSetupGuide");
  }
}

function isSetExperienceLevelMessage(
  message: unknown
): message is { type: "setExperienceLevel"; levelId: ExperienceLevelId } {
  if (!message || typeof message !== "object") {
    return false;
  }

  const maybeMessage = message as { type?: unknown; levelId?: unknown };

  return maybeMessage.type === "setExperienceLevel" &&
    (
      maybeMessage.levelId === "brand-new" ||
      maybeMessage.levelId === "basics" ||
      maybeMessage.levelId === "comfortable"
    );
}
