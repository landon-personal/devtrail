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

  const useStateAssignment = matchUseStateAssignment(trimmedLine);

  if (useStateAssignment) {
    return explainUseStateAssignment(lineNumber, useStateAssignment.stateName, useStateAssignment.setterName, useStateAssignment.initialValue, explanationLevel);
  }

  const propsDestructuring = matchPropsDestructuring(trimmedLine);

  if (propsDestructuring) {
    return `Line ${lineNumber}: This pulls ${formatList(propsDestructuring.props)} out of ${propsDestructuring.source}. That makes those prop values easier to use by name.`;
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
    const wrapperText = componentDefinition.props.includes("children") || /(?:Provider|Layout|Wrapper|Guard|Route)$/.test(componentDefinition.name)
      ? " This looks like a wrapper component because it can render other content inside it."
      : "";

    return `Line ${lineNumber}: ${componentDefinition.name} is a React component, which is a reusable piece of UI.${propsText}${wrapperText}`;
  }

  const hookCall = matchHookCall(trimmedLine);

  if (hookCall) {
    if (hookCall.startsWith("useEffect")) {
      return `Line ${lineNumber}: ${describeUseEffect(explanationLevel)}`;
    }

    return `Line ${lineNumber}: ${describeHookCall(hookCall, explanationLevel)}`;
  }

  const documentTitle = matchDocumentTitleAssignment(trimmedLine);

  if (documentTitle) {
    return `Line ${lineNumber}: This updates the browser tab title to ${documentTitle}. In React, this is often done inside useEffect so the title matches the current page.`;
  }

  const loadingReturn = matchLoadingReturn(trimmedLine);

  if (loadingReturn) {
    return `Line ${lineNumber}: This is a loading state. If ${loadingReturn.condition} is true, the component returns ${loadingReturn.element} early instead of showing the normal page yet.`;
  }

  const protectedRouteReturn = matchProtectedRouteReturn(trimmedLine);

  if (protectedRouteReturn) {
    return `Line ${lineNumber}: This is protecting a route or page. If ${protectedRouteReturn.condition} is true, it returns ${protectedRouteReturn.element} to send the user somewhere else.`;
  }

  const conditionalJsxReturn = matchConditionalJsxReturn(trimmedLine);

  if (conditionalJsxReturn) {
    return `Line ${lineNumber}: This checks ${conditionalJsxReturn.condition} and immediately returns ${conditionalJsxReturn.element} when that condition is true.`;
  }

  const jsxMapRendering = matchJsxMapRendering(trimmedLine);

  if (jsxMapRendering) {
    return `Line ${lineNumber}: This renders a list. ${jsxMapRendering.sourceName}.map goes through each item, and ${jsxMapRendering.itemName} represents the current item while React creates JSX for it.`;
  }

  const conditionalJsxExpression = matchConditionalJsxExpression(trimmedLine);

  if (conditionalJsxExpression) {
    return `Line ${lineNumber}: This is conditional rendering. React shows ${conditionalJsxExpression.element} only when ${conditionalJsxExpression.condition} is true.`;
  }

  const ternaryJsxExpression = matchTernaryJsxExpression(trimmedLine);

  if (ternaryJsxExpression) {
    return `Line ${lineNumber}: This chooses between two pieces of JSX. If ${ternaryJsxExpression.condition} is true it starts with ${ternaryJsxExpression.truthyElement}; otherwise it uses the other branch.`;
  }

  if (trimmedLine.startsWith("return <") || trimmedLine.startsWith("return (")) {
    return `Line ${lineNumber}: This starts the JSX that the React component will show on the page.`;
  }

  if (/^<(BrowserRouter|Routes|RouterProvider)\b/.test(trimmedLine)) {
    return `Line ${lineNumber}: This sets up React Router so the app can choose screens based on the URL.`;
  }

  if (/^<Route\b/.test(trimmedLine) || trimmedLine.includes("<Route ")) {
    return `Line ${lineNumber}: This defines a React Router route, which connects a URL path to the UI that should render there.`;
  }

  if (/^<Navigate\b/.test(trimmedLine) || trimmedLine.includes("<Navigate ")) {
    return `Line ${lineNumber}: Navigate is a React Router component that redirects the user to another route.`;
  }

  if (/\bchildren\b/.test(trimmedLine)) {
    return `Line ${lineNumber}: children means the nested content passed into this component. Wrapper components often render children to show the page or UI inside them.`;
  }

  const wrapperElement = matchWrapperElement(trimmedLine);

  if (wrapperElement) {
    return `Line ${lineNumber}: ${wrapperElement} looks like a React component wrapping other JSX. Wrapper components often provide layout, data, or access control around their children.`;
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

function matchUseStateAssignment(trimmedLine: string): { stateName: string; setterName: string; initialValue: string } | undefined {
  const match = trimmedLine.match(new RegExp(`^const\\s*\\[\\s*(${IDENTIFIER})\\s*,\\s*(${IDENTIFIER})\\s*\\]\\s*=\\s*useState\\((.*)\\)\\s*;?$`));

  if (!match) {
    return undefined;
  }

  return {
    stateName: match[1],
    setterName: match[2],
    initialValue: stripTrailingSemicolon(match[3].trim() || "undefined")
  };
}

function matchPropsDestructuring(trimmedLine: string): { props: string[]; source: string } | undefined {
  const match = trimmedLine.match(/^const\s*\{([^}]*)\}\s*=\s*([^;]+);?$/);

  if (!match) {
    return undefined;
  }

  return {
    props: splitProps(match[1]),
    source: stripTrailingSemicolon(match[2])
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
  const arrowMatch = trimmedLine.match(/^const\s+([A-Z][A-Za-z0-9_$]*)\s*=\s*\(?\s*([^=]*?)\s*\)?\s*=>/);

  if (arrowMatch) {
    return {
      name: arrowMatch[1],
      props: parseComponentProps(arrowMatch[2])
    };
  }

  const functionMatch = trimmedLine.match(/^(?:export\s+default\s+)?function\s+([A-Z][A-Za-z0-9_$]*)\s*\(([^)]*)\)/);

  if (functionMatch) {
    return {
      name: functionMatch[1],
      props: parseComponentProps(functionMatch[2])
    };
  }

  return undefined;
}

