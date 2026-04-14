export type PackageManager =
  | "npm"
  | "yarn"
  | "pnpm"
  | "pip"
  | "uv"
  | "cargo"
  | "go"
  | "gem"
  | "composer"
  | "brew";

export interface ParsedInstall {
  packageManager: PackageManager;
  packages: string[];
  command: string;
  flags: string[];
  isDev: boolean;
  isGlobal: boolean;
}

export interface Parser {
  detect(command: string): ParsedInstall | null;
}
