# Harness

**Provider-agnostic AI memory and learning system.**

Harness makes your AI remember. Every time you correct it, share a preference, or explain how your project works, Harness saves that knowledge and injects it back at the start of every future session — across every AI tool you use.

Works with Claude Code, Cursor, VS Code Copilot, Gemini CLI, Windsurf, Continue, OpenCode, Zed, Aider, Amazon Q, and JetBrains AI.

---

## Why

AI models forget everything between sessions. You spend the first few minutes of every conversation re-explaining your preferences, your project conventions, and the corrections you've already given a dozen times.

Harness fixes this. It's a lightweight MCP server that persists your knowledge to local markdown files and surfaces it automatically when you start a new session.

---

## How It Works

### The two-scope model

Every piece of knowledge lives in one of two places:

| Scope | Location | What goes here |
|---|---|---|
| **Personal** | `~/.harness/personal/` | Your preferences, style, habits — things that follow you across every project |
| **Project** | `.harness/project/` | Conventions, architecture decisions, API patterns — specific to the current codebase |

Harness auto-detects which scope to use based on the language in what you save:
- "I prefer TypeScript over JavaScript" → **personal**
- "In this codebase we use tabs" → **project**

You can always override with `--scope personal` or `--scope project`.

### The flow

```
You correct the AI  →  Harness saves it  →  Next session starts
                                          →  AI calls harness_context
                                          →  Your knowledge is injected
                                          →  AI already knows everything
```

### MCP tools

The Harness MCP server exposes four tools to AI providers:

| Tool | What it does |
|---|---|
| `harness_save` | Save a correction, preference, or learning. AI calls this silently when you correct it. |
| `harness_context` | Load all saved knowledge as a system prompt + index. Called at session start. |
| `harness_list` | List all saved entries across scopes. |
| `harness_consolidate` | Merge and summarize entries when the harness grows large. |

### Auto-save detection

When the AI receives a correction or preference from you, it calls `harness_save` automatically — no explicit command needed. The detection is keyword-based:

- "I prefer...", "always...", "never...", "from now on..." → saved as personal
- "in this project...", "our codebase uses...", "this repo..." → saved as project

You can also save explicitly: `harness save "always use const over let"`.

### Consolidation

When your harness grows beyond **8,000 tokens**, it automatically consolidates using Claude Haiku. Entries are grouped by topic, summarized, and the originals are archived to `archive/YYYY-MM-DD/`. Nothing is deleted — everything is recoverable.

---

## Installation

```bash
npm install -g @jonicodes/harness-cli
# or
pnpm add -g @jonicodes/harness-cli
```

> Requires Node.js 18+. Set `ANTHROPIC_API_KEY` in your environment for consolidation to work.

---

## Quick Start

```bash
# 1. Initialize in your project
cd your-project
harness init

# 2. Wire up your AI provider
harness init --provider claude-code   # or cursor, vscode, gemini, etc.

# 3. Start a new AI session — Harness injects your knowledge automatically

# Save things manually any time
harness save "I prefer functional components over class components"
harness save "Our API uses snake_case for all response fields" --scope project
```

---

## Provider Setup

Run `harness init --provider <name>` to generate the correct config file for your AI tool.

| Provider | Command | Config location |
|---|---|---|
| Claude Code | `--provider claude-code` | `.mcp.json` |
| Cursor | `--provider cursor` | `.cursor/mcp.json` |
| VS Code Copilot | `--provider vscode` | `.vscode/mcp.json` |
| Gemini CLI | `--provider gemini` | `~/.gemini/settings.json` |
| Windsurf | `--provider windsurf` | `~/.codeium/windsurf/mcp_config.json` |
| Continue | `--provider continue` | `~/.continue/config.json` |
| OpenCode | `--provider opencode` | `opencode.json` |
| Zed | `--provider zed` | `~/.config/zed/settings.json` |
| Aider | `--provider aider` | `.aider.conf.yml` |
| Amazon Q | `--provider amazon-q` | `~/.aws/amazonq/mcp.json` |
| JetBrains AI | `--provider jetbrains` | `~/.config/JetBrains/mcp.json` |
| Generic MCP | `--provider generic` | `.harness/mcp-config.json` |

Provider-specific setup guides are in [`docs/providers/`](docs/providers/).

---

## CLI Reference

### Init

```bash
harness init                          # Initialize personal + project dirs, auto-detect daemon
harness init --provider claude-code   # Also write provider config file
harness init --global                 # Personal scope only (no project dir)
harness init --no-daemon              # Skip daemon auto-install
```

### Save

```bash
harness save "your knowledge here"
harness save "our API uses REST" --scope project
harness save "I prefer tabs" --scope personal --topic style
```

### List & Search

```bash
harness list                          # List all entries
harness list --scope personal         # Personal only
harness list --scope project          # Project only
harness search "typescript"           # Full-text search
harness show <id>                     # Show full entry content
```

### Edit & Manage

```bash
harness edit <id>                     # Open entry in $EDITOR
harness move <id> --scope project     # Move entry between scopes
harness delete <id>                   # Delete an entry (prompts y/N)
```

