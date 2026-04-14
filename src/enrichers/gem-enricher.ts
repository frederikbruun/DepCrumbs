import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Enricher, EnrichedPackage } from "./types.js";

const execFileAsync = promisify(execFile);

export class GemEnricher implements Enricher {
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

    try {
      const { stdout } = await execFileAsync("gem", [
        "list",
        packageName,
        "--local",
        "--exact",
      ]);

      // Output format: "gemname (1.2.3, 1.2.2)"
      const match = stdout.match(
        new RegExp(`^${escapeRegExp(packageName)}\\s+\\((.+?)\\)`, "m")
      );
      if (match) {
        // Take the first (latest) version
        const versions = match[1].split(",").map((v: string) => v.trim());
        if (versions[0]) {
          resolvedVersion = versions[0];
        }
      }
    } catch {
      // leave default
    }

    return {
      name: packageName,
      requestedVersion: "unknown",
      resolvedVersion,
      registryUrl: `https://rubygems.org/gems/${packageName}`,
      license: "unknown",
      integrityHash: "unknown",
      isDirect: true,
      directDependencies: [],
    };
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
