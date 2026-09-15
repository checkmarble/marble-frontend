Last Updated: 2026-09-15

## Scope
Combine PR #1883 and #1881 on a feature branch based on origin/main. #1883 already contains the sole change in #1881 (shared Vitest 4.1.11).
## Implementation
1. Apply the complete #1883 diff, regenerating its stale lockfile.
2. Review upstream patch release notes and repository integration points; update Biome schema to 2.5.11 and adapt code only where required.
3. Verify frozen dependency install, formatting, workspace type checks, unit tests, and both application builds.
4. Publish one replacement PR with documentation findings and validation, then close both originals.
## Risks and success criteria
TanStack SSR integration and generated route types must remain compatible. Frozen dependency install must accept the regenerated lockfile. All required checks must pass or any environmental limitation must be recorded in the PR. Original PRs close only after replacement exists.