### Consolidation

```bash
harness consolidate                   # Consolidate current scope
harness consolidate --scope personal  # Personal only
harness consolidate --scope project   # Project only
harness consolidate --dry-run         # Preview without writing
harness status                        # Show entry count + token usage per scope
```

### Import / Export

```bash
harness export                        # Export as markdown (stdout)
harness export --format json          # Export as JSON
harness export --output backup.md     # Write to file
harness import backup.md              # Import from file
```

### Nuclear Options

```bash
harness clear --scope personal        # Delete all personal entries (prompts "yes")
harness clear --scope project         # Delete all project entries (prompts "yes")
harness reset                         # Wipe everything — all scopes, all archives (prompts "reset")
```

### Config

```bash
harness config show                          # View merged config (global + project)
harness config set <key> <value>             # Set a global config value
harness config set <key> <value> --scope project  # Set a project-level override
harness config reset                         # Reset global config to defaults
harness config reset --scope project         # Reset project config to defaults
```

### Server / Daemon

```bash
harness server start                  # Start MCP server daemon
harness server stop                   # Stop daemon
harness server status                 # Show daemon status
harness server logs                   # Tail daemon logs
```

The daemon is auto-managed: `harness init` installs it via launchd (macOS), systemd (Linux), or Windows Service (Windows). You never need to start it manually.

---

## File Format

Each entry is a plain markdown file with YAML frontmatter:

```markdown
---
id: df7a2fe7
created: 2026-05-15T00:25:36.000Z
updated: 2026-05-15T00:25:36.000Z
scope: personal
topic: style
source: auto
confidence: high
---

I prefer explicit TypeScript types over type inference
```

Files are named `<slug>-<id>.md` and stored flat in the scope directory. An `INDEX.md` is rebuilt after every save/delete and contains a summary of all entries — this is what gets injected as context.

---

## Architecture

```
packages/
  core/          Types, FileStore, ScopeResolver, Deduplicator, TokenCounter, ConsolidationEngine
  mcp-server/    MCP server exposing 4 tools to AI providers
  cli/           harness CLI (15 commands)
```

### Deduplication

Before saving, Harness checks if the new content is too similar to an existing entry using Jaccard similarity on word tokens. The default threshold is 0.6 (60% overlap). Duplicate saves are silently skipped.

### Scope resolution

The scope resolver scans the content for signal phrases:

- **Project signals**: "in this repo", "in this codebase", "our api", "our stack", "this service", ...
- **Personal signals**: "i prefer", "my style", "always", "never", "from now on", ...

If no signal matches, defaults to **personal**.

### Consolidation engine

When token count exceeds the threshold (default 8,000):

1. All entries are grouped by topic
2. Each group is sent to Claude Haiku with a summarization prompt
3. The AI rewrites the group as a single concise entry
4. Original files are copied to `archive/YYYY-MM-DD/<scope>/` before deletion
5. The new consolidated entry replaces the group

---

## Configuration

Harness has two config files that layer on top of each other:

| File | Scope |
|---|---|
| `~/.harness/config.json` | Global — applies to all projects |
| `.harness/config.json` | Project — overrides global for this project |

Neither file is required. If they don't exist, defaults are used.

```bash
harness config show                                          # view merged config
harness config set consolidation.token_threshold 5000        # set globally
harness config set consolidation.model claude-opus-4-7       # use a stronger model
harness config set consolidation.archive false               # disable archiving globally
harness config set consolidation.token_threshold 3000 --scope project  # project override
harness config reset                                         # reset global to defaults
harness config reset --scope project                         # reset project to defaults
```

| Key | Default | Description |
|---|---|---|
| `consolidation.token_threshold` | `8000` | Token count before auto-consolidation triggers |
| `consolidation.model` | `claude-haiku-4-5` | AI model used for consolidation |
| `consolidation.archive` | `true` | Archive entries before consolidating |

Set `ANTHROPIC_API_KEY` to enable consolidation.

---

## Repository Structure

```
harness/
  packages/
    core/                   Core library (types, storage, engine)
      src/
        types.ts
        fileStore.ts
        scopeResolver.ts
        deduplicator.ts
        tokenCounter.ts
        consolidationEngine.ts
      tests/
    mcp-server/             MCP server
      src/
        server.ts
        tools/
          harnessSave.ts
          harnessContext.ts
          harnessList.ts
          harnessConsolidate.ts
      tests/
    cli/                    CLI
      src/
        index.ts            Entry point
        commands/           15 commands
        daemon/             launchd / systemd / Windows Service
      tests/
  docs/
    getting-started.md
    providers/              12 provider-specific guides
  .mcp.json                 Harness dogfoods itself (Claude Code config)
```

---

## Development

```bash
git clone https://github.com/joni-codes/harness
cd harness
pnpm install

# Build all packages
pnpm -r build

# Run tests
cd packages/core && node ../../node_modules/vitest/vitest.mjs run
cd packages/mcp-server && node ../../node_modules/vitest/vitest.mjs run
cd packages/cli && node ../../node_modules/vitest/vitest.mjs run
```

---

## License

MIT
