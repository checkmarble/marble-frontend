---
name: dependabot
description: Use when the user wants to handle, merge, combine, consolidate, or clean up open Dependabot PRs, or wants the weekly dependency bumps rolled into one PR, even if they only say "deal with the bumps" or give a range of Dependabot PR numbers. Also use when one Dependabot PR fails CI and the fix belongs with the rest of the batch.
---

# Consolidate Dependabot PRs

Turn the open Dependabot PRs into one verified `chore(deps)` PR. `.github/dependabot.yaml` opens one PR per package per directory (`/`, `packages/*`) for minors and majors, plus `patch`-group PRs across directories, behind a 14-day cooldown. Add what it can't: move related packages together, adapt code, catch production-only breakage.

Stop for the user only at step 8. Merge nothing. Never force-push: `.claude/hooks/block-dangerous-commands.sh` blocks every `git push --force*`, `--force-with-lease` included.

## 1. Collect the batch

```bash
gh pr list --author 'app/dependabot' --state open --limit 100 --json number,title,headRefName,statusCheckRollup
gh pr list --state open --search 'consolidate in:title' --json number,title,headRefName,baseRefName,body
```

If a consolidation PR is open, stack on its branch and drop the PRs its body lists as superseded, but keep a new PR that moves one of its packages further (26.6.4 → 26.6.5). Otherwise base on `origin/main`.

## 2. List the real changes

One row per package: current version (from the base's manifests; Dependabot's "from" can be stale), target, PRs replaced. Classify by the actual jump: the `patch` group has carried minors (`@radix-ui/react-slot` 1.3.3 → 1.5.0).

Per-workspace PRs (`in /packages/...`) change only `package.json`, so they fail `bun install --frozen-lockfile` whatever they bump. PRs that touch `bun.lock` fail for real reasons: `gh run view <run-id> --log-failed | grep '##\[error\]'`.

## 3. Move families together

The cooldown can hold back half of a pair. Check every manifest and the root `overrides`:

| Family | Why |
| --- | --- |
| `react`, `react-dom` | Exact match (react-dom throws otherwise), also in root `dependencies` and `overrides`. `@types/*` release separately: take the matching minor. On a major, update the `react@19.`/`react-dom@19.` prefixes in `scripts/link-single-react.mjs` (it skips silently) and workspace `peerDependencies`. |
| `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/router-plugin`, `@tanstack/react-router-ssr-query`, `@tanstack/react-router-devtools`, root `srvx` override | Shared `router-core`: Router without Start breaks `server` on every route that declares it (`TS2353`). Start's plugin needs `srvx ^0.11.22`. Start 1.169+ drops `useSession` from `@tanstack/react-start/server`, which five session stores use (#2050 held the family back). |
| `vite`, `@vitejs/plugin-react` | Exact pins in root `overrides` and manifests. |
| `storybook`, `@storybook/*` | Addons match the core. |
| `playwright`, `@playwright/test` | `@playwright/test` pins `playwright` exactly; both ship the `playwright` bin, so a mismatch installs browsers for the wrong `playwright-core`. |
| `vitest`, `@vitest/*` | Must match. |
| `@sentry/node`, `@sentry/react`, `@sentry/tanstackstart-react` | One version: they pin `@sentry/core` exactly. `@sentry/vite-plugin` is versioned separately. |
| `@biomejs/biome` | `biome.json` `$schema` URL. |
| Bun | `packageManager`, `.tool-versions`, both tags (`oven/bun:<v>`, `<v>-distroless`) in `Dockerfile` and `Dockerfile.backoffice`, `bun-version` in `check.yaml`, `e2e.yaml`, `compliance.yaml`. |
| Node | `.tool-versions` (setup-node reads it) and `mise.toml`. The Dockerfiles pin no Node. |

A package in several workspaces lands on one version; read `bun install`'s peer warnings too. If a member can't move (still in cooldown, no aligned release), leave the whole family and say why.

## 4. Review breaking changes

For every major, `0.x` minor, Actions or Docker major, and every TanStack Router/Start bump (their patches have broken this app), read the notes (`gh release view <tag> -R <owner>/<repo>`, or the PR body) and grep for each affected API. Record only what we use and the fix.

