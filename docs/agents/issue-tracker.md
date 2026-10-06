# Issue tracker: Linear

Issues and specs live in Linear, in the `MAR` team. Use the
official Linear MCP server (`https://mcp.linear.app/mcp`). If its
tools aren't available, stop and ask the user to add it:

```bash
claude mcp add --transport http linear https://mcp.linear.app/mcp
```

then authenticate with `/mcp`.

## Operations

Use the Linear MCP tools, always scoped to team `MAR`:

Assign every newly created issue to the requesting user; with this connection,
use `assignee: "me"`. Use another assignee only when the user explicitly requests it.

- Create: `save_issue` with `team: "MAR"`, a title, a Markdown description and any labels; omit `id` when creating
- Read: `get_issue` with the identifier (e.g. `MAR-123`), then `list_comments` for the discussion
- List: `list_issues` with `team: "MAR"`, filtering by state, label or assignee as needed
- Comment: `save_comment` on the issue
- Label: `save_issue` with `addLabels` / `removeLabels` to preserve other labels; `labels` replaces the full label set
- Close: `save_issue` with the issue `id`, moving it to a completed state (`Done`), or `Canceled` for wontfix

Refer to issues by their identifier (`MAR-123`), not by URL or internal ID.

## Publishing and fetching

When a skill says "publish to the issue tracker", create a
Linear issue in team `MAR`. When it says "fetch the relevant
ticket", read the issue and its comments.

Map triage roles using `docs/agents/triage-labels.md`.
