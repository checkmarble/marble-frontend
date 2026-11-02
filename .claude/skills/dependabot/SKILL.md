---
name: dependabot
description: Use when the user wants to handle, merge, combine, consolidate, or clean up open Dependabot PRs, or wants the weekly dependency bumps rolled into one PR, even if they only say "deal with the bumps" or give a range of PR numbers. Also use when one Dependabot PR fails CI and the fix belongs with the rest of the batch.
---

# Consolidate Dependabot PRs

Turn the open Dependabot PRs into one reviewed, verified `chore(deps)` PR.

Dependabot opens one PR per package per directory, so a dozen PRs usually hold only a few real changes. Merging them one by one conflicts on `bun.lock` and leaves related packages at mismatched versions. The value of this workflow is in what Dependabot can't do: move related packages together, adapt the code to breaking changes, and catch runtime breakage that only appears in a production build.

Stop for the user's confirmation only where step 8 says to. Don't merge anything.

## 1. Collect the batch

```bash
gh pr list --author 'app/dependabot' --state open --limit 100 \
  --json number,title,headRefName,statusCheckRollup
gh pr list --state open --search 'consolidate in:title' \
  --json number,title,headRefName,body
```

If an earlier consolidation PR is open, stack on it:

- Take its branch as your base, and exclude the Dependabot PRs its body already lists as replaced.
- If a new PR moves a package the open PR already bumps, such as 26.6.4 to 26.6.5, keep it in the batch. It's a real increment on top of the base.

Otherwise, base the work on `origin/main`.

## 2. Build the list of real changes

Read the title and body of each PR, then reduce them to one row per package: current version, target version, and the PR numbers it replaces. Take the current version from the base branch's manifests, because Dependabot's "from" can be stale.

Classify each row by its actual version jump. Group names mislead: the `patch` group has carried minor jumps such as `@radix-ui/react-slot` 1.3.3 → 1.5.0.

Use each PR's CI as a head start, not a verdict:

- PRs that target `/packages/*` often change only `package.json`, so they fail at `bun install --frozen-lockfile` whatever they contain. That failure says nothing about the bump.
- PRs that update `bun.lock` fail for real reasons. Read their errors before you start, since they usually point at the fix:

  ```bash
  gh run view <run-id> --log-failed | grep '##\[error\]'
  ```

## 3. Add the packages Dependabot left out

Dependabot moves packages independently, and its 14-day cooldown can hold back one half of a pair. Check these families against all manifests and the root `overrides` in `package.json`, and move them as a unit:

| Family | Why it has to move together |
| --- | --- |
| `react`, `react-dom`, `@types/react`, `@types/react-dom` | React requires an exact match. The versions are also pinned in the root `dependencies` and `overrides`. |
| `@tanstack/react-start`, `react-router`, `router-plugin`, `react-router-ssr-query`, `react-router-devtools` | They share `router-core`. Moving Router without Start breaks the `server` route option across every route, with `TS2353` errors in type-check. |
| `vite`, `@vitejs/plugin-react` | `vite` is pinned exactly, in root `overrides` and in the package manifests. |
| `storybook`, `@storybook/*` | Addons must match the core version. |
| `playwright`, `@playwright/test` | CI installs browsers with the first and runs tests with the second. |
| `vitest`, `@vitest/*` | The versions must match. |
| `@sentry/*` | The SDKs share a core and should stay on the same major. |
| `@biomejs/biome` | The `biome.json` schema URL carries the version. |
| Bun | `packageManager`, `.tool-versions`, `Dockerfile`, `Dockerfile.backoffice`, and `bun-version` in `.github/workflows/*.yaml`. |
| Node | `.tool-versions` and the Dockerfiles. |

The same package in several workspaces should also land on one version. This list isn't exhaustive, so read the peer dependency warnings from `bun install` too.

If a family member's target version is inside the cooldown window, or the family can't be aligned at all, leave the whole family at its current version and report why. A half-moved family is the failure this step exists to prevent.

## 4. Review breaking changes

Do this for every major bump, every `0.x` minor, every GitHub Actions or Docker major, and every TanStack Router or Start bump, whose patch releases have broken this app before. Read the release notes or changelog (`gh release view`, or the notes in the Dependabot PR body), then grep this repo for each affected API, option, or import.

Record only the outcome for this repo: what changed that we use, and the fix. "Reviewed, and we don't use it" belongs in one line.

