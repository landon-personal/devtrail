export type AIFormattingFailureCategory =
  | "sdk-method-unsupported"
  | "api-rejected-schema"
  | "parsed-output-missing"
  | "json-parse-failed"
  | "validation-failed"
  | "model-refused-or-empty-output"
  | "unknown-ai-formatting-failure";

export type AIValidationFailureReason =
  | "missing-summary"
  | "missing-lineByLine"
  | "invalid-lineByLine"
  | "missing-keyVocabulary"
  | "invalid-keyVocabulary"
  | "missing-commonConfusion"
  | "invalid-commonConfusion"
  | "no-json-object-found"
  | "empty-model-output"
  | "refusal-or-filtered-output"
  | "unknown-parse-failure";

export class AIExplanationFormatError extends Error {
  constructor(
    readonly category: AIFormattingFailureCategory,
    readonly validationFailureReason?: AIValidationFailureReason
  ) {
    super("AI explanation response did not match DevTrail's structured format.");
    this.name = "AIExplanationFormatError";
  }
}

export interface RawAIExplanation {
  summary: string;
  lineByLine: Array<{
    line: string;
    explanation: string;
  }>;
  keyVocabulary: Array<{
    term: string;
    definition: string;
  }>;
  commonConfusion: string[];
}

export interface AIResponseWithPossibleExplanation {
  choices?: unknown;
  output_parsed?: unknown;
  output_text?: unknown;
  output?: unknown;
  error?: unknown;
  incomplete_details?: unknown;
}

export interface AIResponseShapeDiagnostic {
  messageParsedExists: boolean;
  messageContentExists: boolean;
  messageContentType: string;
  messageContentPreview?: string;
  finishReasons: string[];
  messageRefusalExists: boolean;
  outputParsedExists: boolean;
  outputTextExists: boolean;
  outputTextType: string;
  outputTextPreview?: string;
  outputExists: boolean;
  outputItemTypes: string[];
  contentTypes: string[];
}

export function parseAIExplanationFromResponse(response: AIResponseWithPossibleExplanation): RawAIExplanation {
  const parsedOutput = extractParsedOutput(response);

  if (parsedOutput !== undefined) {
    return normalizeAIExplanation(parsedOutput);
  }

  const outputText = extractOutputText(response);

  if (!outputText) {
    const reason = getEmptyOutputReason(response);
    const category = reason === "refusal-or-filtered-output" || reason === "empty-model-output"
      ? "model-refused-or-empty-output"
      : "parsed-output-missing";
    logStructuredDiagnostic(category);
    throw new AIExplanationFormatError(category, reason);
  }

  return parseStructuredOutputText(outputText);
}

export function parseStructuredOutputText(outputText: string): RawAIExplanation {
  const jsonObjectText = extractFirstJsonObject(outputText);

  if (!jsonObjectText) {
    logStructuredDiagnostic("json-parse-failed");
    throw new AIExplanationFormatError("json-parse-failed", "no-json-object-found");
  }

  try {
    return normalizeAIExplanation(JSON.parse(jsonObjectText) as unknown);
  } catch (error) {
    if (error instanceof AIExplanationFormatError) {
      throw error;
    }

    logStructuredDiagnostic("json-parse-failed");
    throw new AIExplanationFormatError("json-parse-failed", "unknown-parse-failure");
  }
}

export function summarizeAIResponseShape(
  response: AIResponseWithPossibleExplanation | undefined,
  includeOutputTextPreview: boolean
): AIResponseShapeDiagnostic {
  const outputText = response?.output_text;
  const outputTextString = typeof outputText === "string" ? outputText : undefined;
  const outputSummary = summarizeOutputItems(response?.output);
  const chatSummary = summarizeChatChoices(response?.choices);

  return {
    messageParsedExists: chatSummary.messageParsedExists,
    messageContentExists: chatSummary.messageContent !== undefined,
    messageContentType: chatSummary.messageContentType,
    messageContentPreview: includeOutputTextPreview && chatSummary.messageContent
      ? chatSummary.messageContent.slice(0, 300)
      : undefined,
    finishReasons: chatSummary.finishReasons,
    messageRefusalExists: chatSummary.messageRefusalExists,
    outputParsedExists: response?.output_parsed !== undefined && response.output_parsed !== null,
    outputTextExists: outputText !== undefined && outputText !== null,
    outputTextType: typeof outputText,
    outputTextPreview: includeOutputTextPreview && outputTextString
      ? outputTextString.slice(0, 300)
      : undefined,
    outputExists: response?.output !== undefined && response.output !== null,
    outputItemTypes: outputSummary.outputItemTypes,
    contentTypes: outputSummary.contentTypes
  };
}

