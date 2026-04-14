import type { Parser, ParsedInstall } from "./types.js";

const INSTALL_SUBCOMMANDS = new Set(["install", "i", "add", "ci"]);

const DEV_FLAGS = new Set(["--save-dev", "-D"]);
const GLOBAL_FLAGS = new Set(["--global", "-g"]);

const KNOWN_FLAGS = new Set([
  "--save-dev",
  "-D",
  "--global",
  "-g",
  "--save",
  "-S",
  "--save-exact",
  "-E",
  "--save-optional",
  "-O",
  "--no-save",
  "--legacy-peer-deps",
  "--force",
  "-f",
  "--ignore-scripts",
  "--no-optional",
  "--production",
]);

export const parser: Parser = {
  detect(command: string): ParsedInstall | null {
    const trimmed = command.trim();
    const tokens = tokenize(trimmed);

    if (tokens.length === 0 || tokens[0] !== "npm") {
      return null;
    }

    const subcommand = tokens[1];
    if (subcommand === undefined || !INSTALL_SUBCOMMANDS.has(subcommand)) {
      return null;
    }

    const packages: string[] = [];
    const flags: string[] = [];
    let isDev = false;
    let isGlobal = false;

    for (let idx = 2; idx < tokens.length; idx++) {
      const token = tokens[idx];

      if (token.startsWith("-")) {
        flags.push(token);
        if (DEV_FLAGS.has(token)) isDev = true;
        if (GLOBAL_FLAGS.has(token)) isGlobal = true;
      } else {
        // Positional arg = package name (possibly with version specifier)
        packages.push(token);
      }
    }

    // `npm ci` never accepts positional package names; ignore any that slipped through
    if (subcommand === "ci") {
      packages.length = 0;
    }

    return {
      packageManager: "npm",
      packages,
      command: trimmed,
      flags,
      isDev,
      isGlobal,
    };
  },
};

/** Naive shell tokenizer – splits on whitespace, respects single/double quotes. */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (quote !== null) {
      if (ch === quote) {
        quote = null;
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }

    if (ch === " " || ch === "\t") {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}
