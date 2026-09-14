Last Updated: 2026-09-14

Decisions: generic defaults only; no name or enum inference on read; missing subtypes remain absent; normalize for all consumers; preserve supervised editor behavior.
Integration: models/data-model.ts adapts API fields; models/semantic-types.ts holds semantic definitions; DataVisualisation/dataFieldsUtils.ts supplies creation inference.
EditTableDrawer.tsx adapts model fields and detects changes; updateTable-adapter.ts compares fields against backend declarations.

Correction: Bool and Bool[] have no read-time semantic fallback because their display follows the data type. Preserve supervised form defaults and existing saved declarations.