export function getAIFormattingFailureLabel(category: AIFormattingFailureCategory): string {
  switch (category) {
    case "sdk-method-unsupported":
      return "SDK method unsupported";
    case "api-rejected-schema":
      return "API rejected schema";
    case "parsed-output-missing":
      return "Parsed output missing";
    case "json-parse-failed":
      return "JSON parse failed";
    case "validation-failed":
      return "Validation failed";
    case "model-refused-or-empty-output":
      return "Model refused or empty output";
    case "unknown-ai-formatting-failure":
      return "Unknown AI formatting failure";
  }
}

export function categorizeAIRequestError(error: unknown): AIFormattingFailureCategory {
  if (isSDKMethodUnsupportedError(error)) {
    return "sdk-method-unsupported";
  }

  if (isAPIRejectedSchemaError(error)) {
    return "api-rejected-schema";
  }

  if (error instanceof SyntaxError) {
    return "json-parse-failed";
  }

  return "unknown-ai-formatting-failure";
}

function normalizeAIExplanation(value: unknown): RawAIExplanation {
  if (!value || typeof value !== "object") {
    throwValidationFailure("unknown-parse-failure");
  }

  const maybeValue = value as Partial<RawAIExplanation>;

  if (typeof maybeValue.summary !== "string") {
    throwValidationFailure("missing-summary");
  }

  const lineByLine = normalizeArrayField(maybeValue, "lineByLine", isLineExplanation);
  const keyVocabulary = normalizeArrayField(maybeValue, "keyVocabulary", isVocabularyItem);
  const commonConfusion = normalizeArrayField(
    maybeValue,
    "commonConfusion",
    (item): item is string => typeof item === "string"
  );

  return {
    summary: cleanText(maybeValue.summary),
    lineByLine: lineByLine.slice(0, 8).map((item) => ({
      line: cleanText(item.line),
      explanation: cleanText(item.explanation)
    })),
    keyVocabulary: keyVocabulary.slice(0, 6).map((item) => ({
      term: cleanText(item.term),
      definition: cleanText(item.definition)
    })),
    commonConfusion: commonConfusion.slice(0, 4).map(cleanText)
  };
}

function normalizeArrayField<T>(
  value: Partial<RawAIExplanation>,
  key: keyof Pick<RawAIExplanation, "lineByLine" | "keyVocabulary" | "commonConfusion">,
  isValidItem: (item: unknown) => item is T
): T[] {
  const fieldValue = value[key];

  if (fieldValue === undefined) {
    throwValidationFailure(missingArrayReasonForKey(key));
  }

  if (!Array.isArray(fieldValue) || !fieldValue.every(isValidItem)) {
    throwValidationFailure(invalidArrayReasonForKey(key));
  }

  return fieldValue as T[];
}

function extractParsedOutput(response: AIResponseWithPossibleExplanation): unknown | undefined {
  const chatMessageParsed = extractChatMessageValue(response.choices, "parsed");

  if (chatMessageParsed !== undefined && chatMessageParsed !== null) {
    return chatMessageParsed;
  }

  if (response.output_parsed !== undefined && response.output_parsed !== null) {
    return response.output_parsed;
  }

  return extractNestedResponseValue(response.output, "parsed");
}

function extractOutputText(response: AIResponseWithPossibleExplanation): string | undefined {
  const chatMessageText = extractChatMessageText(response.choices);

  if (chatMessageText && chatMessageText.trim().length > 0) {
    return chatMessageText;
  }

  if (typeof response.output_text === "string" && response.output_text.trim().length > 0) {
    return response.output_text;
  }

  const nestedText = extractNestedResponseValue(response.output, "text");

  return typeof nestedText === "string" && nestedText.trim().length > 0 ? nestedText : undefined;
}

