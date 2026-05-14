# Harness + Amazon Q Developer

Amazon Q Developer supports MCP via `~/.aws/amazonq/mcp.json`.

## Setup

```bash
harness init --provider amazon-q
```

This creates `~/.aws/amazonq/mcp.json`:

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

Restart Amazon Q Developer after setup.
