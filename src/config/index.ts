import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { DEFAULT_CONFIG, type DepTraceConfig } from "./types.js";

export async function loadConfig(cwd: string): Promise<DepTraceConfig> {
  const localPath = resolve(cwd, ".deptrace.config.json");
  const globalPath = resolve(homedir(), ".deptrace", "config.json");

  for (const configPath of [localPath, globalPath]) {
    try {
      const raw = await readFile(configPath, "utf-8");
      const parsed = JSON.parse(raw) as Partial<DepTraceConfig>;
      return {
        format: parsed.format ?? DEFAULT_CONFIG.format,
        enrichment: {
          ...DEFAULT_CONFIG.enrichment,
          ...parsed.enrichment,
        },
        ignore: parsed.ignore ?? DEFAULT_CONFIG.ignore,
      };
    } catch {
      // File not found or invalid, try next
    }
  }

  return DEFAULT_CONFIG;
}

export { DEFAULT_CONFIG, type DepTraceConfig } from "./types.js";
