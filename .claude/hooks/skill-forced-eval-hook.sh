#!/bin/bash
# UserPromptSubmit hook: Forces Claude to evaluate and activate relevant skills before proceeding.

cat <<'EOF'
MANDATORY SKILL ACTIVATION — Before responding, follow these steps:

1. EVALUATE: For each available skill, determine YES/NO whether it is relevant to this prompt.
2. ACTIVATE: If any skill is relevant, activate it with the Skill() tool NOW, before writing any code or plan.
3. IMPLEMENT: Only after activation, proceed with the task.

CRITICAL: Mentioning a skill without activating it via Skill() is worthless. You MUST call the Skill tool for each relevant skill.
If no skills are relevant, proceed directly.
EOF
