import type { Parser, ParsedInstall } from "./types.js";

const DEV_FLAGS = new Set(["--dev", "-D"]);

export const parser: Parser = {
  detect(command: string): ParsedInstall | null {
    const trimmed = command.trim();
    const tokens = tokenize(trimmed);

    if (tokens.length === 0 || tokens[0] !== "yarn") {
      return null;
    }

    const subcommand = tokens[1];

    // `yarn` alone or `yarn install` = install with no packages
    if (subcommand === undefined || subcommand === "install") {
      const flags: string[] = [];
      let isDev = false;

      const start = subcommand === undefined ? 1 : 2;
      for (let idx = start; idx < tokens.length; idx++) {
        const token = tokens[idx];
        if (token.startsWith("-")) {
          flags.push(token);
          if (DEV_FLAGS.has(token)) isDev = true;
        }
      }

      return {
        packageManager: "yarn",
        packages: [],
        command: trimmed,
        flags,
        isDev,
        isGlobal: false,
      };
    }

    // `yarn add <packages>`
    if (subcommand !== "add") {
      return null;
    }

    const packages: string[] = [];
    const flags: string[] = [];
    let isDev = false;

    for (let idx = 2; idx < tokens.length; idx++) {
      const token = tokens[idx];

      if (token.startsWith("-")) {
        flags.push(token);
        if (DEV_FLAGS.has(token)) isDev = true;
      } else {
        packages.push(token);
      }
    }

    return {
      packageManager: "yarn",
      packages,
      command: trimmed,
      flags,
      isDev,
      isGlobal: false,
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