Hunt changed defaults type-check can't see, in telemetry and auth above all: Sentry 11's `dataCollection` collects more than `sendDefaultPii` did, so `app-builder/src/client.tsx` sets limits. Marble handles regulated financial data: flag anything sending more to a third party, even when it compiles.

## 5. Apply on a branch

Branch `chore/deps-consolidate-<first>-<last>`. If the checkout is in use or dirty, work inside a worktree from the base (Claude Code: `EnterWorktree`): the repo hooks check the session directory's branch.

Edit manifests and `overrides` to the targets, keeping each range style; don't merge or cherry-pick Dependabot branches. Install once with the cooldown, or carets resolve into it (they did in #2050):

```bash
bun install --minimum-release-age=1209600
```

Confirm each row hit its target. Nested lock entries (`"<parent>/<pkg>": [...]`) hide split versions; compare yours with the base's (`git show <base>:bun.lock`):

```bash
grep -oE '"(@tanstack/(router-core|query-core)|@sentry/core|react|react-dom|vite|playwright-core)@[0-9][^"]*' bun.lock | sort | uniq -c
```

Add no second version; a family you move ends on one (an exact root `overrides` entry forces it). Expected: `@sentry/core` under `@sentry/bundler-plugins`. Main already splits `router-core` (stale copy used by the devtools) and `query-core` (devtools): fix if you move that family, else report.

Keep code changes to what review and checks require.

## 6. Verify

Run every `run:` step of `.github/workflows/check.yaml` in order, each from its `working-directory` (`bunx biome ci .` for setup-biome), OpenAPI validation and `generate-api` + `git diff --exit-code` included. The Node and Bun smoke runs matter: in #1986 both builds passed while every SSR request returned 500, and production runs on Bun. Note it if local Node differs from `.tool-versions`.

| When the batch touches | Also run |
| --- | --- |
| Router/Start, React, Vite, Bun, Playwright, Testcontainers | `bun run -F tests test:install && bun run -F tests test:run:prod` after the app-builder build (Docker with `marble-infra` image access, free port 3000) |
| New or replaced dependency | `compliance.yaml`'s `license-report \| license-report-check` in each changed workspace (CI checks only app-builder) |
| Storybook | `bunx storybook dev --ci --smoke-test` in `packages/ui-design-system` |
| Bun or a Docker base image | `docker build -f Dockerfile .` and `-f Dockerfile.backoffice .` |

E2E matters most: it covers the sign-in flow that earlier Start bumps broke. The `E2E tests` workflow runs only on PRs into `main`: for a stacked PR, run it locally or say in the PR that e2e runs once it targets `main`. Name the CI job covering anything not run.

If a bump won't work in reasonable effort, revert it and its family, leave its PRs open, say why.

## 7. Open the PR

Open it against the step-1 base, titled `chore(deps): consolidate Dependabot bumps from #<first> to #<last>` (step 1 finds stacked bases by it). A stacked PR names its base PR in the body's first line. Body:

- `## Summary`: "Replaces #A–#B with one PR" (name any left out, and why); table `Package | From → To | Replaces`; breaking changes with a short diff per fix, one line per change needing none.
- `## Evidence`: commands and results, before/after for fixes, anything not run.
- `## Merge Danger`: `**Door:** one-way or two-way`, `**Blast Radius:**` (including dashboards and alerts).
- Last line: `Supersedes #A, #B, #C.`, every PR listed. Never "Closes": it would close Dependabot PRs at merge without anyone deciding to.

## 8. Report, then ask before closing

Give the PR link, bumps left out, and step 4 risks; list the PRs it replaces and ask whether to close them. Wait: closing tells Dependabot to skip that version, so an abandoned PR's bumps won't return until a newer release. Once confirmed (skip PRs whose bump was left out):

```bash
gh pr close <n> --comment "Superseded by #<new>, which consolidates the Dependabot bumps from #<first> to #<last>."
```

Once a stacked PR's base merges: `git fetch origin && git merge origin/main`, plain `git push`, and `gh pr edit <new> --base main` if GitHub hasn't retargeted it. For a rebased history, hand the user `git rebase --onto origin/main <old-base-branch>` and `git push --force-with-lease` to run.
