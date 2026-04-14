import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Enricher, EnrichedPackage } from "./types.js";

export class GoEnricher implements Enricher {
  async enrich(
    packageNames: string[],
    cwd: string
  ): Promise<EnrichedPackage[]> {
    const results: EnrichedPackage[] = [];

    let goSumContent = "";
    try {
      goSumContent = await readFile(join(cwd, "go.sum"), "utf-8");
    } catch {
      // no go.sum file
    }

    for (const pkg of packageNames) {
      results.push(this.enrichOne(pkg, goSumContent));
    }

    return results;
  }

  private enrichOne(
    packageName: string,
    goSumContent: string
  ): EnrichedPackage {
    // Strip version suffix like @v1.2.3
    const moduleName = packageName.replace(/@v[\d.]+.*$/, "");

    let resolvedVersion = "unknown";
    let integrityHash = "unknown";

    try {
      if (goSumContent) {
        const lines = goSumContent.split("\n");

        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3 && parts[0] === moduleName) {
            const version = parts[1];
            const hash = parts[2];

            // Prefer the non-/go.mod entry
            if (!version.endsWith("/go.mod")) {
              resolvedVersion = version;
              integrityHash = hash;
              break;
            }

            // Fall back to go.mod entry if no other match
            if (resolvedVersion === "unknown") {
              resolvedVersion = version.replace("/go.mod", "");
              integrityHash = hash;
            }
          }
        }
      }
    } catch {
      // leave defaults
    }

    return {
      name: moduleName,
      requestedVersion: "unknown",
      resolvedVersion,
      registryUrl: `https://pkg.go.dev/${moduleName}`,
      license: "unknown",
      integrityHash,
      isDirect: true,
      directDependencies: [],
    };
  }
}
