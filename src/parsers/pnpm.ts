import type { Parser, ParsedInstall } from "./types.js";

const INSTALL_SUBCOMMANDS = new Set(["install", "i"]);
const DEV_FLAGS = new Set(["--save-dev", "-D"]);
const GLOBAL_FLAGS = new Set(["--global", "-g"]);

export const parser: Parser = {
  detect(command: string): ParsedInstall | null {
    const trimmed = command.trim();
    const tokens = tokenize(trimmed);

    if (tokens.length === 0 || tokens[0] !== "pnpm") {
      return null;
    }

    const subcommand = tokens[1];
    if (subcommand === undefined) {
      return null;
    }

    // `pnpm install` / `pnpm i` = install with no packages
    if (INSTALL_SUBCOMMANDS.has(subcommand)) {
      const flags: string[] = [];
      let isDev = false;
      let isGlobal = false;

      for (let idx = 2; idx < tokens.length; idx++) {
        const token = tokens[idx];
        if (token.startsWith("-")) {
          flags.push(token);
          if (DEV_FLAGS.has(token)) isDev = true;
          if (GLOBAL_FLAGS.has(token)) isGlobal = true;
        }
      }

      return {
        packageManager: "pnpm",
        packages: [],
        command: trimmed,
        flags,
        isDev,
        isGlobal,
      };
    }

    // `pnpm add <packages>`
    if (subcommand !== "add") {
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
        packages.push(token);
      }
    }

    return {
      packageManager: "pnpm",
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
