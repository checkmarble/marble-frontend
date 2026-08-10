# Releasing

**This directory is the source of truth** for the published `ego-graph` npm
package. The standalone `github.com/checkmarble/ego-graph` repository is kept
for now, but it is not a release source and must not be kept in sync manually.

## Release

From the repo root, with a clean tree:

```sh
# 1. Everything green
bun run -F ego-graph type-check
bun run -F ego-graph unit-tests
bun run -F ego-graph lint
bun run -F ego-graph build
bun run -F ego-graph check-package

# 2. Bump the version in packages/ego-graph/package.json and commit it.

# 3. Create and push the package-specific release tag.
git tag ego-graph-v<version>
git push origin ego-graph-v<version>
```

Pushing `ego-graph-v<version>` starts the `Publish ego-graph` GitHub Actions
workflow. It verifies that the tag and `package.json` agree, runs the package
checks, publishes from `packages/ego-graph`, and creates a GitHub Release in
this repository. The workflow runs `publint` + `attw` before npm publishing,
while `prepublishOnly` independently rebuilds the package.

## npm trusted publishing

The workflow uses npm trusted publishing (OIDC), so it does not use an npm
token. Before the first release from this repository, configure npm with the
`checkmarble/marble-frontend` repository and
`.github/workflows/publish-ego-graph.yml` workflow. That npm-side change cannot
be made from this repository.

## Gotchas

- **Keep the `unit-tests` script.** The workspace runs `bun run -F '*'
  unit-tests`; rename it and this package silently drops out of `test:all`.
- **`CONTEXT.md` is force-included** by this directory's `.gitignore`. The repo
  root ignores that filename as a local agent file, and without the negation the
  published package would omit the glossary the README links to.
