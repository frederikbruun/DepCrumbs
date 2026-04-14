import { createStorage } from "../../storage/index.js";
import {
  getProjectStoragePath,
  getGlobalStoragePath,
} from "../../storage/paths.js";
import { loadConfig } from "../../config/index.js";
import type { EnrichedInstall } from "../../enrichers/types.js";

interface ExportOptions {
  csv?: boolean;
  global?: boolean;
}

export async function exportCommand(options: ExportOptions): Promise<void> {
  const cwd = process.cwd();
  const config = await loadConfig(cwd);

  const storagePath = options.global
    ? getGlobalStoragePath(config.format)
    : getProjectStoragePath(cwd, config.format);

  const storage = createStorage(storagePath, config.format);
  let entries: EnrichedInstall[];

  try {
    entries = await storage.read();
  } catch {
    console.log("No dependency log found.");
    return;
  }

  if (options.csv) {
    printCsv(entries);
  } else {
    printJson(entries);
  }
}

function printJson(entries: EnrichedInstall[]): void {
  console.log(JSON.stringify(entries, null, 2));
}

function printCsv(entries: EnrichedInstall[]): void {
  console.log("timestamp,packageManager,package,version,license,registry");
  for (const entry of entries) {
    for (const pkg of entry.packages) {
      const row = [
        entry.timestamp,
        entry.packageManager,
        csvEscape(pkg.name),
        csvEscape(pkg.resolvedVersion),
        csvEscape(pkg.license),
        csvEscape(pkg.registryUrl),
      ].join(",");
      console.log(row);
    }
  }
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
