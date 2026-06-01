export interface KnowledgeTerm {
  term: string;
  plainEnglish: string;
  confusion: string;
  beginnerExplanation?: string;
  learningExplanation?: string;
  advancedExplanation?: string;
  example?: string;
}

const FALLBACK_BEGINNER_TERMS = [
  "const",
  "let",
  "function",
  "async",
  "await",
  "map",
  "filter",
  "reduce",
  "fetch"
];

export function detectTerms(code: string, knownTerms: KnowledgeTerm[]): KnowledgeTerm[] {
  const termsToCheck = knownTerms.length > 0
    ? knownTerms
    : FALLBACK_BEGINNER_TERMS.map((term) => ({
      term,
      plainEnglish: `${term} is a JavaScript term worth learning.`,
      confusion: "This term was detected, but no detailed knowledge-pack entry was found."
    }));

  return termsToCheck.filter((entry) => hasTerm(code, entry.term));
}

function hasTerm(code: string, term: string): boolean {
  const escapedTerm = escapeRegExp(term);
  const termPattern = new RegExp(`\\b${escapedTerm}\\b`);
  const propertyPattern = new RegExp(`\\.${escapedTerm}\\s*\\(`);

  return termPattern.test(code) || propertyPattern.test(code);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
