---
description: Map edited routes & launch tests
argument-hint: "[route-path or file-path ...]"
allowed-tools: Bash(git:*), Bash(grep:*), Bash(sort:*), Read
model: sonnet
---

## Context

Find recently changed route files using git:

!git diff --name-only HEAD~5 | grep '/routes/' | sort -u

User-specified additional routes: `$ARGUMENTS`

## Your task

Follow the numbered steps **exactly**:

1. Combine the git diff list with `$ARGUMENTS`, dedupe, and identify the route paths.
2. For each route file, read it and output a JSON record with the path, method, expected
   request/response shapes, and valid + invalid payload examples.
3. **Now call the `Task` tool** using:

```json
{
    "tool": "Task",
    "parameters": {
        "description": "route smoke tests",
        "prompt": "Run the auth-route-tester sub-agent on the JSON above."
    }
}
```
