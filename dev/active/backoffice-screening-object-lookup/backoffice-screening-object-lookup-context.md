# Backoffice Screening Object Lookup Context

Last Updated: 2026-10-01

## Relevant code

- `packages/marble-api/openapis/backoffice.yaml` is the contract for organization-aware backoffice operations; `bun run -F marble-api generate-api` regenerates all API clients.
- `packages/backoffice/src/server-fns/organization.ts` and `packages/backoffice/src/data/organization.ts` provide the existing authenticated server/query boundary for organization pages.
- `packages/backoffice/src/components/pages/organization._layout.tsx` owns organization tabs; file routes under `routes/_app/_private/organizations/` own tab URLs.

## Constraints

- Do not call Marble core's `/data-model` or `/client_data/{table}/{object}` directly from the backoffice: those routes select the organization from the access token.
- Generated files must be regenerated rather than hand-edited.
- Use `ui-design-system` components and existing backoffice Tailwind tokens.
- Preserve unrelated workspace changes, including `mise.local.toml`.

## Decisions

- Route: `/organizations/$orgId/screenings`.
- Search parameters: optional `table` and `objectId`; lookup runs only when both are non-empty and the table exists in the loaded model.
- Table input: organization data-model dropdown, sorted alphabetically by exact table name.
- Result: complete `DataModelObjectDto` rendered as indented JSON with copy support.
- Motiva preview: `queries.test.schema` comes from the selected table's `ftm_entity`; fields with an `ftm_property` contribute string-array values under `properties`, with duplicate mappings merged and nullish values omitted.
- Motiva execution: the server posts to `${MOTIVA_BASE_URL}/match/default?explain=true&threshold=0.0&cutoff=0.0`; the UI triggers it explicitly and presents query totals, ranked candidates, entity properties, datasets, source counts, and positive or negative scored explanations.
- Object IDs are arbitrary trimmed strings rather than frontend-enforced UUIDs.
- Screening history is deferred.

## Integration points

- New API operations: `getOrganizationDataModel` and `getOrganizationClientObject`.
- Query keys: `['organizations', orgId, 'data-model']` and `['organizations', orgId, 'client-data', tableName, objectId]`.
- Backend implementation of the new endpoints is an external delivery dependency.
