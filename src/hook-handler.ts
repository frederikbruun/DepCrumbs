#!/usr/bin/env node
import { detect } from "./parsers/index.js";
import { enrich } from "./enrichers/index.js";
import { createStorage } from "./storage/index.js";
import {
  getProjectStoragePath,
  getGlobalStoragePath,
  ensureDir,
} from "./storage/paths.js";
import { loadConfig } from "./config/index.js";
import { dirname } from "node:path";

async function main(): Promise<void> {
  // 1. Read stdin
  const input = await readStdin();
  const data = JSON.parse(input);

  // 2. Extract command from tool_input
  const command = data?.tool_input?.command;
  if (!command) return;

  // 3. Detect install commands
  const installs = detect(command);
  if (installs.length === 0) return;

  // 4. Get working directory
  const cwd = process.cwd();

  // 5. Load config
  const config = await loadConfig(cwd);

  // 6. For each detected install, enrich and store
  const logged: string[] = [];
  for (const install of installs) {
    const enriched = await enrich(install, cwd);

    // Write to project-local storage
    const projectPath = getProjectStoragePath(cwd, config.format);
    ensureDir(dirname(projectPath));
    const projectStorage = createStorage(projectPath, config.format);
    await projectStorage.append(enriched);

    // Write to global storage
    const globalPath = getGlobalStoragePath(config.format);
    ensureDir(dirname(globalPath));
    const globalStorage = createStorage(globalPath, config.format);
    await globalStorage.append(enriched);

    // Collect summary
    for (const pkg of enriched.packages) {
      logged.push(`${pkg.name}@${pkg.resolvedVersion} (${pkg.license})`);
    }
  }

  // 7. Output context for Claude
  if (logged.length > 0) {
    console.log(
      JSON.stringify({
        additionalContext: `[DepTrace] Logged: ${logged.join(", ")}`,
      }),
    );
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk: string) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
  });
}

main().catch(() => {
  /* never crash */
});
