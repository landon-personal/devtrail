import * as vscode from "vscode";
import {
  clearOpenAIApiKey,
  getOpenAIApiKey,
  getOpenAISDKVersion,
  setOpenAIApiKey
} from "./ai/openaiClient";
import { canSendSelectionToAI } from "./ai/safety";
import {
  AIExplanationFormatError,
  AIExplanationAttemptDiagnostic,
  explainSelectionWithAI,
  explainSelectionWithAIWithDiagnostics,
  getAIFormattingFailureLabel
} from "./ai/explainWithAI";
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
import {
  renderExplanationHtml,
  renderExplanationLoadingHtml,
  renderExplanationSlowWarningHtml,
  renderExplanationStillWaitingHtml
} from "./webview/renderExplanationHtml";

const WELCOME_PROMPT_STATE_KEY = "devtrail.welcomePromptShown";
const DEFAULT_AI_MODEL = "gpt-5-mini";
const DEFAULT_AI_STRUCTURED_MODEL = "gpt-4o-mini";
const FAST_AI_MODEL = "gpt-5-nano";
const DEFAULT_AI_SLOW_WARNING_MS = 5000;
const DEFAULT_AI_MAX_SELECTED_CHARACTERS = 6000;
const AI_FORMATTING_TEST_CODE = "const numbers = [1, 2, 3];\nconst doubled = numbers.map(n => n * 2);";

type AISpeedMode = "balanced" | "fast";

interface AISettings {
  enabled: boolean;
  model: string;
  structuredModel: string;
  includeProjectContext: boolean;
  slowWarningMs: number;
  maxSelectedCharacters: number;
  speedMode: AISpeedMode;
  hasExplicitModelOverride: boolean;
  explanationLevel: ExplanationLevel;
}

interface PackActionMessage {
  type: "installPack" | "uninstallPack" | "resetInstalledPacks";
  packId: string;
}

interface AIWaitActionMessage {
  type: "keepWaiting" | "useLocalExplanation";
}

interface AIFormattingDiagnosticPanelModel {
  sdkVersion: string;
  configuredNormalModel: string;
  configuredStructuredModel: string;
  actualStructuredModel: string;
  aiEnabled: boolean;
  apiKeyExists: boolean;
  diagnostics: AIExplanationAttemptDiagnostic[];
  error?: AIExplanationFormatError;
}

