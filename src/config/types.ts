export interface DepCrumbsConfig {
  format: "json" | "markdown";
  enrichment: {
    license: boolean;
    integrity: boolean;
    dependencyTree: boolean;
  };
  ignore: string[];
}

export const DEFAULT_CONFIG: DepCrumbsConfig = {
  format: "json",
  enrichment: { license: true, integrity: true, dependencyTree: true },
  ignore: [],
};
