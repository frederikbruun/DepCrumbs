---
name: depcrumbs
description: Show the DepCrumbs dependency audit log — what packages were installed, when, by which manager, with license and version info.
---

Show the dependency audit trail logged by DepCrumbs.

1. Read the `.depcrumbs.json` file in the current project root (or `~/.depcrumbs/global.json` for the global log)
2. Format the entries as a clear, readable table with columns: Time, Manager, Package, Version, License
3. If the file doesn't exist or is empty, tell the user no installations have been tracked yet

If the user passes arguments like `--global`, show the global log instead.
