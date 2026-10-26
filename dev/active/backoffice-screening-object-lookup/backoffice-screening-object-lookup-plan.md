# Backoffice Screening Object Lookup

Last Updated: 2026-10-01

## Current state

Organization administration exposes overview and users tabs. The backoffice API can address an organization for feature access, but it has no organization-aware data-model or client-object reads. The Marble core equivalents derive the organization from the caller token and therefore cannot safely serve this backoffice workflow.

## Proposed state

Add a Screenings tab under each organization. Operators select a table from that organization's data model, enter an object ID, and retrieve the complete client object as formatted JSON. The selected table and object ID live in URL search parameters so the lookup survives refreshes and can be shared.

## Implementation phases

1. Extend `openapis/backoffice.yaml` with authenticated organization data-model and client-object endpoints, regenerate `marble-api`, and confirm the generated client exposes both operations.
2. Add validated backoffice server functions and React Query options whose cache keys include the organization, table, and object identifiers.
3. Add the organization Screenings tab and route, including table loading, URL-backed lookup input, conditional object retrieval, result copying, and explicit empty/error states.
4. Run focused tests, type checks, and the backoffice build.

## Risks and dependencies

- The API contract requires matching backend implementation outside this repository before the workflow works in a deployed environment.
- Client object data may contain arbitrary nested values; the UI must render the entire DTO without assuming field types.
- Table and object IDs are user-controlled path parameters and must pass through the generated client's URL encoding.

## Success criteria

- The Screenings tab is reachable for any organization.
- Tables load from the selected organization's data model and are sorted by name.
- A valid table/object pair updates the URL and fetches exactly that organization's object.
- Success, not-found, forbidden, generic-error, loading, and empty-data-model states are clear and recoverable.
- API generation, package type checks, tests, and the backoffice build pass.
