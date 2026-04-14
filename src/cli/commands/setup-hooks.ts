import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
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

export function setupHooksCommand(): void {
  const settingsPath = resolve(homedir(), ".claude", "settings.json");

  let settings: ClaudeSettings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, "utf-8")) as ClaudeSettings;
    } catch {
      console.error(`Failed to parse ${settingsPath}`);
      process.exit(1);
    }
  } else {
    mkdirSync(dirname(settingsPath), { recursive: true });
  }

  if (!settings.hooks) {
    settings.hooks = {};
  }
  if (!settings.hooks.PostToolUse) {
    settings.hooks.PostToolUse = [];
  }

  const hookCommand = "depcrumbs --hook";

  // Check if hook is already configured
  const existing = settings.hooks.PostToolUse.find((entry) =>
    entry.hooks?.some((h) => h.command === hookCommand),
  );

  if (existing) {
    console.log("DepCrumbs hook is already configured in ~/.claude/settings.json");
    return;
  }

  settings.hooks.PostToolUse.push({
    matcher: "Bash",
    hooks: [
      {
        type: "command",
        command: hookCommand,
        async: true,
      },
    ],
  });

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
  console.log("Added DepCrumbs PostToolUse hook to ~/.claude/settings.json");
}
