import { resolve, dirname } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";

export function findGitRoot(startDir: string): string | null {
  let dir = resolve(startDir);
  while (true) {
    if (existsSync(resolve(dir, ".git"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}

export function getProjectStoragePath(
  cwd: string,
  format: "json" | "markdown",
): string {
  const ext = format === "json" ? ".depcrumbs.json" : ".depcrumbs.md";
  const gitRoot = findGitRoot(cwd);
  const base = gitRoot ?? cwd;
  return resolve(base, ext);
}

export function getGlobalStoragePath(format: "json" | "markdown"): string {
  const filename = format === "json" ? "global.json" : "global.md";
  return resolve(homedir(), ".depcrumbs", filename);
}

export function ensureDir(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true });
}
