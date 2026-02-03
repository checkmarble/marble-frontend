# Claude Code — Developer Guide

## The 5 Components

| Component | Triggered by | Purpose | Location |
|-----------|-------------|---------|----------|
| **CLAUDE.md** | Always loaded | What Claude always knows | `CLAUDE.md` |
| **Skills** | Auto (context match) | Knowledge loaded when relevant | `.claude/skills/*/SKILL.md` |
| **Commands** | You type `/name` | On-demand workflows | `.claude/commands/*.md` |
| **Agents** | Claude delegates or you ask | Isolated workers with own context | `.claude/agents/*.md` |
| **Hooks** | Lifecycle events | Deterministic shell scripts | `.claude/settings.json` |

---

## Scope & Priority

Every component exists at multiple levels. **More specific scope wins.**

### Settings & Hooks priority (highest → lowest)

| Priority | Scope | Location | Shared? |
|----------|-------|----------|---------|
| 1 | **Managed** (enterprise) | System-level `managed-settings.json` | All users (IT deployed) |
| 2 | **CLI arguments** | `claude --agents '...'` | Session only |
| 3 | **Local project** | `.claude/settings.local.json` | No (gitignored) |
| 4 | **Project** | `.claude/settings.json` | Yes (committed) |
| 5 | **User** | `~/.claude/settings.json` | No (your machine) |

### Memory (CLAUDE.md) priority

| Priority | Scope | Location | Shared? |
|----------|-------|----------|---------|
| 1 | **Managed** | System-level `CLAUDE.md` | All users (IT deployed) |
| 2 | **Project** | `CLAUDE.md` or `.claude/CLAUDE.md` | Yes (committed) |
| 3 | **Project rules** | `.claude/rules/*.md` | Yes (committed) |
| 4 | **User** | `~/.claude/CLAUDE.md` | No (your machine) |
| 5 | **Local** | `CLAUDE.local.md` | No (gitignored) |

All memory files are loaded and combined. Higher priority files are loaded first.

### Agents priority

| Priority | Scope | Location |
|----------|-------|----------|
| 1 | **CLI flag** | `claude --agents '{...}'` (session only) |
| 2 | **Project** | `.claude/agents/*.md` (committed) |
| 3 | **User** | `~/.claude/agents/*.md` (all projects) |
| 4 | **Plugin** | Plugin's `agents/` directory |

When multiple agents share the same name, highest priority wins.

### Skills priority

| Priority | Scope | Location |
|----------|-------|----------|
| 1 | **Project** | `.claude/skills/*/SKILL.md` (committed) |
| 2 | **User** | `~/.claude/skills/*/SKILL.md` (all projects) |
| 3 | **Plugin** | Plugin's `skills/` directory |

### What goes where?

| I want to... | Put it in... |
|---|---|
| Share conventions with my team | `.claude/settings.json` + `CLAUDE.md` (project) |
| Keep personal preferences | `~/.claude/settings.json` + `~/.claude/CLAUDE.md` (user) |
| Override project settings locally | `.claude/settings.local.json` + `CLAUDE.local.md` (local) |
| Use an agent in all my projects | `~/.claude/agents/` (user) |
| Use an agent only in this repo | `.claude/agents/` (project) |
| Enforce company-wide rules | `managed-settings.json` + managed `CLAUDE.md` (enterprise) |

---

## CLAUDE.md — Project Memory

Always loaded at session start. Put things Claude should **always** know.

**Good for:** tech stack, conventions, import patterns, quick commands, architecture overview.

**Not for:** specialized knowledge that only matters sometimes (use a skill instead).

---

## Skills — Auto-Activated Knowledge

Claude reads the skill's `description` and loads it **only when your prompt matches**.

```yaml
# .claude/skills/api-conventions/SKILL.md
---
name: api-conventions
description: API endpoint conventions. Use when creating or modifying API endpoints.
---
Your REST API patterns, naming, error handling rules here...
```

**You say:** "Create a new endpoint for user preferences"
**Claude does:** sees "endpoint" → loads `api-conventions` skill → follows your patterns.

You never trigger skills manually. They activate silently.

---

## Commands — Manual Workflows

Triggered by typing `/command-name`. For repeatable workflows you want to control. Also a skill now.

