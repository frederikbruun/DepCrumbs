import type { Parser, ParsedInstall } from "./types.js";

const SKIP_FLAGS = new Set([
  "-d",
  "-t",
  "-u",
  "-v",
  "-x",
  "-fix",
  "-insecure",
]);

const VALUE_FLAGS = new Set([
  "-modfile",
]);

export const parser: Parser = {
  detect(command: string): ParsedInstall | null {
    const trimmed = command.trim();

    for (const sub of ["get", "install"] as const) {
      const prefix = `go ${sub}`;
      if (trimmed !== prefix && !trimmed.startsWith(prefix + " ")) {
        continue;
      }

      const argsStr = trimmed.slice(prefix.length).trim();
      const tokens = argsStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
      if (!tokens) return null;

      const packages: string[] = [];
      const flags: string[] = [];

      let i = 0;
      while (i < tokens.length) {
        const tok = tokens[i]!;

        if (tok === "-u") {
          flags.push("-u");
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

        // Skip relative path patterns like ./... – not a package install
        if (tok.startsWith("./") || tok.startsWith("../") || tok === "...") {
          i++;
          continue;
        }

        packages.push(tok);
        i++;
      }

      if (packages.length === 0) return null;

      return {
        packageManager: "go",
        packages,
        command: trimmed,
        flags,
        isDev: false,
        isGlobal: sub === "install",
      };
    }

    return null;
  },
};
