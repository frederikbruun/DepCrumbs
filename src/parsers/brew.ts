import type { Parser, ParsedInstall } from "./types.js";

const SKIP_FLAGS = new Set([
  "--quiet",
  "-q",
  "--verbose",
  "-v",
  "--debug",
  "-d",
  "--force",
  "-f",
  "--overwrite",
  "--dry-run",
  "-n",
  "--keep-tmp",
  "--display-times",
  "--ignore-dependencies",
  "--only-dependencies",
  "--build-from-source",
  "-s",
  "--include-test",
  "--HEAD",
  "--fetch-HEAD",
  "--build-bottle",
  "--skip-cask-deps",
  "--greedy",
  "--greedy-latest",
  "--greedy-auto-updates",
  "--no-binaries",
  "--require-sha",
  "--quarantine",
  "--no-quarantine",
  "--adopt",
  "--skip-post-install",
  "--interactive",
  "--zap",
  "--appdir",
  "--no-upgrade",
]);

const VALUE_FLAGS = new Set([
  "--appdir",
  "--colorpickerdir",
  "--prefpanedir",
  "--qlplugindir",
  "--mdimporterdir",
  "--dictionarydir",
  "--fontdir",
  "--servicedir",
  "--input-macodir",
  "--internet-plugindir",
  "--audio-unit-plugindir",
  "--vst-plugindir",
  "--vst3-plugindir",
  "--screen-saverdir",
  "--language",
  "--bottle-tag",
]);

export const parser: Parser = {
  detect(command: string): ParsedInstall | null {
    const trimmed = command.trim();

    for (const sub of ["install", "reinstall"] as const) {
      const prefix = `brew ${sub}`;
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

        if (tok === "--cask") {
          flags.push("--cask");
          i++;
          continue;
        }

        if (tok === "--formula") {
          flags.push("--formula");
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
        packageManager: "brew",
        packages,
        command: trimmed,
        flags,
        isDev: false,
        isGlobal: true,
      };
    }

    return null;
  },
};