function parseComponentProps(parameterText: string): string[] {
  const trimmedParameters = parameterText.trim();

  if (trimmedParameters.length === 0) {
    return [];
  }

  const destructuredProps = trimmedParameters.match(/^\{([^}]*)\}$/);

  if (destructuredProps) {
    return splitProps(destructuredProps[1]);
  }

  if (/^props\b/.test(trimmedParameters)) {
    return ["props"];
  }

  return [];
}

function splitProps(value: string): string[] {
  return value
    .split(",")
    .map((prop) => prop.trim().replace(/\s*=.*$/, "").replace(/:.*$/, "").trim())
    .filter(Boolean);
}

function matchHookCall(trimmedLine: string): string | undefined {
  const match = trimmedLine.match(/\b(use[A-Z][A-Za-z0-9_]*)\s*\(/);

  return match?.[1];
}

function matchDocumentTitleAssignment(trimmedLine: string): string | undefined {
  const match = trimmedLine.match(/^document\.title\s*=\s*(.+);?$/);

  return match ? stripTrailingSemicolon(match[1]) : undefined;
}

function matchLoadingReturn(trimmedLine: string): { condition: string; element: string } | undefined {
  const match = trimmedLine.match(/^if\s*\(([^)]*(?:loading|Loading|pending|Pending)[^)]*)\)\s*return\s+(<[^;]+);?$/);

  if (!match) {
    return undefined;
  }

  return {
    condition: match[1],
    element: formatJsxElementName(match[2])
  };
}

function matchProtectedRouteReturn(trimmedLine: string): { condition: string; element: string } | undefined {
  const match = trimmedLine.match(/^if\s*\(([^)]*(?:auth|Auth|user|User|token|Token|premium|Premium|permission|Permission|role|Role)[^)]*)\)\s*return\s+(<Navigate\b[^;]*|<[^;]*(?:Login|SignIn|Unauthorized|Upgrade)[^;]*);?$/);

  if (!match) {
    return undefined;
  }

  return {
    condition: match[1],
    element: formatJsxElementName(match[2])
  };
}

