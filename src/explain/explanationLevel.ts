export type ExplanationLevel = "beginner" | "learning" | "advanced";

export const DEFAULT_EXPLANATION_LEVEL: ExplanationLevel = "beginner";

export function normalizeExplanationLevel(value: unknown): ExplanationLevel {
  if (value === "learning" || value === "advanced") {
    return value;
  }

  return DEFAULT_EXPLANATION_LEVEL;
}

export function getExplanationLevelLabel(level: ExplanationLevel): string {
  switch (level) {
    case "learning":
      return "Learning";
    case "advanced":
      return "Advanced";
    case "beginner":
    default:
      return "Beginner";
  }
}

export function getExplanationLevelDescription(level: ExplanationLevel): string {
  switch (level) {
    case "learning":
      return "Balanced explanations with important technical terms explained.";
    case "advanced":
      return "Concise explanations with more technical detail and less hand-holding.";
    case "beginner":
    default:
      return "Very simple explanations with minimal jargon and extra basic context.";
  }
}
