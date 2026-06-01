import * as vscode from "vscode";
import { ExplanationLevel, normalizeExplanationLevel } from "../explain/explanationLevel";
import { PackWithInstallStatus } from "../packs/packRegistry";
import { analyzeProjectPackage, ProjectAnalysisResult, SuggestedPack } from "../project/analyzeProject";

export type ExperienceLevelId = "brand-new" | "basics" | "comfortable";

export interface ExperienceLevelOption {
  id: ExperienceLevelId;
  label: string;
  description: string;
}

export interface SetupGuideModel {
  selectedExperienceLevel?: ExperienceLevelId;
  experienceLevels: ExperienceLevelOption[];
  workspaceName?: string;
  hasWorkspace: boolean;
  hasPackageJson: boolean;
  projectAnalysis?: ProjectAnalysisResult;
  suggestedPacks: SuggestedPack[];
  fallbackMessage?: string;
}

export const EXPERIENCE_LEVEL_STATE_KEY = "devtrail.setup.experienceLevel";

export const EXPERIENCE_LEVELS: ExperienceLevelOption[] = [
  {
    id: "brand-new",
    label: "Brand new",
    description: "I want slow, plain-English explanations and extra vocabulary help."
  },
  {
    id: "basics",
    label: "Know the basics",
    description: "I understand syntax sometimes, but project tools still feel unclear."
  },
  {
    id: "comfortable",
    label: "Comfortable but learning tools/libraries",
    description: "I can read code, but I want help with frameworks, packages, and workflows."
  }
];

export async function buildSetupGuideModel(
  context: vscode.ExtensionContext,
  registryPacks: PackWithInstallStatus[],
  workspaceFolder: vscode.WorkspaceFolder | undefined
): Promise<SetupGuideModel> {
  const selectedExperienceLevel = getSelectedExperienceLevel(context);

  if (!workspaceFolder) {
    return {
      selectedExperienceLevel,
      experienceLevels: EXPERIENCE_LEVELS,
      hasWorkspace: false,
      hasPackageJson: false,
      suggestedPacks: getStarterPacks(registryPacks),
      fallbackMessage: "Open a project folder when you want DevTrail to scan package.json and recommend project-specific packs."
    };
  }

  const packageJsonUri = vscode.Uri.joinPath(workspaceFolder.uri, "package.json");
  const packageJson = await readPackageJson(packageJsonUri);

  if (!packageJson) {
    return {
      selectedExperienceLevel,
      experienceLevels: EXPERIENCE_LEVELS,
      workspaceName: workspaceFolder.name,
      hasWorkspace: true,
      hasPackageJson: false,
      suggestedPacks: getStarterPacks(registryPacks),
      fallbackMessage: "No package.json was found in this workspace root. DevTrail can still help with selected code, hover explanations, and terminal commands."
    };
  }

  const extraProjectSignals = await workspacePathExists(vscode.Uri.joinPath(workspaceFolder.uri, ".git"))
    ? ["git"]
    : [];
  const projectAnalysis = analyzeProjectPackage(packageJson, registryPacks, extraProjectSignals);

  return {
    selectedExperienceLevel,
    experienceLevels: EXPERIENCE_LEVELS,
    workspaceName: workspaceFolder.name,
    hasWorkspace: true,
    hasPackageJson: true,
    projectAnalysis,
    suggestedPacks: projectAnalysis.suggestedPacks
  };
}

function getSelectedExperienceLevel(_context: vscode.ExtensionContext): ExperienceLevelId {
  const configuredLevel = normalizeExplanationLevel(
    vscode.workspace.getConfiguration("devtrail").get<string>("explanationLevel", "beginner")
  );

  return experienceLevelForExplanationLevel(configuredLevel);
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

async function readPackageJson(uri: vscode.Uri): Promise<unknown | undefined> {
  try {
    const packageJsonBytes = await vscode.workspace.fs.readFile(uri);
    const packageJsonText = Buffer.from(packageJsonBytes).toString("utf8");

    return JSON.parse(packageJsonText) as unknown;
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

function getStarterPacks(registryPacks: PackWithInstallStatus[]): SuggestedPack[] {
  const starterPackIds = new Set(["javascript-basics", "npm-commands", "git-basics"]);

  return registryPacks.flatMap((pack) => {
    if (!starterPackIds.has(pack.id)) {
      return [];
    }

    return [{
      id: pack.id,
      displayName: pack.displayName,
      description: pack.description,
      category: pack.category,
      localPath: pack.localPath,
      whySuggested: "Suggested as a useful starter pack while you learn DevTrail.",
      installStatus: pack.installStatus
    }];
  });
}
