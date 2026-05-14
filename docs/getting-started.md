# Getting Started with Harness

Harness is a provider-agnostic AI memory system. It remembers your preferences, corrections, and knowledge across every AI session.

## Installation

```bash
npm install -g @harness/cli
# or
pnpm add -g @harness/cli
```

## Quick Start

```bash
# Initialize in your project
harness init

# Configure your AI provider
harness init --provider claude-code   # Claude Code
harness init --provider cursor        # Cursor
harness init --provider vscode        # VS Code Copilot
harness init --provider gemini        # Gemini CLI

# Save your first memory
harness save "I prefer TypeScript over JavaScript"
harness save "In this project we use tabs not spaces"

# See what's been saved
harness list

# Check status
harness status
```

## How It Works

Harness stores two types of memories:

- **Personal** (`~/.harness/personal/`) — your preferences across all projects
- **Project** (`.harness/project/`) — knowledge specific to the current codebase

Each memory is a markdown file with YAML frontmatter. The MCP server exposes your memories to AI providers via standardized tools.

## Supported Providers

| Provider | Type | Setup |
|---|---|---|
| Claude Code | MCP native | `harness init --provider claude-code` |
| Cursor | MCP native | `harness init --provider cursor` |
| VS Code Copilot | MCP native | `harness init --provider vscode` |
| Gemini CLI | MCP native | `harness init --provider gemini` |
| Windsurf | MCP native | `harness init --provider windsurf` |
| Continue | MCP native | `harness init --provider continue` |
| OpenCode | MCP native | `harness init --provider opencode` |
| Zed | MCP native | `harness init --provider zed` |
| Aider | Config file | `harness init --provider aider` |
| Amazon Q | MCP native | `harness init --provider amazon-q` |
| JetBrains AI | MCP native | `harness init --provider jetbrains` |
| Generic | Config file | `harness init --provider generic` |

## Commands Reference

```
harness init [--provider <name>] [--global]   Initialize Harness
harness save <content> [--scope personal|project] [--topic <topic>]
harness list [--scope personal|project]
harness show <id>
harness search <query>
harness status
harness edit <id>
harness move <id> --scope <scope>
harness delete <id>
harness consolidate [--scope personal|project] [--dry-run]
harness clear --scope <scope>
harness reset
harness export [--format markdown|json] [--output <file>]
harness import <file>
harness server start|stop|status|logs
```

## Consolidation

When your harness grows beyond 8,000 tokens, Harness automatically consolidates entries using Claude Haiku. Old entries are archived to `~/.harness/personal/archive/` or `.harness/project/archive/`.

You can trigger manually: `harness consolidate --dry-run` to preview.

Set `ANTHROPIC_API_KEY` in your environment for consolidation to work.
