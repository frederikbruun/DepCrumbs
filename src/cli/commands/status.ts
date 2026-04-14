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

  console.log("DepTrace Status");
  console.log("===============\n");

  // Check settings file
  if (!existsSync(settingsPath)) {
    console.log("Claude settings: NOT FOUND");
    console.log(`  Expected at: ${settingsPath}`);
    console.log('  Run "deptrace setup" to configure.\n');
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
    console.log('  Run "deptrace setup" to add the PostToolUse hook.\n');
    return;
  }

  const deptraceHook = postToolUse.find((entry) =>
    entry.hooks?.some((h) => h.command.includes("deptrace")),
  );

  if (deptraceHook) {
    console.log("Hook status: CONFIGURED");
    console.log(`  Matcher: ${deptraceHook.matcher}`);
    const hookEntry = deptraceHook.hooks.find((h) =>
      h.command.includes("deptrace"),
    );
    if (hookEntry) {
      console.log(`  Command: ${hookEntry.command}`);
      console.log(`  Async: ${hookEntry.async ?? false}`);
    }
  } else {
    console.log("Hook status: NOT CONFIGURED");
    console.log('  Run "deptrace setup" to add the PostToolUse hook.');
  }

  // Check local config
  const cwd = process.cwd();
  const localConfig = resolve(cwd, ".deptrace.config.json");
  if (existsSync(localConfig)) {
    console.log(`\nLocal config: ${localConfig}`);
  } else {
    console.log("\nLocal config: not found (using defaults)");
  }

  // Check global storage
  const globalStorage = resolve(homedir(), ".deptrace");
  if (existsSync(globalStorage)) {
    console.log(`Global storage: ${globalStorage}`);
  } else {
    console.log("Global storage: not yet created");
  }

  console.log();
}
