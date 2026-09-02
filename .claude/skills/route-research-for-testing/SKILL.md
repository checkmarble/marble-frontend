---
name: route-research-for-testing
description: Use when the user wants smoke tests for recently changed routes or supplies route paths that need focused testing.
disable-model-invocation: true
---

# Route research for testing

Use user-supplied route or file paths when provided. Otherwise inspect the routes changed by the current branch or PR against its base. If the base cannot be determined, ask the user for explicit paths instead of guessing a commit range.

1. Combine changed route files with the user-supplied paths and remove duplicates.
2. Read each route and produce a JSON record containing:
   - Source path and resulting route path.
   - Supported HTTP method or page-loader entry point.
   - Authentication requirements.
   - Request and response shapes.
   - Valid and invalid examples.
3. Delegate the JSON records to a general-purpose subagent. Ask it to inspect the repository's existing test infrastructure, run the narrowest appropriate authenticated smoke tests, and report failures with reproduction details.
4. Summarize tested routes, skipped routes and reasons, commands run, and results.

Do not invent credentials or make destructive requests. The workflow is complete when every identified route is tested or has a specific documented reason it could not be tested.
