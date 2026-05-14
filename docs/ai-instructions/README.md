# AI Instructions Snippets

These snippets tell your AI to automatically call `harness_save` whenever you correct it or state a preference — without you having to ask.

**Automatic:** Run `harness init --provider <name>` and the correct snippet is injected for you.

**Manual:** Copy the snippet for your provider into the listed file in your project root.

| Provider | File |
|---|---|
| Claude Code | `CLAUDE.md` |
| Gemini CLI | `GEMINI.md` |
| Cursor | `.cursor/rules/harness.mdc` |
| VS Code Copilot | `.github/copilot-instructions.md` |
| Windsurf | `.windsurfrules` |

For providers not listed (Continue, Zed, Aider, etc.), paste the snippet into whatever system prompt or rules file that provider supports.
