import { createStorage } from "../../storage/index.js";
import {
  getProjectStoragePath,
  getGlobalStoragePath,
} from "../../storage/paths.js";
import { loadConfig } from "../../config/index.js";
import type { EnrichedInstall } from "../../enrichers/types.js";

interface LogOptions {
  global?: boolean;
  since?: string;
  package?: string;
  manager?: string;
}

export async function logCommand(options: LogOptions): Promise<void> {
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

  if (entries.length === 0) {
    console.log("No entries recorded yet.");
    return;
  }

  // Apply filters
  if (options.since) {
    const sinceDate = new Date(options.since);
    entries = entries.filter((e) => new Date(e.timestamp) >= sinceDate);
  }

  if (options.manager) {
    const mgr = options.manager.toLowerCase();
    entries = entries.filter(
      (e) => e.packageManager.toLowerCase() === mgr,
    );
  }

  if (options.package) {
    const pkgName = options.package.toLowerCase();
    entries = entries.filter((e) =>
      e.packages.some((p) => p.name.toLowerCase().includes(pkgName)),
    );
  }

  if (entries.length === 0) {
    console.log("No entries match the given filters.");
    return;
  }

  // Print formatted table
  const header = [
    "Timestamp".padEnd(24),
    "Manager".padEnd(10),
    "Package".padEnd(30),
    "Version".padEnd(15),
    "License".padEnd(15),
  ].join(" | ");

  const separator = "-".repeat(header.length);

  console.log(header);
  console.log(separator);

  for (const entry of entries) {
    for (const pkg of entry.packages) {
      const row = [
        entry.timestamp.substring(0, 23).padEnd(24),
        entry.packageManager.padEnd(10),
        pkg.name.padEnd(30),
        pkg.resolvedVersion.padEnd(15),
        pkg.license.padEnd(15),
      ].join(" | ");
      console.log(row);
    }
  }

  console.log(separator);
  console.log(
    `Total: ${entries.reduce((sum, e) => sum + e.packages.length, 0)} package(s) in ${entries.length} install(s)`,
  );
}
