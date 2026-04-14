import type { Parser, ParsedInstall } from "./types.js";

const SKIP_FLAGS = new Set([
  "--quiet",
  "-q",
  "--verbose",
  "-v",
  "--debug",
  "--force",
  "-f",
  "--locked",
  "--frozen",
  "--no-verify",
  "--no-track",
  "--list",
  "--dry-run",
  "--no-default-features",
  "--all-features",
  "--optional",
]);

const VALUE_FLAGS = new Set([
  "--version",
  "--registry",
  "--index",
  "--path",
  "--branch",
  "--tag",
  "--rev",
  "--target",
  "--target-dir",
  "--root",
  "--jobs",
  "-j",
  "--profile",
  "--color",
  "--config",
  "-Z",
  "--manifest-path",
  "--package",
  "-p",
  "--rename",
]);

function parseArgs(
  argsStr: string,
  subcommand: "add" | "install",
): {
  packages: string[];
  flags: string[];
} {
  const tokens = argsStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
  const packages: string[] = [];
  const flags: string[] = [];

  if (!tokens) return { packages, flags };

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i]!;

    if (tok === "--features") {
      const next = tokens[i + 1];
      if (next) {
        flags.push(`--features=${next}`);
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    if (tok.startsWith("--features=")) {
      flags.push(tok);
      i++;
      continue;
    }

    if (tok === "--git") {
      const next = tokens[i + 1];
      if (next) {
        flags.push(`--git=${next}`);
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    if (tok.startsWith("--git=")) {
      flags.push(tok);
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
      // skip unknown flags
      i++;
      continue;
    }

    // Positional arg: crate name or path
    packages.push(tok);
    i++;
  }

  return { packages, flags };
}

export const parser: Parser = {
  detect(command: string): ParsedInstall | null {
    const trimmed = command.trim();

    for (const sub of ["add", "install"] as const) {
      const prefix = `cargo ${sub}`;
      if (trimmed === prefix || trimmed.startsWith(prefix + " ")) {
        const argsStr = trimmed.slice(prefix.length).trim();
        const { packages, flags } = parseArgs(argsStr, sub);
        if (packages.length === 0) return null;
        return {
          packageManager: "cargo",
          packages,
          command: trimmed,
          flags,
          isDev: false,
          isGlobal: sub === "install",
        };
      }
    }

    return null;
  },
};
