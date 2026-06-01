export interface CommandPartExplanation {
  part: string;
  explanation: string;
}

export interface CommandPackEntry {
  command: string;
  whatItDoes: string;
  parts: CommandPartExplanation[];
  whenToUse: string;
  commonMistake: string;
}

export interface CommandExplanationResult {
  enteredCommand: string;
  matchedCommand: string;
  whatItDoes: string;
  parts: CommandPartExplanation[];
  whenToUse: string;
  commonMistake: string;
  suggestedExamples: string[];
  wasFound: boolean;
}

const SUPPORTED_EXAMPLES = [
  "git status",
  "git add .",
  "npm install",
  "npm run dev"
];

export function explainCommand(
  enteredCommand: string,
  commandEntries: CommandPackEntry[]
): CommandExplanationResult {
  const normalizedCommand = normalizeCommand(enteredCommand);
  const matchedCommand = findMatchingCommand(normalizedCommand, commandEntries);

  if (matchedCommand) {
    return {
      enteredCommand: enteredCommand.trim(),
      matchedCommand: matchedCommand.command,
      whatItDoes: matchedCommand.whatItDoes,
      parts: matchedCommand.parts,
      whenToUse: matchedCommand.whenToUse,
      commonMistake: matchedCommand.commonMistake,
      suggestedExamples: [],
      wasFound: true
    };
  }

  return {
    enteredCommand: enteredCommand.trim(),
    matchedCommand: normalizedCommand,
    whatItDoes: "DevTrail does not have a local explanation for this command yet.",
    parts: splitUnknownCommand(normalizedCommand),
    whenToUse: "Use project documentation or ask someone you trust before running a command you do not understand.",
    commonMistake: "Some terminal commands can change files, install packages, or publish work. Pause before running a command if you are unsure.",
    suggestedExamples: SUPPORTED_EXAMPLES,
    wasFound: false
  };
}

function findMatchingCommand(
  normalizedCommand: string,
  commandEntries: CommandPackEntry[]
): CommandPackEntry | undefined {
  const normalizedKnownCommand = normalizeKnownCommand(normalizedCommand);

  return commandEntries.find((entry) => entry.command === normalizedKnownCommand);
}

function normalizeKnownCommand(command: string): string {
  if (/^git commit -m\s+(.+)$/.test(command)) {
    return "git commit -m \"message\"";
  }

  if (/^git checkout -b\s+\S+$/.test(command)) {
    return "git checkout -b branch-name";
  }

  return command;
}

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ");
}

function splitUnknownCommand(command: string): CommandPartExplanation[] {
  return command.split(" ").filter(Boolean).map((part) => ({
    part,
    explanation: "DevTrail recognizes this as one piece of the command, but does not have a full explanation yet."
  }));
}
