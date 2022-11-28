# api-marble

This library was generated with [Nx](https://nx.dev).

## Getting started

This library generates ECMAScript classes based on the `src/scripts/marble.proto`.
The generated code can be found in `src/lib/marble_pb.ts`

1. Make sure to have `protoc` installed and available in your PATH

   > On macOS, you can do it using `brew instal protobuf`

2. Run `npx nx api-marble:protoc-gen-es` to generate the client

## Development

### Edit protocol buffer

Update the protocol buffer by editing / copy paste the file `src/scripts/marble.proto`

### Edit ECMAScript generation process

Change the generation script by editing `src/scripts/generate.ts`

### Lint

Run `npx nx lint api-marble` to execute the lint via [ESLint](https://eslint.org/).
