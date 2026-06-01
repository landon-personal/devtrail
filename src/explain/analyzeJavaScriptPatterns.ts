import { DEFAULT_EXPLANATION_LEVEL, ExplanationLevel } from "./explanationLevel";

export interface LineExplanation {
  lineNumber: number;
  text: string;
}

interface ArrayValue {
  display: string;
  numericValues?: number[];
  valueCount: number;
}

interface MapCall {
  targetName: string;
  sourceName: string;
  parameterName: string;
  endIndex: number;
  returnExpression?: string;
  resultDisplay?: string;
}

const IDENTIFIER = "[A-Za-z_$][\\w$]*";

export function analyzeJavaScriptPatterns(
  code: string,
  explanationLevel: ExplanationLevel = DEFAULT_EXPLANATION_LEVEL
): LineExplanation[] {
  const lines = code.split(/\r?\n/);
  const arraysByName = findArrayAssignments(lines);
  const mapCalls = findMapCalls(lines, arraysByName);

  return lines.flatMap((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0) {
      return [];
    }

    const lineNumber = index + 1;
    const mapCall = mapCalls.get(index);
    const returnMapCall = findContainingMapCall(index, mapCalls);
    const text = explainLine(trimmedLine, lineNumber, arraysByName, mapCall, returnMapCall, explanationLevel);

    return [{ lineNumber, text }];
  });
}

function findArrayAssignments(lines: string[]): Map<string, ArrayValue> {
  const arraysByName = new Map<string, ArrayValue>();
  const assignmentPattern = new RegExp(`^\\s*(const|let)\\s+(${IDENTIFIER})\\s*=\\s*(\\[[^\\]]*\\])\\s*;?\\s*$`);

  for (const line of lines) {
    const match = line.match(assignmentPattern);

    if (!match) {
      continue;
    }

    const [, , variableName, arrayLiteral] = match;
    const arrayValue = parseArrayLiteral(arrayLiteral);

    if (arrayValue) {
      arraysByName.set(variableName, arrayValue);
    }
  }

  return arraysByName;
}

function findMapCalls(lines: string[], arraysByName: Map<string, ArrayValue>): Map<number, MapCall> {
  const mapCalls = new Map<number, MapCall>();
  const mapPattern = new RegExp(`^\\s*(const|let)\\s+(${IDENTIFIER})\\s*=\\s*(${IDENTIFIER})\\.map\\(\\s*\\(?\\s*(${IDENTIFIER})\\s*\\)?\\s*=>`);

  lines.forEach((line, index) => {
    const match = line.match(mapPattern);

    if (!match) {
      return;
    }

    const [, , targetName, sourceName, parameterName] = match;
    const returnExpression = findReturnExpression(lines, index);
    const endIndex = findMapEndIndex(lines, index);
    const sourceArray = arraysByName.get(sourceName);
    const resultDisplay = sourceArray && returnExpression
      ? evaluateSimpleMapResult(sourceArray, parameterName, returnExpression)
      : undefined;

    mapCalls.set(index, {
      targetName,
      sourceName,
      parameterName,
      endIndex,
      returnExpression,
      resultDisplay
    });
  });

  return mapCalls;
}

