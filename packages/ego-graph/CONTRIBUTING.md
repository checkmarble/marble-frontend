# Contributing

Thanks for your interest in `ego-graph`.

## Issues first

We prefer issues before code.

1. Open an issue describing the bug or proposed change.
2. Maintainers triage it.
3. If we want the change, we will invite you to collaborate or open a draft PR ourselves.

Unsolicited PRs from new contributors may be closed with a request to start from an issue. Dependabot and other bot PRs are welcome.

## Local setup

This package lives in the Marble Frontend Bun workspace.

```sh
bun install
```

Useful commands, from the repository root:

| Command | What it does |
| --- | --- |
| `bun run -F ego-graph unit-tests` | Run [Vitest](https://vitest.dev) tests |
| `bun run -F ego-graph type-check` | TypeScript (`tsc --noEmit`) |
| `bun run -F ego-graph lint` | Lint with [Biome](https://biomejs.dev) |
| `bun run -F ego-graph format` | Format with Biome |
| `bun run -F ego-graph build` | Build `dist/` with tsdown |
| `bun run -F ego-graph check-package` | Run Publint and arethetypeswrong |

Before opening a PR (when invited), run:

```sh
bun run -F ego-graph type-check && bun run -F ego-graph unit-tests && bun run -F ego-graph lint && bun run -F ego-graph build
```

## Bug reports

Include:

- What you expected
- What actually happened
- Steps to reproduce
- Package version, Node version, and a minimal repro if possible

## Feature requests

Include motivation, a sketch of the API you want, and a short usage example.

## Release / versioning

We use **manual semver**. Maintainers bump `version` in `package.json`, push an
`ego-graph-vX.Y.Z` tag, and GitHub Actions publishes to npm and creates a GitHub
Release. See [RELEASING.md](./RELEASING.md).
