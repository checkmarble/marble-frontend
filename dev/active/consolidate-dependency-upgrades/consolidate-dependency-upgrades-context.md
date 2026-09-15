Last Updated: 2026-09-15

## Relevant facts
#1883 upgrades Biome 2.5.10 to 2.5.11; React Router 1.170.31 to 1.170.32; SSR Query 1.167.1 to 1.167.2; React Start 1.168.48 to 1.168.49; Router Plugin 1.168.34 to 1.168.35; Testing Library React 16.3.2 to 16.3.3; shared Vitest 4.1.10 to 4.1.11.
#1881 contains only the shared Vitest manifest change, already present in #1883.
Both applications use setupRouterSsrQueryIntegration and the TanStack Start Vite plugin with Nitro. app-builder cleans up its per-request QueryClient through router.serverSsr.onCleanup.
biome.json has a versioned schema URL requiring alignment with the installed CLI.
## Constraints
Do not edit generated route trees or API clients. Publish replacement before closing originals. No merge requested.

## Documentation findings
- [TanStack SSR Query internals at the release commit](https://github.com/TanStack/router/blob/79e35335b4bb1c3b5e2275a8df5181aa05036628/packages/router-ssr-query-core/INTERNALS.md): Query Core >=5.102.0 is required; transport now includes queries only, preserves pending promises, batches streaming, and clears request-owned clients. Both applications create a fresh QueryClient inside getRouter and use supported serializeData/deserializeData defaults. Neither relies on mutation dehydration or the internal transport shape. No application-code migration is required. Raise React Query's manifest minimum to ^5.102.8, matching the existing locked version and satisfying the new minimum.
- [React Router 1.170.32 changelog](https://github.com/TanStack/router/blob/main/packages/react-router/CHANGELOG.md): fixes context preservation on reload. React Start and Router Plugin propagate dependency fixes; the Start plugin's Rsbuild configuration change does not apply to our Vite builds.
- [Vitest 4.1.11](https://github.com/vitest-dev/vitest/releases/tag/v4.1.11): lifecycle concurrency and browser/mock fixes; no migration required for our tests.
- [Testing Library React 16.3.3](https://github.com/testing-library/react-testing-library/releases/tag/v16.3.3): fixes re-entrant act during event dispatch; no test changes required.
- [Biome 2.5.11](https://github.com/biomejs/biome/releases/tag/@biomejs%2Fbiome@2.5.11): patch fixes and optional nursery rules; retain existing lint rules and align the schema URL.

## Validation
The original #1883 lockfile fails frozen installation: its shared workspace still records Vitest 4.1.10. Regenerating with Bun 1.3.10 corrects this and deduplicates Vitest at 4.1.11.
Passed: bun install --frozen-lockfile; bunx biome ci .; all workspace type checks; test:all (47 files, 232 tests); app-builder and backoffice production builds; git diff --check.
Builds emitted non-fatal CSS, chunk-size, and dependency annotation warnings. Browser QA was not performed.
