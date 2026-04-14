import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Enricher, EnrichedPackage } from "./types.js";

export class ComposerEnricher implements Enricher {
  async enrich(
    packageNames: string[],
    cwd: string
  ): Promise<EnrichedPackage[]> {
    const results: EnrichedPackage[] = [];

    let lockData: ComposerLock | null = null;
    try {
      const raw = await readFile(join(cwd, "composer.lock"), "utf-8");
      lockData = JSON.parse(raw) as ComposerLock;
    } catch {
      // no lock file
    }

    for (const pkg of packageNames) {
      results.push(this.enrichOne(pkg, lockData));
    }

    return results;
  }

  private enrichOne(
    packageName: string,
    lockData: ComposerLock | null
  ): EnrichedPackage {
    let resolvedVersion = "unknown";
    let license = "unknown";
    let integrityHash = "unknown";
    let directDependencies: string[] = [];

    try {
      if (lockData?.packages) {
        const entry = lockData.packages.find((p) => p.name === packageName);
        if (entry) {
          if (entry.version) {
            resolvedVersion = entry.version;
          }
          if (entry.license && entry.license.length > 0) {
            license = entry.license.join(", ");
          }
          if (entry.dist?.shasum) {
            integrityHash = entry.dist.shasum;
          }
          if (entry.require) {
            directDependencies = Object.keys(entry.require).filter(
              (d) => !d.startsWith("php") && !d.startsWith("ext-")
            );
          }
        }
      }
    } catch {
      // leave defaults
    }

    return {
      name: packageName,
      requestedVersion: "unknown",
      resolvedVersion,
      registryUrl: `https://packagist.org/packages/${packageName}`,
      license,
      integrityHash,
      isDirect: true,
      directDependencies,
    };
  }
}

interface ComposerLockPackage {
  name: string;
  version?: string;
  license?: string[];
  dist?: { shasum?: string };
  require?: Record<string, string>;
}

interface ComposerLock {
  packages?: ComposerLockPackage[];
}
