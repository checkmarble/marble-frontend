# marble-api

This package generates Marble API client based on OpenAPI spec provided in `openapis` folder :

- `openapis/marblecore-api.yaml` : Marble Core API spec
- `openapis/feature-access-api.yaml` : Feature access API spec
- `openapis/transfercheck-api.yaml` : Transfer Check API spec

> Even if the marble backend is a single monolithic API, it is split into multiple OpenAPI specs to allow for better separation of concerns and to prepare for a possible future split into multiple services.

## Getting started

The generated code can be found in `src/lib/generated` folder.

1. Edit `openapis/*.yaml` with the new API spec
   > NB: you can use [OpenAPI (Swagger) Editor](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi) VS Code extension to edit the spec. Copilot can also help you with the edition.
2. Run `pnpm --filter marble-api run generate-api` to generate the clients
3. Review generated code and commit changes

> NB: in case update introduced breaking changes, you may need to resolve TS issues in places the client is used

## Development

### Edit ECMAScript generation process

Change the generation script by editing `scripts/generate.ts`

### Expose some usefull helpers

Change or add files in `src/helpers`

> don't forget to explicitly expose public interface in `src/index.ts`
