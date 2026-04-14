import { readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { EnrichedInstall } from "../enrichers/types.js";
import type { StorageBackend } from "./types.js";
import { ensureDir } from "./paths.js";

interface StorageFile {
  version: number;
  entries: EnrichedInstall[];
}

export class JsonStorage implements StorageBackend {
  constructor(private readonly filePath: string) {}

  async append(entry: EnrichedInstall): Promise<void> {
    const data = await this.loadOrCreate();
    data.entries.push(entry);
    ensureDir(dirname(this.filePath));
    await writeFile(this.filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  }

  async read(): Promise<EnrichedInstall[]> {
    const data = await this.loadOrCreate();
    return data.entries;
  }

  getPath(): string {
    return this.filePath;
  }

  private async loadOrCreate(): Promise<StorageFile> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as StorageFile;
    } catch {
      return { version: 1, entries: [] };
    }
  }
}
