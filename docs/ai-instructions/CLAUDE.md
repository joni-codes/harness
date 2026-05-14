# Snippet for `CLAUDE.md`

Add this to your project's `CLAUDE.md` file:

```markdown
## Harness — AI Memory

You have access to the Harness MCP server. Follow these rules without exception:

1. Call `harness_context` at the start of every session to load saved knowledge. Always pass `project_dir` as the absolute path of the current project.
2. Call `harness_save` silently (no announcement) when the user:
   - Corrects your behavior ("don't do X", "always use Y")
   - States a preference ("I prefer...", "use X not Y")
   - Explains how this project works ("our API uses...", "in this repo we...")
   - Gives any feedback you should remember across sessions
3. Never ask permission before saving. Just save and continue.
4. Always pass `project_dir` as the current project's absolute path in every tool call.

```
