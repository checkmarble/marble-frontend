---
name: dev-docs
description: Use when the user wants to persist an agreed implementation plan for later execution or continuation.
disable-model-invocation: true
---

# Persistent development plan

Use the user's task description and inspect the relevant code before writing the plan.

Create `dev/active/[task-name]/` with:

- `[task-name]-plan.md`: current state, proposed state, implementation phases, risks, dependencies, and success criteria.
- `[task-name]-context.md`: relevant files, constraints, decisions, and integration points.
- `[task-name]-tasks.md`: ordered checklist with acceptance criteria and dependencies.

Include `Last Updated: YYYY-MM-DD` in each file.

Keep the documents self-contained and specific to this repository. Record facts that would be expensive to rediscover, not information readily available from package scripts or directory listings. Check `PROJECT_KNOWLEDGE.md`, `BEST_PRACTICES.md`, `TROUBLESHOOTING.md`, and `dev/README.md` only when those files exist.

The workflow is complete when the three files exist, agree on scope and terminology, and every implementation phase has a checkable completion criterion.
