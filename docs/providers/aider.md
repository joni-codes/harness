# Harness + Aider

Aider doesn't support MCP natively. Harness integrates via `.aider.conf.yml` using Aider's `read` option to inject harness context files.

## Setup

```bash
harness init --provider aider
```

This creates `.aider.conf.yml`:

```yaml
mcp:
  harness:
    command: node
    args:
      - ~/.harness/server/index.js
    env:
      HARNESS_PROJECT_DIR: /path/to/project
```

For Aider versions without MCP support, you can use `--read ~/.harness/personal/INDEX.md` to inject your personal index directly.
