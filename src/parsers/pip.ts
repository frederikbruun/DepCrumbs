import type { Parser, ParsedInstall } from "./types.js";

const PIP_PREFIXES = [
  "pip install",
  "pip3 install",
  "python -m pip install",
  "python3 -m pip install",
];

const SKIP_FLAGS = new Set([
  "--no-cache-dir",
  "--quiet",
  "-q",
  "--no-deps",
  "--no-input",
  "--pre",
  "--force-reinstall",
  "--ignore-installed",
  "--no-warn-script-location",
  "--no-warn-conflicts",
  "--disable-pip-version-check",
  "--progress-bar",
  "--compile",
  "--no-compile",
  "--no-build-isolation",
  "--no-clean",
  "--prefer-binary",
  "--require-hashes",
  "--break-system-packages",
]);

/** Flags that consume the next token as their value. */
const VALUE_FLAGS = new Set([
  "-c",
  "--constraint",
  "-e",
  "--editable",
  "-t",
  "--target",
  "--prefix",
  "--src",
  "--root",
  "-i",
  "--index-url",
  "--extra-index-url",
  "-f",
  "--find-links",
  "--trusted-host",
  "--proxy",
  "--retries",
  "--timeout",
  "--exists-action",
  "--progress-bar",
  "--config-settings",
  "--global-option",
  "--install-option",
  "--build-option",
  "--implementation",
  "--platform",
  "--python-version",
  "--abi",
]);

function isShellBoundary(tok: string): boolean {
  if (tok === "|" || tok === "||" || tok === "&&" || tok === ";") return true;
  if (/^[0-9]?[><]/.test(tok)) return true;
  if (tok === "&>") return true;
  return false;
}

function stripQuotes(tok: string): string {
  if (tok.length >= 2 &&
      ((tok.startsWith('"') && tok.endsWith('"')) ||
       (tok.startsWith("'") && tok.endsWith("'")))) {
    return tok.slice(1, -1);
  }
  return tok;
}

function parseArgs(argsStr: string): ParsedInstall | null {
  const tokens = argsStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
  if (!tokens) return null;

  const packages: string[] = [];
  const flags: string[] = [];
  let isDev = false;
  let isGlobal = false;

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i]!;

    if (tok === "-U" || tok === "--upgrade") {
      flags.push("--upgrade");
      i++;
      continue;
    }

    if (tok === "--user") {
      flags.push("--user");
      i++;
      continue;
    }

    if (tok === "-r" || tok === "--requirement") {
      const next = tokens[i + 1];
      if (next) {
        packages.push(`-r ${next}`);
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    if (VALUE_FLAGS.has(tok)) {
      i += 2; // skip flag + value
      continue;
    }

    if (tok.startsWith("-") && SKIP_FLAGS.has(tok)) {
      i++;
      continue;
    }

    // Skip unknown long flags (--something) or short flags
    if (tok.startsWith("--") && !SKIP_FLAGS.has(tok)) {
      i++;
      continue;
    }

    if (tok.startsWith("-") && !tok.startsWith("--")) {
      // already handled known short flags above; skip unknown ones
      i++;
      continue;
    }

    if (isShellBoundary(tok)) break;

    // Positional arg – treat as package name (may include version specifier)
    packages.push(stripQuotes(tok));
    i++;
  }

  if (packages.length === 0) return null;

  return {
    packageManager: "pip",
    packages,
    command: "",
    flags,
    isDev,
    isGlobal,
  };
}

export const parser: Parser = {
  detect(command: string): ParsedInstall | null {
    const trimmed = command.trim();

    for (const prefix of PIP_PREFIXES) {
      if (
        trimmed === prefix ||
        trimmed.startsWith(prefix + " ")
      ) {
        const argsStr = trimmed.slice(prefix.length).trim();
        const result = parseArgs(argsStr);
        if (result) {
          result.command = trimmed;
        }
        return result;
      }
    }

    return null;
  },
};
