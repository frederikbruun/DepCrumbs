import type { ParsedInstall } from "../parsers/types.js";
import type { PackageManager } from "../parsers/types.js";
import type { EnrichedInstall, EnrichedPackage, Enricher } from "./types.js";
import { NpmEnricher } from "./npm-enricher.js";
import { PipEnricher } from "./pip-enricher.js";
import { CargoEnricher } from "./cargo-enricher.js";
import { GoEnricher } from "./go-enricher.js";
import { GemEnricher } from "./gem-enricher.js";
import { ComposerEnricher } from "./composer-enricher.js";
import { BrewEnricher } from "./brew-enricher.js";

const enricherMap: Record<PackageManager, Enricher> = {
  npm: new NpmEnricher(),
  yarn: new NpmEnricher(),
  pnpm: new NpmEnricher(),
  pip: new PipEnricher(),
  uv: new PipEnricher(),
  cargo: new CargoEnricher(),
  go: new GoEnricher(),
  gem: new GemEnricher(),
  composer: new ComposerEnricher(),
  brew: new BrewEnricher(),
};

export async function enrich(
  parsed: ParsedInstall,
  cwd: string
): Promise<EnrichedInstall> {
  let packages: EnrichedPackage[] = [];

  try {
    const enricher = enricherMap[parsed.packageManager];
    packages = await enricher.enrich(parsed.packages, cwd);
  } catch {
    // If enrichment fails entirely, create stub entries
    packages = parsed.packages.map((name) => ({
      name,
      requestedVersion: "unknown",
      resolvedVersion: "unknown",
      registryUrl: "unknown",
      license: "unknown",
      integrityHash: "unknown",
      isDirect: true,
      directDependencies: [],
    }));
  }

  return {
    packageManager: parsed.packageManager,
    command: parsed.command,
    workingDirectory: cwd,
    timestamp: new Date().toISOString(),
    packages,
  };
}
