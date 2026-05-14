# Harness + JetBrains AI

JetBrains AI supports MCP via `~/.config/JetBrains/mcp.json`.

## Setup

```bash
harness init --provider jetbrains
```

This creates `~/.config/JetBrains/mcp.json`:

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

Restart your JetBrains IDE after setup.
