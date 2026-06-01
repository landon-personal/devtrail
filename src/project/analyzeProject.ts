import type { PackInstallStatus, PackWithInstallStatus } from "../packs/packRegistry";

export interface ProjectScript {
  name: string;
  command: string;
  explanation: string;
}

export interface DetectedTool {
  packageName: string;
  displayName: string;
  whatItIs: string;
  whyThisProjectMightUseIt: string;
  suggestedPackIds: string[];
}

export interface SuggestedPack {
  id: string;
  displayName: string;
  description: string;
  category: string;
  localPath: string;
  whySuggested: string;
  installStatus: PackInstallStatus;
}

export interface ProjectAnalysisResult {
  packageName: string;
  version: string;
  scripts: ProjectScript[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  detectedTools: DetectedTool[];
  suggestedPacks: SuggestedPack[];
}

interface PackageJsonData {
  name?: unknown;
  version?: unknown;
  scripts?: unknown;
  dependencies?: unknown;
  devDependencies?: unknown;
}

interface ToolDefinition {
  packageNames: string[];
  displayName: string;
  whatItIs: string;
  whyThisProjectMightUseIt: string;
}

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    packageNames: ["react"],
    displayName: "React",
    whatItIs: "A JavaScript library for building user interfaces with reusable components.",
    whyThisProjectMightUseIt: "The project likely has interactive UI pieces built from React components."
  },
  {
    packageNames: ["vite"],
    displayName: "Vite",
    whatItIs: "A fast development server and build tool for frontend projects.",
    whyThisProjectMightUseIt: "The project likely uses Vite to run locally and bundle frontend code."
  },
  {
    packageNames: ["typescript"],
    displayName: "TypeScript",
    whatItIs: "JavaScript with type checking added.",
    whyThisProjectMightUseIt: "The project likely uses TypeScript to catch mistakes before code runs."
  },
  {
    packageNames: ["express"],
    displayName: "Express",
    whatItIs: "A Node.js framework for building web servers and APIs.",
    whyThisProjectMightUseIt: "The project might define backend routes that receive requests and send responses."
  },
  {
    packageNames: ["next"],
    displayName: "Next.js",
    whatItIs: "A React framework for building full-stack web apps.",
    whyThisProjectMightUseIt: "The project might use Next.js for pages, routing, server rendering, and API routes."
  },
  {
    packageNames: ["tailwindcss"],
    displayName: "Tailwind CSS",
    whatItIs: "A utility-first CSS framework for styling pages with small class names.",
    whyThisProjectMightUseIt: "The project likely uses Tailwind classes to style UI without writing much custom CSS."
  },
  {
    packageNames: ["eslint"],
    displayName: "ESLint",
    whatItIs: "A tool that checks JavaScript and TypeScript for common problems.",
    whyThisProjectMightUseIt: "The project likely uses ESLint to catch bugs and keep code style consistent."
  },
  {
    packageNames: ["prettier"],
    displayName: "Prettier",
    whatItIs: "A code formatter that rewrites code into a consistent style.",
    whyThisProjectMightUseIt: "The project likely uses Prettier so formatting decisions are automatic."
  },
  {
    packageNames: ["vscode", "@types/vscode"],
    displayName: "VS Code Extension API",
    whatItIs: "The API used to build extensions for Visual Studio Code.",
    whyThisProjectMightUseIt: "The project likely adds commands, panels, or editor features inside VS Code."
  }
];

export function analyzeProjectPackage(
  packageJson: unknown,
  registryPacks: PackWithInstallStatus[] = [],
  extraProjectSignals: string[] = []
): ProjectAnalysisResult {
  const packageData = getPackageJsonData(packageJson);
  const dependencies = getStringRecord(packageData.dependencies);
  const devDependencies = getStringRecord(packageData.devDependencies);
  const projectSignals = buildProjectSignals(packageData, dependencies, devDependencies, extraProjectSignals);

  return {
    packageName: typeof packageData.name === "string" ? packageData.name : "Unnamed package",
    version: typeof packageData.version === "string" ? packageData.version : "No version listed",
    scripts: buildScriptExplanations(getStringRecord(packageData.scripts)),
    dependencies,
    devDependencies,
    detectedTools: detectTools(dependencies, devDependencies, registryPacks),
    suggestedPacks: suggestPacks(projectSignals, registryPacks)
  };
}

function getPackageJsonData(packageJson: unknown): PackageJsonData {
  if (!packageJson || typeof packageJson !== "object" || Array.isArray(packageJson)) {
    return {};
  }

  return packageJson as PackageJsonData;
}

