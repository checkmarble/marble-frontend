# api-marble

This library was generated with [Nx](https://nx.dev).

## Getting started

This library generates Marble API client based on `src/scripts/openapi.yaml`.
The generated code can be found in `src/lib/generated/marble-api.ts`

1. Make sure to have `openapi.yaml` up to date
2. Run `npx nx api-marble:generate-api` to generate the client
3. Review generated code and commit changes

> NB: in case update introduced breaking changes, you may need to resolve TS issues in places the client is used

## Development

### Edit ECMAScript generation process

Change the generation script by editing `src/scripts/generate.ts`

### Expose some usefull helpers

Change or add files in `src/lib/openapi`

> don't forget to explicitly expose public interface in `src/lib/index.ts`
