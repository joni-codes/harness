# Harness + Generic MCP Client

Any MCP-compatible client can connect to the Harness MCP server.

## Server details

```
Transport: stdio
Command: node ~/.harness/server/index.js
Environment: HARNESS_PROJECT_DIR=/path/to/your/project
```

## Available tools

| Tool | Description |
|---|---|
| `harness_save` | Save a memory (content, scope?, topic?) |
| `harness_context` | Get system prompt + memory index |
| `harness_list` | List all memories |
| `harness_consolidate` | Trigger consolidation |

## Setup

```bash
harness init --provider generic
```

This creates `.harness/mcp-config.json` with the server configuration.

Consult your AI client's documentation for how to register an MCP server using this config.
