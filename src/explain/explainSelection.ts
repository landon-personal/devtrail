import { KnowledgeTerm, detectTerms } from "./detectTerms";
import { analyzeJavaScriptPatterns } from "./analyzeJavaScriptPatterns";
import { DEFAULT_EXPLANATION_LEVEL, ExplanationLevel } from "./explanationLevel";

export interface ExplanationResult {
  summary: string;
  lineByLine: string[];
  vocabulary: KnowledgeTerm[];
  beginnerConfusions: string[];
  source: "local" | "ai";
  explanationLevel: ExplanationLevel;
  notice?: string;
}

export function explainSelection(
  code: string,
  knowledgeTerms: KnowledgeTerm[],
  explanationLevel: ExplanationLevel = DEFAULT_EXPLANATION_LEVEL
): ExplanationResult {
  const matchedTerms = tuneKnowledgeTermsForLevel(detectTerms(code, knowledgeTerms), explanationLevel);
  const lineExplanations = analyzeJavaScriptPatterns(code, explanationLevel);

  return {
    summary: buildSummary(code, matchedTerms, explanationLevel),
    lineByLine: lineExplanations.map((line) => line.text),
    vocabulary: matchedTerms,
    beginnerConfusions: buildConfusions(matchedTerms, explanationLevel),
    source: "local",
    explanationLevel
  };
}

