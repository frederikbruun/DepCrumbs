<div align="center">

<img src="docs/logo.svg" alt="DepTrace" width="140">

# DepTrace

**Every install leaves a trail.**

Full audit trail for every package your AI assistant installs — automatically.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/deptrace.svg)](https://www.npmjs.com/package/deptrace)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

[Website](https://frederikbruun.github.io/DepTrace) · [Getting Started](#getting-started) · [How It Works](#how-it-works) · [Roadmap](#roadmap)

</div>

---

DepTrace hooks into Claude Code and records every dependency installation with rich metadata — version, license, registry source, integrity hash, and dependency tree. Across **10 package managers**. With **zero configuration**.

```
$ npm install express lodash
[DepTrace] express@4.21.0 — MIT — sha512-abc...
[DepTrace] lodash@4.17.21 — MIT — sha512-def...
Saved to .deptrace.json
```

## Why?

When AI assistants install packages on your behalf, you lose visibility. DepTrace gives it back:

- **What** was installed — exact package, exact version
- **Where** it came from — registry URL and integrity hash
- **What license** it uses — MIT? GPL? Unknown?
- **What it depends on** — full dependency tree
- **When and how** — timestamp, command, working directory

## Getting Started

### Claude Code Plugin

```bash
claude plugin add deptrace
```

That's it. Hook is configured automatically.

### Standalone CLI

```bash
npm install -g deptrace
deptrace setup
```

`setup` adds a PostToolUse hook to `~/.claude/settings.json`. Tracking begins immediately.

## Supported Package Managers

| Manager | Install Commands | Registry |
|---------|-----------------|----------|
| **npm** | `npm install`, `npm i`, `npm add`, `npm ci` | npmjs.org |
| **yarn** | `yarn add`, `yarn install` | npmjs.org |
| **pnpm** | `pnpm add`, `pnpm install` | npmjs.org |
| **pip** | `pip install`, `pip3 install`, `python -m pip install` | PyPI |
| **uv** | `uv add`, `uv pip install` | PyPI |
| **cargo** | `cargo add`, `cargo install` | crates.io |
| **go** | `go get`, `go install` | proxy.golang.org |
| **gem** | `gem install` | rubygems.org |
| **composer** | `composer require` | packagist.org |
| **brew** | `brew install`, `brew reinstall` | formulae.brew.sh |

## How It Works

```
Claude Code runs "npm install express"
         │
         ▼
   PostToolUse hook fires
         │
         ▼
   Parser detects install command
         │
         ▼
   Enricher fetches metadata from registry
         │
         ▼
   Storage writes to .deptrace.json + ~/.deptrace/
```

1. **Hook** — A PostToolUse hook on Bash fires after every command
2. **Parse** — Detects install commands across all 10 managers
3. **Enrich** — Fetches license, version, hash, and deps from the registry
4. **Store** — Writes per-project `.deptrace.json` and global `~/.deptrace/global.json`

## CLI

```bash
deptrace init          # Create .deptrace.config.json
deptrace setup         # Configure Claude Code hooks
deptrace log           # View audit trail (--since, --package, --manager filters)
deptrace export        # Export as JSON or CSV (--csv)
deptrace status        # Health check — is the hook installed?
```

## Output

### JSON (default)

```json
{
  "timestamp": "2026-04-14T20:15:00.000Z",
  "packageManager": "npm",
  "command": "npm install express",
  "packages": [{
    "name": "express",
    "resolvedVersion": "4.21.0",
    "license": "MIT",
    "registryUrl": "https://registry.npmjs.org/express",
    "integrityHash": "sha512-...",
    "isDirect": true,
    "directDependencies": ["accepts", "body-parser", "..."]
  }]
}
```

### Markdown

```markdown
## 2026-04-14T20:15:00.000Z

- **Package Manager:** npm
- **Command:** `npm install express`

| Package | Version | License | Registry | Hash |
|---------|---------|---------|----------|------|
| express | 4.21.0  | MIT     | npmjs    | sha512-... |
```

## Configuration

```bash
deptrace init
```

Creates `.deptrace.config.json`:

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

Set `"format": "markdown"` for human-readable output.

## Roadmap

- **Multi-tool support** — Codex CLI, Warp, terminal integrations
- **SBOM export** — CycloneDX and SPDX formats
- **Vulnerability scanning** — Cross-reference against CVE databases
- **Dashboard UI** — Browse dependency history in a web interface
- **Team audit logs** — Shared trails with role-based access
- **Policy enforcement** — Block packages that violate license policies

## Contributing

Contributions are welcome! See the [testing guide](docs/TESTING-GUIDE.md) for how to set up a local development environment.

## License

[MIT](LICENSE)