function explainLine(
  trimmedLine: string,
  lineNumber: number,
  arraysByName: Map<string, ArrayValue>,
  mapCall: MapCall | undefined,
  returnMapCall: MapCall | undefined,
  explanationLevel: ExplanationLevel
): string {
  const arrayAssignment = matchArrayAssignment(trimmedLine);

  if (arrayAssignment) {
    const { kind, variableName } = arrayAssignment;
    const arrayValue = arraysByName.get(variableName);

    if (arrayValue) {
      return `Line ${lineNumber}: ${variableName} stores an array of ${arrayValue.valueCount} values: ${arrayValue.display}. ${describeVariableKind(kind, explanationLevel)}`;
    }
  }

  if (mapCall) {
    const resultText = mapCall.resultDisplay
      ? ` Because ${mapCall.sourceName} is ${arraysByName.get(mapCall.sourceName)?.display}, ${mapCall.targetName} becomes ${mapCall.resultDisplay}.`
      : "";

    if (explanationLevel === "advanced") {
      return `Line ${lineNumber}: ${mapCall.targetName} is derived by mapping over ${mapCall.sourceName}; ${mapCall.parameterName} is the callback parameter for each element.${resultText}`;
    }

    return `Line ${lineNumber}: map loops through each item in ${mapCall.sourceName} and creates a new array for ${mapCall.targetName}. ${mapCall.parameterName} represents the current item each time map runs.${resultText}`;
  }

  const componentDefinition = matchReactComponentDefinition(trimmedLine);

  if (componentDefinition) {
    const propsText = componentDefinition.props.length > 0
      ? ` It receives props named ${componentDefinition.props.join(", ")}.`
      : "";

    return `Line ${lineNumber}: ${componentDefinition.name} is a React component, which is a reusable piece of UI.${propsText}`;
  }

  const hookCall = matchHookCall(trimmedLine);

  if (hookCall) {
    if (hookCall.startsWith("useEffect")) {
      return `Line ${lineNumber}: ${describeUseEffect(explanationLevel)}`;
    }

    return `Line ${lineNumber}: ${hookCall} is a hook. Hooks let React components share stateful or reusable behavior.`;
  }

  const conditionalJsxReturn = matchConditionalJsxReturn(trimmedLine);

  if (conditionalJsxReturn) {
    return `Line ${lineNumber}: This checks a condition and immediately returns ${conditionalJsxReturn} JSX when the condition is true.`;
  }

  if (trimmedLine.startsWith("return <") || trimmedLine.startsWith("return (")) {
    return `Line ${lineNumber}: This starts the JSX that the React component will show on the page.`;
  }

  if (/^<Route\b/.test(trimmedLine) || trimmedLine.includes("<Route ")) {
    return `Line ${lineNumber}: This defines a React Router route, which connects a URL path to the UI that should render there.`;
  }

  const variableAssignment = matchVariableAssignment(trimmedLine);

  if (variableAssignment) {
    return `Line ${lineNumber}: ${describeVariableAssignment(variableAssignment.kind, variableAssignment.variableName, variableAssignment.expression, explanationLevel)}`;
  }

  const arrowParameter = matchArrowFunctionParameter(trimmedLine);

  if (arrowParameter) {
    return `Line ${lineNumber}: This arrow function uses ${arrowParameter} as its input value when the function runs.`;
  }

  const returnExpression = matchReturnStatement(trimmedLine);

  if (returnExpression) {
    if (returnMapCall) {
      return explainMapReturn(lineNumber, returnExpression, returnMapCall, explanationLevel);
    }

    if (explanationLevel === "advanced") {
      return `Line ${lineNumber}: return ${returnExpression} exits the function with this result.`;
    }

    return `Line ${lineNumber}: return ${returnExpression} sends this value back to the code that called the function.`;
  }

  const consoleArgument = matchConsoleLog(trimmedLine);

  if (consoleArgument) {
    if (explanationLevel === "advanced") {
      return `Line ${lineNumber}: console.log writes ${consoleArgument} to the developer console for inspection.`;
    }

    return `Line ${lineNumber}: console.log prints the result stored in ${consoleArgument} so you can see it in the console.`;
  }

  if (/^\}\);?$/.test(trimmedLine)) {
    return `Line ${lineNumber}: This closes the callback function and the method call that started above.`;
  }

  if (/^\);?$/.test(trimmedLine)) {
    return `Line ${lineNumber}: This closes the JSX return value that started above.`;
  }

  if (/^\};?$/.test(trimmedLine)) {
    return `Line ${lineNumber}: This closes the function block that started above.`;
  }

  return `Line ${lineNumber}: DevTrail does not recognize a specific pattern here yet. Read it together with the nearby lines: ${trimmedLine}`;
}

