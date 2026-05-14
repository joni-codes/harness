# Harness + Claude Code

Claude Code supports MCP natively. Harness integrates via `.mcp.json` in your project root.

## Setup

```bash
harness init --provider claude-code
```

This writes `.mcp.json` in your project directory:

```json
{
  "mcpServers": {
    "harness": {
      "command": "node",
      "args": ["~/.harness/server/index.js"],
      "env": { "HARNESS_PROJECT_DIR": "/path/to/project" }
    }
  }
}
```

## Usage

Once configured, Claude Code automatically loads your harness context at session start. The AI can call:

- `harness_save` — save a new memory
- `harness_context` — retrieve your system prompt + index
- `harness_list` — list all memories
- `harness_consolidate` — trigger consolidation