export function activate(context: vscode.ExtensionContext): void {
  registerHoverProvider(context);
  registerProjectDependencyWatcher(context);

  // Commands are the entry points users run from the Command Palette.
  const explainSelectionCommand = vscode.commands.registerCommand("devtrail.explainSelection", async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage("Open a code file first, then run DevTrail: Explain Selection.");
      return;
    }

    const selectedCode = editor.document.getText(editor.selection);

    if (selectedCode.trim().length === 0) {
      vscode.window.showWarningMessage("Highlight a small piece of code first, then run DevTrail: Explain Selection.");
      return;
    }

    const aiSettings = getAISettings();

    // A webview is a custom VS Code panel where extensions can render HTML.
    const panel = vscode.window.createWebviewPanel(
      "devtrailExplanation",
      "DevTrail Explanation",
      vscode.ViewColumn.Beside,
      {
        enableScripts: aiSettings.enabled
      }
    );

    if (aiSettings.enabled) {
      panel.webview.html = renderExplanationLoadingHtml(selectedCode, aiSettings.explanationLevel);
    }

    const resolvedKnowledgeTerms = await loadJavaScriptKnowledgePack(context);

    await explainSelectedCode(
      context,
      panel,
      editor.document,
      selectedCode,
      resolvedKnowledgeTerms,
      aiSettings
    );
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
      vscode.window.showWarningMessage("Type a terminal command first, then DevTrail can explain it locally.");
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
      vscode.window.showErrorMessage("Open a project folder first, then run DevTrail: Analyze Project.");
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
      vscode.window.showErrorMessage("Open a project folder first, then run DevTrail: Refresh Project Scan.");
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
      vscode.window.showInformationMessage("Open a file first, then DevTrail can show its language mode.");
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

  const testAIFormattingCommand = vscode.commands.registerCommand("devtrail.testAIFormatting", async () => {
    const aiSettings = getAISettings();

    if (!aiSettings.enabled) {
      vscode.window.showWarningMessage("Enable DevTrail AI explanations before running the formatting test. Local explanations still work without AI.");
      return;
    }

    const apiKey = await getOpenAIApiKey(context);

    if (!apiKey) {
      const selectedAction = await vscode.window.showInformationMessage(
        "DevTrail needs an OpenAI API key before it can test AI formatting.",
        "Set OpenAI API Key"
      );

      if (selectedAction === "Set OpenAI API Key") {
        await vscode.commands.executeCommand("devtrail.setOpenAIApiKey");
      }

      return;
    }

    try {
      const diagnosticResult = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "DevTrail is testing AI formatting...",
          cancellable: false
        },
        () => explainSelectionWithAIWithDiagnostics(AI_FORMATTING_TEST_CODE, {
          extensionContext: context,
          document: createAIFormattingTestDocument(context),
          apiKey,
          structuredModel: resolveStructuredAIModel(aiSettings),
          includeProjectContext: false,
          explanationLevel: aiSettings.explanationLevel
        }, {
          includeOutputTextPreview: true
        })
      );

      if (!diagnosticResult.explanation) {
        openAIFormattingDiagnosticsPanel({
          sdkVersion: getOpenAISDKVersion(),
          configuredNormalModel: aiSettings.model,
          configuredStructuredModel: aiSettings.structuredModel,
          actualStructuredModel: resolveStructuredAIModel(aiSettings),
          aiEnabled: aiSettings.enabled,
          apiKeyExists: true,
          diagnostics: diagnosticResult.diagnostics,
          error: diagnosticResult.error
        });
        vscode.window.showErrorMessage(
          `DevTrail AI formatting needs attention: ${getAIFormattingFailureLabel(diagnosticResult.error?.category ?? "unknown-ai-formatting-failure")}. Local explanations still work.`
        );
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        "devtrailAIFormattingTest",
        "DevTrail AI Formatting Test",
        vscode.ViewColumn.Beside,
        {
          enableScripts: false
        }
      );

      panel.webview.html = renderExplanationHtml(diagnosticResult.explanation, AI_FORMATTING_TEST_CODE);
      vscode.window.showInformationMessage(
        diagnosticResult.recoveredWithJsonFallback
          ? "DevTrail AI formatting recovered with JSON fallback."
          : "DevTrail AI structured formatting test succeeded."
      );
    } catch (error) {
      if (error instanceof AIExplanationFormatError) {
        openAIFormattingDiagnosticsPanel({
          sdkVersion: getOpenAISDKVersion(),
          configuredNormalModel: aiSettings.model,
          configuredStructuredModel: aiSettings.structuredModel,
          actualStructuredModel: resolveStructuredAIModel(aiSettings),
          aiEnabled: aiSettings.enabled,
          apiKeyExists: true,
          diagnostics: [],
          error
        });
        vscode.window.showErrorMessage(
          `DevTrail AI formatting needs attention: ${getAIFormattingFailureLabel(error.category)}. Local explanations still work.`
        );
        return;
      }

      if (!isAbortLikeError(error)) {
        openAIFormattingDiagnosticsPanel({
          sdkVersion: getOpenAISDKVersion(),
          configuredNormalModel: aiSettings.model,
          configuredStructuredModel: aiSettings.structuredModel,
          actualStructuredModel: resolveStructuredAIModel(aiSettings),
          aiEnabled: aiSettings.enabled,
          apiKeyExists: true,
          diagnostics: []
        });
        vscode.window.showWarningMessage(
          `DevTrail AI formatting needs attention: ${getAIFormattingFailureLabel("unknown-ai-formatting-failure")}. Local explanations still work.`
        );
      }
    }
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
      vscode.window.showErrorMessage("Open a project folder first, then DevTrail can install suggested packs.");
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
    testAIFormattingCommand,
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

function createAIFormattingTestDocument(
  context: vscode.ExtensionContext
): Pick<vscode.TextDocument, "languageId" | "fileName" | "uri"> {
  const testUri = vscode.Uri.joinPath(context.extensionUri, "devtrail-ai-formatting-test.js");

  return {
    languageId: "javascript",
    fileName: testUri.fsPath,
    uri: testUri
  };
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

function openAIFormattingDiagnosticsPanel(model: AIFormattingDiagnosticPanelModel): void {
  const panel = vscode.window.createWebviewPanel(
    "devtrailAIFormattingDiagnostics",
    "DevTrail AI Formatting Diagnostics",
    vscode.ViewColumn.Beside,
    {
      enableScripts: false
    }
  );

  panel.webview.html = renderAIFormattingDiagnosticsHtml(model);
}

function renderAIFormattingDiagnosticsHtml(model: AIFormattingDiagnosticPanelModel): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevTrail AI Formatting Diagnostics</title>
  <style>
    body {
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
      font-family: var(--vscode-font-family);
      line-height: 1.5;
      padding: 20px;
    }

    h1 {
      font-size: 1.35rem;
      margin: 0 0 18px;
    }

    h2 {
      border-bottom: 1px solid var(--vscode-panel-border);
      font-size: 1rem;
      margin-top: 24px;
      padding-bottom: 6px;
    }

    li {
      margin-bottom: 8px;
    }

    pre {
      background: var(--vscode-textCodeBlock-background);
      border-radius: 6px;
      overflow: auto;
      padding: 12px;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <h1>DevTrail AI Formatting Check</h1>
  <p>This check uses a tiny built-in sample. It does not show API keys or project code, and local explanations still work if AI formatting needs attention.</p>

  <h2>Environment</h2>
  <ul>
    <li><strong>OpenAI SDK version:</strong> ${escapeDiagnosticHtml(model.sdkVersion)}</li>
    <li><strong>Configured normal model:</strong> ${escapeDiagnosticHtml(model.configuredNormalModel)}</li>
    <li><strong>Configured structured model:</strong> ${escapeDiagnosticHtml(model.configuredStructuredModel)}</li>
    <li><strong>Actual structured model:</strong> ${escapeDiagnosticHtml(model.actualStructuredModel)}</li>
    <li><strong>AI enabled:</strong> ${model.aiEnabled ? "true" : "false"}</li>
    <li><strong>API key exists:</strong> ${model.apiKeyExists ? "true" : "false"}</li>
    <li><strong>Result category:</strong> ${escapeDiagnosticHtml(getAIFormattingFailureLabel(model.error?.category ?? "unknown-ai-formatting-failure"))}</li>
    <li><strong>Formatting detail:</strong> ${escapeDiagnosticHtml(model.error?.validationFailureReason ?? "none")}</li>
  </ul>

  <h2>Attempts</h2>
  ${model.diagnostics.length > 0 ? model.diagnostics.map(renderAIFormattingAttemptHtml).join("") : "<p>No response details were available for this check.</p>"}
</body>
</html>`;
}

function renderAIFormattingAttemptHtml(attempt: AIExplanationAttemptDiagnostic): string {
  const shape = attempt.responseShape;

  return `<section>
    <h3>${escapeDiagnosticHtml(attempt.attempt)}</h3>
    <ul>
      <li><strong>Request method:</strong> ${escapeDiagnosticHtml(attempt.requestMethod)}</li>
      <li><strong>Model used:</strong> ${escapeDiagnosticHtml(attempt.model)}</li>
      <li><strong>Result category:</strong> ${escapeDiagnosticHtml(attempt.failureCategory ? getAIFormattingFailureLabel(attempt.failureCategory) : "none")}</li>
      <li><strong>Formatting detail:</strong> ${escapeDiagnosticHtml(attempt.validationFailureReason ?? "none")}</li>
      <li><strong>message.parsed exists:</strong> ${shape?.messageParsedExists ? "true" : "false"}</li>
      <li><strong>message.content exists:</strong> ${shape?.messageContentExists ? "true" : "false"}</li>
      <li><strong>typeof message.content:</strong> ${escapeDiagnosticHtml(shape?.messageContentType ?? "undefined")}</li>
      <li><strong>message refusal exists:</strong> ${shape?.messageRefusalExists ? "true" : "false"}</li>
      <li><strong>finish reasons:</strong> ${escapeDiagnosticHtml(formatDiagnosticList(shape?.finishReasons))}</li>
      <li><strong>legacy response.output_text exists:</strong> ${shape?.outputTextExists ? "true" : "false"}</li>
      <li><strong>legacy response.output exists:</strong> ${shape?.outputExists ? "true" : "false"}</li>
    </ul>
    ${shape?.messageContentPreview ? `<p><strong>First 300 characters of message.content:</strong></p><pre>${escapeDiagnosticHtml(shape.messageContentPreview)}</pre>` : ""}
    ${shape?.outputTextPreview ? `<p><strong>First 300 characters of legacy response.output_text:</strong></p><pre>${escapeDiagnosticHtml(shape.outputTextPreview)}</pre>` : ""}
  </section>`;
}

function formatDiagnosticList(values: string[] | undefined): string {
  return values && values.length > 0 ? values.join(", ") : "none";
}

function escapeDiagnosticHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
  if (message.type === "resetInstalledPacks") {
    await resetInstalledPacks(context);
    vscode.window.showInformationMessage("DevTrail reset installed packs. JavaScript basics still work as a safe fallback.");
    return;
  }

  if (message.type === "installPack") {
    const wasInstalled = await installPack(context, message.packId);

    if (!wasInstalled) {
      vscode.window.showWarningMessage("DevTrail could not find that bundled pack locally. The rest of DevTrail still works.");
    }

    return;
  }

  await uninstallPack(context, message.packId);
}

async function explainSelectedCode(
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel,
  document: vscode.TextDocument,
  selectedCode: string,
  knowledgeTerms: Awaited<ReturnType<typeof loadJavaScriptKnowledgePack>>,
  aiSettings: AISettings
): Promise<void> {
  const localExplanation = (notice?: string): ExplanationResult => {
    const explanation = explainSelection(selectedCode, knowledgeTerms, aiSettings.explanationLevel);

    return notice ? { ...explanation, notice } : explanation;
  };
  const renderLocalExplanation = (notice?: string) => {
    panel.webview.html = renderExplanationHtml(localExplanation(notice), selectedCode);
  };

  if (!aiSettings.enabled) {
    renderLocalExplanation();
    return;
  }

  if (selectedCode.length > aiSettings.maxSelectedCharacters) {
    vscode.window.showWarningMessage(
      "This selection is large. DevTrail will explain it locally for now. Try selecting a smaller section for AI."
    );
    renderLocalExplanation("This selection was larger than the AI size limit, so DevTrail used the local explanation instead.");
    return;
  }

  const safetyCheck = canSendSelectionToAI(document, selectedCode);

  if (!safetyCheck.allowed) {
    vscode.window.showWarningMessage(
      "This selection may contain secrets. DevTrail will not send it to AI. Try selecting only the non-secret code you want explained."
    );
    renderLocalExplanation("This selection may contain secrets, so DevTrail used the local explanation instead.");
    return;
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

    renderLocalExplanation("AI is enabled, but no API key is configured, so DevTrail used the local explanation instead.");
    return;
  }

  await runAIExplanationWithProgress(
    context,
    panel,
    document,
    selectedCode,
    apiKey,
    aiSettings,
    localExplanation
  );
}

async function runAIExplanationWithProgress(
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel,
  document: vscode.TextDocument,
  selectedCode: string,
  apiKey: string,
  aiSettings: AISettings,
  localExplanation: (notice?: string) => ExplanationResult
): Promise<void> {
  const abortController = new AbortController();
  let finalResultRendered = false;
  let slowWarningHandle: ReturnType<typeof setTimeout> | undefined;
  let webviewMessageSubscription: vscode.Disposable | undefined;
  let panelDisposeSubscription: vscode.Disposable | undefined;
  let resolveFinalResult: (() => void) | undefined;
  const finalResultPromise = new Promise<void>((resolve) => {
    resolveFinalResult = resolve;
  });

  const clearSlowWarning = (): void => {
    if (slowWarningHandle) {
      clearTimeout(slowWarningHandle);
      slowWarningHandle = undefined;
    }
  };

  const disposeWaitResources = (): void => {
    clearSlowWarning();
    webviewMessageSubscription?.dispose();
    webviewMessageSubscription = undefined;
    panelDisposeSubscription?.dispose();
    panelDisposeSubscription = undefined;
  };

  const resolveFinalResultOnce = (): void => {
    resolveFinalResult?.();
    resolveFinalResult = undefined;
  };

  const finishWithLocal = (notice?: string, abortAIRequest = false): void => {
    if (finalResultRendered) {
      return;
    }

    finalResultRendered = true;

    if (abortAIRequest) {
      abortController.abort();
    }

    panel.webview.html = renderExplanationHtml(localExplanation(notice), selectedCode);
    disposeWaitResources();
    resolveFinalResultOnce();
  };

  const finishWithAI = (explanation: ExplanationResult): void => {
    if (finalResultRendered) {
      return;
    }

    finalResultRendered = true;
    panel.webview.html = renderExplanationHtml(explanation, selectedCode);
    disposeWaitResources();
    resolveFinalResultOnce();
  };

  const finishBecausePanelClosed = (): void => {
    if (finalResultRendered) {
      return;
    }

    finalResultRendered = true;
    abortController.abort();
    disposeWaitResources();
    resolveFinalResultOnce();
  };

  const showSlowWarning = (): void => {
    if (finalResultRendered) {
      return;
    }

    panel.webview.html = renderExplanationSlowWarningHtml(selectedCode, aiSettings.explanationLevel, createNonce());
  };

  webviewMessageSubscription = panel.webview.onDidReceiveMessage((message: unknown) => {
    if (!isAIWaitActionMessage(message) || finalResultRendered) {
      return;
    }

    if (message.type === "keepWaiting") {
      panel.webview.html = renderExplanationStillWaitingHtml(selectedCode, aiSettings.explanationLevel);
      return;
    }

    finishWithLocal("You switched to a local explanation while AI was still running.");
  });

  panelDisposeSubscription = panel.onDidDispose(finishBecausePanelClosed);
  slowWarningHandle = setTimeout(showSlowWarning, aiSettings.slowWarningMs);

  void explainSelectionWithAI(selectedCode, {
    extensionContext: context,
    document,
    apiKey,
    structuredModel: resolveStructuredAIModel(aiSettings),
    includeProjectContext: aiSettings.includeProjectContext,
    explanationLevel: aiSettings.explanationLevel,
    signal: abortController.signal
  }).then(
    (explanation) => {
      finishWithAI(explanation);
    },
    (error: unknown) => {
      if (finalResultRendered || isAbortLikeError(error)) {
        return;
      }

      if (error instanceof AIExplanationFormatError) {
        finishWithLocal("AI formatting did not come back in the expected shape, so DevTrail used the local explanation instead.");
        return;
      }

      vscode.window.showWarningMessage("DevTrail could not get an AI explanation right now, so it used the local explanation instead.");
      finishWithLocal("AI was unavailable, so DevTrail used the local explanation instead.");
    }
  );

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "DevTrail is generating an AI explanation...",
      cancellable: true
    },
    async (_progress, token): Promise<void> => {
      const cancellationSubscription = token.onCancellationRequested(() => {
        finishWithLocal("AI explanation was canceled, so DevTrail used the local explanation instead.", true);
      });

      try {
        await finalResultPromise;
      } finally {
        cancellationSubscription.dispose();
      }
    }
  );
}

function getAISettings(): AISettings {
  const configuration = vscode.workspace.getConfiguration("devtrail");
  const speedMode = readSpeedMode(configuration.get<string>("ai.speedMode", "balanced"));
  const model = configuration.get<string>("ai.model", DEFAULT_AI_MODEL).trim() || DEFAULT_AI_MODEL;
  const structuredModel = configuration.get<string>("ai.structuredModel", DEFAULT_AI_STRUCTURED_MODEL).trim() ||
    DEFAULT_AI_STRUCTURED_MODEL;

  return {
    enabled: configuration.get<boolean>("ai.enabled", false),
    model,
    structuredModel,
    includeProjectContext: configuration.get<boolean>("ai.includeProjectContext", true),
    slowWarningMs: readPositiveNumberSetting(configuration, "ai.slowWarningMs", DEFAULT_AI_SLOW_WARNING_MS),
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

function resolveStructuredAIModel(aiSettings: AISettings): string {
  return aiSettings.structuredModel;
}

function isAbortLikeError(error: unknown): boolean {
  return error instanceof Error && /abort|cancel/i.test(error.name);
}

function isPackActionMessage(message: unknown): message is PackActionMessage {
  if (!message || typeof message !== "object") {
    return false;
  }

  const maybeMessage = message as { type?: unknown; packId?: unknown };

  if (maybeMessage.type === "resetInstalledPacks") {
    return true;
  }

  return (maybeMessage.type === "installPack" || maybeMessage.type === "uninstallPack") &&
    typeof maybeMessage.packId === "string";
}

function isAIWaitActionMessage(message: unknown): message is AIWaitActionMessage {
  if (!message || typeof message !== "object") {
    return false;
  }

  const maybeMessage = message as { type?: unknown };

  return maybeMessage.type === "keepWaiting" ||
    maybeMessage.type === "useLocalExplanation";
}

function showProjectScanProblem(status: "noPackageJson" | "invalidPackageJson"): void {
  if (status === "noPackageJson") {
    vscode.window.showWarningMessage("DevTrail could not find package.json in this project folder. You can still use hovers, Explain Selection, and Explain Command.");
    return;
  }

  vscode.window.showErrorMessage("DevTrail found package.json, but it is not valid JSON right now. Fix the file, then run the scan again.");
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
