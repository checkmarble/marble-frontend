# marble-api

This package generates Marble API client based on `src/scripts/openapi.yaml`.

## Getting started

The generated code can be found in `src/lib/generated/marble-api.ts`

1. Edit `scripts/openapi.yaml` with the new API spec
   > NB: you can use [OpenAPI (Swagger) Editor](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi) VS Code extension to edit the spec
2. Run `pnpm --filter marble-api run generate-api` to generate the client
3. Review generated code and commit changes

> NB: in case update introduced breaking changes, you may need to resolve TS issues in places the client is used

## Development

### Edit ECMAScript generation process

Change the generation script by editing `scripts/generate.ts`

### Expose some usefull helpers

Change or add files in `src/helpers`

> don't forget to explicitly expose public interface in `src/index.ts`
