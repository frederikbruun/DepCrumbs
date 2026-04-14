import type { Parser, ParsedInstall } from "./types.js";

const SKIP_FLAGS = new Set([
  "--no-document",
  "--no-ri",
  "--no-rdoc",
  "--no-wrapper",
  "--no-user-install",
  "--user-install",
  "--conservative",
  "--minimal-deps",
  "--prerelease",
  "--pre",
  "--default",
  "--explain",
  "--force",
  "-f",
  "--local",
  "-l",
  "--remote",
  "-r",
  "--both",
  "-b",
  "--development",
  "--no-post-install-message",
  "--ignore-dependencies",
  "--no-suggestions",
  "--wrappers",
  "--no-wrappers",
  "-N",
  "-E",
  "--env-shebang",
  "--no-env-shebang",
  "--quiet",
  "-q",
  "--silent",
  "--verbose",
  "--lock",
]);

const VALUE_FLAGS = new Set([
  "-i",
  "--install-dir",
  "-n",
  "--bindir",
  "--document",
  "--build-root",
  "--vendor",
  "--source",
  "-s",
  "--platform",
  "-P",
  "--trust-policy",
  "-g",
  "--file",
  "--without",
  "--config-file",
]);

export const parser: Parser = {
  detect(command: string): ParsedInstall | null {
    const trimmed = command.trim();
    const prefix = "gem install";

    if (trimmed !== prefix && !trimmed.startsWith(prefix + " ")) {
      return null;
    }

    const argsStr = trimmed.slice(prefix.length).trim();
    const tokens = argsStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
    if (!tokens) return null;

    const packages: string[] = [];
    const flags: string[] = [];

    let i = 0;
    while (i < tokens.length) {
      const tok = tokens[i]!;

      if (tok === "-v" || tok === "--version") {
        const next = tokens[i + 1];
        if (next && !next.startsWith("-")) {
          flags.push(`--version=${next}`);
          i += 2;
        } else {
          i++;
        }
        continue;
      }

      if (tok.startsWith("--version=")) {
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
        i++;
        continue;
      }

      packages.push(tok);
      i++;
    }

    if (packages.length === 0) return null;

    return {
      packageManager: "gem",
      packages,
      command: trimmed,
      flags,
      isDev: false,
      isGlobal: true,
    };
  },
};
