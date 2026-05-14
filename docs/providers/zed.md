# Harness + Zed

Zed supports context servers (MCP) via `~/.config/zed/settings.json`.

## Setup

```bash
harness init --provider zed
```

This merges Harness into `~/.config/zed/settings.json`:

```json
{
  "context_servers": {
    "harness": {
      "command": "node",
      "args": ["~/.harness/server/index.js"],
      "env": { "HARNESS_PROJECT_DIR": "/path/to/project" }
    }
  }
}
```

Restart Zed after setup.
