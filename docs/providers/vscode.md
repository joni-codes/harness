# Harness + VS Code (GitHub Copilot)

VS Code with GitHub Copilot supports MCP via `.vscode/mcp.json`.

## Setup

```bash
harness init --provider vscode
```

This creates `.vscode/mcp.json`:

```json
{
  "servers": {
    "harness": {
      "type": "stdio",
      "command": "node",
      "args": ["~/.harness/server/index.js"],
      "env": { "HARNESS_PROJECT_DIR": "/path/to/project" }
    }
  }
}
```

Reload VS Code and enable the Harness server in the Copilot MCP panel.