Look specifically for changed defaults that type-check can't catch, particularly in telemetry and auth. Sentry 11, for example, replaced `sendDefaultPii` with `dataCollection`, which defaults to collecting more, and this app needed explicit limits to keep cookies, headers, and request bodies out of events. Marble handles regulated financial data, so raise anything that sends more data to a third party in the PR, even when the code still compiles.

## 5. Apply the changes on a branch

Name the branch `chore/deps-consolidate-<first>-<last>` after the lowest and highest PR numbers.

Leave the user's current work alone. If the checkout is on another branch or has uncommitted changes, create a worktree from the base and run `bun install` there.

Edit the manifests and overrides directly, then run `bun install` once. Don't merge or cherry-pick the Dependabot branches: they conflict on `bun.lock`, and the per-package ones have no lockfile changes to offer.

Keep the existing range style, exact or caret, for each dependency. A caret range can resolve past Dependabot's target if a newer release exists, so note that in the PR. Afterwards, check `bun.lock` holds one version of each family.

Make the code changes the review and the checks call for, and keep them minimal. This PR isn't the place for refactors. Don't edit `routeTree.gen.ts` or `packages/marble-api/src/generated/*` by hand.

## 6. Verify

Run the same checks as `.github/workflows/check.yaml`. If that file has changed, it takes priority over this list.

```bash
bun install --frozen-lockfile
bunx biome ci .
bun run -F '*' type-check
bun run test:all
bun run -F app-builder build
bun run -F backoffice build
bun run test:production
SMOKE_RUNTIME=bun bun run test:production
```

Both smoke runs matter, because production runs on Bun and a dependency can parse under Node and crash under Bun. react-dom 19.3 did exactly that, and every SSR request returned 500 while the build stayed green.

Add the checks the batch calls for:

| When the batch touches | Also run |
| --- | --- |
| TanStack Router or Start, React, Vite, Bun, Playwright, Testcontainers | `bun run -F tests test:run:prod` (needs Docker and a free port 3000) |
| Any new or replaced dependency | The `license-report` command from `.github/workflows/compliance.yaml` |
| The API generator | `bun run -F marble-api generate-api`, then confirm there's no diff |
| Storybook | Start Storybook from `packages/ui-design-system` |
| Bun, Node, or a Docker base image | `docker build` on `Dockerfile` and `Dockerfile.backoffice` |

The first row matters most. Type-check, unit tests, and builds have all passed on versions that left sign-in stuck on "Loading…" or produced a dev-mode SSR bundle, and only e2e caught them. If a check can't run locally, say so in the PR and name the CI job that covers it.

If a bump can't be made to work within a reasonable effort, revert that bump and its family, leave its PRs open, and report why. One stubborn package shouldn't hold back the batch.

## 7. Open the PR

Commit, push, and open the PR against the base from step 1. For a stacked PR, say which PR it's stacked on in the first line of the body.

Use this structure for the body, unless the `pr` skill is available, in which case follow that and keep the same content:

```markdown
## Summary

Replaces #A–#B with one PR. (Name any PRs in that range left out, and why.)

| Package | From → To | Replaces |
| --- | --- | --- |

Breaking changes and the fixes applied:
(a short diff block per change, then one line each for changes reviewed that needed no code)

## Evidence

(the commands that ran and their results, before/after for anything fixed, and anything not run)

## Merge Danger

**Door:** one-way or two-way
**Blast Radius:** (what could break in production, including dashboards and alerts)

Supersedes #A, #B, #C.
```

List every replaced PR number individually, so the closing step and reviewers can work from it. Write "Supersedes" and not "Closes": closing keywords would act on the Dependabot PRs at merge time without anyone deciding to.

## 8. Report, then ask before closing

Give the user the PR link, the bumps left out, and any risk from step 4. Then list the Dependabot PRs the new PR replaces and ask whether to close them.

Wait for an answer, because closing tells Dependabot to skip that version. If the consolidated PR is later abandoned, those bumps won't come back on their own until a newer release exists. Once the user confirms:

```bash
gh pr close <n> --comment "Superseded by #<new>, which consolidates the Dependabot bumps from #<first> to #<last>."
```

Leave out any PR whose bump was left out of the consolidated PR.

For a stacked PR, remind the user it needs rebasing once its base merges, because the base's commits get squashed: `git rebase --onto origin/main <old-base-branch>`, then `git push --force-with-lease`. Plain `--force` is blocked here.
