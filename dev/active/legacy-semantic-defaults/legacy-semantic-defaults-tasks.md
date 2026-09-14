Last Updated: 2026-09-14

- [x] Share generic defaults with creation inference.
- [x] Apply semantic defaults on DataModelField and retain fallback provenance; booleans keep missing semantics.
- [x] Preserve editor inference, change detection, and save payloads.
- [x] Run focused regression tests, formatting, and app-builder type-check.

Validation: 27 focused tests passed; app-builder type-check passed; Biome check and git diff --check passed.

Correction: Bool and Bool[] have no read-time semantic fallback because their display follows the data type. Preserve supervised form defaults and existing saved declarations.
