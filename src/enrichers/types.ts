import type { PackageManager } from "../parsers/types.js";

export interface EnrichedPackage {
  name: string;
  requestedVersion: string;
  resolvedVersion: string;
  registryUrl: string;
  license: string;
  integrityHash: string;
  isDirect: boolean;
  directDependencies: string[];
}

export interface EnrichedInstall {
  packageManager: PackageManager;
  command: string;
  workingDirectory: string;
  timestamp: string;
  packages: EnrichedPackage[];
  claudeSessionId?: string;
}

export interface Enricher {
  enrich(packageNames: string[], cwd: string): Promise<EnrichedPackage[]>;
}
