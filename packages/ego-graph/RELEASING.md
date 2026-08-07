# Releasing

**This directory is the source of truth.** `github.com/checkmarble/ego-graph` is a
mirror, regenerated from here on every release. Never commit to the mirror
directly — the next release overwrites it.

The one file that differs: the mirror needs its own `biome.json`, because here
the monorepo root config governs. Everything else is identical, deliberately, so
the split is lossless.

## Release

From the repo root, with a clean tree:

```sh
# 1. Everything green
bun run -F ego-graph type-check
bun run -F ego-graph unit-tests
bun run -F ego-graph build
bun run -F ego-graph check-package

# 2. Bump the version in packages/ego-graph/package.json, commit.

# 3. Regenerate the mirror
git subtree split --prefix=packages/ego-graph -b ego-graph-release

# 4. Push it (force: the split rewrites history each time)
git push --force git@github.com:checkmarble/ego-graph.git ego-graph-release:main

# 5. Publish from a fresh clone of the mirror
git clone git@github.com:checkmarble/ego-graph.git /tmp/ego-graph-publish
cd /tmp/ego-graph-publish
bun install
# biome.json is mirror-only; add it if the lint script is needed there.
npm publish --otp=<code>

# 6. Tag
git tag v<version> && git push --tags
```

`prepublishOnly` rebuilds and runs `publint` + `attw`, so a malformed package
cannot get out.

## npm requires 2FA

`npm publish` fails with `E403 ... Two-factor authentication or granular access
token with bypass 2fa enabled is required`. Two ways through:

- **Publishing by hand:** enable 2FA on the npm account, then pass `--otp=<code>`.
- **From CI:** create a *granular* access token with "Bypass 2FA" enabled, scoped
  to this package, and set `NODE_AUTH_TOKEN`. Classic automation tokens no
  longer satisfy the requirement.

## Gotchas

- **Keep the `unit-tests` script.** The workspace runs `bun run -F '*'
  unit-tests`; rename it and this package silently drops out of `test:all`.
- **`CONTEXT.md` is force-included** by this directory's `.gitignore`. The repo
  root ignores that filename as a local agent file, and without the negation the
  subtree split drops the glossary the README links to.
- **`tsconfig.json` is self-contained**, not extending the monorepo base. That is
  what lets the same file work in the mirror. Do not re-add `extends`.
