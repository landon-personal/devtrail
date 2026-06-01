import * as assert from "assert";
import {
  AIExplanationFormatError,
  parseAIExplanationFromResponse
} from "./parseAIExplanation";

const validExplanation = {
  summary: "This creates a new doubled array.",
  lineByLine: [
    {
      line: "const numbers = [1, 2, 3];",
      explanation: "numbers stores three values."
    }
  ],
  keyVocabulary: [
    {
      term: "map",
      definition: "map creates a new array from each item."
    }
  ],
  commonConfusion: [
    "map does not change the original array."
  ]
};

function assertFormatCategory(error: unknown, category: AIExplanationFormatError["category"]): void {
  assert.ok(error instanceof AIExplanationFormatError);
  assert.strictEqual(error.category, category);
}

function assertValidationReason(
  error: unknown,
  reason: NonNullable<AIExplanationFormatError["validationFailureReason"]>
): void {
  assert.ok(error instanceof AIExplanationFormatError);
  assert.strictEqual(error.validationFailureReason, reason);
}

function runParserTests(): void {
  assert.deepStrictEqual(
    parseAIExplanationFromResponse({ output_parsed: validExplanation }),
    validExplanation
  );

  assert.deepStrictEqual(
    parseAIExplanationFromResponse({
      choices: [
        {
          finish_reason: "stop",
          message: {
            parsed: validExplanation,
            content: null,
            refusal: null
          }
        }
      ]
    }),
    validExplanation
  );

  assert.deepStrictEqual(
    parseAIExplanationFromResponse({
      choices: [
        {
          finish_reason: "stop",
          message: {
            content: JSON.stringify(validExplanation),
            refusal: null
          }
        }
      ]
    }),
    validExplanation
  );

  assert.deepStrictEqual(
    parseAIExplanationFromResponse({ output_text: JSON.stringify(validExplanation) }),
    validExplanation
  );

  assert.deepStrictEqual(
    parseAIExplanationFromResponse({
      output: [
        {
          type: "message",
          content: [
            {
              type: "output_text",
              text: JSON.stringify(validExplanation)
            }
          ]
        }
      ]
    }),
    validExplanation
  );

  assert.deepStrictEqual(
    parseAIExplanationFromResponse({
      output_text: `Here is the JSON:\n\`\`\`json\n${JSON.stringify(validExplanation)}\n\`\`\``
    }),
    validExplanation
  );

  assert.deepStrictEqual(
    parseAIExplanationFromResponse({
      output_text: `Result follows: ${JSON.stringify(validExplanation)}\nDone.`
    }),
    validExplanation
  );

  assert.throws(
    () => parseAIExplanationFromResponse({ output_text: "no object here" }),
    (error) => {
      assertFormatCategory(error, "json-parse-failed");
      assertValidationReason(error, "no-json-object-found");
      return true;
    }
  );

  assert.throws(
    () => parseAIExplanationFromResponse({ output_parsed: { summary: 42 } }),
    (error) => {
      assertFormatCategory(error, "validation-failed");
      assertValidationReason(error, "missing-summary");
      return true;
    }
  );

  assert.throws(
    () => parseAIExplanationFromResponse({ output_parsed: { summary: "Only a summary." } }),
    (error) => {
      assertFormatCategory(error, "validation-failed");
      assertValidationReason(error, "missing-lineByLine");
      return true;
    }
  );

  assert.throws(
    () => parseAIExplanationFromResponse({
      output: [
        {
          type: "message",
          content: [
            {
              type: "output_refusal",
              refusal: "Cannot help with that."
            }
          ]
        }
      ]
    }),
    (error) => {
      assertFormatCategory(error, "model-refused-or-empty-output");
      assertValidationReason(error, "refusal-or-filtered-output");
      return true;
    }
  );
}

runParserTests();
console.log("DevTrail AI parser tests passed.");