function buildSummary(
  code: string,
  matchedTerms: KnowledgeTerm[],
  explanationLevel: ExplanationLevel
): string {
  const trimmedCode = code.trim();

  if (trimmedCode.includes("fetch")) {
    if (explanationLevel === "advanced") {
      return "This code performs an asynchronous network request and handles the response.";
    }

    return "This code appears to make a network request and work with the result.";
  }

  if (/<Route\b|<Routes\b|<BrowserRouter\b|<RouterProvider\b/.test(trimmedCode)) {
    if (explanationLevel === "advanced") {
      return "This code configures React Router so URLs render specific UI branches.";
    }

    return "This code sets up routes, which tell the React app what screen to show for each URL.";
  }

  if (/<Navigate\b/.test(trimmedCode) || /return\s+<[^>]*(Login|SignIn|Unauthorized|Upgrade)/.test(trimmedCode)) {
    if (explanationLevel === "advanced") {
      return "This code conditionally redirects or gates access to a React route.";
    }

    return "This code appears to protect a page by sending some users somewhere else.";
  }

  if (/document\.title\s*=/.test(trimmedCode)) {
    if (explanationLevel === "advanced") {
      return "This code updates document metadata, likely as a React side effect.";
    }

    return "This code changes the browser tab title, often so it matches the current page.";
  }

  if (looksLikeReactComponent(trimmedCode)) {
    if (explanationLevel === "advanced") {
      return "This code defines a React component and returns JSX for rendering.";
    }

    return "This code appears to define a React component that returns JSX for the page.";
  }

  if (trimmedCode.includes("useEffect(")) {
    if (explanationLevel === "advanced") {
      return "This code schedules React side-effect work after render.";
    }

    return "This code appears to run React side-effect logic after the component renders.";
  }

  if (/\buse[A-Z][A-Za-z0-9_]*\s*\(/.test(trimmedCode)) {
    if (explanationLevel === "advanced") {
      return "This code uses React hook-style functions to compose component behavior.";
    }

    return "This code uses hooks, which are helper functions that give React components extra behavior.";
  }

  if (trimmedCode.includes(".map(") && trimmedCode.includes("console.log(")) {
    if (explanationLevel === "advanced") {
      return "This code transforms an array with map and logs the derived result.";
    }

    return "This code stores values, uses map to create a transformed array, and prints the result.";
  }

  if (trimmedCode.includes(".map(")) {
    if (explanationLevel === "advanced") {
      return "This code maps an array into a new array of derived values.";
    }

    return "This code appears to transform items in an array into a new array.";
  }

  if (trimmedCode.includes(".filter(")) {
    if (explanationLevel === "advanced") {
      return "This code filters an array by keeping items that pass a predicate.";
    }

    return "This code appears to keep only the array items that match a condition.";
  }

  if (trimmedCode.includes(".reduce(")) {
    if (explanationLevel === "advanced") {
      return "This code reduces an array into one accumulated result.";
    }

    return "This code appears to combine multiple values into one final result.";
  }

  if (matchedTerms.some((entry) => entry.term === "function" || entry.term === "async")) {
    if (explanationLevel === "advanced") {
      return "This code defines callable behavior, possibly with asynchronous control flow.";
    }

    return "This code defines reusable behavior that can be called from somewhere else.";
  }

  if (explanationLevel === "advanced") {
    return "This code runs a focused piece of JavaScript or TypeScript behavior.";
  }

  return "This code runs a small piece of JavaScript or TypeScript logic.";
}

function looksLikeReactComponent(code: string): boolean {
  return /const\s+[A-Z][A-Za-z0-9_]*\s*=\s*\(/.test(code) ||
    /function\s+[A-Z][A-Za-z0-9_]*\s*\(/.test(code) ||
    /return\s*\(?\s*</.test(code);
}

function buildConfusions(matchedTerms: KnowledgeTerm[], explanationLevel: ExplanationLevel): string[] {
  if (matchedTerms.length === 0) {
    if (explanationLevel === "advanced") {
      return [
        "DevTrail did not match a specific local term here. Check data flow, side effects, and return values."
      ];
    }

    return [
      "Beginners often try to understand every symbol at once. Start by identifying the inputs, the output, and what changes in between."
    ];
  }

  if (explanationLevel === "advanced") {
    return matchedTerms.map((entry) => `${entry.term}: ${entry.confusion}`);
  }

  return matchedTerms.map((entry) => `${entry.term}: ${entry.confusion}`);
}

export function tuneKnowledgeTermForLevel(
  term: KnowledgeTerm,
  explanationLevel: ExplanationLevel
): KnowledgeTerm {
  return {
    ...term,
    plainEnglish: getLevelSpecificDefinition(term, explanationLevel)
  };
}

function tuneKnowledgeTermsForLevel(
  terms: KnowledgeTerm[],
  explanationLevel: ExplanationLevel
): KnowledgeTerm[] {
  return terms.map((term) => tuneKnowledgeTermForLevel(term, explanationLevel));
}

function getLevelSpecificDefinition(term: KnowledgeTerm, explanationLevel: ExplanationLevel): string {
  if (explanationLevel === "advanced" && term.advancedExplanation) {
    return term.advancedExplanation;
  }

  if (explanationLevel === "learning" && term.learningExplanation) {
    return term.learningExplanation;
  }

  if (explanationLevel === "beginner" && term.beginnerExplanation) {
    return term.beginnerExplanation;
  }

  const definition = LEVEL_DEFINITIONS[term.term]?.[explanationLevel];

  return definition ?? term.plainEnglish;
}

const LEVEL_DEFINITIONS: Record<string, Partial<Record<ExplanationLevel, string>>> = {
  const: {
    beginner: "const creates a named value. You can read it later, but you usually do not reassign it.",
    learning: "const declares a block-scoped variable binding that cannot be reassigned.",
    advanced: "const creates an immutable binding, not an immutable value."
  },
  let: {
    beginner: "let creates a named value that you are allowed to change later.",
    learning: "let declares a block-scoped variable binding that can be reassigned.",
    advanced: "let creates a mutable block-scoped binding."
  },
  function: {
    beginner: "function defines a reusable set of steps that runs when you call it.",
    learning: "function declares reusable behavior with inputs, a body, and an optional return value.",
    advanced: "function creates callable behavior with its own scope and return path."
  },
  return: {
    beginner: "return sends a value back from a function.",
    learning: "return exits the current function and provides its result.",
    advanced: "return terminates function execution with a result value."
  },
  array: {
    beginner: "An array is a list of values kept in order.",
    learning: "An array is an ordered collection you can loop over, map, filter, or reduce.",
    advanced: "An array is an indexed ordered collection with built-in iteration methods."
  },
  props: {
    beginner: "Props are values a parent gives to a React component.",
    learning: "Props are read-only values passed from a parent component to a child component.",
    advanced: "Props are immutable component inputs passed through React's render tree."
  },
  state: {
    beginner: "State is a value React remembers and can use to update the screen.",
    learning: "State is component data that triggers a re-render when updated.",
    advanced: "State is render-affecting component data managed by React."
  },
  hook: {
    beginner: "A hook is a React helper that lets a component use React features.",
    learning: "A hook is a React function for using state, effects, or shared behavior inside components.",
    advanced: "A hook composes React stateful behavior under the Rules of Hooks."
  },
  component: {
    beginner: "A component is a reusable piece of the screen.",
    learning: "A component is a reusable UI function that receives props and returns JSX.",
    advanced: "A component is a renderable React unit with props, state, and JSX output."
  },
  useEffect: {
    beginner: "useEffect lets React run some code after the screen updates.",
    learning: "useEffect runs side-effect code after render, often for fetching data, subscriptions, or syncing with outside systems.",
    advanced: "useEffect schedules post-render side effects based on its dependency array."
  }
};