function matchConditionalJsxReturn(trimmedLine: string): { condition: string; element: string } | undefined {
  const match = trimmedLine.match(/^if\s*\((.+)\)\s*return\s+(<[^;]+);?$/);

  if (!match) {
    return undefined;
  }

  return {
    condition: match[1],
    element: formatJsxElementName(match[2])
  };
}

function matchJsxMapRendering(trimmedLine: string): { sourceName: string; itemName: string } | undefined {
  const match = trimmedLine.match(new RegExp(`\\b(${IDENTIFIER})\\.map\\(\\s*\\(?\\s*(${IDENTIFIER})`));

  if (!match) {
    return undefined;
  }

  return {
    sourceName: match[1],
    itemName: match[2]
  };
}

function matchConditionalJsxExpression(trimmedLine: string): { condition: string; element: string } | undefined {
  const match = trimmedLine.match(/\{\s*(.+?)\s*&&\s*(<[^}]+)\}/);

  if (!match) {
    return undefined;
  }

  return {
    condition: match[1],
    element: formatJsxElementName(match[2])
  };
}

function matchTernaryJsxExpression(trimmedLine: string): { condition: string; truthyElement: string } | undefined {
  const match = trimmedLine.match(/\{\s*(.+?)\s*\?\s*(<[^:]+)\s*:/);

  if (!match) {
    return undefined;
  }

  return {
    condition: match[1],
    truthyElement: formatJsxElementName(match[2])
  };
}

function matchWrapperElement(trimmedLine: string): string | undefined {
  const match = trimmedLine.match(/^<([A-Z][A-Za-z0-9_.]*(?:Provider|Layout|Wrapper|Guard|Route|Shell|Boundary)?)\b[^/>]*>\s*$/);

  if (!match || match[1] === "Route") {
    return undefined;
  }

  return `<${match[1]}>`;
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

function explainUseStateAssignment(
  lineNumber: number,
  stateName: string,
  setterName: string,
  initialValue: string,
  explanationLevel: ExplanationLevel
): string {
  if (/loading|pending/i.test(stateName)) {
    return `Line ${lineNumber}: ${stateName} is React state for a loading state. ${setterName} changes it, and the starting value is ${initialValue}.`;
  }

  if (explanationLevel === "advanced") {
    return `Line ${lineNumber}: useState creates render-affecting state ${stateName} and updater ${setterName}, initialized to ${initialValue}.`;
  }

  if (explanationLevel === "learning") {
    return `Line ${lineNumber}: useState gives this component a state value named ${stateName} and a setter named ${setterName}. Updating it asks React to render again.`;
  }

  return `Line ${lineNumber}: useState lets React remember ${stateName}. Use ${setterName} when that value needs to change on the screen.`;
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

function describeHookCall(hookName: string, explanationLevel: ExplanationLevel): string {
  const builtInHooks = new Set(["useState", "useEffect", "useMemo", "useCallback", "useRef", "useContext", "useReducer"]);
  const hookKind = builtInHooks.has(hookName) ? "React hook" : "custom hook";

  if (explanationLevel === "advanced") {
    return `${hookName} is a ${hookKind}. It composes React behavior and must follow the Rules of Hooks.`;
  }

  if (explanationLevel === "learning") {
    return `${hookName} is a ${hookKind}. Hooks let components use React features or shared reusable logic.`;
  }

  return `${hookName} is a ${hookKind}. A hook is a helper that gives a component extra React behavior.`;
}

function stripTrailingSemicolon(value: string): string {
  return value.trim().replace(/;$/, "");
}

function formatArray(values: number[]): string {
  return `[${values.map((value) => Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)))).join(", ")}]`;
}

function formatList(values: string[]): string {
  if (values.length === 0) {
    return "values";
  }

  if (values.length === 1) {
    return values[0];
  }

  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

function formatJsxElementName(value: string): string {
  const match = value.match(/^<\s*([A-Za-z][A-Za-z0-9_.]*)/);

  return match ? `<${match[1]}>` : value.trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