```yaml
# .claude/commands/review.md
---
description: Review recent code changes
---
Run git diff to find recent changes, then review for quality, security, and patterns.
```

**Usage:** `/review`

---

## Agents — Isolated Workers

Separate Claude instances with their own context, tools, and model.

```yaml
# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: Reviews code for quality. Use proactively after code changes.
tools: Read, Grep, Glob, Bash
model: sonnet
permissionMode: plan
---
You are a senior code reviewer. Run git diff, analyze changes, report issues.
```

### Two ways to invoke

```
# Automatic — Claude delegates when description matches
You: "Review my recent changes"

# Explicit
You: "Use the code-reviewer agent to check my work"
```

### Key properties

| Field | Purpose |
|-------|---------|
| `description` | When Claude should delegate (add "Use proactively" for auto-delegation) |
| `tools` | Restrict what the agent can do (read-only vs write) |
| `model` | `haiku` (fast/cheap), `sonnet` (balanced), `opus` (deep reasoning), `inherit` |
| `permissionMode` | `plan` (read-only), `default`, `acceptEdits`, `bypassPermissions` |
| `skills` | Preload skill content into the agent's context |

### When to use agents vs main conversation

| Use agent | Use main conversation |
|-----------|-----------------------|
| Self-contained task | Iterative back-and-forth |
| Produces verbose output | Needs conversation history |
| Needs tool restrictions | Quick targeted change |
| Can use cheaper model | Latency matters |

---

## Hooks — Automated Guardrails

Shell scripts that run on lifecycle events. Cannot be bypassed by Claude.

### Hook events

| Event | When it fires | Can block? |
|-------|--------------|-----------|
| `SessionStart` | Session starts/resumes/clears/compacts | No |
| `PreToolUse` | Before Claude uses a tool | **Yes** — exit 2 blocks the action |
| `PostToolUse` | After a tool completes | No (already happened) |
| `Stop` | Claude finishes responding | **Yes** — can force Claude to continue |
| `Notification` | Claude needs attention | No |
| `UserPromptSubmit` | You submit a prompt | **Yes** — can reject the prompt |
| `SubagentStart/Stop` | Agent starts/finishes | No/Yes |

### Hook types

| Type | What it runs | Cost | Use for |
|------|-------------|------|---------|
| `command` | Shell script | Free | Format, lint, type-check, block commands |
| `prompt` | Single LLM call (no tools) | Tokens | Yes/no judgment on input data |
| `agent` | Sub-agent with Read/Grep/Glob | Tokens | Judgment that requires reading files |

### Common hook patterns

**Block edits on main branch** (PreToolUse):
```json
{
  "PreToolUse": [{
    "matcher": "Edit|Write|MultiEdit",
    "hooks": [{
      "type": "command",
      "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-main-edits.sh"
    }]
  }]
}
```

**Block dangerous commands** (PreToolUse):
```json
{
  "PreToolUse": [{
    "matcher": "Bash",
    "hooks": [{
      "type": "command",
      "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-commands.sh"
    }]
  }]
}
```

**Auto-format + type-check on stop** (Stop):
```json
{
  "Stop": [{
    "hooks": [{
      "type": "command",
      "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/stop-check.sh",
      "timeout": 120
    }]
  }]
}
```

**Desktop notification** (Notification):
```json
{
  "Notification": [{
    "matcher": "permission_prompt|idle_prompt",
    "hooks": [{
      "type": "command",
      "command": "osascript -e 'display notification \"Claude needs attention\" with title \"Claude Code\"'"
    }]
  }]
}
```

---

## Decision Flowchart

```
Should Claude ALWAYS know this?
  → CLAUDE.md

Should Claude know this SOMETIMES (based on context)?
  → Skill

Do I want to trigger this MANUALLY?
  → Command (/name)

Does this need ISOLATED context or restricted tools?
  → Agent

Must this happen AUTOMATICALLY every time?
  → Hook
```

---

## Quick Reference

```
.claude/
  settings.json           # Hooks + permissions
  hooks/                  # Shell scripts for hooks
  agents/                 # Sub-agents (isolated workers)
  skills/                 # Auto-activated knowledge
  commands/               # Slash commands (/name)

CLAUDE.md                 # Always-loaded project memory
```
