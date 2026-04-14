# DepCrumbs

Dependency audit trail for Claude Code.

## Build & Test

```bash
npm install
npm run build
npm test
```

## Architecture

- `src/parsers/` — one parser per package manager, detects install commands
- `src/enrichers/` — fetches metadata from registries (license, hash, deps)
- `src/storage/` — JSON and Markdown storage backends
- `src/cli/` — standalone CLI (depcrumbs init/setup/log/export/status)
- `hooks/` — Claude Code PostToolUse hook on Bash

## Key Patterns

- All parsers implement `Parser` interface from `src/parsers/types.ts`
- All enrichers return `EnrichedPackage[]` from `src/enrichers/types.ts`
- Storage backends implement `StorageBackend` from `src/storage/types.ts`
- Hook handler never throws — fault-tolerant with "unknown" fallbacks
