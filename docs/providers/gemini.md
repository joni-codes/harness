# Harness + Gemini CLI

Gemini CLI supports MCP via `~/.gemini/settings.json`.

## Setup

```bash
harness init --provider gemini
```

This adds Harness to `~/.gemini/settings.json`:

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

The config is global. Change `HARNESS_PROJECT_DIR` per project when needed.
