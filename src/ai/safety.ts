import * as path from "path";
import * as vscode from "vscode";

const SENSITIVE_PATTERNS = [
  /\bOPENAI_API_KEY\b/i,
  /\b[A-Z0-9_]*API_KEY[A-Z0-9_]*\b/i,
  /\b[A-Z0-9_]*SECRET[A-Z0-9_]*\b/i,
  /\b[A-Z0-9_]*TOKEN[A-Z0-9_]*\b/i,
  /\b[A-Z0-9_]*PASSWORD[A-Z0-9_]*\b/i,
  /\b[A-Z0-9_]*PRIVATE_KEY[A-Z0-9_]*\b/i,
  /^\s*[A-Za-z_][A-Za-z0-9_]*\s*=\s*['"]?[^\s'"]{8,}/m
];

const BLOCKED_FILE_NAMES = new Set([
  ".npmrc",
  ".pypirc",
  ".yarnrc",
  ".yarnrc.yml",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock"
]);

export function canSendSelectionToAI(
  document: vscode.TextDocument,
  selectedCode: string
): { allowed: true } | { allowed: false; reason: string } {
  if (isBlockedFile(document.uri)) {
    return {
      allowed: false,
      reason: "This file type may contain dependency lock data or local secrets."
    };
  }

  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(selectedCode))) {
    return {
      allowed: false,
      reason: "This selection looks like it may contain a secret."
    };
  }

  return { allowed: true };
}

function isBlockedFile(uri: vscode.Uri): boolean {
  if (uri.scheme !== "file") {
    return false;
  }

  const normalizedPath = uri.fsPath.split(path.sep).join("/");
  const fileName = path.basename(uri.fsPath);

  return normalizedPath.includes("/node_modules/") ||
    BLOCKED_FILE_NAMES.has(fileName) ||
    fileName === ".env" ||
    fileName.startsWith(".env.") ||
    (fileName.startsWith(".") && /secret|token|credential|config/i.test(fileName));
}
