# Harness + Continue

Continue (the VS Code/JetBrains extension) supports MCP via `~/.continue/config.json`.

## Setup

```bash
harness init --provider continue
```

This merges Harness into your existing `~/.continue/config.json`:

```json
{
  "mcpServers": [
    {
      "name": "harness",
      "command": "node",
      "args": ["~/.harness/server/index.js"],
      "env": { "HARNESS_PROJECT_DIR": "/path/to/project" }
    }
  ]
}
```

Reload the Continue extension after setup.
