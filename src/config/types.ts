export interface DepTraceConfig {
  format: "json" | "markdown";
  enrichment: {
    license: boolean;
    integrity: boolean;
    dependencyTree: boolean;
  };
  ignore: string[];
}

export const DEFAULT_CONFIG: DepTraceConfig = {
  format: "json",
  enrichment: { license: true, integrity: true, dependencyTree: true },
  ignore: [],
};
