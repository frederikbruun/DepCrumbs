# DepTrace

Full audit trail for every package your AI assistant installs.

DepTrace hooks into Claude Code and automatically records every dependency installation with rich metadata -- version, license, registry source, integrity hash, and dependency tree. Never lose track of what got installed, when, or why.

## Features

- **Automatic tracking** via Claude Code PostToolUse hooks -- zero manual effort
- **10 package managers**: npm, yarn, pnpm, pip, uv, cargo, go, gem, composer, brew
- **Full metadata**: version, license, registry URL, integrity hash, dependency tree
- **JSON and Markdown** output formats
- **Per-project and global** tracking
- **Standalone CLI** for viewing, exporting, and managing audit trails

## Quick Start

### Option 1: Claude Code Plugin

Install DepTrace as a Claude Code plugin for automatic tracking:

```bash
claude plugin add deptrace
```

The plugin registers a PostToolUse hook on Bash that detects install commands automatically.

### Option 2: Standalone CLI

```bash
npm install -g deptrace
deptrace setup
```

`deptrace setup` configures the Claude Code hooks in your environment so tracking begins immediately.

## How It Works

1. A **PostToolUse hook** fires after every Bash tool invocation in Claude Code
2. The hook **parses the command** to detect package install operations (e.g., `npm install`, `pip install`, `cargo add`)
3. Detected packages are **enriched** with metadata from their respective registries (npm registry, PyPI, crates.io, etc.)
4. The complete audit record is **stored** as a JSON or Markdown file in your project's `.deptrace/` directory

## CLI Commands

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `deptrace init`    | Create a `.deptrace.config.json` in the current project |
| `deptrace setup`   | Configure Claude Code hooks for automatic tracking |
| `deptrace log`     | View the audit trail for the current project |
| `deptrace export`  | Export audit data as JSON or CSV         |
| `deptrace status`  | Check hook health and configuration      |

## Configuration

Create a `.deptrace.config.json` in your project root (or run `deptrace init`):

```json
{
  "format": "json",
  "enrichment": {
    "license": true,
    "integrity": true,
    "dependencyTree": true
  },
  "ignore": []
}
```

| Option                      | Default  | Description                                    |
| --------------------------- | -------- | ---------------------------------------------- |
| `format`                    | `"json"` | Output format: `"json"` or `"markdown"`        |
| `enrichment.license`        | `true`   | Fetch license info from registry               |
| `enrichment.integrity`      | `true`   | Fetch integrity/checksum hash                  |
| `enrichment.dependencyTree` | `true`   | Resolve transitive dependencies                |
| `ignore`                    | `[]`     | Package name patterns to skip                  |

## Output Formats

### JSON

```json
{
  "timestamp": "2025-01-15T10:32:00Z",
  "command": "npm install express",
  "packages": [
    {
      "name": "express",
      "version": "4.21.2",
      "manager": "npm",
      "license": "MIT",
      "registry": "https://registry.npmjs.org/express",
      "integrity": "sha512-...",
      "dependencies": ["accepts", "body-parser", "..."]
    }
  ]
}
```

### Markdown

```markdown
## 2025-01-15 10:32 — npm install express

| Field      | Value                                    |
| ---------- | ---------------------------------------- |
| Package    | express                                  |
| Version    | 4.21.2                                   |
| Manager    | npm                                      |
| License    | MIT                                      |
| Integrity  | sha512-...                               |
```

## Roadmap

- SBOM export (CycloneDX / SPDX)
- Vulnerability scanning integration (OSV, Snyk)
- Dashboard UI for browsing audit history
- Team-shared audit trails via remote storage
- Policy enforcement (block unlicensed or GPL packages)
- Support for additional package managers (apt, dnf, nix)

## License

MIT -- see [LICENSE](LICENSE) for details.
