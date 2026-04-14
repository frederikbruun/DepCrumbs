#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { setupHooksCommand } from "./commands/setup-hooks.js";
import { logCommand } from "./commands/log.js";
import { exportCommand } from "./commands/export.js";
import { statusCommand } from "./commands/status.js";

const program = new Command();

program
  .name("deptrace")
  .description(
    "Dependency tracking and audit trail for every package installation",
  )
  .version("1.0.0");

// --hook flag: run hook-handler directly (reads stdin)
program.option("--hook", "Run the PostToolUse hook handler (reads JSON from stdin)");

program
  .command("init")
  .description("Create a .deptrace.config.json in the current directory")
  .action(() => {
    initCommand();
  });

program
  .command("setup")
  .description("Add DepTrace hook to ~/.claude/settings.json")
  .action(() => {
    setupHooksCommand();
  });

program
  .command("log")
  .description("Show recorded dependency installations")
  .option("-g, --global", "Show global log instead of project-local")
  .option("--since <date>", "Only show entries after this date")
  .option("--package <name>", "Filter by package name")
  .option("--manager <name>", "Filter by package manager")
  .action(async (options: {
    global?: boolean;
    since?: string;
    package?: string;
    manager?: string;
  }) => {
    await logCommand(options);
  });

program
  .command("export")
  .description("Export dependency log as JSON or CSV")
  .option("--csv", "Output as CSV instead of JSON")
  .option("-g, --global", "Export global log instead of project-local")
  .action(async (options: { csv?: boolean; global?: boolean }) => {
    await exportCommand(options);
  });

program
  .command("status")
  .description("Check if DepTrace hooks are configured")
  .action(() => {
    statusCommand();
  });

// Handle --hook flag before parsing subcommands
const args = process.argv.slice(2);
if (args.includes("--hook")) {
  // Dynamically import and run the hook handler
  import("../hook-handler.js").catch(() => {
    /* never crash */
  });
} else {
  program.parse();
}
