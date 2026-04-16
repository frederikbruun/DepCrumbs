import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Enricher, EnrichedPackage } from "./types.js";

const execFileAsync = promisify(execFile);

function barePackageName(spec: string): string {
  // Strip version specifiers: >=, <=, ==, !=, ~=, >, <, [extras], ; markers
  return spec.split(/[><=!~\s\[;]/)[0]?.trim() ?? spec;
}

export class PipEnricher implements Enricher {
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
    const bareName = barePackageName(packageName);

    try {
      const { stdout } = await execFileAsync("pip", ["show", bareName]);
      const lines = stdout.split("\n");

      for (const line of lines) {
        const [key, ...valueParts] = line.split(":");
        const value = valueParts.join(":").trim();

        if (key?.trim() === "Version" && value) {
          resolvedVersion = value;
        } else if (key?.trim() === "License" && value) {
          license = value;
        } else if (key?.trim() === "Requires" && value) {
          directDependencies = value
            .split(",")
            .map((d: string) => d.trim())
            .filter((d: string) => d.length > 0);
        }
      }
    } catch {
      // leave defaults
    }

    return {
      name: packageName,
      requestedVersion: "unknown",
      resolvedVersion,
      registryUrl: `https://pypi.org/project/${bareName}/`,
      license,
      integrityHash: "unknown",
      isDirect: true,
      directDependencies,
    };
  }
}
