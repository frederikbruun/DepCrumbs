import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { DEFAULT_CONFIG } from "../../config/index.js";

export function initCommand(): void {
  const cwd = process.cwd();
  const configPath = resolve(cwd, ".depcrumbs.config.json");

  if (existsSync(configPath)) {
    console.log(`Config already exists at ${configPath}`);
    return;
  }

  writeFileSync(
    configPath,
    JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n",
    "utf-8",
  );
  console.log(`Created ${configPath}`);
}
