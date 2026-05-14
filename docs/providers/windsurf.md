# Harness + Windsurf

Windsurf reads MCP config from `~/.codeium/windsurf/mcp_config.json`.

## Setup

```bash
harness init --provider windsurf
```

This creates or updates `~/.codeium/windsurf/mcp_config.json`:

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

Restart Windsurf after setup.
