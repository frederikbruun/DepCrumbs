import { readFile, writeFile, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import type { EnrichedInstall } from "../enrichers/types.js";
import type { StorageBackend } from "./types.js";
import { ensureDir } from "./paths.js";

export class MarkdownStorage implements StorageBackend {
  constructor(private readonly filePath: string) {}

  async append(entry: EnrichedInstall): Promise<void> {
    ensureDir(dirname(this.filePath));

    if (!existsSync(this.filePath)) {
      await writeFile(this.filePath, "# DepTrace Audit Log\n\n", "utf-8");
    }

    const section = this.formatEntry(entry);
    await appendFile(this.filePath, section, "utf-8");
  }

  async read(): Promise<EnrichedInstall[]> {
    return [];
  }

  getPath(): string {
    return this.filePath;
  }

  private formatEntry(entry: EnrichedInstall): string {
    const lines: string[] = [
      `## ${entry.timestamp}`,
      "",
      `- **Package Manager:** ${entry.packageManager}`,
      `- **Command:** \`${entry.command}\``,
      `- **Working Directory:** \`${entry.workingDirectory}\``,
      "",
      "| Package | Version | License | Registry | Hash |",
      "|---------|---------|---------|----------|------|",
    ];

    for (const pkg of entry.packages) {
      lines.push(
        `| ${pkg.name} | ${pkg.resolvedVersion} | ${pkg.license} | ${pkg.registryUrl} | ${pkg.integrityHash} |`,
      );
    }

    lines.push("", "---", "");
    return lines.join("\n");
  }
}
