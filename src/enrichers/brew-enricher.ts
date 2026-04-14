import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Enricher, EnrichedPackage } from "./types.js";

const execFileAsync = promisify(execFile);

export class BrewEnricher implements Enricher {
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
    _cwd: string
  ): Promise<EnrichedPackage> {
    let resolvedVersion = "unknown";
    let license = "unknown";
    let directDependencies: string[] = [];

    try {
      const { stdout } = await execFileAsync("brew", [
        "info",
        packageName,
        "--json=v2",
      ]);

      const info = JSON.parse(stdout) as BrewInfoResult;
      const formula = info.formulae?.[0];

      if (formula) {
        if (formula.versions?.stable) {
          resolvedVersion = formula.versions.stable;
        }
        if (formula.license) {
          license = formula.license;
        }
        if (formula.dependencies && formula.dependencies.length > 0) {
          directDependencies = formula.dependencies;
        }
      }
    } catch {
      // leave defaults
    }

    return {
      name: packageName,
      requestedVersion: "unknown",
      resolvedVersion,
      registryUrl: `https://formulae.brew.sh/formula/${packageName}`,
      license,
      integrityHash: "unknown",
      isDirect: true,
      directDependencies,
    };
  }
}

interface BrewInfoResult {
  formulae?: Array<{
    versions?: { stable?: string };
    license?: string;
    dependencies?: string[];
  }>;
}
