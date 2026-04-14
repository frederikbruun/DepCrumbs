import type { EnrichedInstall } from "../enrichers/types.js";

export interface StorageBackend {
  append(entry: EnrichedInstall): Promise<void>;
  read(): Promise<EnrichedInstall[]>;
  getPath(): string;
}