function extractNestedResponseValue(output: unknown, key: "parsed" | "text"): unknown | undefined {
  if (!Array.isArray(output)) {
    return undefined;
  }

  const textValues: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const maybeItem = item as { content?: unknown };

    if (!Array.isArray(maybeItem.content)) {
      continue;
    }

    for (const content of maybeItem.content) {
      if (!content || typeof content !== "object") {
        continue;
      }

      const maybeContent = content as { type?: unknown; parsed?: unknown; text?: unknown };

      if (maybeContent.type !== "output_text") {
        continue;
      }

      if (key === "parsed" && maybeContent.parsed !== undefined && maybeContent.parsed !== null) {
        return maybeContent.parsed;
      }

      if (key === "text" && typeof maybeContent.text === "string") {
        textValues.push(maybeContent.text);
      }
    }
  }

  return key === "text" && textValues.length > 0 ? textValues.join("\n") : undefined;
}

function extractChatMessageValue(choices: unknown, key: "parsed" | "content" | "refusal"): unknown | undefined {
  if (!Array.isArray(choices)) {
    return undefined;
  }

  for (const choice of choices) {
    if (!choice || typeof choice !== "object") {
      continue;
    }

    const maybeChoice = choice as { message?: unknown };

    if (!maybeChoice.message || typeof maybeChoice.message !== "object") {
      continue;
    }

    const maybeMessage = maybeChoice.message as {
      parsed?: unknown;
      content?: unknown;
      refusal?: unknown;
    };
    const value = maybeMessage[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function extractChatMessageText(choices: unknown): string | undefined {
  const content = extractChatMessageValue(choices, "content");

  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return undefined;
  }

  const textParts: string[] = [];

  for (const part of content) {
    if (!part || typeof part !== "object") {
      continue;
    }

    const maybePart = part as { type?: unknown; text?: unknown };

    if ((maybePart.type === "text" || maybePart.type === "output_text") && typeof maybePart.text === "string") {
      textParts.push(maybePart.text);
    }
  }

  return textParts.length > 0 ? textParts.join("\n") : undefined;
}

function extractFirstJsonObject(outputText: string): string | undefined {
  const trimmedText = outputText.trim();

  if (trimmedText.length === 0) {
    return undefined;
  }

  const fencedJson = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidateText = fencedJson?.[1]?.trim() || trimmedText;
  const firstBraceIndex = candidateText.indexOf("{");

  if (firstBraceIndex === -1) {
    return undefined;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = firstBraceIndex; index < candidateText.length; index += 1) {
    const character = candidateText[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === "\\") {
      escaped = inString;
      continue;
    }

    if (character === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (character === "{") {
      depth += 1;
      continue;
    }

    if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return candidateText.slice(firstBraceIndex, index + 1);
      }
    }
  }

  return undefined;
}

function getEmptyOutputReason(response: AIResponseWithPossibleExplanation): AIValidationFailureReason {
  if (hasRefusal(response)) {
    return "refusal-or-filtered-output";
  }

  return "empty-model-output";
}

function hasRefusal(response: AIResponseWithPossibleExplanation): boolean {
  if (response.error || response.incomplete_details) {
    return true;
  }

  if (extractChatMessageValue(response.choices, "refusal") !== undefined) {
    return true;
  }

  if (hasContentFilteredChatChoice(response.choices)) {
    return true;
  }

  if (!Array.isArray(response.output)) {
    return false;
  }

  return response.output.some((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const maybeItem = item as { content?: unknown };

    return Array.isArray(maybeItem.content) && maybeItem.content.some((content) => {
      if (!content || typeof content !== "object") {
        return false;
      }

      return (content as { type?: unknown }).type === "output_refusal";
    });
  });
}

function hasContentFilteredChatChoice(choices: unknown): boolean {
  if (!Array.isArray(choices)) {
    return false;
  }

  return choices.some((choice) => {
    if (!choice || typeof choice !== "object") {
      return false;
    }

    return (choice as { finish_reason?: unknown }).finish_reason === "content_filter";
  });
}

function summarizeOutputItems(output: unknown): {
  outputItemTypes: string[];
  contentTypes: string[];
} {
  if (!Array.isArray(output)) {
    return {
      outputItemTypes: [],
      contentTypes: []
    };
  }

  const outputItemTypes = new Set<string>();
  const contentTypes = new Set<string>();

  for (const item of output) {
    if (!item || typeof item !== "object") {
      outputItemTypes.add(typeof item);
      continue;
    }

    const maybeItem = item as { type?: unknown; content?: unknown };
    outputItemTypes.add(typeof maybeItem.type === "string" ? maybeItem.type : "unknown");

    if (!Array.isArray(maybeItem.content)) {
      continue;
    }

    for (const content of maybeItem.content) {
      if (!content || typeof content !== "object") {
        contentTypes.add(typeof content);
        continue;
      }

      const maybeContent = content as { type?: unknown };
      contentTypes.add(typeof maybeContent.type === "string" ? maybeContent.type : "unknown");
    }
  }

  return {
    outputItemTypes: [...outputItemTypes],
    contentTypes: [...contentTypes]
  };
}

function summarizeChatChoices(choices: unknown): {
  messageParsedExists: boolean;
  messageContent?: string;
  messageContentType: string;
  finishReasons: string[];
  messageRefusalExists: boolean;
} {
  if (!Array.isArray(choices)) {
    return {
      messageParsedExists: false,
      messageContentType: "undefined",
      finishReasons: [],
      messageRefusalExists: false
    };
  }

  const finishReasons = new Set<string>();
  let messageParsedExists = false;
  let messageContent: string | undefined;
  let messageContentType = "undefined";
  let messageRefusalExists = false;

  for (const choice of choices) {
    if (!choice || typeof choice !== "object") {
      continue;
    }

    const maybeChoice = choice as {
      finish_reason?: unknown;
      message?: unknown;
    };

    if (typeof maybeChoice.finish_reason === "string") {
      finishReasons.add(maybeChoice.finish_reason);
    }

    if (!maybeChoice.message || typeof maybeChoice.message !== "object") {
      continue;
    }

    const maybeMessage = maybeChoice.message as {
      parsed?: unknown;
      content?: unknown;
      refusal?: unknown;
    };

    if (maybeMessage.parsed !== undefined && maybeMessage.parsed !== null) {
      messageParsedExists = true;
    }

    if (messageContent === undefined) {
      messageContent = extractChatMessageText([choice]);
      messageContentType = Array.isArray(maybeMessage.content) ? "array" : typeof maybeMessage.content;
    }

    if (maybeMessage.refusal !== undefined && maybeMessage.refusal !== null) {
      messageRefusalExists = true;
    }
  }

  return {
    messageParsedExists,
    messageContent,
    messageContentType,
    finishReasons: [...finishReasons],
    messageRefusalExists
  };
}

function isLineExplanation(value: unknown): value is { line: string; explanation: string } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeValue = value as { line?: unknown; explanation?: unknown };

  return typeof maybeValue.line === "string" &&
    typeof maybeValue.explanation === "string";
}