function parseArrayLiteral(arrayLiteral: string): ArrayValue {
  const innerValue = arrayLiteral.slice(1, -1).trim();

  if (innerValue.length === 0) {
    return {
      display: "[]",
      numericValues: [],
      valueCount: 0
    };
  }

  const parts = innerValue.split(",").map((part) => part.trim());
  const numericValues = parts.map((part) => Number(part));

  return {
    display: `[${parts.join(", ")}]`,
    numericValues: numericValues.some((value) => Number.isNaN(value)) ? undefined : numericValues,
    valueCount: parts.length
  };
}

function findReturnExpression(lines: string[], startIndex: number): string | undefined {
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const trimmedLine = lines[index].trim();
    const returnExpression = matchReturnStatement(trimmedLine);

    if (returnExpression) {
      return returnExpression;
    }

    if (trimmedLine.includes(");")) {
      return undefined;
    }
  }

  return undefined;
}

function findMapEndIndex(lines: string[], startIndex: number): number {
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (lines[index].trim().includes(");")) {
      return index;
    }
  }

  return startIndex;
}

function findContainingMapCall(index: number, mapCalls: Map<number, MapCall>): MapCall | undefined {
  for (const [startIndex, mapCall] of mapCalls) {
    if (index > startIndex && index <= mapCall.endIndex) {
      return mapCall;
    }
  }

  return undefined;
}

function evaluateSimpleMapResult(
  sourceArray: ArrayValue,
  parameterName: string,
  returnExpression: string
): string | undefined {
  if (returnExpression === parameterName) {
    return sourceArray.display;
  }

  if (!sourceArray.numericValues) {
    return undefined;
  }

  const escapedParameter = escapeRegExp(parameterName);
  const parameterFirstPattern = new RegExp(`^${escapedParameter}\\s*([*+\\-/])\\s*(-?\\d+(?:\\.\\d+)?)$`);
  const numberFirstPattern = new RegExp(`^(-?\\d+(?:\\.\\d+)?)\\s*([*+\\-/])\\s*${escapedParameter}$`);
  const parameterFirstMatch = returnExpression.match(parameterFirstPattern);
  const numberFirstMatch = returnExpression.match(numberFirstPattern);

  if (parameterFirstMatch) {
    const [, operator, rightValue] = parameterFirstMatch;
    return formatArray(sourceArray.numericValues.map((value) => applyOperator(value, operator, Number(rightValue))));
  }

  if (numberFirstMatch) {
    const [, leftValue, operator] = numberFirstMatch;
    return formatArray(sourceArray.numericValues.map((value) => applyOperator(Number(leftValue), operator, value)));
  }

  return undefined;
}

function applyOperator(leftValue: number, operator: string, rightValue: number): number {
  switch (operator) {
    case "*":
      return leftValue * rightValue;
    case "+":
      return leftValue + rightValue;
    case "-":
      return leftValue - rightValue;
    case "/":
      return leftValue / rightValue;
    default:
      return leftValue;
  }
}

function explainMapReturn(
  lineNumber: number,
  returnExpression: string,
  mapCall: MapCall,
  explanationLevel: ExplanationLevel
): string {
  if (returnExpression === `${mapCall.parameterName} * 2`) {
    if (explanationLevel === "advanced") {
      return `Line ${lineNumber}: return ${returnExpression} returns the transformed element for map's output array.`;
    }

    return `Line ${lineNumber}: return ${returnExpression} sends back the doubled value for each item, which is what map puts into the new array.`;
  }

  if (explanationLevel === "advanced") {
    return `Line ${lineNumber}: return ${returnExpression} produces the mapped value for the current ${mapCall.parameterName}.`;
  }

  return `Line ${lineNumber}: return ${returnExpression} sends a value back for the current ${mapCall.parameterName}, and map puts that value into the new array.`;
}

function matchArrayAssignment(trimmedLine: string): { kind: string; variableName: string } | undefined {
  const match = trimmedLine.match(new RegExp(`^(const|let)\\s+(${IDENTIFIER})\\s*=\\s*\\[[^\\]]*\\]\\s*;?$`));

  if (!match) {
    return undefined;
  }

  return {
    kind: match[1],
    variableName: match[2]
  };
}

