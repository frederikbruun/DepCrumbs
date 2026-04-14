import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Enricher, EnrichedPackage } from "./types.js";

export class NpmEnricher implements Enricher {
  async enrich(
    packageNames: string[],
    cwd: string
  ): Promise<EnrichedPackage[]> {
    const results: EnrichedPackage[] = [];

    for (const pkg of packageNames) {
      results.push(await this.enrichOne(pkg, cwd));
    }

    return results;
  }

  private async enrichOne(
    packageName: string,
    cwd: string
  ): Promise<EnrichedPackage> {
    let resolvedVersion = "unknown";
    let license = "unknown";
    let directDependencies: string[] = [];
    let integrityHash = "unknown";

    // Read package.json from node_modules
    try {
      const pkgJsonPath = join(cwd, "node_modules", packageName, "package.json");
      const raw = await readFile(pkgJsonPath, "utf-8");
      const pkgJson = JSON.parse(raw) as Record<string, unknown>;

      if (typeof pkgJson.version === "string") {
        resolvedVersion = pkgJson.version;
      }
      if (typeof pkgJson.license === "string") {
        license = pkgJson.license;
      }
      if (
        pkgJson.dependencies &&
        typeof pkgJson.dependencies === "object" &&
        pkgJson.dependencies !== null
      ) {
        directDependencies = Object.keys(
          pkgJson.dependencies as Record<string, unknown>
        );
      }
    } catch {
      // leave defaults
    }

    // Read integrity hash from package-lock.json
    try {
      const lockPath = join(cwd, "package-lock.json");
      const raw = await readFile(lockPath, "utf-8");
      const lockJson = JSON.parse(raw) as Record<string, unknown>;
      const packages = lockJson.packages as
        | Record<string, Record<string, unknown>>
        | undefined;

      if (packages) {
        const entry = packages[`node_modules/${packageName}`];
        if (entry && typeof entry.integrity === "string") {
          integrityHash = entry.integrity;
        }
      }
    } catch {
      // leave default
    }

    return {
      name: packageName,
      requestedVersion: "unknown",
      resolvedVersion,
      registryUrl: `https://registry.npmjs.org/${packageName}`,
      license,
      integrityHash,
      isDirect: true,
      directDependencies,
    };
  }
}
