# Issue tracker: Linear

Read by the `mattpocock-skills@claude-plugins-official` plugin skills (when installed), e.g. `to-spec`, `to-tickets`, `triage`, through the "Issue tracker" pointer in CLAUDE.md.

Issues and specs live in Linear, in the `MAR` team. Use the
official Linear MCP server (`https://mcp.linear.app/mcp`). If its
tools aren't available, stop and ask the user to add it.

Claude Code:

```bash
claude mcp add --transport http linear https://mcp.linear.app/mcp
```

then authenticate with `/mcp`.

Codex:

```bash
codex mcp add linear --url https://mcp.linear.app/mcp
codex mcp login linear
```

## Operations

Use the Linear MCP tools, always scoped to team `MAR`. If a call fails, check the tool and
parameter names below against the connected server's schemas, and the state names against
the team's workflow states.

Assign every newly created issue to the requesting user; with this connection,
use `assignee: "me"`. Use another assignee only when the user explicitly requests it.

- Create: `save_issue` with `team: "MAR"`, a title, a Markdown description and any labels; omit `id` when creating
- Read: `get_issue` with the identifier (e.g. `MAR-123`), then `list_comments` for the discussion
- List: `list_issues` with `team: "MAR"`, filtering by state, label or assignee as needed
- Comment: `save_comment` on the issue
- Label: update via `save_issue`; prefer the server's additive label parameters (e.g. `addLabels` / `removeLabels`) over a full `labels` replacement so other labels are kept
- Close: `save_issue` with the issue `id`, moving it to a completed state (`Done`), or `Canceled` for wontfix

Refer to issues by their identifier (`MAR-123`), not by URL or internal ID.

## Publishing and fetching

When a skill says "publish to the issue tracker", create a
Linear issue in team `MAR`. When it says "fetch the relevant
ticket", read the issue and its comments.

Map triage roles using `docs/agents/triage-labels.md`.
