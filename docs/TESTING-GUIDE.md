# DepTrace — Testguide

Denne guide hjælper dig med at teste DepTrace end-to-end, fra unit tests til en rigtig Claude Code-session.

---

## 1. Unit Tests

Kør alle 43 parser-tests:

```bash
cd ~/CascadeProjects/DepTrace
npm test
```

Forventet output: `Tests 43 passed (43)`

---

## 2. Build

Kompiler TypeScript til JavaScript:

```bash
npm run build
```

Tjek at `dist/` mappen blev oprettet med alle filer:

```bash
ls dist/hook-handler.js dist/cli/index.js dist/parsers/index.js
```

---

## 3. Test CLI'en lokalt

Uden at installere globalt kan du køre CLI'en direkte:

```bash
# Se hjælp
node dist/cli/index.js --help

# Opret config i et testprojekt
mkdir /tmp/deptrace-test && cd /tmp/deptrace-test
node ~/CascadeProjects/DepTrace/dist/cli/index.js init
cat .deptrace.config.json

# Tjek status (vil rapportere at hooks ikke er sat op endnu)
node ~/CascadeProjects/DepTrace/dist/cli/index.js status
```

---

## 4. Test hook-handleren manuelt

Du kan simulere hvad Claude Code sender til hook'en ved at pipe JSON til stdin:

```bash
cd /tmp/deptrace-test

# Simuler en npm install kommando
echo '{"tool_name":"Bash","tool_input":{"command":"npm install express"}}' | \
  node ~/CascadeProjects/DepTrace/dist/hook-handler.js

# Tjek om .deptrace.json blev oprettet
cat .deptrace.json
```

**Bemærk:** Enrichment kræver at `express` faktisk er installeret (node_modules skal eksistere). For en fuld test:

```bash
cd /tmp/deptrace-test
npm init -y
npm install express

# Kør hook-handleren igen
echo '{"tool_name":"Bash","tool_input":{"command":"npm install express"}}' | \
  node ~/CascadeProjects/DepTrace/dist/hook-handler.js

# Nu bør .deptrace.json have fulde metadata (version, license, hash)
cat .deptrace.json | python3 -m json.tool
```

---

## 5. Test med andre package managers

```bash
# pip
echo '{"tool_name":"Bash","tool_input":{"command":"pip install requests"}}' | \
  node ~/CascadeProjects/DepTrace/dist/hook-handler.js

# brew
echo '{"tool_name":"Bash","tool_input":{"command":"brew install jq"}}' | \
  node ~/CascadeProjects/DepTrace/dist/hook-handler.js

# Kommandoer der IKKE skal trigge (ingen output forventet)
echo '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | \
  node ~/CascadeProjects/DepTrace/dist/hook-handler.js

echo '{"tool_name":"Bash","tool_input":{"command":"ls -la"}}' | \
  node ~/CascadeProjects/DepTrace/dist/hook-handler.js
```

---

## 6. Test som Claude Code hook (live!)

### 6a. Manuel hook-opsætning

Tilføj dette til din `~/.claude/settings.json` under `"hooks"`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node /Users/frederikbruun/CascadeProjects/DepTrace/dist/hook-handler.js",
            "async": true
          }
        ]
      }
    ]
  }
}
```

### 6b. Test i en Claude Code session

1. Start en ny Claude Code session i et testprojekt
2. Bed Claude om at installere en package: *"Installer express med npm"*
3. Tjek om `.deptrace.json` blev oprettet i projektmappen
4. Tjek om `~/.deptrace/global.json` også fik en entry

### 6c. Fjern hook igen

Fjern `PostToolUse`-blokken fra `~/.claude/settings.json` når du er færdig med at teste.

---

## 7. Test log og export

```bash
cd /tmp/deptrace-test

# Se audit log
node ~/CascadeProjects/DepTrace/dist/cli/index.js log

# Eksporter som JSON
node ~/CascadeProjects/DepTrace/dist/cli/index.js export

# Eksporter som CSV
node ~/CascadeProjects/DepTrace/dist/cli/index.js export --csv
```

---

## 8. Test Markdown output

```bash
cd /tmp/deptrace-test

# Opret config med markdown format
echo '{"format":"markdown","enrichment":{"license":true,"integrity":true,"dependencyTree":true},"ignore":[]}' > .deptrace.config.json

# Kør hook igen
echo '{"tool_name":"Bash","tool_input":{"command":"npm install lodash"}}' | \
  node ~/CascadeProjects/DepTrace/dist/hook-handler.js

# Tjek markdown output
cat .deptrace.md
```

---

## 9. Test compound commands

```bash
# Flere installationer i én kommando
echo '{"tool_name":"Bash","tool_input":{"command":"npm install express && pip install requests"}}' | \
  node ~/CascadeProjects/DepTrace/dist/hook-handler.js

# Bør logge begge installationer
cat .deptrace.json | python3 -m json.tool
```

---

## Fejlfinding

| Problem | Løsning |
|---------|---------|
| `dist/` mangler | Kør `npm run build` |
| Hook giver ingen output | Kommandoen var ikke en install — det er forventet! |
| Enrichment viser "unknown" | Package er ikke installeret lokalt — installer den først |
| Global log mangler | Tjek at `~/.deptrace/` mappen eksisterer |
| Hook crasher | Bør aldrig ske — tjek `node dist/hook-handler.js` manuelt |

---

## Oprydning

```bash
rm -rf /tmp/deptrace-test
```
