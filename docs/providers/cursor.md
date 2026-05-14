# Harness + Cursor

Cursor supports MCP servers via `.cursor/mcp.json`.

## Setup

```bash
harness init --provider cursor
```

This creates `.cursor/mcp.json` in your project:

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

Restart Cursor after setup. The Harness MCP server will appear in Cursor's MCP panel.
