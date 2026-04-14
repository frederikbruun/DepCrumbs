import type { Parser, ParsedInstall } from "./types.js";

const SKIP_FLAGS = new Set([
  "--prefer-source",
  "--prefer-dist",
  "--prefer-install",
  "--no-progress",
  "--no-suggest",
  "--no-update",
  "--no-install",
  "--no-scripts",
  "--no-autoloader",
  "--update-no-dev",
  "--update-with-dependencies",
  "--update-with-all-dependencies",
  "--with-dependencies",
  "--with-all-dependencies",
  "--no-interaction",
  "-n",
  "--verbose",
  "-v",
  "-vv",
  "-vvv",
  "--optimize-autoloader",
  "-o",
  "--classmap-authoritative",
  "-a",
  "--apcu-autoloader",
  "--sort-packages",
  "--prefer-stable",
  "--prefer-lowest",
  "--fixed",
  "--dry-run",
  "--ansi",
  "--no-ansi",
  "--quiet",
  "-q",
]);

const VALUE_FLAGS = new Set([
  "--working-dir",
  "-d",
  "--prefer-install",
]);

export const parser: Parser = {
  detect(command: string): ParsedInstall | null {
    const trimmed = command.trim();
    const prefix = "composer require";

    if (trimmed !== prefix && !trimmed.startsWith(prefix + " ")) {
      return null;
    }

    const argsStr = trimmed.slice(prefix.length).trim();
    const tokens = argsStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
    if (!tokens) return null;

    const packages: string[] = [];
    const flags: string[] = [];
    let isDev = false;

    let i = 0;
    while (i < tokens.length) {
      const tok = tokens[i]!;

      if (tok === "--dev") {
        isDev = true;
        flags.push("--dev");
        i++;
        continue;
      }

      if (VALUE_FLAGS.has(tok)) {
        i += 2;
        continue;
      }

      if (tok.startsWith("-")) {
        if (SKIP_FLAGS.has(tok)) {
          i++;
          continue;
        }
        i++;
        continue;
      }

      // Positional: vendor/package or vendor/package:^1.0
      packages.push(tok);
      i++;
    }

    if (packages.length === 0) return null;

    return {
      packageManager: "composer",
      packages,
      command: trimmed,
      flags,
      isDev,
      isGlobal: false,
    };
  },
};