function matchVariableAssignment(trimmedLine: string): { kind: string; variableName: string; expression: string } | undefined {
  const match = trimmedLine.match(new RegExp(`^(const|let)\\s+(${IDENTIFIER})\\s*=\\s*(.+);?$`));

  if (!match) {
    return undefined;
  }

  return {
    kind: match[1],
    variableName: match[2],
    expression: stripTrailingSemicolon(match[3])
  };
}

function matchArrowFunctionParameter(trimmedLine: string): string | undefined {
  const match = trimmedLine.match(new RegExp(`\\(?\\s*(${IDENTIFIER})\\s*\\)?\\s*=>`));

  return match?.[1];
}

function matchReturnStatement(trimmedLine: string): string | undefined {
  const match = trimmedLine.match(/^return\s+(.+?);?$/);

  return match ? stripTrailingSemicolon(match[1]) : undefined;
}

function matchConsoleLog(trimmedLine: string): string | undefined {
  const match = trimmedLine.match(new RegExp(`^console\\.log\\(\\s*(${IDENTIFIER})\\s*\\)\\s*;?$`));

  return match?.[1];
}

function matchReactComponentDefinition(trimmedLine: string): { name: string; props: string[] } | undefined {
  const match = trimmedLine.match(/^const\s+([A-Z][A-Za-z0-9_$]*)\s*=\s*\(\s*\{([^}]*)\}\s*\)\s*=>/);

  if (!match) {
    return undefined;
  }

  return {
    name: match[1],
    props: match[2].split(",").map((prop) => prop.trim()).filter(Boolean)
  };
}

function matchHookCall(trimmedLine: string): string | undefined {
  const match = trimmedLine.match(/\b(use[A-Z][A-Za-z0-9_]*)\s*\(/);

  return match?.[1];
}

function matchConditionalJsxReturn(trimmedLine: string): string | undefined {
  const match = trimmedLine.match(/^if\s*\(.+\)\s*return\s+<([A-Za-z][A-Za-z0-9.]*)\b.*;?$/);

  return match ? `<${match[1]}>` : undefined;
}

function describeVariableKind(kind: string, explanationLevel: ExplanationLevel): string {
  if (kind === "const") {
    if (explanationLevel === "advanced") {
      return "const creates an immutable binding, not an immutable value.";
    }

    if (explanationLevel === "learning") {
      return "const declares a block-scoped variable binding that cannot be reassigned.";
    }

    return "const means this variable name cannot be reassigned to a different value.";
  }

  if (explanationLevel === "advanced") {
    return "let creates a mutable block-scoped binding.";
  }

  if (explanationLevel === "learning") {
    return "let declares a block-scoped variable binding that can be reassigned.";
  }

  return "let means this variable can be assigned a different value later.";
}

function describeVariableAssignment(
  kind: string,
  variableName: string,
  expression: string,
  explanationLevel: ExplanationLevel
): string {
  if (explanationLevel === "advanced") {
    return `${kind} creates ${kind === "const" ? "an immutable binding" : "a mutable binding"} named ${variableName} initialized from ${expression}.`;
  }

  if (explanationLevel === "learning") {
    return `${kind} declares a block-scoped variable named ${variableName} and stores the value from ${expression}.`;
  }

  return `${kind} creates a named value called ${variableName}. It stores the value from ${expression} so the code can use it later.`;
}

function describeUseEffect(explanationLevel: ExplanationLevel): string {
  if (explanationLevel === "advanced") {
    return "useEffect schedules post-render side effects based on its dependency array.";
  }

  if (explanationLevel === "learning") {
    return "useEffect runs side-effect code after render, often for fetching data, subscriptions, or syncing with outside systems.";
  }

  return "useEffect lets React run some code after the screen updates.";
}

function stripTrailingSemicolon(value: string): string {
  return value.trim().replace(/;$/, "");
}

function formatArray(values: number[]): string {
  return `[${values.map((value) => Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)))).join(", ")}]`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
