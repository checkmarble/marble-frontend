# Backoffice Screening Object Lookup Tasks

Last Updated: 2026-10-01

- [x] Add organization-aware data-model and client-object reads to the backoffice OpenAPI contract.
  - Acceptance: the generated backoffice client exposes typed operations returning `DataModelDto` and `DataModelObjectDto`.
- [x] Add the authenticated server/query layer.
  - Acceptance: inputs are validated, generated calls use the configured API base URL and authenticated fetch, and query keys include every organization/object discriminator.
- [x] Add the Screenings organization route and navigation tab.
  - Acceptance: the route validates `table` and `objectId` search parameters and restores a submitted lookup after refresh.
- [x] Build the lookup and result interface.
  - Acceptance: table loading, empty data model, form validation, conditional retrieval, formatted JSON, copying, not-found, forbidden, retry, and loading states are covered.
- [x] Build the Motiva query preview from FTM metadata.
  - Acceptance: the table FTM entity becomes the query schema, mapped object fields become string-array properties, duplicate mappings merge, and missing table FTM configuration is reported.
- [x] Run the mapped query against Motiva and present the response.
  - Acceptance: the request uses `POST /match/default?explain=true`, validates the response, handles failures and zero matches, and renders ranked candidate details with scored explanations.
- [x] Verify the implementation.
  - Acceptance: focused tests, `marble-api` and `backoffice` type checks, and the backoffice build pass without editing unrelated files.