function isVocabularyItem(value: unknown): value is { term: string; definition: string } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeValue = value as { term?: unknown; definition?: unknown };

  return typeof maybeValue.term === "string" &&
    typeof maybeValue.definition === "string";
}

function cleanText(value: string): string {
  return value
    .replace(/```+/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function missingArrayReasonForKey(
  key: keyof Pick<RawAIExplanation, "lineByLine" | "keyVocabulary" | "commonConfusion">
): AIValidationFailureReason {
  if (key === "lineByLine") {
    return "missing-lineByLine";
  }

  if (key === "keyVocabulary") {
    return "missing-keyVocabulary";
  }

  return "missing-commonConfusion";
}

function invalidArrayReasonForKey(
  key: keyof Pick<RawAIExplanation, "lineByLine" | "keyVocabulary" | "commonConfusion">
): AIValidationFailureReason {
  if (key === "lineByLine") {
    return "invalid-lineByLine";
  }

  if (key === "keyVocabulary") {
    return "invalid-keyVocabulary";
  }

  return "invalid-commonConfusion";
}

function throwValidationFailure(reason: AIValidationFailureReason): never {
  logStructuredDiagnostic("validation-failed");
  throw new AIExplanationFormatError("validation-failed", reason);
}

function isSDKMethodUnsupportedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /responses\.(parse|create)|not a function|unsupported/i.test(error.message);
}

function isAPIRejectedSchemaError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { status?: unknown; message?: unknown };

  return maybeError.status === 400 &&
    typeof maybeError.message === "string" &&
    /schema|json_schema|text\.format|response format|format/i.test(maybeError.message);
}

function logStructuredDiagnostic(category: AIFormattingFailureCategory): void {
  if (category === "parsed-output-missing" || category === "model-refused-or-empty-output") {
    console.warn("DevTrail AI structured output missing");
    return;
  }

  if (category === "json-parse-failed") {
    console.warn("DevTrail AI structured parse failed");
    return;
  }

  if (category === "validation-failed") {
    console.warn("DevTrail AI structured validation failed");
  }
}
