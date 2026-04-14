import type { ParsedInstall } from "./types.js";
import { parser as npmParser } from "./npm.js";
import { parser as yarnParser } from "./yarn.js";
import { parser as pnpmParser } from "./pnpm.js";
import { parser as pipParser } from "./pip.js";
import { parser as uvParser } from "./uv.js";
import { parser as cargoParser } from "./cargo.js";
import { parser as goParser } from "./go.js";
import { parser as gemParser } from "./gem.js";
import { parser as composerParser } from "./composer.js";
import { parser as brewParser } from "./brew.js";

export type { ParsedInstall, Parser, PackageManager } from "./types.js";

const parsers = [
  npmParser,
  yarnParser,
  pnpmParser,
  pipParser,
  uvParser,
  cargoParser,
  goParser,
  gemParser,
  composerParser,
  brewParser,
];

/**
 * Split a compound shell command on `&&`, `||`, and `;` separators,
 * but not when they appear inside single or double quotes.
 */
function splitCommands(input: string): string[] {
  const parts: string[] = [];
  let current = "";
  let quote: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (quote !== null) {
      current += ch;
      if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      current += ch;
      quote = ch;
      continue;
    }

    // Check for `&&`
    if (ch === "&" && input[i + 1] === "&") {
      parts.push(current);
      current = "";
      i++; // skip second `&`
      continue;
    }

    // Check for `||`
    if (ch === "|" && input[i + 1] === "|") {
      parts.push(current);
      current = "";
      i++; // skip second `|`
      continue;
    }

    // Check for `;`
    if (ch === ";") {
      parts.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  if (current.length > 0) {
    parts.push(current);
  }

  return parts;
}

/**
 * Strip shell redirects (2>&1, >/dev/null, 2>/dev/null, etc.) from a command.
 */
function stripRedirects(command: string): string {
  return command.replace(/\s+\d*>&\d+/g, "").replace(/\s+\d*>+\s*\/\S+/g, "").trim();
}

/**
 * Detect install commands in a (possibly compound) shell command string.
 * Returns all matches from all registered parsers.
 */
export function detect(command: string): ParsedInstall[] {
  const subCommands = splitCommands(command);
  const results: ParsedInstall[] = [];

  for (const sub of subCommands) {
    const trimmed = stripRedirects(sub.trim());
    if (trimmed.length === 0) continue;

    for (const p of parsers) {
      const result = p.detect(trimmed);
      if (result !== null) {
        results.push(result);
      }
    }
  }

  return results;
}