function buildScriptExplanations(scripts: Record<string, string>): ProjectScript[] {
  return Object.entries(scripts).map(([name, command]) => ({
    name,
    command,
    explanation: explainScript(name, command)
  }));
}

function explainScript(name: string, command: string): string {
  const lowerName = name.toLowerCase();
  const lowerCommand = command.toLowerCase();

  if (lowerName === "compile") {
    return "Usually turns TypeScript into JavaScript and reports type errors.";
  }

  if (lowerName === "dev") {
    return "Usually starts a local development server or watch mode while you work.";
  }

  if (lowerName === "test" || lowerName.includes("test")) {
    return "Usually runs automated checks that verify the project still works.";
  }

  if (lowerName === "build") {
    return "Usually creates production-ready output that can be deployed or packaged.";
  }

  if (lowerName === "start") {
    return "Usually starts the app or server after it has been installed or built.";
  }

  if (lowerName.includes("watch")) {
    return "Usually keeps running and repeats work when files change.";
  }

  if (lowerCommand.includes("tsc")) {
    return "Usually runs the TypeScript compiler to check or build TypeScript files.";
  }

  if (lowerName.includes("lint") || lowerCommand.includes("eslint")) {
    return "Usually checks code for common mistakes and style problems.";
  }

  if (lowerName.includes("format") || lowerCommand.includes("prettier")) {
    return "Usually formats code so files follow a consistent style.";
  }

  return "A project-specific shortcut. Check the command text to see what tool it runs.";
}

function detectTools(
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
  registryPacks: PackWithInstallStatus[]
): DetectedTool[] {
  const installedPackages = new Set([
    ...Object.keys(dependencies),
    ...Object.keys(devDependencies)
  ]);

  return TOOL_DEFINITIONS.flatMap((definition) => {
    const matchedPackageName = definition.packageNames.find((packageName) => installedPackages.has(packageName));

    if (!matchedPackageName) {
      return [];
    }

    return [{
      packageName: matchedPackageName,
      displayName: definition.displayName,
      whatItIs: definition.whatItIs,
      whyThisProjectMightUseIt: definition.whyThisProjectMightUseIt,
      suggestedPackIds: findRelatedPacks(matchedPackageName, registryPacks).map((pack) => pack.id)
    }];
  });
}

function suggestPacks(
  projectSignals: Set<string>,
  registryPacks: PackWithInstallStatus[]
): SuggestedPack[] {
  return registryPacks.flatMap((pack) => {
    const matchedSignals = pack.relatedPackages.filter((packageName) => projectSignals.has(packageName));

    if (matchedSignals.length === 0) {
      return [];
    }

    return [{
      id: pack.id,
      displayName: pack.displayName,
      description: pack.description,
      category: pack.category,
      localPath: pack.localPath,
      whySuggested: buildPackSuggestionReason(pack, matchedSignals),
      installStatus: pack.installStatus
    }];
  });
}

function findRelatedPacks(
  packageName: string,
  registryPacks: PackWithInstallStatus[]
): PackWithInstallStatus[] {
  return registryPacks.filter((pack) => pack.relatedPackages.includes(packageName));
}

function buildPackSuggestionReason(pack: PackWithInstallStatus, matchedSignals: string[]): string {
  if (matchedSignals.includes("git")) {
    return "Suggested because this workspace appears to be a Git repository.";
  }

  if (pack.id === "javascript-basics" && matchedSignals.includes("package.json")) {
    return "Suggested because package.json usually means this is a JavaScript or Node project.";
  }

  if (pack.id === "npm-commands" && matchedSignals.includes("package.json")) {
    return "This workspace has a package.json, so npm command explanations are useful here.";
  }

  if (matchedSignals.length === 1) {
    return `Suggested because package.json includes ${matchedSignals[0]}.`;
  }

  return `Suggested because package.json includes ${matchedSignals.join(", ")}.`;
}

function buildProjectSignals(
  packageData: PackageJsonData,
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
  extraProjectSignals: string[]
): Set<string> {
  const signals = new Set([
    ...Object.keys(dependencies),
    ...Object.keys(devDependencies),
    ...extraProjectSignals
  ]);

  if (
    Object.keys(getStringRecord(packageData.scripts)).length > 0 ||
    signals.size > 0
  ) {
    signals.add("package.json");
  }

  return signals;
}

function getStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
}
