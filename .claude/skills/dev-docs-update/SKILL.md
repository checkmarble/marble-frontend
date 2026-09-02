---
name: dev-docs-update
description: Use when approaching context compaction, handing off a conversation, or pausing work that another agent must resume.
disable-model-invocation: true
---

# Update development handoff

For each task under `dev/active/`, update its plan, context, and task files so all three reflect the current conversation and repository state.

Record:

- Current implementation state and the reason for each modified file.
- Revisions to the proposed state, implementation phases, and risks in the plan file.
- Decisions, constraints, blockers, and unresolved questions.
- Completed, in-progress, newly discovered, and reprioritized tasks.
- The exact next step and commands needed to verify unfinished work.
- A current `Last Updated` date in each file.

If work will continue in another conversation, include the active file or subsystem, the intended outcome, uncommitted changes that need attention, and the verification commands.

Preserve established decisions unless the current work superseded them. Prefer facts that are hard to recover from code over a narrative of the conversation.

The workflow is complete when another agent can resume the task without relying on the current conversation history.
