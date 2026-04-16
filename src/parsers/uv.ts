import type { Parser, ParsedInstall } from "./types.js";

const SKIP_FLAGS = new Set([
  "--no-cache",
  "--quiet",
  "-q",
  "--no-deps",
  "--no-build-isolation",
  "--force-reinstall",
  "--reinstall",
  "--pre",
  "--system",
  "--break-system-packages",
  "--compile-bytecode",
  "--no-compile-bytecode",
  "--require-hashes",
  "--offline",
  "--refresh",
  "--no-progress",
]);

const VALUE_FLAGS = new Set([
  "-c",
  "--constraint",
  "-e",
  "--editable",
  "-p",
  "--python",
  "-i",
  "--index-url",
  "--extra-index-url",
  "-f",
  "--find-links",
  "--prefix",
  "--target",
  "--config-setting",
  "--resolution",
  "--prerelease",
  "--keyring-provider",
  "--index-strategy",
  "--exclude-newer",
  "--link-mode",
  "--cache-dir",
]);

function parseTokens(argsStr: string): string[] | null {
  return argsStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? null;
}

function isShellBoundary(tok: string): boolean {
  if (tok === "|" || tok === "||" || tok === "&&" || tok === ";") return true;
  // redirects: >, >>, <, 2>&1, &>, 2>, 1>, etc.
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

function parsePipInstallArgs(argsStr: string): {
  packages: string[];
  flags: string[];
  isDev: boolean;
} {
  const tokens = parseTokens(argsStr);
  const packages: string[] = [];
  const flags: string[] = [];
  let isDev = false;

  if (!tokens) return { packages, flags, isDev };

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i]!;

    if (isShellBoundary(tok)) break;

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

    packages.push(stripQuotes(tok));
    i++;
  }

  return { packages, flags, isDev };
}

function parseAddArgs(argsStr: string): {
  packages: string[];
  flags: string[];
  isDev: boolean;
} {
  const tokens = parseTokens(argsStr);
  const packages: string[] = [];
  const flags: string[] = [];
  let isDev = false;

  if (!tokens) return { packages, flags, isDev };

  const addValueFlags = new Set([
    "-p",
    "--python",
    "--tag",
    "--branch",
    "--rev",
    "--extra",
    "--cache-dir",
    "--index-url",
    "--extra-index-url",
  ]);

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i]!;

    if (isShellBoundary(tok)) break;

    if (tok === "--dev") {
      isDev = true;
      flags.push("--dev");
      i++;
      continue;
    }

    if (tok === "--optional") {
      flags.push("--optional");
      i++;
      continue;
    }

    if (addValueFlags.has(tok)) {
      i += 2;
      continue;
    }

    if (tok.startsWith("-")) {
      i++;
      continue;
    }

    packages.push(stripQuotes(tok));
    i++;
  }

  return { packages, flags, isDev };
}

export const parser: Parser = {
  detect(command: string): ParsedInstall | null {
    const trimmed = command.trim();

    // uv pip install
    const pipPrefix = "uv pip install";
    if (trimmed === pipPrefix || trimmed.startsWith(pipPrefix + " ")) {
      const argsStr = trimmed.slice(pipPrefix.length).trim();
      const { packages, flags } = parsePipInstallArgs(argsStr);
      if (packages.length === 0) return null;
      return {
        packageManager: "uv",
        packages,
        command: trimmed,
        flags,
        isDev: false,
        isGlobal: false,
      };
    }

    // uv add
    const addPrefix = "uv add";
    if (trimmed === addPrefix || trimmed.startsWith(addPrefix + " ")) {
      const argsStr = trimmed.slice(addPrefix.length).trim();
      const { packages, flags, isDev } = parseAddArgs(argsStr);
      if (packages.length === 0) return null;
      return {
        packageManager: "uv",
        packages,
        command: trimmed,
        flags,
        isDev,
        isGlobal: false,
      };
    }

    return null;
  },
};
