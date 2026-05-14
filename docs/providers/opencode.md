# Harness + OpenCode

OpenCode reads MCP configuration from `opencode.json` in the project root.

## Setup

```bash
harness init --provider opencode
```

This creates or updates `opencode.json`:

```json
{
  "mcp": {
    "harness": {
      "command": "node",
      "args": ["~/.harness/server/index.js"],
      "env": { "HARNESS_PROJECT_DIR": "/path/to/project" }
    }
  }
}
```
