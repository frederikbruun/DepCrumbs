import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Enricher, EnrichedPackage } from "./types.js";

export class CargoEnricher implements Enricher {
  async enrich(
    packageNames: string[],
    cwd: string
  ): Promise<EnrichedPackage[]> {
    const results: EnrichedPackage[] = [];

    let lockContent = "";
    try {
      lockContent = await readFile(join(cwd, "Cargo.lock"), "utf-8");
    } catch {
      // no lock file
    }

    for (const pkg of packageNames) {
      results.push(this.enrichOne(pkg, lockContent));
    }

    return results;
  }

  private enrichOne(
    packageName: string,
    lockContent: string
  ): EnrichedPackage {
    let resolvedVersion = "unknown";
    let integrityHash = "unknown";

    try {
      if (lockContent) {
        const blocks = lockContent.split("[[package]]");

        for (const block of blocks) {
          const nameMatch = block.match(/^name\s*=\s*"(.+)"/m);
          if (nameMatch && nameMatch[1] === packageName) {
            const versionMatch = block.match(/^version\s*=\s*"(.+)"/m);
            if (versionMatch) {
              resolvedVersion = versionMatch[1];
            }

            const checksumMatch = block.match(/^checksum\s*=\s*"(.+)"/m);
            if (checksumMatch) {
              integrityHash = checksumMatch[1];
            }

            break;
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
      registryUrl: `https://crates.io/crates/${packageName}`,
      license: "unknown",
      integrityHash,
      isDirect: true,
      directDependencies: [],
    };
  }
}
