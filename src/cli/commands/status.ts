import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

interface ClaudeSettings {
  hooks?: {
    PostToolUse?: Array<{
      matcher: string;
      hooks: Array<{
        type: string;
        command: string;
        async?: boolean;
      }>;
    }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function statusCommand(): void {
  const settingsPath = resolve(homedir(), ".claude", "settings.json");

  console.log("DepCrumbs Status");
  console.log("===============\n");

  // Check settings file
  if (!existsSync(settingsPath)) {
    console.log("Claude settings: NOT FOUND");
    console.log(`  Expected at: ${settingsPath}`);
    console.log('  Run "depcrumbs setup" to configure.\n');
    return;
  }

  let settings: ClaudeSettings;
  try {
    settings = JSON.parse(readFileSync(settingsPath, "utf-8")) as ClaudeSettings;
  } catch {
    console.log("Claude settings: PARSE ERROR");
    console.log(`  File at: ${settingsPath}`);
    return;
  }

  // Check hook configuration
  const postToolUse = settings.hooks?.PostToolUse;
  if (!postToolUse || postToolUse.length === 0) {
    console.log("Hook status: NOT CONFIGURED");
    console.log('  Run "depcrumbs setup" to add the PostToolUse hook.\n');
    return;
  }

  const depcrumbsHook = postToolUse.find((entry) =>
    entry.hooks?.some((h) => h.command.includes("depcrumbs")),
  );

  if (depcrumbsHook) {
    console.log("Hook status: CONFIGURED");
    console.log(`  Matcher: ${depcrumbsHook.matcher}`);
    const hookEntry = depcrumbsHook.hooks.find((h) =>
      h.command.includes("depcrumbs"),
    );
    if (hookEntry) {
      console.log(`  Command: ${hookEntry.command}`);
      console.log(`  Async: ${hookEntry.async ?? false}`);
    }
  } else {
    console.log("Hook status: NOT CONFIGURED");
    console.log('  Run "depcrumbs setup" to add the PostToolUse hook.');
  }

  // Check local config
  const cwd = process.cwd();
  const localConfig = resolve(cwd, ".depcrumbs.config.json");
  if (existsSync(localConfig)) {
    console.log(`\nLocal config: ${localConfig}`);
  } else {
    console.log("\nLocal config: not found (using defaults)");
  }

  // Check global storage
  const globalStorage = resolve(homedir(), ".depcrumbs");
  if (existsSync(globalStorage)) {
    console.log(`Global storage: ${globalStorage}`);
  } else {
    console.log("Global storage: not yet created");
  }

  console.log();
}
