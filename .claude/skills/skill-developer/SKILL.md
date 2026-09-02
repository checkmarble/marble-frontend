---
name: skill-developer
description: Use when adding or changing SKILL.md files, skill trigger descriptions, manual skill workflows, or progressive disclosure.
---

# Shared skill development

Skills in `.claude/skills/**/SKILL.md` are the shared source for Claude Code, Cursor, and Codex. Author them there; Codex discovers the same folders through the `.agents/skills` symlink.

## Choose the right mechanism

- Put baseline project facts in `CLAUDE.md` (Codex reads it via the `AGENTS.md` symlink).
- Put path-specific conventions in `.claude/rules/*.md`, with activation wrappers in `.cursor/rules/*.mdc`.
- Use a skill for domain knowledge or a reusable workflow.
- Use an agent when the work needs isolated context, a different model, or restricted tools.
- Use platform hooks only for deterministic enforcement.

## Create or update a skill

1. Define one task or domain and the cases that should invoke it.
2. Create `.claude/skills/{skill-name}/SKILL.md`.
3. Add frontmatter:

   ```yaml
   ---
   name: skill-name
   description: What the skill does. Use when the user requests the relevant task or works in the relevant domain.
   ---
   ```

4. Add `disable-model-invocation: true` when the workflow should run only after explicit user invocation.
5. Keep the main file focused on steps and completion criteria. Move branch-specific reference material into directly linked sibling files.
6. Verify every referenced file and command exists.
7. Test the description against prompts that should and should not activate the skill.

## Description rules

- Answer "When should the agent use this skill?"
- Start with "Use when" and list concrete triggering situations.
- Use project terms, file types, and user task language.
- Keep implementation details and capability summaries in the skill body.
- Keep the description under 1024 characters.
- Do not describe trigger infrastructure that does not exist.

## Shared manual workflows

Store the workflow as a manually invoked skill. If Claude Code also needs a legacy slash command, keep `.claude/commands/{name}.md` as a thin wrapper that reads the skill and passes `$ARGUMENTS`.

## Current activation model

- Cursor receives skill paths and descriptions, then reads relevant skill bodies.
- Claude Code discovers the same project skill metadata.
- Codex discovers the same folders through `.agents/skills`.
- `.claude/hooks/skill-forced-eval-hook.sh` reminds Claude Code to evaluate available skills.
- This repository does not use `skill-rules.json`, keyword-matching hooks, skill session state, or PreToolUse skill enforcement.

The work is complete when Claude Code, Cursor, and Codex can discover the skill, its references resolve, and matching prompts consistently select the intended workflow.
